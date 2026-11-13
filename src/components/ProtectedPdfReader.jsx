import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Lock,
  X,
  AlertTriangle,
  List,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useAuth } from '../context/AuthContext';

// Set worker source using Vite's ?url import with safe fallback
try {
  if (pdfjsLib?.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
} catch (e) {
  console.warn('[PDF Reader] Notice: workerSrc top-level initialization deferred:', e?.message);
}

export default function ProtectedPdfReader({
  pdfUrl = '/api/pdf/social-freedom',
  bookId = 'social-freedom',
  user,
  onClose,
}) {
  const { getIdToken } = useAuth();
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(90);
  const getInitialScale = () => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 480) return 0.55;
      if (w < 768) return 0.75;
      if (w < 1024) return 0.95;
    }
    return 1.15;
  };

  const [scale, setScale] = useState(getInitialScale);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drmToast, setDrmToast] = useState('');
  const [showToc, setShowToc] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const loadingTaskRef = useRef(null);

  const studentEmail = user?.email || 'student@mentico.com';
  const licenseKey = user?.licenseKey || 'STUDENT_VAULT_2026';

  const chapters = [
    { page: 1, title: 'Introduction: The Social Freedom Mindset' },
    { page: 8, title: 'Module 1: Confidence Architecture & Anxiety Erasure' },
    { page: 22, title: 'Module 2: The Conversation Engine (7 Core Steps)' },
    { page: 40, title: 'Module 3: Ethical Attraction & Reading Reciprocity' },
    { page: 58, title: 'Module 4: Rejection Alchemy & Unshakeable Composure' },
    { page: 74, title: 'Module 5: The 30-Day Social Freedom Challenge' },
    { page: 86, title: 'Module 6: Summary Cheat Sheets & Final Field Cards' },
  ];

  const triggerDrmWarning = useCallback((msg) => {
    setDrmToast(msg);
    setTimeout(() => {
      setDrmToast('');
    }, 3000);
  }, []);

  // Forensic Watermark Baked Directly Into Canvas Pixels
  const drawCanvasWatermark = useCallback((ctx, width, height, dpr = 1) => {
    ctx.save();
    ctx.font = `bold ${Math.round(15 * dpr)}px monospace`;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.14)';
    ctx.rotate((-25 * Math.PI) / 180);

    const text = `LICENSED TO: ${studentEmail} • ID: ${licenseKey} • MENTICO PROTECTED VAULT`;
    const stepX = 360 * dpr;
    const stepY = 140 * dpr;

    for (let x = -width; x < width * 2; x += stepX) {
      for (let y = -height; y < height * 2; y += stepY) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  }, [studentEmail, licenseKey]);

  // DRM & Anti-Piracy Keyboard / Right-Click Interception
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerDrmWarning('Right-click is disabled to protect Mentico copyright.');
    };

    const handleKeyDown = (e) => {
      // Block Ctrl+S, Ctrl+P, Ctrl+U, Cmd+S, Cmd+P, F12
      if (
        ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        triggerDrmWarning('Saving, printing, and copying are prohibited under Mentico DRM.');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerDrmWarning]);

  // Resolved PDF Endpoint (R2 Stream via Vercel Serverless Function)
  const resolvedUrl = bookId ? `/api/pdf/${bookId}` : pdfUrl;

  // Range-Optimized PDF.js Document Loading
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    async function initializePdf() {
      try {
        let idToken = null;
        if (typeof getIdToken === 'function') {
          try {
            idToken = await getIdToken();
          } catch (tokErr) {
            console.warn('[PDF Reader] Token notice:', tokErr.message);
          }
        }

        const httpHeaders = idToken ? { Authorization: `Bearer ${idToken}` } : {};

        // Ensure worker is assigned before initiating document load
        try {
          if (pdfjsLib?.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
          }
        } catch {}

        /**
         * PDF.js Range-Streaming Configuration:
         * - disableRange: false -> Enables HTTP 206 Partial Content byte ranges
         * - disableStream: false -> Allows progressive data streaming chunk-by-chunk
         * - disableAutoFetch: true -> CRITICAL: Stops PDF.js from downloading all 20-50 MB in the background!
         * - rangeChunkSize: 65536 -> 64 KB chunk size for fastest first-page display
         */
        const loadingTask = pdfjsLib.getDocument({
          url: resolvedUrl,
          httpHeaders,
          disableRange: false,
          disableStream: false,
          disableAutoFetch: true,
          rangeChunkSize: 65536,
          cMapPacked: true,
        });

        loadingTaskRef.current = loadingTask;

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('PDF Load Error:', err);
        setIsLoading(false);
        setLoadError(err.message || 'Error loading protected PDF document.');
      }
    }

    initializePdf();

    return () => {
      isMounted = false;
      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch {}
      }
    };
  }, [resolvedUrl, getIdToken]);

  // Render Page to Canvas with DPR optimization + Forensic Watermark
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    // Cancel existing render task if page or scale changed rapidly
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
    }

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });

      // Device Pixel Ratio capped at 2 to ensure razor-sharp text without memory bloat
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const renderContext = {
        canvasContext: context,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise
        .then(() => {
          if (isCancelled) return;
          // Apply forensic watermark directly to the canvas pixels
          drawCanvasWatermark(context, viewport.width * dpr, viewport.height * dpr, dpr);
        })
        .catch((err) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error('Page render error:', err);
          }
        });
    }).catch((pageErr) => {
      if (pageErr?.name !== 'RenderingCancelledException') {
        console.error('Failed to load page:', pageErr);
      }
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, scale, drawCanvasWatermark]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div className="reader-modal-overlay" ref={containerRef} role="dialog" aria-modal="true">
      {/* Toast Warning for DRM Interception */}
      {drmToast && (
        <div className="drm-toast">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>{drmToast}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="reader-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#DC2626',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              MENTICO SOCIAL FREEDOM // PROTECTED WEB READER
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
              AUTHENTICATED AS <span style={{ color: '#EF4444' }}>{studentEmail}</span> • LICENSE: {licenseKey}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            className="reader-drm-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#EF4444',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Lock size={12} />
            <span>PROTECTED DRM</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{ padding: '0.4rem 0.6rem' }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            className="modal-close-btn"
            style={{ position: 'static', width: '32px', height: '32px' }}
            onClick={onClose}
            title="Exit Reader"
            aria-label="Exit Reader"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation & Zoom Toolbar */}
      <div className="reader-toolbar">
        {/* Table of Contents Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowToc(!showToc)}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <List size={14} />
            <span>Chapters</span>
          </button>

          {/* Page Flip Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <ChevronLeft size={16} />
            </button>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: '#E5E7EB',
                padding: '0 0.5rem',
                minWidth: '105px',
                textAlign: 'center',
              }}
            >
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setScale((s) => Math.max(0.65, s - 0.15))}
            title="Zoom Out"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <ZoomOut size={14} />
          </button>

          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', minWidth: '45px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
            title="Zoom In"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <ZoomIn size={14} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setScale(1.15)}
            title="Reset Zoom"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Fit
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="reader-viewport">
        {/* Table of Contents Floating Popover */}
        {showToc && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              width: '320px',
              backgroundColor: '#0F0F0F',
              border: '1px solid #2A2A2A',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              zIndex: 100,
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #262626', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#EF4444' }}>
                TABLE OF CONTENTS
              </span>
              <button
                type="button"
                onClick={() => setShowToc(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '350px', overflowY: 'auto' }}>
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentPage(ch.page);
                    setShowToc(false);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '4px',
                    textAlign: 'left',
                    background: currentPage >= ch.page && (idx === chapters.length - 1 || currentPage < chapters[idx + 1].page) ? '#1E1E1E' : 'transparent',
                    border: 'none',
                    color: '#F3F4F6',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                  }}
                >
                  <span style={{ flex: 1, paddingRight: '0.5rem' }}>{ch.title}</span>
                  <span style={{ color: '#EF4444', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    p.{ch.page}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #333',
                borderTopColor: '#DC2626',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
              DECRYPTING PROTECTED MENTICO PAGES...
            </div>
          </div>
        )}

        {/* Load Error Fallback */}
        {loadError && !isLoading && (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#F87171', padding: '3rem 1.5rem' }}>
            <AlertTriangle size={36} style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Reader Decryption Notice
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Your Mentico license is active. Access is strictly delivered via this protected DRM environment. Click below to reload the reader.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
              >
                <RotateCw size={16} />
                <span>Reload Protected Reader</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
              >
                <X size={16} />
                <span>Exit Reader</span>
              </button>
            </div>
          </div>
        )}

        {/* Document Canvas Container with Layered Dynamic Watermarking */}
        <div
          className="reader-canvas-container"
          style={{ display: isLoading ? 'none' : 'block' }}
        >
          {/* Layer 1: HTML5 Canvas with pixels rendered by PDF.js */}
          <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />

          {/* Layer 2: Floating DOM Watermark Overlay to resist screen capture */}
          <div className="reader-watermark-overlay">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="reader-watermark-item">
                MENTICO VAULT • {studentEmail} • {licenseKey} • UNAUTHORIZED SHARING IS PROHIBITED
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

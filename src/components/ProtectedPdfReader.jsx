import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Shield,
  Lock,
  X,
  BookOpen,
  AlertTriangle,
  List,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source using Vite's ?url import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ProtectedPdfReader({
  pdfUrl = '/Mentico_Mastery_Blueprint.pdf',
  user,
  onClose,
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(90);
  const [scale, setScale] = useState(1.15);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drmToast, setDrmToast] = useState('');
  const [showToc, setShowToc] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

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
  }, []);

  const triggerDrmWarning = (msg) => {
    setDrmToast(msg);
    setTimeout(() => {
      setDrmToast('');
    }, 3000);
  };

  // Load the PDF Document
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      disableRange: false,
    });

    loadingTask.promise
      .then((doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('PDF Load Error:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Render Page to Canvas + Forensic Watermark directly on Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    // Cancel existing render if page/scale changed rapidly
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise
        .then(() => {
          if (isCancelled) return;
          // Apply forensic watermark directly to the canvas pixels
          drawCanvasWatermark(context, viewport.width, viewport.height);
        })
        .catch((err) => {
          if (err.name !== 'RenderingCancelledException') {
            console.error('Page render error:', err);
          }
        });
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  // Forensic Watermark Baked Directly Into Canvas Pixels
  const drawCanvasWatermark = (ctx, width, height) => {
    ctx.save();
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = 'rgba(220, 38, 38, 0.14)';
    ctx.rotate((-25 * Math.PI) / 180);

    const text = `LICENSED TO: ${studentEmail} • ID: ${licenseKey} • MENTICO PROTECTED VAULT`;

    for (let x = -width; x < width * 2; x += 360) {
      for (let y = -height; y < height * 2; y += 140) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  };

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
            <span>SITE-ONLY ACCESS • DRM ACTIVE</span>
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

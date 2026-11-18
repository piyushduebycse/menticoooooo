import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  CheckCircle2,
  Lock,
  ExternalLink,
  Key,
  RefreshCw,
  Sparkles,
  CheckSquare,
  Square,
  Mic,
  Heart,
  Eye,
  X,
  Maximize2,
  BookOpen,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import ProtectedPdfReader from '../components/ProtectedPdfReader';
import LearningJourney from '../components/LearningJourney';
import { getReadingProgress } from '../services/readingProgress';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const shouldAutoOpen = searchParams.get('openPdf') === 'true' || location.state?.openPdf === true;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('[Dashboard] Logout error:', err);
    }
    try {
      localStorage.removeItem('mentico_access_pass');
      window.dispatchEvent(new Event('storage'));
    } catch {}
    navigate('/');
  };

  const storedPass = (() => {
    try {
      return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mentico_access_pass') || '{}') : {};
    } catch {
      return {};
    }
  })();

  const effectiveUser = {
    ...(user || {}),
    ...(storedPass || {}),
    ...(location.state?.accessPass || {}),
    hasPurchased: Boolean(user?.hasPurchased || user?.hasPurchasedPdf || storedPass?.hasPurchased || location.state?.accessPass?.hasPurchased),
    name: user?.displayName || storedPass?.name || location.state?.accessPass?.name || 'Mentico Student',
    email: user?.email || storedPass?.email || location.state?.accessPass?.email || 'student@mentico.co.in',
    accessToken: location.state?.accessPass?.accessToken || storedPass?.accessToken || user?.accessToken || null,
    licenseKey: location.state?.accessPass?.licenseKey || storedPass?.licenseKey || user?.licenseKey || 'MENTICO-IN-VIP',
  };

  const studentId = effectiveUser?.uid || effectiveUser?.email;
  const [readingProgress, setReadingProgress] = useState(() => getReadingProgress(studentId, 'social-freedom'));
  const [initialPdfPage, setInitialPdfPage] = useState(1);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(shouldAutoOpen);

  useEffect(() => {
    if (shouldAutoOpen) {
      setIsPdfViewerOpen(true);
    }
  }, [shouldAutoOpen]);

  // Synchronize reading progress on mount and when studentId changes
  useEffect(() => {
    if (studentId) {
      setReadingProgress(getReadingProgress(studentId, 'social-freedom'));
    }
  }, [studentId]);

  // Listen to cross-component reading progress updates
  useEffect(() => {
    const handleProgressEvent = (e) => {
      if (e.detail) {
        setReadingProgress(e.detail);
      }
    };
    window.addEventListener('mentico:reading-progress-updated', handleProgressEvent);
    return () => window.removeEventListener('mentico:reading-progress-updated', handleProgressEvent);
  }, []);

  const handleResumeReading = (pageNumber = null) => {
    const target = pageNumber || readingProgress.lastPage || 1;
    setInitialPdfPage(target);
    setIsPdfViewerOpen(true);
  };

  const handleRefresh = () => {
    setIsFetchingData(true);
    if (studentId) {
      setReadingProgress(getReadingProgress(studentId, 'social-freedom'));
    }
    setTimeout(() => {
      setIsFetchingData(false);
    }, 200);
  };

  if (isFetchingData) {
    return (
      <div className="section" style={{ paddingTop: '2.5rem' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        {/* ==================================================================
            DASHBOARD HEADER: STUDENT STATUS & LICENSE KEY
            ================================================================== */}
        <div
          className="card card-red-accent dashboard-header-card"
          style={{
            marginBottom: '2rem',
            padding: 'clamp(1.25rem, 3.5vw, 2.25rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--pure-black)',
                  border: '2px solid var(--red-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                }}
              >
                {String(effectiveUser?.name || effectiveUser?.displayName || effectiveUser?.email || 'ST')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 style={{ fontSize: '1.6rem' }}>{effectiveUser?.name || effectiveUser?.displayName || 'Mentico Student'}</h2>
                  <span className="badge-red" style={{ fontSize: '0.7rem' }}>
                    PRO MEMBER // 18–30
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {effectiveUser?.email || 'student@mentico.co.in'} • Enrolled in Mentico 3-in-1 Mastery Program
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRefresh}
                title="Refresh Cloud Sync"
              >
                <RefreshCw size={14} />
                <span>Sync Vault</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                title="Sign Out of Mentico"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-secondary)',
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Sub-strip */}
          <div
            className="dashboard-metrics-strip"
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Key size={15} color="var(--red-primary)" />
              <span>Student ID:</span>
              <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 700 }}>
                {user?.licenseKey || 'MENTICO-IN-9842-X1'}
              </code>
            </div>
            <div>
              Program Access: <span style={{ color: 'var(--red-primary)', fontWeight: 700 }}>FULL ACCESS (ACTIVE)</span>
            </div>
            <div>
              Reader Mode: <strong style={{ color: '#16A34A' }}>PROTECTED WEB ACCESS</strong>
            </div>
          </div>
        </div>

        {/* ==================================================================
            QUICK STATS SUMMARY CARDS
            ================================================================== */}
        <div className="dashboard-stats-grid">
          <div className="card card-solid" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              BLUEPRINT DELIVERABLE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Official PDF</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--red-primary)', fontWeight: 600 }}>Official High-Res Document</div>
          </div>

          <div className="card card-solid" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              READING PROGRESS
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {readingProgress.progressPercentage}% Complete
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {readingProgress.isStarted ? `${readingProgress.lastPage} of ${readingProgress.totalPages} Pages Read` : 'Journey Not Started Yet'}
            </div>
          </div>

          <div className="card card-solid" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              FIELD MANUAL
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>16 Core Modules</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>180 Comprehensive Pages</div>
          </div>

          <div className="card card-solid" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              SPEECH TEMPLATES
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--red-primary)' }}>15 Cheatsheets</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Viva, GD & Dating Scripts</div>
          </div>
        </div>

        {/* ==================================================================
            MAIN CONTENT SPLIT: LEFT (PRIMARY PDF READER) & RIGHT (CHECKLIST)
            ================================================================== */}
        <div className="dashboard-main-grid">
          {/* Left Column: PDF Download Center */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Primary Student Deliverable</h3>
                <p style={{ fontSize: '0.88rem' }}>Official High-Resolution Mentico Blueprint PDF.</p>
              </div>
              <span className="badge-red" style={{ fontSize: '0.7rem' }}>
                DIGITAL PDF MANUAL
              </span>
            </div>

            {/* Featured PDF Protected Reader Showcase */}
            <div className="deliverable-card-inner">
              {/* PDF Document Icon Visual */}
              <div
                style={{
                  width: '95px',
                  height: '120px',
                  backgroundColor: 'var(--pure-black)',
                  border: '2px solid var(--red-primary)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  color: '#FFFFFF',
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--red-primary)', fontWeight: 800 }}>
                  MENTICO
                </div>
                <div style={{ textAlign: 'center' }}>
                  <FileText size={32} color="var(--red-primary)" style={{ margin: '0 auto' }} />
                </div>
                <div style={{ fontSize: '0.6rem', textAlign: 'center', color: '#A1A1AA', fontFamily: 'var(--font-mono)' }}>
                  FULL MANUAL
                </div>
              </div>

              {/* PDF Metadata and CTAs */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                  The Mentico Mastery Blueprint (PDF)
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Official Course Manual • High-Res Digital PDF • Licensed to:{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red-primary)', fontWeight: 700 }}>
                    {user?.displayName || user?.email}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Primary Protected Reader Button */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleResumeReading(readingProgress.lastPage)}
                    id="dashboard-open-reader-btn"
                    style={{ flex: 1, minWidth: '220px', padding: '0.95rem 1.5rem', fontWeight: 800 }}
                  >
                    <BookOpen size={18} />
                    <span>Open Protected Web Reader</span>
                  </button>

                  {/* Direct Backup Link if R2 is unavailable */}
                  <a
                    href="https://drive.google.com/file/d/12Tak_H7W-TS0gmyX9Lkza0lSwY_a-fn_/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontWeight: 700,
                      padding: '0.95rem 1.25rem',
                      textDecoration: 'none',
                    }}
                    title="Direct PDF link hosted on Google Drive"
                  >
                    <ExternalLink size={16} />
                    <span>Direct Reader (Google Drive)</span>
                  </a>

                  <div
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={14} color="#16A34A" />
                      <span>ANTI-PIRACY ACTIVE • WATERMARKED TO {user?.email}</span>
                    </div>
                    <a
                      href="https://drive.google.com/file/d/12Tak_H7W-TS0gmyX9Lkza0lSwY_a-fn_/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--red-primary)', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Direct Backup: Google Drive ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Secondary Modules */}
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Bonus Student Toolkits (Protected View):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <FileText size={18} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>GD & Campus Placement Cheat Sheets</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>15 Powerful Group Discussion Openers • Inside Blueprint</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleResumeReading(readingProgress.lastPage)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={14} color="var(--red-primary)" />
                  <span>Read Online</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <Heart size={18} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Social Charisma & Small Talk Framework</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Never run out of things to say • Inside Blueprint</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleResumeReading(readingProgress.lastPage)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={14} color="var(--red-primary)" />
                  <span>Read Online</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Your Learning Journey Section */}
          <LearningJourney
            progress={readingProgress}
            onResumeReading={handleResumeReading}
          />
        </div>

      </div>

      {/* ==================================================================
          IN-APP PDF READER MODAL (DISPLAYS THE OFFICIAL DIGITAL MANUAL)
          ================================================================== */}
      {isPdfViewerOpen && (
        <ErrorBoundary>
          <ProtectedPdfReader
            bookId="social-freedom"
            pdfUrl="/api/pdf/social-freedom"
            initialPage={initialPdfPage}
            onProgressUpdate={(updated) => setReadingProgress(updated)}
            user={effectiveUser}
            onClose={() => setIsPdfViewerOpen(false)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

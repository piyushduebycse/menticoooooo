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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import ProtectedPdfReader from '../components/ProtectedPdfReader';

export default function Dashboard() {
  const { user } = useAuth();
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  // 30-Day Indian Youth Confidence & Speaking Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Open Chapter 1 in the Mentico Protected Web Reader', completed: true },
    { id: 2, text: 'Complete Day 1 Drill: Diaphragm Breathing & Vocal Resonance', completed: true },
    { id: 3, text: 'Day 2: 3-Second Eye Contact & Non-Apologetic Posture Drill', completed: true },
    { id: 4, text: 'Day 3: Record a 60-second impromptu speech without filler words', completed: false },
    { id: 5, text: 'Day 4: Initiate an effortless small-talk conversation with a stranger', completed: false },
    { id: 6, text: 'Day 5: Practice the "Pause & Breathe" anchor during a college/office meeting', completed: false },
  ]);

  // Simulate network fetch with Skeleton Loader for 1.2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetchingData(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsFetchingData(true);
    setTimeout(() => {
      setIsFetchingData(false);
    }, 900);
  };

  const toggleChecklist = (id) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

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
          className="card card-red-accent"
          style={{
            marginBottom: '2rem',
            padding: '2.25rem',
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
                {(user?.displayName || user?.email || 'ST')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 style={{ fontSize: '1.6rem' }}>{user?.displayName || 'Mentico Student'}</h2>
                  <span className="badge-red" style={{ fontSize: '0.7rem' }}>
                    PRO MEMBER // 18–30
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {user?.email} • Enrolled in Mentico 3-in-1 Mastery Program
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRefresh}
                title="Refresh Cloud Sync"
              >
                <RefreshCw size={14} />
                <span>Sync Vault</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Sub-strip */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card card-solid" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              BLUEPRINT DELIVERABLE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>12.6 MB PDF</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--red-primary)', fontWeight: 600 }}>Official High-Res Document</div>
          </div>

          <div className="card card-solid" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              30-DAY CHALLENGE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {progressPercent}% Complete
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{completedCount} of {checklist.length} Completed</div>
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
            MAIN CONTENT SPLIT: LEFT (PRIMARY PDF DOWNLOAD) & RIGHT (CHECKLIST)
            ================================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '2rem',
            alignItems: 'start',
            marginBottom: '4rem',
          }}
        >
          {/* Left Column: PDF Download Center */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Primary Student Deliverable</h3>
                <p style={{ fontSize: '0.88rem' }}>Official High-Resolution Mentico Blueprint PDF (12.6 MB).</p>
              </div>
              <span className="badge-red" style={{ fontSize: '0.7rem' }}>
                DIGITAL PDF (12.6 MB)
              </span>
            </div>

            {/* Featured PDF Download Showcase */}
            <div
              style={{
                padding: '2rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-main)',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.75rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
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
                  12.6 MB PDF
                </div>
              </div>

              {/* PDF Metadata and CTAs */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                  The Mentico Mastery Blueprint (PDF)
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Official Course Manual • 12.6 MB High-Res PDF • Licensed to:{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red-primary)', fontWeight: 700 }}>
                    {user?.displayName || user?.email}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Primary CTA Button: Launch Protected Reader */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsPdfViewerOpen(true)}
                    id="dashboard-open-reader-btn"
                    style={{ flex: 1, minWidth: '240px', padding: '0.9rem 1.5rem', fontWeight: 800 }}
                  >
                    <BookOpen size={18} />
                    <span>Open Protected Web Reader</span>
                  </button>

                  <div
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <Shield size={14} color="#16A34A" />
                    <span>ANTI-PIRACY ACTIVE • WATERMARKED TO {user?.email} • SITE-ONLY ACCESS</span>
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={18} color="var(--red-primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>GD & Campus Placement Cheat Sheets</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>15 Powerful Group Discussion Openers • Inside Blueprint</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsPdfViewerOpen(true)}
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Heart size={18} color="var(--red-primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Social Charisma & Small Talk Framework</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Never run out of things to say • Inside Blueprint</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsPdfViewerOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={14} color="var(--red-primary)" />
                  <span>Read Online</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 30-Day Daily Habit Tracker */}
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>30-Day Confidence Sprint</h3>
              <p style={{ fontSize: '0.85rem' }}>Daily micro-habits to rewire speech & social poise.</p>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>Challenge Progress</span>
                <span style={{ color: 'var(--red-primary)', fontFamily: 'var(--font-mono)' }}>{progressPercent}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-main)',
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--red-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: item.completed ? 'var(--red-subtle)' : 'var(--bg-surface)',
                    border: item.completed ? '1px solid var(--red-subtle-border)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {item.completed ? (
                    <CheckSquare size={18} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Square size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                  <span
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      color: item.completed ? 'var(--text-main)' : 'var(--text-secondary)',
                      textDecoration: item.completed ? 'line-through' : 'none',
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================================
          IN-APP PDF READER MODAL (DISPLAYS THE REAL 12.6 MB PDF)
          ================================================================== */}
      {isPdfViewerOpen && (
        <ProtectedPdfReader
          pdfUrl="/Mentico_Mastery_Blueprint.pdf"
          user={user}
          onClose={() => setIsPdfViewerOpen(false)}
        />
      )}
    </div>
  );
}

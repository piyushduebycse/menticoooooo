import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading, openAuthModal, loginDemo } = useAuth();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  if (loading) {
    return (
      <div
        className="container"
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Spinner size="lg" color="red" />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          VERIFYING MENTICO STUDENT CREDENTIALS...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container-narrow">
          <div
            className="card card-red-accent"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                backgroundColor: 'var(--red-subtle)',
                border: '1px solid var(--red-subtle-border)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red-primary)',
              }}
            >
              <Lock size={32} />
            </div>

            <div className="badge-red" style={{ marginBottom: '1rem' }}>
              MENTICO STUDENT VAULT // PROTECTED
            </div>

            <h2 style={{ marginBottom: '1rem' }}>Student Login Required</h2>
            <p style={{ maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.98rem' }}>
              The Student Vault contains your downloadable 180-page Mentico Mastery Blueprint (PDF),
              audio speech drills, 30-day confidence challenge, and relationship frameworks.
            </p>

            {/* What's protected list */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-main)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'left',
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                UNLOCKED UPON LOGIN:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--red-primary)" />
                  The Mentico 180-Page Master PDF (Confidence, Speaking & Relationships)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--red-primary)" />
                  30-Day Daily Speech & Stage Presence Audio Drills
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--red-primary)" />
                  College & Corporate Conversation Cheat Sheets + Hindi/English Fluency Guide
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openAuthModal('login')}
              >
                <span>Sign In with Credentials</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                disabled={isDemoLoading}
                onClick={async () => {
                  setIsDemoLoading(true);
                  try {
                    await loginDemo();
                  } finally {
                    setIsDemoLoading(false);
                  }
                }}
              >
                {isDemoLoading ? (
                  <Spinner size="sm" color="red" text="Unlocking..." />
                ) : (
                  <>
                    <Zap size={16} color="var(--red-primary)" />
                    <span>Quick 1-Click Demo Login</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

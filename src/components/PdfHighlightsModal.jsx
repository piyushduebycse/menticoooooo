import React from 'react';
import { X, Lock, CheckCircle2, BookOpen, ArrowRight, Sparkles, Shield, Eye } from 'lucide-react';

export default function PdfHighlightsModal({ isOpen, onClose, onUnlock, currentPrice = 1, originalPrice = 999 }) {
  if (!isOpen) return null;

  return (
    <div className="highlight-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="highlight-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="highlight-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--red-subtle)',
                border: '1px solid var(--red-subtle-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red-primary)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>The Mentico Blueprint</h3>
                <span className="badge-red" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                  SAMPLE HIGHLIGHTS
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                Official 3-Page Field Manual Excerpt • Full Manual is 180 Pages
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Close Sample Preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Curated Highlights */}
        <div className="highlight-modal-body">
          {/* Highlight Notice */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--red-subtle)',
              border: '1px solid var(--red-subtle-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
            }}
          >
            <Eye size={16} color="var(--red-primary)" style={{ flexShrink: 0 }} />
            <span>
              Previewing selected excerpts from <strong>Chapter 1 & 2</strong>. The full manual and protected reader unlock upon checkout.
            </span>
          </div>

          {/* Highlight Card 1: 3-Second Action Rule */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red-primary)', fontWeight: 700 }}>
                // MODULE 1 • PAGE 18 EXCERPT
              </span>
              <span className="badge-mono" style={{ fontSize: '0.68rem' }}>CONFIDENCE DRILL</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>The 3-Second Action Rule Against Social Hesitation</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, marginBottom: '0.75rem' }}>
              "In Indian colleges and corporate teams, 90% of students hesitate not because of lack of knowledge, but because they overthink potential judgment for 30 seconds before speaking. When you notice someone you want to speak with or when an open question is asked, count <strong>3-2-1</strong> and shift your physical posture forward before your analytical mind can manufacture fear."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <CheckCircle2 size={13} color="var(--red-primary)" />
              <span>Full 30-Day Confidence Habit Protocol inside Chapter 1</span>
            </div>
          </div>

          {/* Highlight Card 2: Voice Shaking Anchor */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red-primary)', fontWeight: 700 }}>
                // MODULE 2 • PAGE 84 EXCERPT
              </span>
              <span className="badge-mono" style={{ fontSize: '0.68rem' }}>STAGE DRILL</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>The 'Pause & Breathe' Vocal Anchor</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, marginBottom: '0.75rem' }}>
              "When your voice trembles during a presentation, viva panel, or interview, the instinct is to speak faster to finish quickly. This is fatal. Instead: anchor both heels flat, drop your shoulders 2 inches, take a deliberate 2-second breath through your abdomen, and resume. In high-stakes Indian contexts, intentional silence signals unshakable authority."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <CheckCircle2 size={13} color="var(--red-primary)" />
              <span>Includes 15 Group Discussion & Viva Openers inside Chapter 2</span>
            </div>
          </div>

          {/* Highlight Card 3: Small Talk Framework */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red-primary)', fontWeight: 700 }}>
                // MODULE 3 • PAGE 126 EXCERPT
              </span>
              <span className="badge-mono" style={{ fontSize: '0.68rem' }}>CONNECTION DRILL</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>The 4-Thread Conversation Engine</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              "Never ask dead-end questions like 'What do you do?'. Split every answer into 4 conversational branches: Situation, Emotional Motivator, Contrarian Take, or Future Vision. You will never face an awkward silence again."
            </p>
          </div>

          {/* Locked Content Showcase */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--red-subtle-border)',
              backgroundColor: 'rgba(220, 38, 38, 0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--red-subtle)', color: 'var(--red-primary)', marginBottom: '0.65rem' }}>
              <Lock size={18} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.25rem' }}>
              170 Additional Pages & Field Cheatsheets Locked
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 auto 0.75rem', maxWidth: '440px' }}>
              Modules 3, 4, 5, 6, the 30-Day Social Freedom Challenge, Placement Viva Scripts, and Dating Poise Cheatsheets unlock in the Protected Web Reader upon enrollment.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>✓ Protected Web Reader</span>
              <span>✓ Lifetime Access</span>
              <span>✓ 30-Day Refund Guarantee</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="highlight-modal-footer">
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="badge-red" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                50% OFF
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Instant digital credential delivered immediately
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onUnlock();
            }}
            style={{ fontWeight: 800, padding: '0.8rem 1.4rem' }}
          >
            <span>Unlock Full Manual (₹{currentPrice})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

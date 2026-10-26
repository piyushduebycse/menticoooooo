import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  CheckCircle2,
  Lock,
  Shield,
  Star,
  Zap,
  ArrowRight,
  BookOpen,
  Headphones,
  Eye,
  Gift,
  Mic,
  Heart,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ProtectedPdfReader from '../components/ProtectedPdfReader';
import { openRazorpayCheckout } from '../services/razorpay';
import confetti from 'canvas-confetti';

export default function Product() {
  const { user, getIdToken, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activePreviewTab, setActivePreviewTab] = useState('toc');
  const [couponError, setCouponError] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  const originalPrice = 999; // in INR (original price)
  const basePrice = Number(import.meta.env.VITE_PRODUCT_PRICE_INR || 499); // ₹499 only
  const currentPrice = basePrice;

  const handlePurchase = async () => {
    setCouponError('');

    if (!user) {
      // User must be authenticated to purchase
      navigate('/login?redirect=%2Fpurchase');
      return;
    }

    if (user?.hasPurchased) {
      navigate('/library');
      return;
    }

    setIsPurchasing(true);

    try {
      // Paid flow via Razorpay
      const token = await getIdToken(true);
      if (!token) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      // Step A: Create order on serverless endpoint
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayedAmountInPaise: Math.round(currentPrice * 100) }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        if (orderData.code === 'razorpay/not-configured') {
          throw new Error('Checkout is not configured yet. Please contact support.');
        }
        throw new Error(orderData.error || 'Could not initiate payment order.');
      }

      if (orderData.alreadyPurchased) {
        navigate('/library');
        return;
      }

      // Step B: Open Razorpay Checkout modal
      await openRazorpayCheckout({
        order: orderData,
        user,
        onSuccess: async (paymentResponse) => {
          // Step C: Verify payment signature on server
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: paymentResponse.razorpay_order_id,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Payment verification failed.');
          }

          if (typeof refreshUser === 'function') {
            await refreshUser();
          }

          setPurchaseSuccess(true);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => {
            navigate('/library');
          }, 1200);
        },
        onFailure: (err) => {
          if (err.message && !err.message.includes('closed before completion')) {
            setCouponError(err.message);
          }
        },
      });
    } catch (err) {
      console.error('[Purchase Error]:', err);
      setCouponError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const chapters = [
    {
      num: '01',
      track: 'CONFIDENCE',
      title: 'Breaking The "Log Kya Kahenge" Cage',
      pages: 'pp. 12–42',
      summary:
        'Deconstruct social conditioning and fear of judgment. Discover the 3-step physical grounding routine that prevents racing heartbeat and sweaty palms before speaking.',
    },
    {
      num: '02',
      track: 'SPEAKING',
      title: 'Vocal Presence & Stage Command',
      pages: 'pp. 43–76',
      summary:
        'How to project from the diaphragm instead of the throat. Eliminating filler words ("umm", "like", "actually") and mastering strategic pauses in English and Hinglish.',
    },
    {
      num: '03',
      track: 'SPEAKING',
      title: 'High-Stakes College Vivas, GDs & Job Interviews',
      pages: 'pp. 77–110',
      summary:
        'Proven frameworks for campus placement interviews, group discussions, and viva panels. How to lead without being aggressive and answer tricky questions with poise.',
    },
    {
      num: '04',
      track: 'RELATIONSHIPS',
      title: 'Effortless Small Talk to Deep Connection',
      pages: 'pp. 111–138',
      summary:
        'Eliminate awkward silences forever. The 4 conversation thread techniques to effortlessly chat with new batchmates, colleagues, and strangers in social settings.',
    },
    {
      num: '05',
      track: 'RELATIONSHIPS',
      title: 'Dating Confidence & Authentic Magnetism',
      pages: 'pp. 139–162',
      summary:
        'How to show genuine romantic interest with respect, playfulness, and confidence. Overcoming rejection sensitivity and establishing healthy emotional boundaries.',
    },
    {
      num: '06',
      track: 'INTEGRATION',
      title: 'The 30-Day Daily Habit Protocol',
      pages: 'pp. 163–180',
      summary:
        'A morning and evening 10-minute vocal warmup, mirror drill, and daily social stretch goal that hardwires confidence into your daily muscle memory.',
    },
  ];

  return (
    <div className="section" style={{ paddingTop: '3.5rem' }}>
      <div className="container product-page-container">
        {/* ==================================================================
            PRODUCT HERO SECTION
            ================================================================== */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 4rem' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
            MENTICO OFFICIAL DIGITAL CURRICULUM // AGE 18–30
          </div>
          <h1 className="product-hero-title" style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>
            The Mentico Mastery Blueprint (PDF)
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
            The complete 12.6 MB self-transformation manual covering <strong>Confidence Building</strong>,{' '}
            <strong>Public Speaking Mastery</strong>, and <strong>Relationship Dynamics</strong>.
          </p>
        </div>

        {/* ==================================================================
            PRODUCT OVERVIEW GRID: DETAILS & CHECKOUT CARD
            ================================================================== */}
        <div className="product-overview-grid">
          {/* Left Column: Product Specifications & What's Inside */}
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--red-subtle)',
                    border: '1px solid var(--red-subtle-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--red-primary)',
                  }}
                >
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem' }}>Mentico Master PDF Specifications</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    2026 EDITION // PRINTABLE // 12.6 MB HIGH-RES DELIVERABLE
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-main)',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FILE SIZE</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>12.6 MB</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High-Res Vector</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FORMAT</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Visual PDF</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile & Laptop</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PAGES</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>180 Pages</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Field Manual</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>COMMUNITY</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--red-primary)' }}>Mentico Pro</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Youth Circle</div>
                </div>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Full Learning Assets Included:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Complete 12.6 MB Mentico Mastery Blueprint (High-Resolution Vector PDF)',
                  'Confidence Building Framework: Overcoming social anxiety & stage shivering',
                  'Public Speaking & Stage Presence: Keynotes, college viva & group discussions',
                  'Relationship & Dating Dynamics: Natural small talk & charisma cheatsheets',
                  '30 Actionable Speech Drills & Daily Exercises (Illustrated inside the PDF)',
                  'Printable 30-Day Daily Habit Tracker & Speech Evaluation Scorecard',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <CheckCircle2 size={18} color="var(--red-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.94rem', color: 'var(--text-main)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive PDF Sneak Peek */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={18} color="var(--red-primary)" />
                  <h4 style={{ fontSize: '1.1rem' }}>Blueprint Sample Sneak Peek</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsPdfPreviewOpen(true)}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Eye size={14} color="var(--red-primary)" />
                    <span>Preview Live PDF</span>
                  </button>
                  <span className="badge-mono" style={{ fontSize: '0.72rem' }}>VERIFIED EXCERPTS</span>
                </div>
              </div>

              {/* Preview tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-main)',
                  paddingBottom: '0.5rem',
                  overflowX: 'auto',
                }}
              >
                {[
                  { id: 'toc', label: 'Curriculum Index' },
                  { id: 'confidence', label: 'Confidence Excerpt' },
                  { id: 'speaking', label: 'Speech Drill Sample' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActivePreviewTab(t.id)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: activePreviewTab === t.id ? 'var(--red-subtle)' : 'transparent',
                      color: activePreviewTab === t.id ? 'var(--red-primary)' : 'var(--text-muted)',
                      border: activePreviewTab === t.id ? '1px solid var(--red-subtle-border)' : '1px solid transparent',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Preview Content Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {activePreviewTab === 'toc' && (
                  <div>
                    <div style={{ color: 'var(--red-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      // MENTICO CURRICULUM OVERVIEW (12.6 MB PDF)
                    </div>
                    <div>MODULE 1: INTERNAL CONFIDENCE ARCHITECTURE (pp. 12–76)</div>
                    <div style={{ color: 'var(--text-muted)' }}>• Defeating social anxiety & the Spotlight Effect</div>
                    <div style={{ color: 'var(--text-muted)' }}>• Physical stance, eye contact & grounding physiology</div>
                    <div style={{ marginTop: '0.75rem' }}>MODULE 2: PUBLIC SPEAKING & VOCAL COMMAND (pp. 77–138)</div>
                    <div style={{ color: 'var(--text-muted)' }}>• Diaphragmatic projection & eliminating filler words</div>
                    <div style={{ color: 'var(--text-muted)' }}>• Cracking College Viva, GDs & Corporate Presentations</div>
                    <div style={{ marginTop: '0.75rem' }}>MODULE 3: RELATIONSHIP & SOCIAL CHARISMA (pp. 139–180)</div>
                    <div style={{ color: 'var(--text-muted)' }}>• Small talk mastery, dating poise & building lifelong networks</div>
                  </div>
                )}

                {activePreviewTab === 'confidence' && (
                  <div>
                    <div style={{ color: 'var(--red-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      // EXCERPT: CHAPTER 1.2 — THE 3-SECOND RULE FOR SOCIAL ANXIETY
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      "In Indian college campuses and first jobs, 90% of students hesitate because
                      they overthink the possible negative outcome for 30 seconds before acting.
                      When you see someone you want to speak with or when the professor asks a question,
                      count 3-2-1 and move your physical body before your analytical brain invents fear."
                    </p>
                    <div style={{ color: 'var(--red-primary)', fontSize: '0.75rem' }}>
                      [Full 30-Day Confidence Habit Loop inside the 12.6 MB Blueprint]
                    </div>
                  </div>
                )}

                {activePreviewTab === 'speaking' && (
                  <div>
                    <div style={{ color: 'var(--red-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      // EXCERPT: CHAPTER 2.4 — THE 'PAUSE & BREATHE' ANCHOR
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      "When you feel your voice shaking during a stage presentation or interview:"
                    </p>
                    <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      "Plant both feet firmly at shoulder-width. Drop your shoulders 2 inches.
                      Take a 2-second deliberate pause. In India, people speak too quickly out of
                      nervousness. The audience interprets silence as calm, authoritative command."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Enrollment Card */}
          <div>
            <div
              className="card card-red-accent product-checkout-card"
              id="checkout-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span className="badge-red">STUDENT & YOUTH PRICING</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--red-primary)', fontSize: '0.85rem' }}>
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
              </div>

              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>The Mentico Blueprint</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Unlock the complete 180-page manual, action frameworks, and live exercises instantly.
              </p>

              {/* Price display in INR */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                  ₹{currentPrice.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--red-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    50% SPECIAL LAUNCH DISCOUNT
                  </span>
                </div>
              </div>

              {couponError && (
                <div role="alert" style={{ color: 'var(--red-primary)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {couponError}
                </div>
              )}

              {user?.hasPurchasedPdf && (
                <div
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Active License Detected</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                    You already have lifetime access to the Social Freedom Hub with this account.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', borderColor: '#22c55e', color: '#22c55e' }}
                  >
                    Open Social Freedom Hub →
                  </button>
                </div>
              )}

              {/* Primary Purchase CTA with Loading Spinner */}
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
                onClick={handlePurchase}
                disabled={isPurchasing || purchaseSuccess}
                id="btn-purchase-blueprint"
              >
                {isPurchasing ? (
                  <Spinner size="sm" color="white" text="Activating Student Membership..." />
                ) : purchaseSuccess ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Enrolled! Redirecting to Social Freedom Hub...</span>
                  </span>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Get Instant Access (₹{currentPrice})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {user ? (
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Logged in as: <strong style={{ color: 'var(--text-main)' }}>{user.email}</strong>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Instant digital credentials delivered immediately upon enrollment.
                </div>
              )}

              {/* Guarantee / Security badge */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Shield size={24} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>30-Day Money-Back Guarantee</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    If you don't feel a noticeable boost in confidence within 30 days, get a 100% full refund.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
            CHAPTER BY CHAPTER CURRICULUM
            ================================================================== */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge-red" style={{ marginBottom: '1rem' }}>
              6 ACTIONABLE MODULES
            </div>
            <h2>Step-by-Step Mastery Curriculum</h2>
            <p>Designed for young Indians to read, practice, and implement immediately.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {chapters.map((ch, idx) => (
              <div
                key={idx}
                className="card chapter-curriculum-card"
              >
                <div className="chapter-num-box">
                  {ch.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="chapter-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{ch.title}</h3>
                      <span className="tag-red" style={{ fontSize: '0.68rem' }}>{ch.track}</span>
                    </div>
                    <span className="badge-mono" style={{ fontSize: '0.72rem' }}>{ch.pages}</span>
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, margin: 0, marginTop: '0.4rem' }}>{ch.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================
          MOBILE PINNED BOTTOM ACTION BAR
          Sticks to the bottom of the viewport on mobile devices
          ================================================================== */}
      <div className="mobile-pinned-bottom-bar" id="mobile-bottom-bar">
        <div className="mobile-pinned-pricing-box">
          <div className="mobile-pinned-price-line">
            <span className="mobile-pinned-price">₹{currentPrice.toLocaleString('en-IN')}</span>
            <span className="mobile-pinned-original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
            <span className="mobile-pinned-badge">
              50% OFF
            </span>
          </div>
          <div className="mobile-pinned-sublabel">
            Instant Access // 12.6 MB Blueprint
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary mobile-pinned-cta-btn"
          onClick={() => {
            const card = document.getElementById('checkout-card');
            if (card) {
              const rect = card.getBoundingClientRect();
              const isCardInView = rect.top >= -50 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 150;
              if (isCardInView && !isPurchasing) {
                handlePurchase();
              } else {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else {
              handlePurchase();
            }
          }}
          disabled={isPurchasing || purchaseSuccess}
          id="btn-mobile-pinned-cta"
        >
          {isPurchasing ? (
            <Spinner size="sm" color="white" text="" />
          ) : purchaseSuccess ? (
            <span>Redirecting...</span>
          ) : (
            <>
              <span>{currentPrice === 0 ? 'Claim Free' : 'Get the Book'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* ==================================================================
          IN-APP PDF PREVIEW MODAL (PREVIEW THE REAL 12.6 MB PDF)
          ================================================================== */}
      {isPdfPreviewOpen && (
        <ProtectedPdfReader
          pdfUrl="/Mentico_Mastery_Blueprint.pdf"
          user={user}
          onClose={() => setIsPdfPreviewOpen(false)}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Shield,
  Users,
  Compass,
  Heart,
  Settings,
  Sparkles,
  BarChart3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Zap,
  BookOpen,
} from 'lucide-react';
import Spinner from '../components/Spinner';
import ProtectedPdfReader from '../components/ProtectedPdfReader';

export default function Home() {
  const navigate = useNavigate();
  const [isCtaLoading, setIsCtaLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [selectedPreviewPage, setSelectedPreviewPage] = useState(null);

  const handleCtaClick = () => {
    setIsCtaLoading(true);
    setTimeout(() => {
      setIsCtaLoading(false);
      navigate('/product');
    }, 600);
  };

  const whatYoullLearn = [
    {
      icon: MessageSquare,
      title: 'Start without overthinking',
      desc: 'Take small, practical actions in real situations.',
    },
    {
      icon: Shield,
      title: 'Handle rejection with confidence',
      desc: "Don't take it personally. Learn, move forward.",
    },
    {
      icon: Users,
      title: 'Have better conversations',
      desc: 'Move beyond small talk and keep it natural.',
    },
    {
      icon: Compass,
      title: 'Build a social life beyond dating',
      desc: 'Make friends and feel more comfortable in groups.',
    },
    {
      icon: Heart,
      title: 'Read reciprocity',
      desc: 'Understand genuine interest vs friendliness.',
    },
    {
      icon: Settings,
      title: 'Practical frameworks',
      desc: 'Simple models you can reuse in everyday life.',
    },
    {
      icon: Sparkles,
      title: 'Express attraction without manipulation',
      desc: 'Be honest, clear and respectful.',
    },
    {
      icon: BarChart3,
      title: '30-day challenge',
      desc: 'Turn learning into real experience.',
    },
  ];

  const familiarList = [
    'You overthink before approaching someone.',
    'You struggle to start or keep conversations.',
    'You worry about what others think.',
    'You avoid social situations.',
    'You want to express interest but fear rejection.',
    'You feel stuck, even though you want more connections.',
  ];

  const challengeSteps = [
    {
      badge: 'DAYS 1–3',
      color: '#0284C7',
      phase: 'Presence',
      desc: 'Be more aware and present.',
    },
    {
      badge: 'DAYS 4–9',
      color: '#16A34A',
      phase: 'Small Actions',
      desc: 'Start simple conversations.',
    },
    {
      badge: 'DAYS 10–21',
      color: '#D97706',
      phase: 'Build Momentum',
      desc: 'Go deeper, join groups, express yourself.',
    },
    {
      badge: 'DAYS 22–30',
      color: '#DC2626',
      phase: 'Real Progress',
      desc: 'Handle uncertainty, make invitations and review.',
    },
  ];

  const notList = [
    'No scripts.',
    'No manipulation.',
    'No fake personality.',
    'No guaranteed dates.',
    'No tricks or shortcuts.',
  ];

  const isList = [
    'A practical, ethical system.',
    'Real-world strategies.',
    'Respect for boundaries.',
    'Focus on genuine connections.',
    'Works for everyday life, not just dating.',
  ];

  const formulaSteps = [
    { title: 'ACTION', subtitle: 'Take small actions.', icon: '🏃' },
    { title: 'EXPERIENCE', subtitle: 'See what actually happens.', icon: '📄' },
    { title: 'EVIDENCE', subtitle: 'Build your own proof.', icon: '📊' },
    { title: 'CONFIDENCE', subtitle: 'Your confidence grows.', icon: '🧠' },
    { title: 'MORE ACTION', subtitle: 'Keep improving.', icon: '🔄' },
  ];

  const whatsInsideList = [
    '90 pages of practical content',
    'Social confidence fundamentals',
    'Conversation frameworks',
    'Approaching women (ethical & respectful)',
    'Rejection handling',
    'Real-life scenarios',
    '30-day challenge',
    'Cheat sheets & final field card',
    'And much more...',
  ];

  const testimonials = [
    {
      name: 'Aman, 26',
      quote:
        'This helped me stop overthinking and actually start talking to people. The 30-day challenge is super practical.',
      avatarBg: '#FECACA',
      initial: 'A',
    },
    {
      name: 'Rohan, 24',
      quote:
        'I feel more confident in social situations and conversations feel so much more natural now.',
      avatarBg: '#FED7AA',
      initial: 'R',
    },
    {
      name: 'Karan, 28',
      quote:
        'Not just about dating, this improved my overall social life. Very practical and well explained.',
      avatarBg: '#BBF7D0',
      initial: 'K',
    },
  ];

  const sneakPeekItems = [
    {
      id: 1,
      title: 'BUILD YOUR SOCIAL CONFIDENCE. BECOME A DIFFERENT YOU.',
      tag: 'Clear frameworks',
      previewType: 'cover',
    },
    {
      id: 2,
      title: 'The Conversation Engine',
      steps: ['Observe', 'Open', 'Find a Thread', 'Relate', 'Play', 'Go Deeper', 'Check Reciprocity'],
      tag: 'Practical steps',
      previewType: 'engine',
    },
    {
      id: 3,
      title: 'The 30-Day Challenge',
      tag: 'Actionable roadmap',
      previewType: 'roadmap',
    },
    {
      id: 4,
      title: 'Final Field Card',
      tenets: ['BE PRESENT.', 'START SIMPLE.', 'LISTEN.', 'RELATE.', 'EXPRESS YOURSELF.', 'CHECK RECIPROCITY.', 'RESPECT THE ANSWER.', 'KEEP LIVING.'],
      tag: 'Easy to remember',
      previewType: 'card',
    },
  ];

  const isForYouList = [
    'You want to overcome social anxiety or hesitation.',
    'You want to be more confident in conversations.',
    'You want to make friends and meet new people.',
    'You want to express interest respectfully.',
    'You want practical steps, not just theory.',
    "You're ready to take action and improve.",
  ];

  const faqs = [
    {
      q: 'What format is the book?',
      a: 'It is accessible 24/7 inside the official Mentico Protected Web Reader on your phone, tablet, and laptop. To protect content authenticity and prevent piracy, it is read directly in your authenticated student vault with zero download hassle.',
    },
    {
      q: 'Is this only about approaching women?',
      a: 'No. While it teaches respectful, ethical attraction without games, it is designed for your whole social life: making friends, feeling comfortable in groups, college vivas, networking, and everyday casual interactions.',
    },
    {
      q: 'Will this guarantee dates or relationships?',
      a: 'No ethical coach guarantees dates because human attraction is mutual and nuanced. What it guarantees is that you will eliminate overthinking, handle uncertainty with calm confidence, and communicate with magnetic honesty.',
    },
    {
      q: 'How will I receive the book?',
      a: 'Access is 100% instantaneous. Immediately after enrolling, your personal student license is activated and you can open the complete 90-page field guide in the high-res Mentico Web Reader.',
    },
  ];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div className="container" style={{ paddingTop: '1.5rem' }}>

        {/* ==================================================================
            1. HERO SECTION (2-COLUMN BLUEPRINT LAYOUT)
            ================================================================== */}
        <section
          className="blueprint-hero-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="hero-grid-responsive">
            {/* Left Column: Title, Subtitle, CTA & Skyline Graphic */}
            <div style={{ position: 'relative' }}>
              {/* Top Badges: Tag + Non-colliding Handwritten Note */}
              <div className="hero-top-badges">
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    border: '1px solid rgba(3, 105, 161, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  A PRACTICAL FIELD GUIDE
                </div>

                {/* Handwritten Note top-right */}
                <div className="handwritten-annotation hero-handwritten-note">
                  More confidence.
                  <br />
                  More real connections.
                  <br />
                  A freer you.
                </div>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                  lineHeight: 1.05,
                  marginBottom: '0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                MENTICO
              </h1>
              <h2
                style={{
                  fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)',
                  color: '#0284C7',
                  lineHeight: 1.05,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                SOCIAL FREEDOM
              </h2>

              <p
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: '0.6rem',
                }}
              >
                Stop overthinking. Start participating.
              </p>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '1.75rem',
                }}
              >
                A step-by-step system to build real social confidence, have better conversations,
                handle rejection and create meaningful connections.
              </p>

              {/* Red CTA Button with Loading Spinner */}
              <div style={{ marginBottom: '1.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleCtaClick}
                  disabled={isCtaLoading}
                  style={{
                    backgroundColor: 'var(--red-primary)',
                    color: '#FFFFFF',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    padding: '0.95rem 2rem',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 18px var(--red-glow)',
                  }}
                >
                  {isCtaLoading ? (
                    <Spinner size="sm" color="white" text="Opening Mentico Vault..." />
                  ) : (
                    <>
                      <span>Get the PDF Book Now</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '1.75rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={15} color="var(--red-primary)" /> Instant digital access
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={15} color="var(--red-primary)" /> 90 pages practical guide
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--red-primary)" /> 30-day challenge included
                </span>
              </div>

              {/* Hero Skyline Illustration */}
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* SVG Illustration: Young man with backpack sitting, gazing at city skyline */}
                <svg
                  width="110"
                  height="75"
                  viewBox="0 0 110 75"
                  fill="none"
                  style={{ flexShrink: 0 }}
                  aria-hidden="true"
                >
                  {/* Sun & rays */}
                  <circle cx="95" cy="20" r="12" fill="#FDE047" opacity="0.6" />
                  <path d="M95 4V1M107 8L110 5M83 8L80 5" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Distant skyline buildings */}
                  <rect x="55" y="24" width="8" height="35" fill="#CBD5E1" />
                  <rect x="65" y="16" width="10" height="43" fill="#94A3B8" />
                  <rect x="77" y="22" width="7" height="37" fill="#CBD5E1" />
                  <rect x="86" y="12" width="9" height="47" fill="#64748B" />
                  <rect x="97" y="26" width="8" height="33" fill="#94A3B8" />
                  {/* Hill ground */}
                  <path d="M0 68 Q50 56 110 65 L110 75 L0 75 Z" fill="#65A30D" opacity="0.4" />
                  {/* Boy silhouette with backpack viewed from behind */}
                  <ellipse cx="28" cy="46" rx="9" ry="14" fill="#3B82F6" />
                  {/* Backpack */}
                  <rect x="22" y="44" width="9" height="11" rx="2" fill="#1E293B" />
                  {/* Head */}
                  <circle cx="28" cy="28" r="6" fill="#FBBF24" />
                  <path d="M22 26 C23 20, 33 20, 34 26 C31 22, 25 22, 22 26 Z" fill="#1E293B" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    From Social Hesitation to Freedom
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Turn concepts into real-world confidence across campuses, workplaces & social circles.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: WHAT YOU'LL LEARN (2x4 Grid) */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-main)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.75rem',
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="marker-tag marker-blue">WHAT YOU'LL LEARN</span>
              </div>

              <div className="learn-grid-responsive">
                {whatYoullLearn.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--red-primary)',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: '0.2rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. "DOES THIS SOUND FAMILIAR?" vs "30-DAY SOCIAL FREEDOM CHALLENGE"
            ================================================================== */}
        <section className="blueprint-grid-2col">
          {/* Left Card: DOES THIS SOUND FAMILIAR? */}
          <div className="blueprint-card blueprint-card-pink">
            <span className="marker-tag marker-pink">DOES THIS SOUND FAMILIAR?</span>

            <div className="familiar-grid-responsive">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {familiarList.map((text, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#F87171',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        flexShrink: 0,
                        marginTop: '3px',
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.4 }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Illustration: Guy sitting, thought bubble with tangled scribbles */}
              <div style={{ textAlign: 'center' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" fill="none" style={{ margin: '0 auto' }}>
                  {/* Thought bubble cloud */}
                  <path
                    d="M60 40 C50 30, 80 15, 95 25 C115 15, 135 30, 125 45 C135 60, 115 75, 95 65 C85 75, 60 70, 60 55 C45 55, 45 40, 60 40 Z"
                    fill="var(--bg-card)"
                    stroke="var(--border-main)"
                    strokeWidth="1.5"
                  />
                  {/* Small thought bubbles */}
                  <circle cx="55" cy="75" r="4" fill="var(--bg-card)" stroke="var(--border-main)" />
                  <circle cx="50" cy="85" r="2.5" fill="var(--bg-card)" stroke="var(--border-main)" />
                  {/* Tangled scribble lines inside bubble */}
                  <path
                    d="M70 45 Q85 30 95 45 T110 35 T100 55 T80 40 T90 55 T105 45"
                    stroke="#1E293B"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  {/* Man sitting, head in hands */}
                  <circle cx="50" cy="100" r="12" fill="#FBBF24" />
                  <path d="M42 98 C42 92, 58 92, 58 98 Z" fill="#1E293B" />
                  {/* Hands to head */}
                  <path d="M38 108 L45 102 M62 108 L55 102" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
                  {/* Torso */}
                  <path d="M35 120 C35 110, 65 110, 65 120 L65 145 L35 145 Z" fill="#64748B" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Card: THE 30-DAY SOCIAL FREEDOM CHALLENGE */}
          <div className="blueprint-card blueprint-card-yellow">
            <span className="marker-tag marker-yellow">THE 30-DAY SOCIAL FREEDOM CHALLENGE</span>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              A progressive challenge to turn concepts into real-world experience.
            </p>

            <div className="challenge-timeline">
              {challengeSteps.map((step, idx) => (
                <div key={idx} className="challenge-step">
                  <div className="challenge-calendar-icon">
                    <div className="challenge-calendar-header" style={{ backgroundColor: step.color }} />
                    <div className="challenge-calendar-body">{step.badge}</div>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {step.phase}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. "THIS IS NOT A PICKUP-LINE BOOK" vs "THE CONFIDENCE FORMULA"
            ================================================================== */}
        <section className="blueprint-grid-2col">
          {/* Left Card: THIS IS NOT A PICKUP-LINE BOOK */}
          <div className="blueprint-card blueprint-card-blue">
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                THIS IS{' '}
                <span
                  style={{
                    backgroundColor: 'var(--red-subtle)',
                    color: 'var(--red-primary)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--red-primary)',
                    textDecoration: 'none',
                    fontWeight: 900,
                  }}
                >
                  NOT
                </span>{' '}
                A PICKUP-LINE BOOK
              </span>
            </div>

            <div className="not-pickup-grid">
              {/* Left Column: What It's Not */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {notList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={17} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Column: What It Is */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {isList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={17} color="#16A34A" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: THE CONFIDENCE FORMULA */}
          <div className="blueprint-card blueprint-card-blue">
            <span className="marker-tag marker-blue">THE CONFIDENCE FORMULA</span>

            <div className="formula-flow">
              {formulaSteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="formula-node">
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{step.icon}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {step.subtitle}
                    </div>
                  </div>
                  {idx < formulaSteps.length - 1 && (
                    <div className="formula-arrow">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. "WHAT'S INSIDE?" vs "REAL PEOPLE. REAL PROGRESS."
            ================================================================== */}
        <section className="blueprint-grid-2col">
          {/* Left Card: WHAT'S INSIDE? */}
          <div className="blueprint-card blueprint-card-green">
            <span className="marker-tag marker-green">WHAT'S INSIDE?</span>

            <div className="inside-grid-responsive">
              {/* 3D Book Mockup */}
              <div className="book-mockup-wrapper">
                <div className="book-3d">
                  <div className="book-3d-spine" />
                  <div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--red-primary)', fontFamily: 'var(--font-mono)' }}>
                      MENTICO
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0A0A', lineHeight: 1.1, marginTop: '0.25rem' }}>
                      SOCIAL<br />
                      <span style={{ color: '#0284C7' }}>FREEDOM</span>
                    </div>
                  </div>

                  {/* Artwork silhouette on book */}
                  <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                    <svg width="70" height="50" viewBox="0 0 70 50" fill="none">
                      <rect x="35" y="10" width="6" height="30" fill="#94A3B8" />
                      <rect x="44" y="5" width="7" height="35" fill="#64748B" />
                      <rect x="54" y="15" width="6" height="25" fill="#CBD5E1" />
                      <circle cx="20" cy="22" r="4" fill="#FBBF24" />
                      <ellipse cx="20" cy="34" rx="6" ry="9" fill="#3B82F6" />
                    </svg>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.52rem', color: '#475569', lineHeight: 1.25, borderTop: '1px solid #E2E8F0', paddingTop: '0.4rem' }}>
                      A practical field guide to social confidence, connection and courage
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {whatsInsideList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: REAL PEOPLE. REAL PROGRESS. */}
          <div className="blueprint-card blueprint-card-green">
            <span className="marker-tag marker-green">REAL PEOPLE. REAL PROGRESS.</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem 1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: t.avatarBg,
                      color: '#0A0A0A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                    }}
                  >
                    {t.initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.86rem', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.45, marginBottom: '0.4rem' }}>
                      "{t.quote}"
                    </p>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      — {t.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. "A SNEAK PEEK INSIDE" vs "THIS BOOK IS FOR YOU IF..." + "FAQ"
            ================================================================== */}
        <section className="blueprint-grid-2col">
          {/* Left Column: A SNEAK PEEK INSIDE */}
          <div className="blueprint-card blueprint-card-blue">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="marker-tag marker-blue">A SNEAK PEEK INSIDE</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPdfPreviewOpen(true)}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', marginBottom: '1.25rem' }}
              >
                <Eye size={13} color="var(--red-primary)" />
                <span>View Full PDF</span>
              </button>
            </div>

            <div className="sneak-peek-grid">
              {sneakPeekItems.map((item) => (
                <div
                  key={item.id}
                  className="sneak-peek-item"
                  onClick={() => setIsPdfPreviewOpen(true)}
                  title="Click to preview PDF document"
                >
                  <div className="sneak-peek-frame">
                    {/* Header line on preview */}
                    <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '0.3rem', fontSize: '0.52rem', fontWeight: 800, color: '#0A0A0A', textAlign: 'center' }}>
                      {item.title}
                    </div>

                    {/* Middle content mockup */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0.25rem 0' }}>
                      {item.previewType === 'cover' && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#0284C7' }}>MENTICO</div>
                          <div style={{ fontSize: '0.45rem', color: '#64748B', marginTop: '2px' }}>BECOME A DIFFERENT YOU</div>
                        </div>
                      )}

                      {item.previewType === 'engine' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {item.steps?.slice(0, 5).map((s, idx) => (
                            <div key={idx} style={{ fontSize: '0.42rem', backgroundColor: '#F1F5F9', color: '#0A0A0A', padding: '1px 3px', borderRadius: '2px', textAlign: 'center', fontWeight: 700 }}>
                              • {s}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.previewType === 'roadmap' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ fontSize: '0.45rem', fontWeight: 800, color: '#16A34A', textAlign: 'center' }}>30-DAY MAP</div>
                          <div style={{ fontSize: '0.38rem', color: '#475569' }}>☑ Week 1: Presence</div>
                          <div style={{ fontSize: '0.38rem', color: '#475569' }}>☑ Week 2: Actions</div>
                          <div style={{ fontSize: '0.38rem', color: '#475569' }}>☑ Week 3: Momentum</div>
                        </div>
                      )}

                      {item.previewType === 'card' && (
                        <div style={{ fontSize: '0.38rem', color: '#0A0A0A', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontWeight: 800, color: '#DC2626' }}>FIELD CARD</div>
                          <div>1. BE PRESENT</div>
                          <div>2. START SIMPLE</div>
                          <div>3. LISTEN & RELATE</div>
                        </div>
                      )}
                    </div>

                    {/* Footer badge */}
                    <div style={{ fontSize: '0.45rem', textAlign: 'center', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '0.2rem' }}>
                      90 PAGES
                    </div>
                  </div>

                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem', textAlign: 'center' }}>
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: "THIS BOOK IS FOR YOU IF..." + "FREQUENTLY ASKED QUESTIONS" */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Card: THIS BOOK IS FOR YOU IF... */}
            <div className="blueprint-card blueprint-card-pink">
              <span className="marker-tag marker-pink">THIS BOOK IS FOR YOU IF...</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {isForYouList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.35 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Card: FREQUENTLY ASKED QUESTIONS */}
            <div className="blueprint-card blueprint-card-yellow">
              <span className="marker-tag marker-yellow">FREQUENTLY ASKED QUESTIONS</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-main)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          background: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{faq.q}</span>
                        <span style={{ color: 'var(--red-primary)', fontWeight: 800, fontSize: '1rem', marginLeft: '0.5rem' }}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 1rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            6. FINAL CALL TO ACTION BANNER (BOTTOM OF BLUEPRINT)
            ================================================================== */}
        <section
          className="bottom-cta-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="footer-cta-responsive">
            {/* Left Note */}
            <div className="handwritten-annotation" style={{ fontSize: '1.15rem', lineHeight: 1.35 }}>
              Same person.
              <br />
              More capable.
              <br />
              More freedom.
            </div>

            {/* Center: Title & Button */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '1.25rem' }}>
                Ready to start your<br />
                Social Freedom journey?
              </h2>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleCtaClick}
                disabled={isCtaLoading}
                style={{
                  backgroundColor: 'var(--red-primary)',
                  color: '#FFFFFF',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  padding: '0.95rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 18px var(--red-glow)',
                  marginBottom: '1rem',
                }}
              >
                {isCtaLoading ? (
                  <Spinner size="sm" color="white" text="Opening Mentico Vault..." />
                ) : (
                  <>
                    <span>Get the PDF Book Now</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Instant access • 90 pages • 30-day challenge • Lifetime access
              </div>
            </div>

            {/* Right: Skyline Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
                <circle cx="120" cy="25" r="14" fill="#FDE047" opacity="0.6" />
                <rect x="70" y="32" width="10" height="45" fill="#CBD5E1" />
                <rect x="83" y="22" width="12" height="55" fill="#94A3B8" />
                <rect x="98" y="30" width="9" height="47" fill="#CBD5E1" />
                <rect x="110" y="16" width="11" height="61" fill="#64748B" />
                <path d="M0 80 Q60 68 140 76 L140 90 L0 90 Z" fill="#65A30D" opacity="0.4" />
                {/* Young man silhouette with backpack */}
                <ellipse cx="38" cy="58" rx="10" ry="16" fill="#3B82F6" />
                <rect x="31" y="55" width="11" height="13" rx="2" fill="#1E293B" />
                <circle cx="38" cy="38" r="7" fill="#FBBF24" />
                <path d="M31 36 C32 29, 44 29, 45 36 Z" fill="#1E293B" />
              </svg>
            </div>
          </div>
        </section>

      </div>

      {/* ==================================================================
          IN-APP PDF READER MODAL (FOR VIEWING SAMPLES / REAL 12.6 MB PDF)
          ================================================================== */}
      {isPdfPreviewOpen && (
        <ProtectedPdfReader
          pdfUrl="/Mentico_Mastery_Blueprint.pdf"
          user={{ email: 'guest.preview@mentico.com', licenseKey: 'PREVIEW_MODE' }}
          onClose={() => setIsPdfPreviewOpen(false)}
        />
      )}
    </div>
  );
}

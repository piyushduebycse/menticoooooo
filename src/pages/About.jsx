import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Shield,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Mic,
  Heart,
  Sparkles,
  Users,
} from 'lucide-react';
import Spinner from '../components/Spinner';

export default function About() {
  const navigate = useNavigate();
  const [isConsultLoading, setIsConsultLoading] = useState(false);

  const milestones = [
    {
      year: '2015 — 2017',
      title: 'From Shy Engineering Student to Campus Leader',
      org: 'B.Tech Graduate & Self-Taught Communicator',
      description:
        'Grew up as a painfully shy introvert who froze during class presentations and viva exams. Determined to break the cycle of self-doubt, dove deep into cognitive behavioral principles, vocal physiology, and debate dynamics.',
    },
    {
      year: '2018 — 2021',
      title: 'TEDx Speaker & Youth Workshop Pioneer',
      org: 'Josh Talks & 12+ TEDx Stages Across India',
      description:
        'Invited to speak at IIT Delhi, IIT Bombay, SRCC, and BITS Pilani. Delivered keynotes on conquering stage fright and overcoming the Indian societal fear of judgment ("Log Kya Kahenge").',
    },
    {
      year: '2022 — 2024',
      title: 'Corporate Youth Soft-Skills Consultant',
      org: 'Trained Freshers at Tier 1 Tech & Consulting Firms',
      description:
        'Conducted high-impact communication bootcamps for fresh engineering and MBA recruits at top MNCs and high-growth Indian startups, helping young professionals speak up in global meetings.',
    },
    {
      year: '2025 — PRESENT',
      title: 'Founder & Head Mentor, Mentico',
      org: 'Over 25,000+ Young Indians Empowered',
      description:
        'Launched the Mentico Social Freedom Field Manual (PDF), distilling a decade of real stage work into actionable daily exercises for youth aged 18–30.',
    },
  ];

  const doctrines = [
    {
      title: '1. Kill "Log Kya Kahenge" Forever',
      body: 'Most people aren’t judging you; they are too busy worrying about what others think of them. When you step into authentic self-acceptance, your awkwardness vanishes.',
    },
    {
      title: '2. Confidence is a Skill, Not DNA',
      body: 'Nobody is born a magnetic orator. Charisma, posture, and deep voice projection are trainable physical habits that can be mastered in 30 days of consistent drills.',
    },
    {
      title: '3. Speak to Add Value, Not to Impress',
      body: 'When you speak with the intention of giving value rather than seeking validation, social anxiety immediately drops by 80%. Your attention shifts from yourself to your audience.',
    },
    {
      title: '4. Genuine Curiosity is Pure Charisma',
      body: 'You do not need cheesy pick-up lines or corporate jargon. Listening with undivided attention and asking thoughtful questions makes you unforgettable in any circle.',
    },
  ];

  const campusPartners = [
    'TEDx YOUTH',
    'JOSH TALKS',
    'IIT BOMBAY E-SUMMIT',
    'YOURSTORY INDIA',
    'DELHI UNIVERSITY',
  ];

  const handleApplyClick = () => {
    setIsConsultLoading(true);
    setTimeout(() => {
      setIsConsultLoading(false);
      navigate('/contact');
    }, 600);
  };

  return (
    <div className="section" style={{ paddingTop: '3.5rem' }}>
      <div className="container">
        {/* ==================================================================
            INSTRUCTOR BIO & HERO DOSSIER
            ================================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: '3.5rem',
            alignItems: 'center',
            marginBottom: '6rem',
          }}
        >
          {/* Left Column: Portrait Card */}
          <div>
            <div
              className="card card-red-accent"
              style={{
                padding: '2rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-main)',
                textAlign: 'center',
              }}
            >
              {/* Monochromatic Executive Avatar */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4/4.5',
                  backgroundColor: 'var(--pure-black)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-main)',
                  boxShadow: 'inset 0 0 40px rgba(220, 38, 38, 0.25)',
                }}
              >
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <span className="badge-red" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    HEAD MENTOR
                  </span>
                </div>

                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-card)',
                    border: '2px solid var(--red-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                  }}
                >
                  AS
                </div>

                <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
                  Aryan Sharma
                </div>
                <div style={{ color: 'var(--red-primary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.2rem' }}>
                  TEDx SPEAKER & YOUTH COACH
                </div>
                <div style={{ color: '#A1A1AA', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                  Bengaluru • New Delhi • Mumbai
                </div>
              </div>

              {/* Verified Credentials Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STUDENTS GUIDED</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red-primary)' }}>25,000+</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Ages 18 to 30</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>KEYNOTES</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red-primary)' }}>12+ TEDx</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>IITs & Top Colls</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Instructor Credentials & Story */}
          <div>
            <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
              MENTOR PROFILE & MISSION
            </div>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '1.25rem' }}>
              "I Used To Freeze On Stage. If I Could Transform, So Can You."
            </h1>
            <p style={{ fontSize: '1.08rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              In Indian society, we are taught to study hard, score marks, and keep our heads down.
              Nobody teaches us how to speak up in a room full of strangers, how to lead a viva with
              poise, or how to build genuine relationships without feeling awkward.
            </p>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Aryan Sharma founded <strong>Mentico</strong> to give young Indians (18–30) the exact
              training they never received in school or college: unshakeable personal confidence,
              vocal authority, and magnetic social skills.
            </p>

            {/* Quick bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
              {[
                'Mentored 25,000+ college students & young corporate professionals across India',
                'Featured in 12+ TEDx conferences & top national youth summits',
                'Creator of the 30-Day Mentico Vocal & Stage Presence Daily Drills',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} color="var(--red-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/product" className="btn btn-primary">
                <span>Explore The Mentico Blueprint</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleApplyClick}
                disabled={isConsultLoading}
              >
                {isConsultLoading ? (
                  <Spinner size="sm" color="red" text="Connecting to Desk..." />
                ) : (
                  <span>Request Campus / 1-on-1 Session</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================
            FEATURED IN STRIP
            ================================================================== */}
        <div
          style={{
            borderTop: '1px solid var(--border-main)',
            borderBottom: '1px solid var(--border-main)',
            padding: '2.5rem 0',
            marginBottom: '6rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              marginBottom: '1.5rem',
              fontWeight: 700,
            }}
          >
            FEATURED ACROSS PREMIER STAGES & PLATFORMS
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '3rem',
              flexWrap: 'wrap',
            }}
          >
            {campusPartners.map((press, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  transition: 'color var(--transition-fast)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--red-primary)')}
                onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
              >
                {press}
              </span>
            ))}
          </div>
        </div>

        {/* ==================================================================
            CAREER CHRONOLOGY / MILESTONES
            ================================================================== */}
        <div style={{ maxWidth: '850px', margin: '0 auto 6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge-red" style={{ marginBottom: '1rem' }}>
              THE JOURNEY
            </div>
            <h2>A Decade of Empowering Indian Youth</h2>
            <p>From stuttering through college vivas to commanding stages of thousands.</p>
          </div>

          <div style={{ position: 'relative', borderLeft: '2px solid var(--border-main)', paddingLeft: '2rem', marginLeft: '1rem' }}>
            {milestones.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '3rem', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.65rem',
                    top: '4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-base)',
                    border: '3px solid var(--red-primary)',
                  }}
                />

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--red-primary)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  {item.year}
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{item.title}</h3>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {item.org}
                </div>
                <p style={{ fontSize: '0.94rem', lineHeight: 1.6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================
            THE 4 MENTICO DOCTRINES
            ================================================================== */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <div className="badge-red" style={{ marginBottom: '1rem' }}>
              MENTICO PHILOSOPHY
            </div>
            <h2>The 4 Rules of Unshakeable Presence</h2>
            <p>Practical mental models crafted specifically for the Indian demographic.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {doctrines.map((ph, idx) => (
              <div key={idx} className="card card-red-accent" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.18rem', marginBottom: '0.75rem' }}>{ph.title}</h3>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>{ph.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================
            PERSONAL MEMORANDUM FROM ARYAN SHARMA
            ================================================================== */}
        <div
          className="card"
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            padding: '3.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-main)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--red-primary)', marginBottom: '1rem' }}>
            DIRECT NOTE // ARYAN SHARMA
          </div>
          <h3 style={{ fontSize: '1.7rem', marginBottom: '1.25rem' }}>
            "You don’t have to stay the quiet, overlooked person in the corner."
          </h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            Between 18 and 30, the decisions you make, the friends you choose, and your ability to
            stand up and articulate your ideas will shape the next 40 years of your life.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            The Mentico Mastery Blueprint gives you the step-by-step tools to speak without fear,
            command respect in group settings, and build relationships with genuine warmth and confidence.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontStyle: 'italic',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                }}
              >
                Aryan Sharma
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Founder & Lead Mentor, Mentico
              </div>
            </div>

            <Link to="/purchase" className="btn btn-primary">
              <span>Get The Field Manual (₹499)</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Heart, Shield, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function About() {
  const { user } = useAuth();
  const hasPurchased = Boolean(user?.hasPurchased || user?.hasPurchasedPdf);

  return (
    <div className="section" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header Hero */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3.5rem' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
            ABOUT MENTICO
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            We believe social confidence is a skill, not a personality trait.
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            Mentico was created with one simple belief: You don't have to be naturally outgoing,
            exceptionally charming, or born with extraordinary confidence to become socially comfortable.
          </p>
        </div>

        {/* Narrative Core Section */}
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto 3.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Card 1: The Core Struggle */}
          <div
            className="card card-solid"
            style={{
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              borderLeft: '4px solid var(--red-primary)',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', fontWeight: 800 }}>
              The Root of the Struggle
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              Most people don't struggle because they lack something. They struggle because they overthink,
              fear judgment, hesitate to take action, and spend too much time worrying about how others perceive them.
            </p>
          </div>

          {/* Card 2: The Mentico Approach */}
          <div
            className="card card-solid"
            style={{
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              borderLeft: '4px solid var(--text-main)',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', fontWeight: 800 }}>
              Breaking the Pattern
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              At Mentico, we focus on breaking these patterns through practical exercises, real-world experiences,
              behavioural insights, and actionable frameworks.
            </p>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              We believe confidence isn't built by simply reading motivational quotes or waiting for the perfect moment.
              It's built through understanding your behaviour, challenging your comfort zone, and taking consistent action.
            </p>
          </div>

          {/* Card 3: Our Purpose */}
          <div
            className="card card-solid"
            style={{
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', fontWeight: 800 }}>
              Practical, Accessible &amp; Achievable
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              Through our content and learning resources, we aim to make social confidence more practical,
              accessible, and achievable.
            </p>
          </div>
        </div>

        {/* Mission Banner & Motto */}
        <div
          className="card card-red-accent"
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div className="badge-mono" style={{ fontSize: '0.78rem' }}>
            OUR CORE MISSION
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              lineHeight: 1.3,
              maxWidth: '680px',
            }}
          >
            Help people stop overthinking, start interacting, and experience social freedom.
          </h2>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.2rem, 3.5vw, 1.85rem)',
              fontWeight: 800,
              color: 'var(--red-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}
          >
            MENTICO — Less Overthinking. More Living.
          </div>

          {/* Navigation CTA */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to={hasPurchased ? '/library?openPdf=true' : '/purchase'}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                fontWeight: 700,
              }}
            >
              <span>{hasPurchased ? 'Open Your Library' : 'Explore the Course'}</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/contact"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
              }}
            >
              <span>Get In Touch</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

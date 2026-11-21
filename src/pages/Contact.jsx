import React, { useState } from 'react';
import { Mail, Copy, Check, ArrowRight, Shield, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const contactEmail = 'margmanpath@gmail.com';

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(contactEmail).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  };

  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
            HELP &amp; INQUIRIES
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              lineHeight: 1.2,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Contact Us
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Have a question about the course, need support with your access, or want to collaborate? We're here to help.
          </p>
        </div>

        {/* Primary Contact Card */}
        <div
          className="card card-red-accent"
          style={{
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '2.5rem',
          }}
        >
          {/* Email Icon Circle */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--red-subtle)',
              border: '2px solid var(--red-subtle-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red-primary)',
            }}
          >
            <Mail size={32} />
          </div>

          <div>
            <div
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '0.5rem',
              }}
            >
              <a
                href={`mailto:${contactEmail}`}
                style={{
                  color: 'var(--red-primary)',
                  textDecoration: 'none',
                  borderBottom: '2px solid var(--red-primary)',
                  overflowWrap: 'anywhere',
                }}
              >
                {contactEmail}
              </a>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              We typically respond within 24 business hours.
            </p>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '420px',
              marginTop: '0.5rem',
            }}
          >
            <a
              href={`mailto:${contactEmail}?subject=Mentico%20Query`}
              className="btn btn-primary"
              style={{
                flex: '1 1 180px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Mail size={16} />
              <span>Send Email</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{
                flex: '1 1 160px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                fontWeight: 600,
              }}
            >
              {copied ? <Check size={16} color="#16A34A" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
            </button>
          </div>
        </div>

        {/* Helpful Footnote */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            Review our{' '}
            <Link to="/terms" style={{ color: 'var(--red-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              Terms &amp; Conditions
            </Link>{' '}
            for course license details and delivery policies.
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, FileText, CheckCircle2, AlertCircle, Mail, Printer } from 'lucide-react';

export default function Terms() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="section" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
            MENTICO OFFICIAL POLICY
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              lineHeight: 1.25,
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            TERMS &amp; CONDITIONS
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--red-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
              marginBottom: '0.5rem',
            }}
          >
            Social Freedom Course | One-Time Purchase: ₹499
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto' }}>
            By purchasing, downloading, or accessing the Mentico Social Freedom Course, you agree to the following Terms &amp; Conditions.
          </p>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={14} />
            <span>Print Terms</span>
          </button>
        </div>

        {/* Terms Card */}
        <div
          className="card"
          style={{
            padding: 'clamp(1.5rem, 4vw, 3rem)',
            lineHeight: 1.8,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Section 1 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>1.</span> Personal Use Only
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              This course is purchased for individual learning and personal development. Access is intended solely for the original purchaser.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 2 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>2.</span> Intellectual Property Rights
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              All course materials, including PDFs, written content, frameworks, exercises, illustrations, strategies, and other resources, are the intellectual property of Mentico.
            </p>
            <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No part of this course may be:
            </p>
            <ul
              style={{
                paddingLeft: '1.5rem',
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <li>Reproduced, copied, or republished.</li>
              <li>Shared, forwarded, distributed, or uploaded to public platforms.</li>
              <li>Resold, sublicensed, or commercially exploited.</li>
              <li>Used to create or sell a competing course or digital product without written permission from Mentico.</li>
            </ul>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 3 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>3.</span> No Sharing or Redistribution
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Your purchase does not grant you the right to distribute the course to friends, family, groups, communities, or third parties.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Unauthorised sharing, duplication, or resale of the course is strictly prohibited.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 4 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>4.</span> No Refund Policy
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Since this is a digital product that provides immediate access to downloadable intellectual property, all purchases are final and non-refundable once the course has been delivered or access has been provided, except where a refund or remedy is required under applicable law.
            </p>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Please review the course description carefully before purchasing.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 5 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>5.</span> Educational Purpose
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              The Social Freedom Course is designed to provide practical guidance on social confidence, communication, overcoming approach anxiety, and interpersonal interactions.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 6 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>6.</span> Ethical Use &amp; Personal Responsibility
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              The techniques and exercises provided in this course must be used responsibly and ethically.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Participants are expected to respect other people's boundaries, consent, comfort, and personal space. Harassment, manipulation, intimidation, or unwanted interactions are not encouraged or endorsed.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 7 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>7.</span> Not a Substitute for Professional Help
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              This course is an educational resource and is not a substitute for professional psychological counselling, psychotherapy, or medical treatment.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Individuals experiencing significant psychological distress should seek guidance from a qualified professional.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 8 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>8.</span> Limitation of Liability
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Mentico shall not be held responsible for individual decisions or actions taken by participants while implementing the concepts discussed in the course, to the extent permitted by applicable law.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 9 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>9.</span> Changes to Course Content
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Mentico reserves the right to modify, improve, update, or discontinue course content and associated resources when necessary.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Section 10 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--red-primary)' }}>10.</span> Acceptance of Terms
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              By completing your purchase and accessing the Social Freedom Course, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions.
            </p>
          </div>

          <div style={{ height: '2px', backgroundColor: 'var(--border-main)', margin: '2rem 0' }} />

          {/* Copyright & Support */}
          <div
            style={{
              paddingTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              &copy; Mentico. All Rights Reserved.
            </div>
            <div>
              For questions or support, contact Mentico through its official communication channels at{' '}
              <a
                href="mailto:margmanpath@gmail.com"
                style={{ color: 'var(--red-primary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                margmanpath@gmail.com
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


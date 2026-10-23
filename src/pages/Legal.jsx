import React, { useState } from 'react';
import { Shield, FileText, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Legal() {
  const [activeTab, setActiveTab] = useState('terms');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="section" style={{ paddingTop: '3.5rem' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
            MENTICO POLICIES & STUDENT RIGHTS
          </div>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.75rem' }}>
            Terms, Privacy & Student Protections
          </h1>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>
            Effective as of October 2026 • Mentico Learning Technologies Pvt. Ltd. (India)
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-main)',
            paddingBottom: '0.75rem',
            marginBottom: '2.5rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'terms', label: 'Program Terms' },
            { id: 'privacy', label: 'Student Privacy' },
            { id: 'growth', label: 'Career Growth Disclaimer' },
            { id: 'refund', label: '30-Day Guarantee Policy' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                backgroundColor: activeTab === tab.id ? 'var(--red-subtle)' : 'transparent',
                color: activeTab === tab.id ? 'var(--red-primary)' : 'var(--text-secondary)',
                border: activeTab === tab.id ? '1px solid var(--red-subtle-border)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={14} />
            <span>Print Policy</span>
          </button>
        </div>

        {/* Tab Contents Card */}
        <div className="card" style={{ padding: '3rem 2.5rem', lineHeight: 1.8 }}>
          {/* ================================================================
              TAB 1: PROGRAM TERMS
              ================================================================ */}
          {activeTab === 'terms' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <Shield size={16} /> MENTICO DIGITAL ENROLLMENT TERMS
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>1. Scope of Digital License</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                When you enroll in <em>The Mentico Social Freedom Field Manual (PDF)</em>, you are
                granted a personal, non-transferable single-user license to access, download, and retain
                the educational materials for your personal self-improvement, campus prep, and career growth.
              </p>
              <p style={{ marginBottom: '1.75rem', fontSize: '0.95rem' }}>
                Commercial duplication, unauthorized re-uploading to public Telegram channels, torrent
                sites, or paid redistribution of any Mentico proprietary materials is strictly prohibited
                under the Indian Copyright Act, 1957.
              </p>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>2. Age Eligibility</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Mentico is tailored specifically for young adults aged 18 to 30. By registering an account,
                you verify that you are at least 18 years of age or possess guardian permission to access
                online learning materials.
              </p>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>3. Supportive Community Code</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Mentico is a safe, encouraging space designed to build people up. Any harassment, hate
                speech, or disrespectful behavior in student forums or live Q&A sessions will result in
                immediate revocation of membership without refund.
              </p>
            </div>
          )}

          {/* ================================================================
              TAB 2: PRIVACY POLICY
              ================================================================ */}
          {activeTab === 'privacy' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <Shield size={16} /> STUDENT DATA PRIVACY & CONFIDENTIALITY
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>1. Zero Data Sharing Policy</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                We treat student records with utmost care. Mentico never sells, rents, or exposes your
                personal details, phone numbers, or email addresses to spam aggregators, third-party marketing
                companies, or unsolicited callers.
              </p>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>2. Data We Process</h2>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <li>Your student account details (Name, email address, city, and encrypted password).</li>
                <li>Course enrollment records and generated student license keys.</li>
                <li>Voluntary support tickets and workshop inquiries submitted to our desk.</li>
              </ul>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>3. Secure Infrastructure</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                All user data is encrypted in transit and at rest using modern SSL/TLS 1.3 standards and
                protected by Firebase Firestore cloud security protocols.
              </p>
            </div>
          )}

          {/* ================================================================
              TAB 3: CAREER & GROWTH DISCLAIMER
              ================================================================ */}
          {activeTab === 'growth' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <AlertCircle size={16} /> EDUCATIONAL GUIDANCE & RESULTS DISCLAIMER
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Personal Effort & Transformation</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                The techniques, speech exercises, and psychological tools provided in the Mentico
                Mastery Blueprint have helped tens of thousands of young Indians build confidence and
                articulate their thoughts effectively.
              </p>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                However, personal growth requires consistent daily practice. Mentico does not guarantee
                automatic college placements, specific salary packages, or exam marks, as real-world outcomes
                depend on individual dedication, domain knowledge, and preparation.
              </p>
              <p style={{ fontSize: '0.95rem' }}>
                Mentico provides educational coaching and behavioral frameworks; it is not a substitute for
                formal clinical psychotherapy or medical treatment for severe psychological disorders.
              </p>
            </div>
          )}

          {/* ================================================================
              TAB 4: REFUND & GUARANTEE POLICY
              ================================================================ */}
          {activeTab === 'refund' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} /> 30-DAY NO-QUESTIONS-ASKED GUARANTEE
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Our 100% Student Satisfaction Pledge</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                We want you to feel complete confidence in your decision to join Mentico. If you review the
                180-page blueprint, practice the daily speech drills, and genuinely do not feel a noticeable
                uplift in your confidence or public speaking comfort within 30 days, we will refund your
                enrollment fee in full.
              </p>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Simply send an email to <code>support@mentico.in</code> with your student email and transaction
                ID within 30 days of purchase. Your refund will be processed back to your UPI, card, or
                original payment source within 3–5 business days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

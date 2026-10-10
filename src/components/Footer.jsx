import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Terminal, ArrowUpRight, Heart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isRealFirebase } = useAuth();
  const { isDark } = useTheme();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Mentico Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Link to="/" className="brand-logo" aria-label="Mentico Home">
                <img
                  src={isDark ? "/logo-trans-dark.png" : "/logo-trans-light.png"}
                  alt="MENTICO"
                  className="brand-logo-img"
                  style={{ height: '32px' }}
                />
              </Link>
            </div>
            <p style={{ maxWidth: '340px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              India’s transformative confidence building, public speaking, and relationship mastery
              community built exclusively for 18–30 year-olds. From campus placements to boardroom charisma.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-red" style={{ fontSize: '0.72rem' }}>
                <span className="pulse-red" /> 25,000+ YOUNG INDIANS EMPOWERED
              </span>
              <span
                className="badge-mono"
                style={{ fontSize: '0.72rem' }}
                title={isRealFirebase ? 'Connected to Firebase Cloud' : 'Running on Mentico Local Engine'}
              >
                <Terminal size={11} /> {isRealFirebase ? 'FIREBASE CLOUD' : 'LOCAL ENGINE'}
              </span>
            </div>
          </div>

          {/* Column 2: Programs & Vault */}
          <div>
            <div className="footer-col-title">Core Disciplines</div>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">Confidence Architecture</Link>
              </li>
              <li>
                <Link to="/" className="footer-link">Public Speaking & Stage Presence</Link>
              </li>
              <li>
                <Link to="/" className="footer-link">Relationship & Social Dynamics</Link>
              </li>
              <li>
                <Link to="/product" className="footer-link">Mentico Mastery PDF Blueprint</Link>
              </li>
              <li>
                <Link to="/dashboard" className="footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Student Vault Access <ArrowUpRight size={13} color="var(--red-primary)" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Mentorship & Campus */}
          <div>
            <div className="footer-col-title">Mentorship & Outreach</div>
            <ul className="footer-links">
              <li>
                <Link to="/about" className="footer-link">About Lead Mentor</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">College Fest & Campus Workshops</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">1-on-1 Speech Audit</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">Corporate Graduate Bootcamps</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Student Rights */}
          <div>
            <div className="footer-col-title">Ethics & Policies</div>
            <ul className="footer-links">
              <li>
                <Link to="/legal" className="footer-link">Terms of Program</Link>
              </li>
              <li>
                <Link to="/legal" className="footer-link">Privacy & Student Confidentiality</Link>
              </li>
              <li>
                <Link to="/legal" className="footer-link">Personal Growth Disclaimer</Link>
              </li>
              <li>
                <Link to="/legal" className="footer-link">30-Day Money-Back Guarantee</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Mentico Learning Technologies Pvt. Ltd. Bengaluru & New Delhi, India.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target: 18–30 Indian Youth
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Red, White & Black Signature Style
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

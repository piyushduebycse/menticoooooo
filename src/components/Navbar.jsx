import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Lock, Unlock, LogOut, Menu, X, ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const hasPurchased = Boolean(user?.hasPurchased || user?.hasPurchasedPdf);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { label: 'About', path: '/about' },
    {
      label: hasPurchased ? 'Read the Book' : 'The Manual',
      path: hasPurchased ? '/library?openPdf=true' : '/purchase',
    },
    {
      label: 'Library',
      path: '/library',
      isProtected: true,
    },
    { label: 'Contact & FAQs', path: '/contact' },
    { label: 'Legal', path: '/legal' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)} aria-label="Mentico Home">
          <img
            src={isDark ? "/logo-trans-dark.png" : "/logo-trans-light.png"}
            alt="MENTICO"
            className="brand-logo-img"
          />
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {item.label}
                {item.isProtected && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px',
                      color: user ? 'var(--red-primary)' : 'var(--text-muted)',
                    }}
                    title={user ? 'Hub Unlocked' : 'Member Access Only'}
                  >
                    {user ? <Unlock size={12} /> : <Lock size={12} />}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Nav Actions: Day/Night Toggle + CTA */}
        <div className="nav-actions">
          {/* Day/Night Theme Toggle */}
          <ThemeToggle />

          {/* User Account or Blueprint CTA Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to={hasPurchased ? '/library' : '/purchase'}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                title={hasPurchased ? 'Open Library' : 'Complete Purchase'}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: hasPurchased ? '#22c55e' : 'var(--red-primary)',
                  }}
                />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName?.split(' ')[0] || 'Member'}
                </span>
              </Link>

              {/* Show 'Read the Book' or 'Get the Manual' */}
              <Link
                to={hasPurchased ? '/library?openPdf=true' : '/purchase'}
                className="btn btn-primary btn-sm nav-cta-desktop"
                style={{
                  backgroundColor: hasPurchased ? '#16a34a' : 'var(--red-primary)',
                  borderColor: hasPurchased ? '#16a34a' : 'var(--red-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <span>{hasPurchased ? 'Read the Book' : 'Get the Manual'}</span>
                <ArrowRight size={14} />
              </Link>

              <button
                type="button"
                className="btn btn-secondary btn-sm btn-icon-only"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              >
                Sign In
              </Link>
              <Link
                to="/purchase"
                className="btn btn-primary btn-sm nav-cta-desktop"
                style={{
                  backgroundColor: 'var(--red-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <span>Get the Manual</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <li key="/">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0' }}
              >
                <span>Home</span>
              </NavLink>
            </li>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0' }}
                >
                  <span>{item.label}</span>
                  {item.isProtected && (
                    <span className="badge-mono" style={{ fontSize: '0.72rem' }}>
                      {user ? 'ACCESS GRANTED' : 'LOGIN REQUIRED'}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {user && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Logged in as <strong>{user.email}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Prominent CTA in mobile drawer */}
            <Link
              to={hasPurchased ? '/library?openPdf=true' : '/purchase'}
              className="btn btn-primary"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                width: '100%',
                backgroundColor: hasPurchased ? '#16a34a' : 'var(--red-primary)',
                borderColor: hasPurchased ? '#16a34a' : 'var(--red-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
              }}
            >
              <span>{hasPurchased ? 'Read the Book →' : 'Get the Manual Now'}</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

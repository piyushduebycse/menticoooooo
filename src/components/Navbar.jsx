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

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { label: 'About', path: '/about' },
    { label: "What's Inside", path: '/product' },
    {
      label: 'Social Freedom Hub',
      path: '/dashboard',
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

        {/* Nav Actions: Day/Night Toggle + "Get the Book" CTA */}
        <div className="nav-actions">
          {/* Day/Night Theme Toggle */}
          <ThemeToggle />

          {/* User Account or Blueprint CTA Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/dashboard"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                title="Go to Student Dashboard"
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--red-primary)',
                  }}
                />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName?.split(' ')[0] || 'Student'}
                </span>
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
                to="/product"
                className="btn btn-primary btn-sm nav-cta-desktop"
                style={{
                  backgroundColor: 'var(--red-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <span>Get the Book</span>
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
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li key="/">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}
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
                  style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}
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

          <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
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
            ) : (
              <Link
                to="/product"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get the Book Now
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function AuthModal() {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    authRedirectPath,
    setAuthRedirectPath,
    login,
    signup,
    loginDemo,
    loginGoogle,
    loginGoogleRedirect,
    resetPassword,
  } = useAuth();
  const [tab, setTab] = useState(authModalTab || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const onAuthSuccess = (authUser) => {
    const target = authRedirectPath;
    closeAuthModal();
    if (target) {
      setAuthRedirectPath(null);
      navigate(target);
    } else if (authUser?.hasPurchased) {
      navigate('/library');
    } else {
      navigate('/purchase');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      let loggedUser;
      if (tab === 'login') {
        if (!email || !password) {
          throw new Error('Please fill in both email and password.');
        }
        loggedUser = await login(email, password);
      } else if (tab === 'signup') {
        if (!name || !email || !password) {
          throw new Error('Please complete all registration fields.');
        }
        loggedUser = await signup(name, email, password);
      } else if (tab === 'forgot') {
        if (!email) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(email);
        setSuccessMessage('Password reset link sent! Check your inbox.');
        setIsLoading(false);
        return;
      }
      onAuthSuccess(loggedUser);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      const demo = await loginDemo();
      onAuthSuccess(demo);
    } catch (err) {
      setError(err.message || 'Demo student access initialization failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsPopupBlocked(false);
    setIsLoading(true);
    try {
      const gUser = await loginGoogle();
      onAuthSuccess(gUser);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked') || err.message?.includes('Pop-up was blocked')) {
        setIsPopupBlocked(true);
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setError('');
    setIsRedirectLoading(true);
    try {
      await loginGoogleRedirect();
    } catch (err) {
      setError(err.message || 'Could not initiate redirect sign-in.');
      setIsRedirectLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              margin: '0 auto 0.75rem',
              backgroundColor: 'var(--red-subtle)',
              border: '1px solid var(--red-subtle-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red-primary)',
            }}
          >
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '1.45rem', marginBottom: '0.35rem' }}>
            {tab === 'login' ? 'Mentico Student Portal' : 'Join Mentico Community'}
          </h3>
          <p style={{ fontSize: '0.86rem' }}>
            {tab === 'login'
              ? 'Sign in to access your confidence blueprints, speech drills & field manual'
              : 'Empowering young Indians (18-30) with unshakeable confidence'}
          </p>
        </div>

        {/* Fast Demo Access Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={14} color="var(--red-primary)" /> Instant Student Demo
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Test unlocked dashboard as Aarav Mehta (24, Bengaluru)
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isLoading}
            style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            {isDemoLoading ? <Spinner size="xs" color="white" /> : '1-Click Demo'}
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-main)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 600,
              backgroundColor: tab === 'login' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none',
              border: tab === 'login' ? '1px solid var(--border-subtle)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(''); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 600,
              backgroundColor: tab === 'signup' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: tab === 'signup' ? 'var(--shadow-sm)' : 'none',
              border: tab === 'signup' ? '1px solid var(--border-subtle)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Register
          </button>
        </div>

        {successMessage && (
          <div
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              fontWeight: 600,
            }}
          >
            {successMessage}
          </div>
        )}

        {isPopupBlocked && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem',
              marginBottom: '1rem',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--red-primary)', marginBottom: '0.35rem' }}>
              Pop-up was blocked by browser
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.35', marginBottom: '0.65rem' }}>
              1. Look at the right side of your URL bar for the pop-up icon and select <strong>"Always allow"</strong>.<br />
              2. Or proceed directly using the button below:
            </div>
            <button
              type="button"
              onClick={handleGoogleRedirectLogin}
              disabled={isRedirectLoading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                fontSize: '0.78rem',
                padding: '0.5rem 0.75rem',
                color: 'var(--red-primary)',
                borderColor: 'var(--red-primary)',
                fontWeight: 600,
              }}
            >
              {isRedirectLoading ? 'Redirecting...' : 'Sign in with Google via Redirect →'}
            </button>
          </div>
        )}

        {error && !isPopupBlocked && (
          <div
            style={{
              backgroundColor: 'var(--red-subtle)',
              border: '1px solid var(--red-subtle-border)',
              color: 'var(--red-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="modal-name">
                Full Name & City
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="modal-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rohan Varma (Delhi)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="modal-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="modal-email"
                type="email"
                className="form-input"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="modal-password">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setError(''); setSuccessMessage(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--red-primary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="modal-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLoading || isDemoLoading}
          >
            {isLoading ? (
              <Spinner size="sm" color="white" text={tab === 'login' ? 'Logging in...' : tab === 'signup' ? 'Enrolling...' : 'Sending link...'} />
            ) : (
              <>
                <span>
                  {tab === 'login' && 'Sign In to Mentico'}
                  {tab === 'signup' && 'Create Account & Continue'}
                  {tab === 'forgot' && 'Send Password Reset Email'}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {tab === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); setSuccessMessage(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ← Back to Member Login
            </button>
          </div>
        )}

        {/* Google Authentication */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', margin: '1rem 0' }}>
            <div style={{ borderTop: '1px solid var(--border-main)', position: 'absolute', top: '50%', width: '100%' }}></div>
            <span
              style={{
                position: 'relative',
                backgroundColor: 'var(--bg-card)',
                padding: '0 0.75rem',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              OR FAST LOGIN
            </span>
          </div>

          <button
            type="button"
            id="btn-google-login"
            className="btn btn-secondary"
            onClick={handleGoogleLogin}
            disabled={isLoading || isDemoLoading}
            style={{ width: '100%', fontSize: '0.88rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#EA4335" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#4285F4" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#34A853" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

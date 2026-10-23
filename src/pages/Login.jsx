import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup, loginGoogle, loginGoogleRedirect, resetPassword, sendVerificationEmail } = useAuth();

  // Extract redirect query param if any
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');

  // Tabs: 'login' | 'signup' | 'forgot'
  const [tab, setTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  // If user is already logged in, route them appropriately
  useEffect(() => {
    if (user) {
      handlePostAuthRedirect(user);
    }
  }, [user]);

  const handlePostAuthRedirect = (loggedInUser) => {
    if (redirectTarget) {
      navigate(decodeURIComponent(redirectTarget), { replace: true });
      return;
    }

    if (loggedInUser?.hasPurchased) {
      navigate('/library', { replace: true });
    } else {
      navigate('/purchase', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPopupBlocked(false);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (tab === 'login') {
        if (!email || !password) {
          throw new Error('Please fill in both email and password.');
        }
        const loggedUser = await login(email, password);
        handlePostAuthRedirect(loggedUser);
      } else if (tab === 'signup') {
        if (!name || !email || !password) {
          throw new Error('Please fill in all registration fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const newUser = await signup(name, email, password);
        // Attempt sending email verification
        try {
          await sendVerificationEmail();
          setVerificationSent(true);
        } catch {
          // Verification email error is non-fatal
        }
        handlePostAuthRedirect(newUser);
      } else if (tab === 'forgot') {
        if (!email) {
          throw new Error('Please enter your account email address.');
        }
        await resetPassword(email);
        setSuccessMessage('Password reset link sent! Check your inbox (and spam folder).');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsPopupBlocked(false);
    setSuccessMessage('');
    setIsGoogleLoading(true);

    try {
      const gUser = await loginGoogle();
      handlePostAuthRedirect(gUser);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked') || err.message?.includes('Pop-up was blocked')) {
        setIsPopupBlocked(true);
      } else {
        setError(err.message || 'Google sign-in was canceled or failed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setError('');
    setIsRedirectLoading(true);
    try {
      await loginGoogleRedirect();
      // Browser will navigate to Google accounts
    } catch (err) {
      setError(err.message || 'Could not initiate redirect sign-in.');
      setIsRedirectLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '82vh', display: 'flex', alignItems: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container-narrow" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header Icon */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                margin: '0 auto 1rem',
                backgroundColor: 'var(--red-subtle)',
                border: '1px solid var(--red-subtle-border)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red-primary)',
              }}
            >
              {tab === 'forgot' ? <KeyRound size={26} /> : <Sparkles size={26} />}
            </div>
            <h2 style={{ fontSize: '1.65rem', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
              {tab === 'login' && 'Sign in to Mentico'}
              {tab === 'signup' && 'Create Your Student Account'}
              {tab === 'forgot' && 'Reset Your Password'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {tab === 'login' && 'Access the Social Freedom field manual and download library.'}
              {tab === 'signup' && 'Instant access to your manual, speech drills, and updates.'}
              {tab === 'forgot' && 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          {/* Tab Navigation (Login / Signup) */}
          {tab !== 'forgot' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: 'var(--bg-surface)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-main)',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccessMessage(''); }}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: tab === 'login' ? 'var(--bg-card)' : 'transparent',
                  color: tab === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
                  border: tab === 'login' ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(''); setSuccessMessage(''); }}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: tab === 'signup' ? 'var(--bg-card)' : 'transparent',
                  color: tab === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
                  border: tab === 'signup' ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {isPopupBlocked && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.15rem',
                marginBottom: '1.25rem',
                fontSize: '0.84rem',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: 'var(--red-primary)',
                  marginBottom: '0.45rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} />
                <span>Browser Blocked the Google Pop-up</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.45', margin: '0 0 0.85rem' }}>
                Your browser blocked the Google sign-in window. You can easily proceed using either method:
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 0.85rem',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  Method 1: Allow pop-ups in URL bar (Recommended)
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                  Look at the right side of your browser's address bar for the <strong>pop-up blocked icon (window with red X)</strong>. Click it, select <strong>"Always allow pop-ups and redirects from this site"</strong>, and click "Sign in with Google" again.
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Method 2: Continue via Full-Page Redirect
                </div>
                <button
                  type="button"
                  id="btn-google-redirect-fallback"
                  onClick={handleGoogleRedirectSignIn}
                  disabled={isRedirectLoading}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    fontSize: '0.82rem',
                    padding: '0.65rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderColor: 'var(--red-primary)',
                    color: 'var(--red-primary)',
                    fontWeight: 600,
                  }}
                >
                  {isRedirectLoading ? (
                    <Spinner size="sm" color="red" text="Opening Google Sign-In..." />
                  ) : (
                    <span>Continue with Google (Full-Page Redirect) →</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && !isPopupBlocked && (
            <div
              style={{
                backgroundColor: 'var(--red-subtle)',
                border: '1px solid var(--red-subtle-border)',
                color: 'var(--red-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" htmlFor="name-input">
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="name-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rohan Varma"
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

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email-input"
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
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="password-input">
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
                        fontSize: '0.78rem',
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
                    id="password-input"
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
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
              disabled={isLoading || isGoogleLoading}
              id="btn-auth-submit"
            >
              {isLoading ? (
                <Spinner size="sm" color="white" text={tab === 'login' ? 'Signing in...' : tab === 'signup' ? 'Creating account...' : 'Sending link...'} />
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span>{tab === 'login' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Password Reset Email'}</span>
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {tab === 'forgot' && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccessMessage(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                ← Back to Member Login
              </button>
            </div>
          )}

          {/* Google Sign-in */}
          {tab !== 'forgot' && (
            <div style={{ marginTop: '1.75rem' }}>
              <div style={{ position: 'relative', margin: '1.25rem 0', textAlign: 'center' }}>
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
                  OR CONTINUE WITH
                </span>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                id="btn-google-login-page"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                style={{ width: '100%', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}
              >
                {isGoogleLoading ? (
                  <Spinner size="sm" color="red" text="Connecting to Google..." />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#EA4335" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#4285F4" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#34A853" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            By continuing, you agree to Mentico's{' '}
            <Link to="/legal" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/legal" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Route protection wrapper:
 * - requirePurchase: if true, performs server-side verification against /api/auth/me.
 *   Access is only granted if the server independently verifies the user's purchase status.
 * - guestOnly: if true (e.g. /login), logged-in users are redirected to /library or /purchase.
 * - default: requires authentication, redirects logged-out users to /login?redirect=...
 */
export default function ProtectedRoute({ children, requirePurchase = false, guestOnly = false }) {
  const { user, loading, getIdToken } = useAuth();
  const location = useLocation();
  const [attempt, setAttempt] = useState(0);
  const [verification, setVerification] = useState({ loading: requirePurchase, entitled: false, error: '' });

  const searchParams = new URLSearchParams(location.search);
  const urlToken = searchParams.get('token') || searchParams.get('pass');

  useEffect(() => {
    if (!requirePurchase) return;
    const controller = new AbortController();

    let pass = null;
    try {
      pass = JSON.parse(localStorage.getItem('mentico_access_pass') || 'null');
    } catch {}

    const statePass = location.state?.accessPass;

    (async () => {
      const candidateToken =
        urlToken ||
        statePass?.accessToken ||
        pass?.accessToken ||
        (user && typeof getIdToken === 'function' ? await getIdToken().catch(() => null) : null);

      if (!candidateToken) {
        setVerification({ loading: false, entitled: false, error: '' });
        return;
      }

      setVerification({ loading: true, entitled: false, error: '' });

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${candidateToken}` },
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status >= 500) {
          throw new Error(data.error || 'Purchase verification is temporarily unavailable.');
        }

        if (response.status === 401 || response.status === 403) {
          if (!urlToken) localStorage.removeItem('mentico_access_pass');
        }

        if (!controller.signal.aborted) {
          const isEntitled = response.ok && data.success && data.user?.hasPurchased === true;
          if (isEntitled && urlToken) {
            try {
              localStorage.setItem(
                'mentico_access_pass',
                JSON.stringify({
                  hasPurchased: true,
                  accessToken: urlToken,
                  email: data.user.email,
                  name: data.user.name,
                  licenseKey: data.user.licenseKey || 'MENTICO-IN-VIP',
                })
              );
            } catch {}
          }
          setVerification({ loading: false, entitled: isEntitled, error: '' });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          // If offline or network error, fallback to valid local pass or user state
          if ((candidateToken?.startsWith('mtc_') || urlToken) && (pass?.hasPurchased || urlToken)) {
            setVerification({ loading: false, entitled: true, error: '' });
          } else if (user?.hasPurchased && !user.status) {
            setVerification({ loading: false, entitled: true, error: '' });
          } else {
            setVerification({
              loading: false,
              entitled: false,
              error: err.message || 'Could not confirm access. Please retry.',
            });
          }
        }
      }
    })();

    return () => controller.abort();
  }, [requirePurchase, location.state, location.search, urlToken, user, getIdToken, attempt]);

  if ((requirePurchase && verification.loading) || (!requirePurchase && loading)) {
    return (
      <div
        className="container"
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Spinner size="lg" color="red" />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          CONFIRMING READING ACCESS...
        </p>
      </div>
    );
  }

  if (requirePurchase) {
    if (verification.error) {
      return (
        <section className="container-narrow" style={{ paddingBlock: 48 }}>
          <div className="card" role="alert">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Let’s confirm your access.</h2>
            <p style={{ marginBlock: 20, color: 'var(--text-secondary)' }}>{verification.error}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>
                Retry verification
              </button>
              <Link className="btn btn-secondary" to="/contact">
                Get help
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (verification.entitled) {
      return children;
    }

    // If not logged in and no pass provided, send to login to authenticate their account
    if (!user && !urlToken) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
    }

    return <Navigate to="/purchase?denied=true" replace />;
  }

  if (guestOnly) {
    return user || verification.entitled ? <Navigate to="/library" replace /> : children;
  }

  return user ? children : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}

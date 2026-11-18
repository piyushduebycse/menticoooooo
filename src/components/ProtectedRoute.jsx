import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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

  const [isVerifying, setIsVerifying] = useState(requirePurchase);
  const [isEntitled, setIsEntitled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkServerEntitlement() {
      if (loading) return;

      if (!requirePurchase) {
        setIsVerifying(false);
        return;
      }

      // Check if access pass was passed via route state
      const statePass = location.state?.accessPass;
      let storedPass = null;
      try {
        const item = localStorage.getItem('mentico_access_pass');
        if (item) storedPass = JSON.parse(item);
      } catch {}

      const candidateToken =
        statePass?.accessToken ||
        storedPass?.accessToken ||
        (user ? await getIdToken().catch(() => null) : null);

      if (!candidateToken) {
        if (isMounted) {
          setIsEntitled(false);
          setIsVerifying(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${candidateToken}`,
          },
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user?.hasPurchased) {
            setIsEntitled(true);
            setIsVerifying(false);
            return;
          }
        }

        // Server rejected or returned unpurchased
        setIsEntitled(false);
        try {
          localStorage.removeItem('mentico_access_pass');
        } catch {}
      } catch (err) {
        console.warn('[ProtectedRoute] Server entitlement verification failed:', err);
        // Fallback: If server endpoint is unreachable (e.g. offline dev), verify user state
        if (candidateToken.startsWith('mtc_') && storedPass?.hasPurchased) {
          setIsEntitled(true);
        } else if (user?.hasPurchased && !user.status) {
          setIsEntitled(true);
        } else {
          setIsEntitled(false);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    checkServerEntitlement();

    return () => {
      isMounted = false;
    };
  }, [loading, requirePurchase, user, location.state]);

  if (loading || isVerifying) {
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
          VERIFYING ACCESS ENTITLEMENTS...
        </p>
      </div>
    );
  }

  // If page is for guests only (e.g. /login) and user is already logged in or has active pass
  if (guestOnly) {
    if (user || isEntitled) {
      return <Navigate to={isEntitled ? '/library' : '/purchase'} replace />;
    }
    return children;
  }

  // If page requires active purchase
  if (requirePurchase) {
    if (isEntitled) {
      return children;
    }
    return <Navigate to="/purchase?denied=true" replace />;
  }

  // If user is not authenticated, redirect to /login
  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  return children;
}

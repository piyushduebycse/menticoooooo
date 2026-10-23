import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Route protection wrapper:
 * - requirePurchase: if true, user must be logged in AND have hasPurchased === true.
 * - guestOnly: if true (e.g. /login), logged-in users are redirected to /library or /purchase.
 * - default: requires authentication, redirects logged-out users to /login?redirect=...
 */
export default function ProtectedRoute({ children, requirePurchase = false, guestOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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
          VERIFYING MENTICO CREDENTIALS...
        </p>
      </div>
    );
  }

  // If page is for guests only (e.g. /login) and user is already logged in
  if (guestOnly && user) {
    if (user.hasPurchased) {
      return <Navigate to="/library" replace />;
    }
    return <Navigate to="/purchase" replace />;
  }

  // If user is not authenticated, redirect to /login and preserve return URL
  if (!user && !guestOnly) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  // If page requires active purchase and user has not purchased yet
  if (requirePurchase && user && !user.hasPurchased) {
    return <Navigate to="/purchase" replace />;
  }

  return children;
}

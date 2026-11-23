import { useEffect, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children, requirePurchase = false, guestOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [attempt, setAttempt] = useState(0);
  const [verification, setVerification] = useState({ loading: requirePurchase, entitled: false, error: '' });
  useEffect(() => {
    if (!requirePurchase) return;
    const controller = new AbortController();
    let pass;
    try { pass = JSON.parse(localStorage.getItem('mentico_access_pass') || 'null'); } catch {}
    const token = location.state?.accessPass?.accessToken || pass?.accessToken;
    if (!token) { setVerification({ loading: false, entitled: false, error: '' }); return; }
    setVerification({ loading: true, entitled: false, error: '' });
    (async () => {
      try {
        const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const data = await response.json();
        if (response.status >= 500) throw new Error(data.error || 'Purchase verification is temporarily unavailable.');
        if (response.status === 401 || response.status === 403) localStorage.removeItem('mentico_access_pass');
        if (!controller.signal.aborted) setVerification({ loading: false, entitled: response.ok && data.success && data.user?.hasPurchased === true, error: '' });
      } catch (err) {
        if (!controller.signal.aborted) setVerification({ loading: false, entitled: false, error: err.message || 'Could not confirm access. Please retry.' });
      }
    })();
    return () => controller.abort();
  }, [requirePurchase, location.state, attempt]);

  if ((requirePurchase && verification.loading) || (!requirePurchase && loading)) {
    return <div className="container" style={{ minHeight: '60vh', display: 'grid', placeContent: 'center', gap: 16 }}><Spinner size="lg" color="red"/><p>Confirming your reading access…</p></div>;
  }
  if (requirePurchase) {
    if (verification.error) return <section className="container-narrow" style={{ paddingBlock: 48 }}><div className="card" role="alert"><h1>Let’s confirm your access.</h1><p style={{ marginBlock: 20 }}>{verification.error}</p><button className="btn btn-primary" onClick={() => setAttempt(n => n + 1)}>Retry verification</button><Link className="btn btn-secondary" to="/contact" style={{ marginLeft: 12 }}>Get help</Link></div></section>;
    return verification.entitled ? children : <Navigate to="/purchase?denied=true" replace/>;
  }
  if (guestOnly) return user ? <Navigate to="/purchase" replace/> : children;
  return user ? children : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace/>;
}

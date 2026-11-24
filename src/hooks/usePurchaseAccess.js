import { useEffect, useState } from 'react';
function storedToken() {
  try { return JSON.parse(localStorage.getItem('mentico_access_pass') || 'null')?.accessToken || ''; } catch { return ''; }
}
export default function usePurchaseAccess() {
  const [token, setToken] = useState(storedToken);
  const [verified, setVerified] = useState({ token: '', access: null });
  useEffect(() => {
    const sync = () => setToken(storedToken());
    window.addEventListener('storage', sync);
    window.addEventListener('mentico:purchase', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('mentico:purchase', sync); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (!token) return;
    (async () => {
      try {
        const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const data = await response.json();
        if (!controller.signal.aborted) setVerified({ token, access: response.ok && data.success && data.user?.hasPurchased === true ? data.user : null });
      } catch { if (!controller.signal.aborted) setVerified({ token, access: null }); }
    })();
    return () => controller.abort();
  }, [token]);
  return { access: token && verified.token === token ? verified.access : null, accessToken: token };
}

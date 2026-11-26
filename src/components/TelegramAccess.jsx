import { useEffect, useState } from 'react';
import { MessageCircle, Copy, ExternalLink } from 'lucide-react';
import './PurchasePlans.css';
export default function TelegramAccess({ accessToken }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', url: '' });
  const [copyMessage, setCopyMessage] = useState('');
  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not confirm Telegram access. Please retry.');
        const url = data.user?.hasTelegramAccess ? data.user.telegramInviteUrl : '';
        if (!controller.signal.aborted) setState({ loading: false, error: '', url: url || '' });
      } catch (err) { if (!controller.signal.aborted) setState({ loading: false, error: err.message, url: '' }); }
    })();
    return () => controller.abort();
  }, [accessToken, attempt]);
  if (!accessToken || state.loading) return null;
  if (state.error) return <section className="telegram-access"><h2>Community access</h2><p role="alert">{state.error}</p><button className="btn btn-secondary" onClick={() => { setState({ loading: true, error: '', url: '' }); setAttempt(n => n + 1); }}>Retry community access</button></section>;
  if (!state.url) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(state.url); setCopyMessage('Link copied. Paste it into Telegram to join.'); }
    catch { setCopyMessage('Select and copy the link from the field below.'); }
  };
  return <section className="telegram-access" aria-labelledby="telegram-access-title">
    <span className="badge-red">INCLUDED IN YOUR ₹499 PLAN</span><h2 id="telegram-access-title">Your Field Guide + Community.</h2><p>Join us on Telegram for community access and guidance from the Mentico mentor, subject to availability.</p>
    <div className="telegram-access-actions"><a className="btn btn-primary" href={state.url} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>Join on Telegram<ExternalLink size={16}/></a><button className="btn btn-secondary" onClick={copy}><Copy size={17}/>Copy Telegram link</button></div>
    <label htmlFor="telegram-invite">Or copy and paste this link into Telegram</label><input id="telegram-invite" readOnly value={state.url} onFocus={event => event.target.select()}/>
    <p role="status" className="telegram-access-note">{copyMessage || 'Please keep this members-only invite private.'}</p>
  </section>;
}

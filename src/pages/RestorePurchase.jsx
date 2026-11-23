import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RestorePurchase.css';

export default function RestorePurchase() {
  const navigate = useNavigate();
  const { markPurchased } = useAuth();
  const [token, setToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [email, setEmail] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const hasLink = Boolean(token && !linkInvalid);
  useEffect(() => {
    const captureLink = () => {
      const value = new URLSearchParams(window.location.hash.slice(1)).get('token');
      if (value) { setToken(value); setLinkInvalid(false); setNotice(null); }
      if (window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname);
    };
    captureLink();
    window.addEventListener('hashchange', captureLink);
    return () => window.removeEventListener('hashchange', captureLink);
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setNotice(null);
    try {
      const response = await fetch(hasLink ? '/api/purchase/restore' : '/api/purchase/request-recovery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasLink ? { token } : { email: email.trim(), paymentId: paymentId.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        if (hasLink && response.status === 400) setLinkInvalid(true);
        throw new Error(data.error || 'Recovery is temporarily unavailable. Please retry or contact support.');
      }
      if (!hasLink) {
        setNotice({ type: 'success', message: data.message });
        return;
      }
      let saved = true;
      try { localStorage.setItem('mentico_access_pass', JSON.stringify(data)); } catch { saved = false; }
      markPurchased?.(data);
      navigate('/library?openPdf=true', { replace: true, state: { accessPass: data, openPdf: true, storageUnavailable: !saved } });
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Check your connection and retry.' });
    } finally { setBusy(false); }
  }
  return <section className="restore-page container-narrow">
    <div className="restore-intro">
      <span className="badge-red">YOUR PURCHASE STAYS YOURS</span>
      <h1>Pick up where<br/>you left off.</h1>
      <p>New phone, cleared browser, same Social Freedom. Restore your reading access without paying again.</p>
    </div>
    <div className="restore-card">
      <div className="restore-card-heading"><span className="restore-icon">{hasLink ? <BookOpen size={24}/> : <Mail size={24}/>}</span><div><h2>{hasLink ? 'Your library is waiting.' : 'Restore your purchase'}</h2><p>{hasLink ? 'Confirm below to open your field guide on this browser.' : 'We’ll send a private link to your purchase email.'}</p></div></div>
      <form onSubmit={submit}>
        {!hasLink && <>
          <label htmlFor="restore-email">Purchase email</label>
          <input id="restore-email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} required disabled={busy}/>
          <label htmlFor="restore-payment">Razorpay payment ID</label>
          <input id="restore-payment" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="pay_…" maxLength={84} value={paymentId} onChange={event => setPaymentId(event.target.value)} required disabled={busy} aria-describedby="restore-payment-help"/>
          <p id="restore-payment-help" className="restore-help">Find the ID starting with <strong>pay_</strong> in your Razorpay receipt. Use the email you entered at checkout.</p>
        </>}
        {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`restore-notice restore-notice-${notice.type}`}>{notice.message}</div>}
        <button className="btn btn-primary" disabled={busy} type="submit">{busy ? (hasLink ? 'Confirming your purchase…' : 'Sending verification link…') : (hasLink ? 'Restore access & open my library' : 'Email my verification link')}<ArrowRight size={18}/></button>
      </form>
      <p className="restore-security"><ShieldCheck size={17}/>{hasLink ? 'We’ll check your current payment status before restoring access.' : 'Only someone with access to your purchase email can restore it.'}</p>
    </div>
    <p className="restore-support">Can’t find your receipt or used the wrong email? <Link to="/contact">Contact support</Link>. Please don’t purchase again.</p>
    <Link className="restore-back" to="/purchase">Back to the course</Link>
  </section>;
}

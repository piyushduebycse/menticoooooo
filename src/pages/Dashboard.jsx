import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Download, BookOpen, CheckCircle2, Mail, FileText, ArrowRight } from 'lucide-react';
import TelegramAccess from '../components/TelegramAccess';
import { downloadPublication } from '../services/downloadPublication';
import './Downloads.css';

export default function Dashboard() {
  const location = useLocation();
  const [params] = useSearchParams();
  const pass = (() => { try { return JSON.parse(localStorage.getItem('mentico_access_pass') || '{}'); } catch { return {}; } })();
  const accessToken = params.get('token') || params.get('pass') || location.state?.accessPass?.accessToken || pass.accessToken;
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const controller = useRef(null);
  const urls = useRef(new Set());
  useEffect(() => () => {
    controller.current?.abort();
    for (const url of urls.current) URL.revokeObjectURL(url);
  }, []);
  const download = async () => {
    if (status === 'downloading') return;
    setError(''); setStatus('downloading'); setProgress(0);
    controller.current = new AbortController();
    try {
      const blob = await downloadPublication({ accessToken, onProgress: setProgress, signal: controller.current.signal });
      const url = URL.createObjectURL(blob); urls.current.add(url);
      const link = document.createElement('a'); link.href = url; link.download = 'Mentico-Social-Freedom.pdf';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, 60000);
      setStatus('done');
    } catch (err) {
      if (err.name !== 'AbortError') { setError(err.message); setStatus('idle'); }
    }
  };
  return <section className="downloads-page container-narrow">
    <div className="downloads-welcome"><span className="badge-red"><CheckCircle2 size={14}/>PURCHASE CONFIRMED</span><h1>Your field guide.<br/>Yours to keep.</h1><p>Download it once. Read it anywhere. Your next small conversation starts here.</p></div>
    <div className="download-book-card">
      <img src="/images/book_isolated.jpg" alt="Social Freedom by Mentico field guide"/>
      <div><span className="downloads-eyebrow">SOCIAL FREEDOM · BY MENTICO</span><h2>Make room for real conversations.</h2><p>A comprehensive field guide, practical frameworks and your 30-day challenge. Save your Course for offline reading or print a copy for personal use.</p>
        <div className="download-book-badges"><span><FileText size={15}/>Downloadable Course</span><span><BookOpen size={15}/>Lifetime access</span></div>
        <button className="btn btn-primary download-primary" onClick={download} disabled={status === 'downloading'}><Download size={22}/>{status === 'downloading' ? `Preparing your Course… ${progress}%` : status === 'done' ? 'Download Course again' : 'Download my Course'}<ArrowRight size={18}/></button>
        {status === 'downloading' && <progress className="download-progress" value={progress} max={100} aria-label="Course download progress"/>}
        {error && <p role="alert" className="download-error">{error}</p>}
        {status === 'done' && <p role="status" className="download-success"><CheckCircle2 size={17}/>Your Course is ready. Check your browser’s downloads or your phone’s Files app.</p>}
        <p className="downloads-fine-print">Open your Course from your downloads to read it offline.</p>
      </div>
    </div>
    <TelegramAccess accessToken={accessToken}/>
    <div className="downloads-help"><Mail size={22}/><div><h2>Need a hand with your download?</h2><p>Use the purchase link in your confirmation email to return here. If anything goes wrong, contact us with your payment ID—please don’t pay again.</p><Link to="/contact">Contact Mentico support<ArrowRight size={16}/></Link></div></div>
  </section>;
}

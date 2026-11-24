import usePurchaseAccess from '../hooks/usePurchaseAccess';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open, () => setOpen(false));
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const resize = () => { if (window.innerWidth >= 900) setOpen(false); };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const { access } = usePurchaseAccess();
  const hasPass = Boolean(access);
  const links = [['/', 'Home'], ['/about', 'About Mentico'], ['/purchase', 'The field guide'], ...(hasPass ? [['/library', 'My downloads']] : []), ['/contact', 'Contact']];
  const signOut = async () => {
    await logout();
    localStorage.removeItem('mentico_access_pass');
    window.dispatchEvent(new Event('storage'));
    setOpen(false);
  };
  return <header className={`site-header ${open ? 'is-open' : ''}`}>
    <div className="site-nav">
      <Link className="site-wordmark" to="/" aria-label="Mentico home"><span>mentico<span className="wordmark-dot">.</span></span><small>Social Freedom</small></Link>
      <div className="site-ticker" role="note" aria-label="YOU DON'T HAVE A PEOPLE PROBLEM. YOU HAVE AN APPROACH PROBLEM.">
        <div aria-hidden="true">{[0, 1].map(copy => <span key={copy}>YOU DON'T HAVE A PEOPLE PROBLEM. YOU HAVE AN APPROACH PROBLEM. <b>✦</b></span>)}</div>
      </div>
      <nav className="site-desktop-nav" aria-label="Main navigation">{links.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}</nav>
      <Link className="btn btn-primary site-nav-cta" to={hasPass ? '/library' : '/purchase'}>{hasPass ? 'My downloads' : 'Get the field guide'}<ArrowRight size={16}/></Link>
      <button type="button" className="site-menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-mobile-nav" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}>{open ? <X size={25}/> : <Menu size={25}/>}</button>
    </div>
    {open && <nav id="site-mobile-nav" className="site-mobile-nav" aria-label="Mobile navigation">
      <span className="site-menu-label">Explore Mentico</span>
      {links.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'}>{label}<ArrowRight size={18}/></NavLink>)}
      <Link to="/terms">Terms & policies</Link>
      {(user || access) ? <button className="btn btn-secondary" onClick={signOut}><LogOut size={16}/>Sign out</button> : null}
      <Link className="btn btn-primary" to="/purchase">Get the field guide<ArrowRight size={18}/></Link>
    </nav>}
  </header>;
}

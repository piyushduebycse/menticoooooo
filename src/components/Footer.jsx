import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="site-footer">
    <div className="container site-footer-grid">
      <div><Link className="site-wordmark" to="/" aria-label="Mentico home"><span>mentico<span className="wordmark-dot">.</span></span><small>Social Freedom</small></Link><p>A practical field guide to better conversations, meaningful connections and a little more courage, every day.</p></div>
      <nav aria-label="Explore Mentico"><h2>Explore</h2><Link to="/">Home</Link><Link to="/about">About Mentico</Link><Link to="/purchase">Get the course</Link><Link to="/library">My library</Link></nav>
      <nav aria-label="Support and policies"><h2>Here to help</h2><Link to="/contact">Contact & support</Link><Link to="/terms">Terms & policies</Link><Link to="/restore">Restore purchase</Link><Link to="/login">Member sign in</Link><a href="mailto:margmanpath@gmail.com">margmanpath@gmail.com</a></nav>
    </div>
    <div className="container site-footer-bottom"><span>© {new Date().getFullYear()} Mentico. All rights reserved.</span><span>Less overthinking. More living.</span></div>
  </footer>;
}

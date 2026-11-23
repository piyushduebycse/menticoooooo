import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// 7 Core Pages Lazy-Loaded for Instant Initial Page Load
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Product = lazy(() => import('./pages/Product'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Login = lazy(() => import('./pages/Login'));
const RestorePurchase = lazy(() => import('./pages/RestorePurchase'));

// Lightweight page transition loader
function PageLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-main)',
          borderTopColor: 'var(--red-primary)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
    </div>
  );
}

// Scroll to top helper on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const titles = { '/': 'Social Freedom', '/purchase': 'Get the course', '/about': 'About Mentico', '/contact': 'Contact & support', '/terms': 'Terms & policies', '/login': 'Member sign in', '/library': 'My library', '/restore': 'Restore purchase' };
    document.title = `${titles[pathname] || 'Mentico'} · Mentico`;
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`app-wrapper ${isLandingPage ? 'landing-mode' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} data-page={location.pathname.split('/')[1] || 'home'} className={isLandingPage ? 'landing-main-content' : 'main-content'}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/restore" element={<RestorePurchase />} />
              <Route path="/about" element={<About />} />
              
              {/* Purchase Route (open to all visitors so they can buy directly) */}
              <Route path="/purchase" element={<Product />} />
              {/* Backward-compatibility alias for /product */}
              <Route path="/product" element={<Navigate to="/purchase" replace />} />

              {/* Library Download Route (requires authentication AND active purchase) */}
              <Route
                path="/library"
                element={
                  <ProtectedRoute requirePurchase={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Backward-compatibility alias for /dashboard */}
              <Route path="/dashboard" element={<Navigate to="/library" replace />} />
              {/* Direct alias for PDF reader */}
              <Route path="/reader" element={<Navigate to="/library?openPdf=true" replace />} />

              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              {/* Backward-compatibility redirect for legacy /legal */}
              <Route path="/legal" element={<Navigate to="/terms" replace />} />

              {/* Fallback route */}
              <Route path="*" element={<section className="brand-not-found container-narrow"><span className="badge-red">PAGE NOT FOUND</span><h1>A little off the path.</h1><p>This page isn't available. Head home to explore Social Freedom, or contact us if you need help.</p><div><Link className="btn btn-primary" to="/">Back to Mentico</Link><Link className="btn btn-secondary" to="/contact">Get help</Link></div></section>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
          <Analytics />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';

// 7 Core Pages Lazy-Loaded for Instant Initial Page Load
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Product = lazy(() => import('./pages/Product'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const Login = lazy(() => import('./pages/Login'));

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
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`app-wrapper ${isLandingPage ? 'landing-mode' : ''}`}>
      {!isLandingPage && <Navbar />}
      <main className={isLandingPage ? 'landing-main-content' : 'main-content'}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            
            {/* Purchase Route (requires authentication, redirects unauthenticated to /login?redirect=/purchase) */}
            <Route
              path="/purchase"
              element={
                <ProtectedRoute>
                  <Product />
                </ProtectedRoute>
              }
            />
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
            <Route path="/legal" element={<Legal />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isLandingPage && <Footer />}
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


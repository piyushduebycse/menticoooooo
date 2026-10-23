import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';

// 7 Core Pages
import Home from './pages/Home';
import About from './pages/About';
import Product from './pages/Product';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Login from './pages/Login';

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

          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


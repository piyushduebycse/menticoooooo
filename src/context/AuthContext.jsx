import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService, isRealFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  const [authRedirectPath, setAuthRedirectPath] = useState(null);

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    const loggedUser = await firebaseAuthService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const signup = async (name, email, password) => {
    const newUser = await firebaseAuthService.signup(name, email, password);
    setUser(newUser);
    return newUser;
  };

  const loginDemo = async () => {
    const demoUser = await firebaseAuthService.loginDemo();
    setUser(demoUser);
    return demoUser;
  };

  const loginGoogle = async () => {
    const gUser = await firebaseAuthService.loginGoogle();
    setUser(gUser);
    return gUser;
  };

  const loginGoogleRedirect = async () => {
    return await firebaseAuthService.loginGoogleRedirect();
  };

  const logout = async () => {
    await firebaseAuthService.logout();
    setUser(null);
  };

  const resetPassword = async (email) => {
    return await firebaseAuthService.resetPassword(email);
  };

  const sendVerificationEmail = async () => {
    return await firebaseAuthService.sendVerificationEmail();
  };

  const getIdToken = async (forceRefresh = false) => {
    return await firebaseAuthService.getIdToken(forceRefresh);
  };

  const refreshUser = async () => {
    const updated = await firebaseAuthService.refreshUser();
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  const submitTicket = async (ticketData) => {
    return await firebaseAuthService.saveSupportTicket(ticketData);
  };

  const openAuthModal = (tab = 'login', redirectPath = null) => {
    setAuthModalTab(tab);
    setAuthRedirectPath(redirectPath);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginDemo,
        loginGoogle,
        loginGoogleRedirect,
        logout,
        resetPassword,
        sendVerificationEmail,
        getIdToken,
        refreshUser,
        submitTicket,
        isRealFirebase: isRealFirebaseConfigured,
        isAuthModalOpen,
        authModalTab,
        authRedirectPath,
        setAuthRedirectPath,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

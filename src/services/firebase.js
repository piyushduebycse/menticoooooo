import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Environment or custom injected Firebase credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isRealFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY'
);

let app = null;
let auth = null;
let db = null;
let analytics = null;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to simulated engine:', err);
  }
}

/* ==========================================================================
   Simulated Storage Engine (Guarantees 100% operational demo out-of-the-box)
   ========================================================================== */
const STORAGE_KEY_USER = 'mentico_auth_user';
const STORAGE_KEY_PURCHASES = 'mentico_purchases';
const STORAGE_KEY_TICKETS = 'mentico_contact_tickets';

// Default Demo Indian Youth User (18-30 target demographic)
export const DEMO_MENTICO_USER = {
  uid: 'mentico_demo_84920',
  email: 'aarav.mehta@gmail.com',
  displayName: 'Aarav Mehta (24, Bengaluru)',
  role: 'Mentico Pro Member',
  hasPurchasedPdf: true,
  purchaseDate: '2026-09-28T10:30:00Z',
  licenseKey: 'MENTICO-IN-9842-X1',
  downloadCount: 3,
  lastDownload: '2026-10-04T18:20:00Z',
  goals: ['Stage Presence', 'Overcoming Social Hesitation', 'High-Trust Networking'],
};

/* ==========================================================================
   Auth Wrappers (Real Firebase with Mock Fallback)
   ========================================================================== */
export const firebaseAuthService = {
  // Listen to Auth State
  onAuthChange: (callback) => {
    if (isRealFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          let extraData = {};
          try {
            if (db) {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const snapshot = await getDoc(userDocRef);
              if (snapshot.exists()) {
                extraData = snapshot.data();
              }
            }
          } catch (e) {
            console.error('Error fetching firestore user profile:', e);
          }
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            hasPurchasedPdf: extraData.hasPurchasedPdf ?? true,
            licenseKey: extraData.licenseKey || 'MENTICO-IN-7701-VIP',
            ...extraData,
          });
        } else {
          callback(null);
        }
      });
    }

    // Mock Mode Observer
    const notifyMock = () => {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        try {
          callback(JSON.parse(stored));
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    };

    window.addEventListener('storage', notifyMock);
    notifyMock();

    return () => {
      window.removeEventListener('storage', notifyMock);
    };
  },

  // Email / Password Login
  login: async (email, password) => {
    if (isRealFirebaseConfigured && auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
      } catch (err) {
        if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
          throw new Error('Firebase API Key in .env is invalid. Please copy the complete Web API Key from Firebase Console (Project Settings > General > Web API Key).');
        }
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. If you do not have an account yet, switch to Register.');
        }
        if (err.code === 'auth/operation-not-allowed') {
          throw new Error('Email/Password sign-in is disabled in Firebase Console. Enable it under Authentication > Sign-in method.');
        }
        throw err;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser = {
      uid: 'usr_' + Date.now(),
      email,
      displayName: email.split('@')[0].toUpperCase(),
      role: 'Mentico Member',
      hasPurchasedPdf: true,
      licenseKey: 'MENTICO-IN-' + Math.floor(1000 + Math.random() * 9000),
      purchaseDate: new Date().toISOString(),
      downloadCount: 1,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    window.dispatchEvent(new Event('storage'));
    return mockUser;
  },

  // Signup
  signup: async (name, email, password) => {
    if (isRealFirebaseConfigured && auth) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        if (db) {
          await setDoc(doc(db, 'users', credential.user.uid), {
            displayName: name,
            email,
            createdAt: serverTimestamp(),
            hasPurchasedPdf: false,
            role: 'Mentico Student',
          });
        }
        return credential.user;
      } catch (err) {
        if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
          throw new Error('Firebase API Key in .env is invalid. Please copy the complete Web API Key from Firebase Console (Project Settings > General > Web API Key).');
        }
        if (err.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please switch to Member Login.');
        }
        if (err.code === 'auth/weak-password') {
          throw new Error('Password should be at least 6 characters.');
        }
        if (err.code === 'auth/operation-not-allowed') {
          throw new Error('Email/Password sign-in is disabled in Firebase Console. Enable it under Authentication > Sign-in method.');
        }
        throw err;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    const mockUser = {
      uid: 'usr_' + Date.now(),
      email,
      displayName: name || email.split('@')[0],
      role: 'Mentico Student',
      hasPurchasedPdf: false,
      licenseKey: 'PENDING_ENROLLMENT',
      purchaseDate: null,
      downloadCount: 0,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    window.dispatchEvent(new Event('storage'));
    return mockUser;
  },

  // Demo Login (Instant 1-click test)
  loginDemo: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEMO_MENTICO_USER));
    window.dispatchEvent(new Event('storage'));
    return DEMO_MENTICO_USER;
  },

  // Google Login
  loginGoogle: async () => {
    if (isRealFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        return credential.user;
      } catch (err) {
        if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
          throw new Error('Firebase API Key in .env is invalid. Please copy the complete Web API Key from Firebase Console (Project Settings > General > Web API Key).');
        }
        if (err.code === 'auth/popup-closed-by-user') {
          throw new Error('Google sign-in popup was closed before completing.');
        }
        throw err;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockUser = {
      uid: 'google_user_' + Date.now(),
      email: 'ananya.sharma@gmail.com',
      displayName: 'Ananya Sharma (22, Delhi NCR)',
      role: 'Mentico Member',
      hasPurchasedPdf: true,
      licenseKey: 'MENTICO-IN-5102-G',
      purchaseDate: new Date().toISOString(),
      downloadCount: 2,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    window.dispatchEvent(new Event('storage'));
    return mockUser;
  },

  // Logout
  logout: async () => {
    if (isRealFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    window.dispatchEvent(new Event('storage'));
  },

  // Record Purchase in Firestore / LocalStorage
  recordPurchase: async (userId, productDetails) => {
    const purchaseData = {
      userId,
      productName: 'The Mentico 3-in-1 Mastery Blueprint (PDF + Audio Vault)',
      productType: 'Confidence, Public Speaking & Relationship Master Program',
      amount: productDetails.amount ?? 1999,
      currency: 'INR',
      licenseKey: 'MENTICO-IN-' + Math.floor(1000 + Math.random() * 9000) + '-LIC',
      status: 'completed',
      timestamp: new Date().toISOString(),
    };

    if (isRealFirebaseConfigured && db && userId) {
      try {
        await addDoc(collection(db, 'orders'), {
          ...purchaseData,
          createdAt: serverTimestamp(),
        });
        await setDoc(
          doc(db, 'users', userId),
          {
            hasPurchasedPdf: true,
            licenseKey: purchaseData.licenseKey,
            lastOrderDate: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore order write error:', err);
      }
    }

    // Update Local User state
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      try {
        const u = JSON.parse(stored);
        u.hasPurchasedPdf = true;
        u.licenseKey = purchaseData.licenseKey;
        u.purchaseDate = purchaseData.timestamp;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }

    const purchases = JSON.parse(localStorage.getItem(STORAGE_KEY_PURCHASES) || '[]');
    purchases.push(purchaseData);
    localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(purchases));

    return purchaseData;
  },

  // Record Support Form Ticket
  saveSupportTicket: async (ticket) => {
    const ticketRecord = {
      ...ticket,
      ticketId: 'MENTICO-TK-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    if (isRealFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'support_tickets'), {
          ...ticketRecord,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore support ticket write error:', err);
      }
    }

    const tickets = JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS) || '[]');
    tickets.push(ticketRecord);
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));

    return ticketRecord;
  },
};

export { auth, db, analytics };

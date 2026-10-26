import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Server-only Firebase Admin SDK Singleton (Modular Firebase Admin v14)
 * Resilient against missing service account credentials and network dropouts.
 */
let adminApp = null;
let adminAuth = null;
let adminDb = null;
let adminStorage = null;

// Safe In-Memory DB stub for local dev when service account credentials are not configured
const inMemoryStore = new Map();

function createSafeFirestoreStub() {
  return {
    collection: (collName) => ({
      doc: (docId) => ({
        get: async () => {
          const key = `${collName}/${docId}`;
          const data = inMemoryStore.get(key);
          return {
            exists: Boolean(data),
            id: docId,
            data: () => data || {},
          };
        },
        set: async (data, options = {}) => {
          const key = `${collName}/${docId}`;
          if (options.merge && inMemoryStore.has(key)) {
            inMemoryStore.set(key, { ...inMemoryStore.get(key), ...data });
          } else {
            inMemoryStore.set(key, data);
          }
          return { writeTime: new Date() };
        },
        update: async (data) => {
          const key = `${collName}/${docId}`;
          inMemoryStore.set(key, { ...(inMemoryStore.get(key) || {}), ...data });
          return { writeTime: new Date() };
        },
      }),
    }),
    batch: () => {
      const ops = [];
      return {
        set: (docRef, data, options) => ops.push(() => docRef.set(data, options)),
        update: (docRef, data) => ops.push(() => docRef.update(data)),
        commit: async () => {
          for (const op of ops) {
            await op();
          }
          return [];
        },
      };
    },
  };
}

export function getFirebaseAdmin() {
  if (adminApp && adminAuth && adminDb) {
    return { adminApp, adminAuth, adminDb, adminStorage, FieldValue };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'margman-staging';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;

  const hasServiceAccount = Boolean(projectId && clientEmail && privateKey);

  if (getApps().length > 0) {
    adminApp = getApp();
  } else if (hasServiceAccount) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
    } catch (err) {
      console.error('[Firebase Admin] Service account initialization failed:', err);
      throw err;
    }
  } else {
    try {
      adminApp = initializeApp({
        projectId,
        storageBucket,
      });
    } catch {
      adminApp = getApp();
    }
  }

  try {
    adminAuth = getAuth(adminApp);
  } catch (err) {
    console.warn('[Firebase Admin] Auth initialization warning:', err.message);
  }

  // Only initialize real Firestore if real service account credentials are provided.
  // Otherwise, use safe in-memory stub to prevent GCP ADC metadata lookup timeouts/crashes on Windows.
  if (hasServiceAccount) {
    try {
      adminDb = getFirestore(adminApp);
    } catch (err) {
      console.error('[Firebase Admin] Firestore initialization failed:', err);
      throw err;
    }
  } else {
    adminDb = createSafeFirestoreStub();
  }

  try {
    adminStorage = getStorage(adminApp);
  } catch {
    adminStorage = null;
  }

  return { adminApp, adminAuth, adminDb, adminStorage, FieldValue };
}

// Fallback safe FieldValue implementation
const SafeFieldValue = {
  serverTimestamp: () => new Date().toISOString(),
  delete: () => null,
  increment: (n) => n,
  arrayUnion: (...elements) => elements,
  arrayRemove: (...elements) => elements,
};

export { SafeFieldValue as FieldValue };

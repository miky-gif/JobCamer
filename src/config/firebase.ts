import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDMcHjBsHmAO6gduKaNTpaeH7nZTnynCnY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jobcamer-65a6d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jobcamer-65a6d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jobcamer-65a6d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '900433308527',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:900433308527:web:343b7cae9fa3b3ef50969a',
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connecter aux émulateurs en développement (optionnel)
// Désactivé par défaut - Activer seulement si vous utilisez Firebase Emulator Suite
// if (import.meta.env.DEV && window.location.hostname === 'localhost') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199);
//   } catch (error) {
//     // Les émulateurs sont déjà connectés
//   }
// }

export default app;

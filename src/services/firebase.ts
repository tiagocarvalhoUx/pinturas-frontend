import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(config)
  .filter(([, value]) => typeof value !== 'string' || !value.trim())
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `[Firebase] Configuracao ausente: ${missingKeys.join(
      ', ',
    )}. Preencha EXPO_PUBLIC_FIREBASE_* no frontend/.env e reinicie o Expo.`,
  );
}

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);

export const firebaseAuth = getAuth(firebaseApp);

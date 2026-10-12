'use client';

import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = () => Object.values(config).every(Boolean);

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) throw new Error('La configuración de Firebase está pendiente.');
  const app = getApps().find((item) => item.name === 'formance') || initializeApp(config, 'formance');
  return getAuth(app);
}

import * as admin from 'firebase-admin';
import { config } from './env';

// Initialize Firebase Admin
// In production, use standard GOOGLE_APPLICATION_CREDENTIALS env var
// For local dev, you might want to mock or use a serviceAccount.json
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        console.log('Firebase Admin Initialized');
    }
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    // Do not exit process, strictly speaking, as we might want to run without auth for some tests or in a "mock" mode if intended.
    // But for production this is critical.
}

export const firebaseAuth = admin.auth();

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBaUHn-HGz3oCBM1dorwSYk8F9f4e2bGQ",
    authDomain: "moneymitra-22314.firebaseapp.com",
    projectId: "moneymitra-22314",
    storageBucket: "moneymitra-22314.firebasestorage.app",
    messagingSenderId: "354091700236",
    appId: "1:354091700236:web:4de292ea3e40da35305e29",
    measurementId: "G-8DWP8LPC60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

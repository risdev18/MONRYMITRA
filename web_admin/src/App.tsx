import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Dashboard from './pages/Dashboard';
import AddCustomer from './pages/AddCustomer';
import Attendance from './pages/Attendance';
import CustomerDetails from './pages/CustomerDetails';
import SetupBusinessPage from './pages/SetupBusiness';
import DynamicDashboard from './pages/DynamicDashboard';
import ExamPaper from './pages/ExamPaper';
import Paywall from './pages/Paywall';
import AdminLogin from './pages/AdminLogin';
import AdminCoupons from './pages/AdminCoupons';
import AuthPage from './pages/Auth';
import RootGuard from './components/RootGuard';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [firebaseError, setFirebaseError] = useState(false);

    useEffect(() => {
        // Check if Firebase is properly configured
        if (!auth) {
            setFirebaseError(true);
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            }, (error) => {
                console.error('Auth state change error:', error);
                setFirebaseError(true);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error('Firebase auth error:', error);
            setFirebaseError(true);
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
                <div className="text-white font-black text-3xl animate-pulse">MoneyMitra</div>
            </div>
        );
    }

    if (firebaseError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-600 via-orange-600 to-yellow-500 flex items-center justify-center p-6">
                <div className="max-w-2xl bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/20 text-white">
                    <h1 className="text-4xl font-black mb-6">⚠️ Firebase Not Configured</h1>
                    <p className="text-xl font-bold mb-4">Your Firebase credentials are not set up yet.</p>
                    <div className="bg-white/10 p-6 rounded-2xl mb-6 text-left">
                        <p className="font-bold mb-4">📋 Quick Setup Steps:</p>
                        <ol className="space-y-2 text-sm">
                            <li>1. Go to <a href="https://console.firebase.google.com/" target="_blank" className="underline">Firebase Console</a></li>
                            <li>2. Create a new project (or use existing)</li>
                            <li>3. Enable Email/Password authentication</li>
                            <li>4. Create Firestore database</li>
                            <li>5. Copy your Firebase config</li>
                            <li>6. Update <code className="bg-black/30 px-2 py-1 rounded">web_admin/src/firebase.ts</code></li>
                        </ol>
                    </div>
                    <p className="text-sm opacity-80">📖 Full instructions in: <code className="bg-black/30 px-2 py-1 rounded">FIREBASE_SETUP_GUIDE.md</code></p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:scale-105 transition"
                    >
                        Reload After Setup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={user ? <Navigate to="/setup" /> : <AuthPage />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-coupons" element={<AdminCoupons />} />

                {/* Protected Routes */}
                {user ? (
                    <>
                        <Route path="/setup" element={<SetupBusinessPage />} />
                        <Route path="/paywall" element={<Paywall />} />

                        <Route path="/" element={
                            <RootGuard>
                                <DynamicDashboard />
                            </RootGuard>
                        } />

                        <Route path="/old-dashboard" element={<Dashboard />} />
                        <Route path="/add-customer" element={
                            <RootGuard>
                                <AddCustomer />
                            </RootGuard>
                        } />
                        <Route path="/attendance" element={
                            <RootGuard>
                                <Attendance />
                            </RootGuard>
                        } />
                        <Route path="/customer/:id" element={
                            <RootGuard>
                                <CustomerDetails />
                            </RootGuard>
                        } />
                        <Route path="/exam" element={<ExamPaper />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/auth" />} />
                )}
            </Routes>
        </Router>
    );
}

export default App;

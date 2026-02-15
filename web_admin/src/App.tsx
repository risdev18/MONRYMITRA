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
            <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center font-sans">
                <div className="text-slate-900 font-black text-4xl animate-pulse italic tracking-tight">MoneyMitra</div>
            </div>
        );
    }

    if (firebaseError) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 font-sans">
                <div className="max-w-2xl w-full bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 text-slate-900 text-center italic">
                    <h1 className="text-4xl font-black mb-6 tracking-tight">⚠️ Configuration Required</h1>
                    <p className="text-xl font-bold mb-4 text-slate-500">Your Firebase credentials are not set up yet.</p>
                    <div className="bg-[#F7F9FC] p-8 rounded-2xl mb-8 text-left border border-slate-100 shadow-inner">
                        <p className="font-black text-xs uppercase tracking-widest text-indigo-600 mb-4 italic">📋 Quick Setup Steps:</p>
                        <ol className="space-y-3 text-sm font-bold text-slate-600">
                            <li>1. Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-indigo-600 underline">Firebase Console</a></li>
                            <li>2. Create a new project (or use existing)</li>
                            <li>3. Enable Email/Password authentication</li>
                            <li>4. Create Firestore database</li>
                            <li>5. Copy your Firebase config</li>
                            <li>6. Update <code className="bg-slate-200 px-2 py-1 rounded-lg text-slate-900">web_admin/src/firebase.ts</code></li>
                        </ol>
                    </div>
                    <p className="text-xs font-bold text-slate-400">📖 Full instructions in: <code className="bg-slate-100 px-2 py-1 rounded text-slate-500">FIREBASE_SETUP_GUIDE.md</code></p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-10 w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-xl shadow-slate-200 active:scale-95"
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building, UserPlus, LogIn } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthPage() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                alert('Account created! Please setup your business.');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/setup');
        } catch (error: any) {
            alert(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/20">
                <div className="text-center mb-10">
                    <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <Building className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">MoneyMitra</h1>
                    <p className="text-white/70 font-bold mt-2 italic">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-white/60 mb-2 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-4 w-4 h-4 text-white/40" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold placeholder:text-white/30 focus:ring-2 focus:ring-white/50 outline-none transition backdrop-blur-sm"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-white/60 mb-2 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-4 w-4 h-4 text-white/40" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold placeholder:text-white/30 focus:ring-2 focus:ring-white/50 outline-none transition backdrop-blur-sm"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : (
                            <>
                                {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-white/80 font-bold text-sm hover:text-white transition"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 text-center">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        Secure • Encrypted • Private
                    </p>
                </div>
            </div>
        </div>
    );
}

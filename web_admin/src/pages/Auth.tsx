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
        <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 italic">
                <div className="text-center mb-10">
                    <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                        <Building className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">MoneyMitra</h1>
                    <p className="text-slate-500 font-bold mt-2 italic uppercase text-[10px] tracking-[0.2em]">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-4 w-4 h-4 text-slate-300" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-6 py-4 bg-[#F7F9FC] border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-4 w-4 h-4 text-slate-300" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-6 py-4 bg-[#F7F9FC] border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-50 hover:bg-slate-800"
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
                        className="text-slate-400 font-bold text-sm hover:text-slate-900 transition"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 text-center">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        Secure SSL • Encrypted • Private
                    </p>
                </div>
            </div>
        </div>
    );
}

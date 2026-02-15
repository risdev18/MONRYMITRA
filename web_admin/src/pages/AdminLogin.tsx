import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Matching User's provided credentials
        if (user === 'RishabhAnsh' && pass === '4137RishAnsh') {
            navigate('/admin-coupons');
        } else {
            alert('Invalid Admin Credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 italic">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="text-center mb-10">
                    <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Authorized access only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-5 top-4 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder:text-slate-300"
                                value={user}
                                onChange={e => setUser(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-4 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder:text-slate-300"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition active:scale-95 mt-4 shadow-md shadow-emerald-200"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
}

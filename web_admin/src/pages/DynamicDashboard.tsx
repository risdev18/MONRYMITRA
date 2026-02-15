import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle, Settings, UserPlus, FileText,
    Phone, Send, CreditCard, TrendingUp,
    Search, Mic, Users, ArrowUpRight, Trash2, X, ShieldCheck, Zap, Plus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CustomerAPI } from '../api';

export default function DynamicDashboard() {
    const navigate = useNavigate();
    const { business } = useAppStore();
    const [customers, setCustomers] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await CustomerAPI.getAll();
            setCustomers(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const clearAllData = async () => {
        if (window.confirm("Are you sure you want to DELETE ALL MEMBERS? This cannot be undone.")) {
            if (window.confirm("Please confirm again. All member data will be lost forever.")) {
                try {
                    // Delete all customers one by one (Firestore doesn't have a simple 'delete collection' from client)
                    const promises = customers.map(c => CustomerAPI.delete(c._id));
                    await Promise.all(promises);
                    alert("All members deleted successfully.");
                    loadStats();
                } catch (e) {
                    console.error("Failed to delete all", e);
                    alert("Failed to delete some members. Please try again.");
                }
            }
        }
    };

    const deleteCustomer = async (e: any, id: string) => {
        e.stopPropagation(); // Prevent navigation to details page
        if (window.confirm("Delete this member?")) {
            try {
                await CustomerAPI.delete(id);
                loadStats();
            } catch (error) {
                console.error("Failed to delete member", error);
            }
        }
    };

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
    };

    const startVoiceCommand = () => {
        const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
        recognition.lang = 'en-IN';
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('Listening...');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const result = event.results[0][0].transcript.toLowerCase();
            setTranscript(result);

            if (result.includes('add')) {
                const words = result.split(' ');
                const addIndex = words.indexOf('add');
                const name = words[addIndex + 1];
                const amount = words.find((w: string, i: number) => i > addIndex && !isNaN(Number(w)));

                if (name) {
                    const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
                    const cleanAmount = Number(amount) || 0;

                    await CustomerAPI.create({
                        name: cleanName,
                        phone: '0000000000',
                        category: business.businessType || 'OTHER',
                        amountDue: cleanAmount,
                    });

                    speak(`Ok, added ${cleanName} with ${cleanAmount} rupees.`);
                    loadStats();
                    setTimeout(() => setTranscript(''), 3000);
                }
            } else {
                speak("I didn't catch that. Say Add followed by a name.");
            }
        };
        recognition.start();
    };

    if (!business) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-slate-400">⚡ LOADING...</div>;

    const totalPending = customers.reduce((sum, c) => sum + (Number(c.amountDue) || 0), 0);
    const activeCount = customers.length;
    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);

    return (
        <div className="min-h-screen bg-[#F7F9FC] pb-32 font-sans text-slate-900">
            {/* ... (Header section remains mostly same but calls the new clearAllData) ... */}
            {/* Header section with reduced height and softer gradient */}
            <header className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-10 pb-12 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]" />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-8">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/80 italic">Operations Console</p>
                            <h1 className="text-3xl font-black tracking-tighter mt-1 text-white">{business.businessName}</h1>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={clearAllData} className="p-3.5 bg-white/5 rounded-2xl hover:bg-rose-500 border border-white/10 group transition-all active:scale-95" title="Reset All">
                                <Trash2 className="w-5 h-5 text-rose-400 group-hover:text-white" />
                            </button>
                            <button onClick={() => alert("Settings coming soon!")} className="p-3.5 bg-white/5 rounded-2xl hover:bg-slate-700 transition border border-white/10 active:scale-95">
                                <Settings className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Dues</p>
                                <div className="bg-emerald-500/20 p-1 rounded-md">
                                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-4xl font-black tracking-tight text-white">₹{totalPending.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Members</p>
                                <div className="bg-emerald-500/20 p-1 rounded-md">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-4xl font-black tracking-tight text-white">{activeCount}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Trial / Subscription Banner Logic */}
            <div className="max-w-5xl mx-auto px-6 mt-4">
                {business.paymentStatus === 'TRIAL' && (
                    <div className="bg-white border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-2 rounded-lg">
                                <Zap className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-emerald-900 uppercase">3-Day Free Trial Active</p>
                                <p className="text-[10px] text-slate-500 font-bold">Unlock unlimited features forever.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/paywall')}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition active:scale-95 shadow-lg shadow-emerald-100"
                        >
                            Pay Now
                        </button>
                    </div>
                )}

                {business.paymentStatus === 'PENDING_APPROVAL' && (
                    <div className="bg-white border border-amber-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className="bg-amber-50 p-2 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-amber-900 uppercase">Activation Pending</p>
                            <p className="text-[10px] text-slate-500 font-bold">Admin is reviewing your payment.</p>
                        </div>
                    </div>
                )}

                {business.paymentStatus === 'PAID' && (
                    <div className="bg-white border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-emerald-900 uppercase">Premium Plan Active</p>
                            <p className="text-[10px] text-slate-500 font-bold">All features unlocked.</p>
                        </div>
                    </div>
                )}
            </div>

            <main className="max-w-5xl mx-auto p-6 -mt-4 relative z-20">
                {/* Search & Mic Bar */}
                <div className="relative mb-16 mt-6">
                    <div className="bg-white rounded-[1.75rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-2.5 flex items-center group focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                        <Search className="ml-5 text-slate-300 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find or add member..."
                            className="flex-1 px-4 py-4 bg-transparent border-none focus:ring-0 font-bold text-slate-800 placeholder:text-slate-300 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={startVoiceCommand}
                            className={`px-6 py-4 rounded-[1.25rem] transition-all flex items-center gap-3 active:scale-95 ${isListening ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'}`}
                        >
                            <Mic className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">{isListening ? 'Listening' : 'Voice Entry'}</span>
                        </button>
                    </div>
                    {transcript && (
                        <div className="absolute top-full left-0 w-full mt-3 bg-slate-800 text-white p-4 rounded-2xl text-xs font-black flex justify-between items-center animate-in slide-in-from-top-2 border border-slate-700 shadow-2xl z-30">
                            <span className="italic truncate pr-4">"{transcript}"</span>
                            <X className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setTranscript('')} />
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-16">
                    <QuickAction
                        label="New Member"
                        sub="Register"
                        icon={UserPlus}
                        onClick={() => navigate('/add-customer')}
                    />
                    <QuickAction
                        label="Collect Fees"
                        sub="Register"
                        icon={CreditCard}
                        onClick={() => navigate('/attendance')}
                    />
                    <QuickAction
                        label="Broadcast"
                        sub="WhatsApp"
                        icon={Send}
                        onClick={() => {
                            const msg = prompt("Enter message to broadcast:");
                            if (msg) {
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                            }
                        }}
                    />
                    {/* 📄 AI Question Paper - Only for Educational Businesses */}
                    {(business.businessType === 'TUITION' || business.businessType === 'COLLEGE') && (
                        <QuickAction
                            label="Exam Paper"
                            sub="AI Generator"
                            icon={FileText}
                            onClick={() => navigate('/exam')}
                        />
                    )}
                    <QuickAction
                        label="Analytics"
                        sub="P&L Report"
                        icon={TrendingUp}
                        onClick={() => alert("Detailed Analytics Report coming in the next update!")}
                    />
                    <QuickAction
                        label="Admin Panel"
                        sub="Coupons & Trial"
                        icon={ShieldCheck}
                        onClick={() => navigate('/admin-login')}
                    />
                </div>

                {/* Member List */}
                {customers.length > 0 ? (
                    <div className="mb-16">
                        <header className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Recent Members</h3>
                            <button onClick={() => navigate('/attendance')} className="text-[10px] font-black text-emerald-600 uppercase hover:bg-emerald-50 px-3 py-1 rounded-lg transition">View Register</button>
                        </header>
                        <div className="space-y-4">
                            {filtered.map(c => (
                                <div key={c._id} onClick={() => navigate(`/customer/${c._id}`)} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-md relative">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black group-hover:bg-slate-900 group-hover:text-white transition-colors uppercase text-slate-700">
                                            {c.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-lg">{c.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.category || 'Portfolio'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={`font-black text-lg ${c.amountDue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{c.amountDue}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Balance</p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteCustomer(e, c._id)}
                                            className="p-2 -mr-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                            title="Delete Member"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-20 text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm px-8">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <UserPlus className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Empty Register</h3>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 mb-8 italic">Add your first member to start collecting payments.</p>
                        <button
                            onClick={() => navigate('/add-customer')}
                            className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center gap-3 mx-auto"
                        >
                            <Plus className="w-6 h-6" /> Add New Member
                        </button>
                    </div>
                )}
            </main>

            {/* Bottom Floating Bar - Sleeker & Circular-inspired */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
                <button
                    onClick={() => window.open('https://wa.me/918468943268', '_blank')}
                    className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-700 transition-all hover:scale-110 active:scale-90 group relative"
                    title="WhatsApp Support"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute right-full mr-3 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">WhatsApp Help</span>
                </button>
                <button
                    onClick={() => window.location.href = 'tel:8468943268'}
                    className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-all hover:scale-110 active:scale-90 group relative"
                    title="Call Support"
                >
                    <Phone className="w-5 h-5" />
                    <span className="absolute right-full mr-3 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Call Now</span>
                </button>
            </div>
        </div>
    );
}

function QuickAction({ label, sub, icon: Icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`bg-white text-slate-900 border-slate-100 p-6 rounded-[2.5rem] text-left flex flex-col justify-between h-52 shadow-sm hover:shadow-2xl transition-all border group hover:-translate-y-1`}
        >
            <div className={`bg-emerald-50 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform group-hover:bg-emerald-600`}>
                <Icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1 italic tracking-[0.2em]">{sub}</p>
                <p className="font-black text-2xl leading-none tracking-tighter text-slate-900">{label}</p>
            </div>
        </button>
    );
}

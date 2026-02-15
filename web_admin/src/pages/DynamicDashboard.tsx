import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle, Settings, UserPlus, FileText,
    Phone, Send, CreditCard, TrendingUp,
    Search, Mic, Users, ArrowUpRight, Trash2, X, ShieldCheck, Zap
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
            <header className="bg-slate-900 text-white p-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 italic">Workstation</p>
                            <h1 className="text-2xl font-black tracking-tight mt-1 text-white">{business.businessName.toUpperCase()}</h1>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={clearAllData} className="p-3 bg-white/10 rounded-2xl hover:bg-rose-500 border border-white/10 group transition-all" title="Delete All Members">
                                <Trash2 className="w-5 h-5 text-rose-400 group-hover:text-white" />
                            </button>
                            <button onClick={() => alert("Settings coming soon!")} className="p-3 bg-white/10 rounded-2xl hover:bg-slate-700 transition border border-white/10">
                                <Settings className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-slate-400">Pending</p>
                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-3xl font-black">₹{totalPending.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-slate-400">Portfolio</p>
                                <Users className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-3xl font-black">{activeCount}</p>
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
                <div className="relative mb-12 mt-4">
                    <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-2 flex items-center">
                        <Search className="ml-5 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="flex-1 px-4 py-4 bg-transparent border-none focus:ring-0 font-bold text-slate-800 placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={startVoiceCommand}
                            className={`p-4 rounded-[1.25rem] transition-all flex items-center gap-2 ${isListening ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            <Mic className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{isListening ? 'Listening' : 'Voice Add'}</span>
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
                    <div className="mb-16 text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">No Members Yet</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1 mb-6">Add your first member to start tracking</p>
                        <button onClick={() => navigate('/add-customer')} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-100">
                            Add Member
                        </button>
                    </div>
                )}
            </main>

            {/* Bottom Bar - Compact */}
            <div className="fixed bottom-6 left-0 w-full px-6 flex justify-center z-50 pointer-events-none">
                <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md text-white rounded-full p-1.5 flex gap-2 shadow-2xl pointer-events-auto items-center">
                    <button
                        onClick={() => window.open('https://wa.me/918468943268', '_blank')}
                        className="flex items-center gap-2 px-6 py-3 hover:bg-white/10 rounded-full transition"
                    >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Help</span>
                    </button>
                    <div className="w-[1px] bg-slate-700 h-4"></div>
                    <button
                        onClick={() => window.location.href = 'tel:8468943268'}
                        className="flex items-center gap-2 px-6 py-3 hover:bg-white/10 rounded-full transition"
                    >
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ label, sub, icon: Icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`bg-white text-slate-900 border-slate-100 p-6 rounded-[2rem] text-left flex flex-col justify-between h-44 shadow-sm hover:shadow-xl transition-all border group`}
        >
            <div className={`bg-slate-50 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform group-hover:bg-emerald-50`}>
                <Icon className="w-6 h-6 text-slate-800 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase opacity-50 mb-1 italic tracking-widest">{sub}</p>
                <p className="font-black text-xl leading-none tracking-tighter text-slate-800">{label}</p>
            </div>
        </button>
    );
}

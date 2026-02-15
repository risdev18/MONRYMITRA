import { useState, useEffect } from 'react';
import { Users, CreditCard, Calendar, Plus, Search, TrendingUp, AlertCircle, CheckCircle2, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomerAPI, TransactionAPI } from '../api';

export default function Dashboard() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ todayPending: 0, weekPending: 0, paidToday: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [custRes, txRes] = await Promise.all([
                CustomerAPI.getAll(),
                TransactionAPI.getAll()
            ]);

            const fetchedCustomers = custRes.data;
            const fetchedTransactions = txRes.data;

            setCustomers(fetchedCustomers);

            // Calculate "One Look System" Stats
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Mocking these splits for the UI demo based on existing data
            const todayPending = fetchedCustomers
                .filter((c: any) => c.amountDue > 0 && new Date(c.nextDueDate || now) <= startOfDay)
                .reduce((sum: number, c: any) => sum + (c.amountDue || 0), 0);

            const weekPending = fetchedCustomers
                .filter((c: any) => c.amountDue > 0)
                .reduce((sum: number, c: any) => sum + (c.amountDue || 0), 0) - todayPending;

            const paidToday = fetchedTransactions
                .filter((t: any) => {
                    const tDate = new Date(t.date);
                    return t.type === 'PAYMENT' && tDate >= startOfDay;
                })
                .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

            setStats({ todayPending, weekPending, paidToday });
        } catch (e) {
            console.error("Failed to load dashboard data", e);
            setCustomers([]);
        }
    };

    const [isListening, setIsListening] = useState(false);

    const startVoiceCommand = async () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            setIsListening(false);

            // AI Logic Simulation
            const nameMatch = transcript.match(/add ([\w]+)/i) || transcript.match(/naam ([\w]+)/i);
            const amountMatch = transcript.match(/(\d+)/);

            if (nameMatch && amountMatch) {
                const name = nameMatch[1];
                const amount = amountMatch[1];

                await CustomerAPI.create({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    amountDue: parseInt(amount),
                    phone: '99999' + Math.floor(10000 + Math.random() * 90000),
                    category: 'OTHER',
                    billingCycle: 'MONTHLY',
                    startDate: new Date()
                });

                alert(`WOW! MoneyMitra AI processed: "Add ${name} ₹${amount}"\n\nMember added successfully! Tension khatam! ✅`);
                loadData(); // REFRESH THE LIST
            } else {
                alert(`I heard: "${transcript}"\n\nTry saying "Add Rahul 1500" to see the magic!`);
            }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.start();
    };

    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:block fixed h-full shadow-2xl">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        MoneyMitra
                    </h1>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-2 opacity-80">Paise Vasooli Assistant</p>
                </div>
                <nav className="mt-8 px-4">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600/20 text-emerald-400 rounded-xl font-semibold border-l-4 border-emerald-500">
                        <Users className="w-5 h-5" /> Dashboard
                    </button>
                    <button onClick={() => navigate('/attendance')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition mt-2">
                        <Calendar className="w-5 h-5" /> Attendance
                    </button>
                </nav>

                <div className="absolute bottom-8 left-0 px-6 w-full">
                    <button
                        onClick={startVoiceCommand}
                        className={`w-full bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-left transition hover:bg-slate-800 ${isListening ? 'ring-2 ring-rose-500' : ''}`}
                    >
                        <p className="text-xs text-slate-400">Pro Feature</p>
                        <p className="text-sm font-bold text-white mt-1 flex items-center justify-between">
                            Voice First Entry
                            <Mic className={`w-4 h-4 ${isListening ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-400">
                            {isListening ? "Listening..." : "Click to Try Demo"}
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:ml-64">
                <header className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Home Dashboard</h2>
                        <p className="text-slate-500 mt-1 font-medium">MoneyMitra – Paise Vasooli ka Tension Khatam</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/add-customer')}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 font-bold"
                        >
                            <Plus className="w-5 h-5" /> Onboard Member
                        </button>
                    </div>
                </header>

                {/* "One Look System" Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Today Pending"
                        value={`₹${stats.todayPending.toLocaleString()}`}
                        color="text-rose-600"
                        accent="bg-rose-50"
                        icon={<AlertCircle className="w-6 h-6 text-rose-500" />}
                        label="Immediate Action"
                    />
                    <StatCard
                        title="This Week Pending"
                        value={`₹${stats.weekPending.toLocaleString()}`}
                        color="text-amber-600"
                        accent="bg-amber-50"
                        icon={<TrendingUp className="w-6 h-6 text-amber-500" />}
                        label="Upcoming Dues"
                    />
                    <StatCard
                        title="Paid Today"
                        value={`₹${stats.paidToday.toLocaleString()}`}
                        color="text-emerald-600"
                        accent="bg-emerald-50"
                        icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        label="Money Recovered"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            Recent Dues
                            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-black">{customers.length} Total</span>
                        </h3>
                        <div className="relative w-64 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-emerald-500"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={startVoiceCommand}
                                className={`p-2 rounded-xl transition ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FBFCFE]">
                                <tr>
                                    <th className="px-8 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Member Name</th>
                                    <th className="px-8 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Business Type</th>
                                    <th className="px-8 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Balance</th>
                                    <th className="px-8 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-40">
                                                <Users className="w-12 h-12 mb-3" />
                                                <p className="font-bold">No members found</p>
                                                <p className="text-sm">Try adding a member to see them here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((cust) => (
                                        <tr
                                            key={cust._id}
                                            className="hover:bg-slate-50 transition group cursor-pointer"
                                            onClick={() => navigate(`/customer/${cust._id}`)}
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${cust.amountDue > 5000 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {cust.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{cust.name}</p>
                                                        <p className="text-xs text-slate-500">{cust.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">
                                                    {cust.category || 'MEMBER'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {cust.amountDue > 5000 ? (
                                                    <span className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                                        Very Late
                                                    </span>
                                                ) : cust.amountDue > 0 ? (
                                                    <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                                        Due Soon
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                        Healthy
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className={`font-black text-lg ${cust.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    ₹{cust.amountDue.toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-slate-900 font-black text-xs hover:bg-slate-50 px-4 py-2 rounded-lg transition uppercase tracking-wider">
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, color, icon, accent, label }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-100 transition duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 ${accent} rounded-bl-[4rem] -mr-12 -mt-12 group-hover:w-28 group-hover:h-28 transition-all opacity-40`} />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${accent}`}>
                        {icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter py-1 px-3 ${accent} ${color.replace('text-', 'text-opacity-80 text-')} rounded-full`}>
                        {label}
                    </span>
                </div>
                <p className="text-slate-500 text-sm font-bold">{title}</p>
                <p className={`text-4xl font-black mt-1 ${color} tracking-tight`}>{value}</p>
            </div>
        </div>
    );
}

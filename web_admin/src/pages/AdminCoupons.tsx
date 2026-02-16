import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, ArrowLeft, Users, ShieldCheck, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CouponAPI, BusinessAPI } from '../api';

export default function AdminCoupons() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'COUPONS' | 'ACTIVATIONS'>('COUPONS');

    return (
        <div className="min-h-screen bg-[#F7F9FC] text-slate-900 p-8 font-sans italic">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/paywall')} className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-emerald-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Exit Admin
                </button>

                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Admin Console</h1>
                        <p className="text-slate-500 font-bold mt-2 italic">Manage your business & revenue.</p>
                    </div>
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setTab('COUPONS')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${tab === 'COUPONS' ? 'bg-slate-900 text-white shadow-md shadow-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Coupons
                        </button>
                        <button
                            onClick={() => setTab('ACTIVATIONS')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${tab === 'ACTIVATIONS' ? 'bg-rose-600 text-white shadow-md shadow-rose-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Activations
                        </button>
                    </div>
                </header>

                {tab === 'COUPONS' ? <CouponManager /> : <ActivationManager />}
            </div>
        </div>
    );
}

function ActivationManager() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

    useEffect(() => { loadBusinesses(); }, []);

    const loadBusinesses = async () => {
        const res = await BusinessAPI.getAll();
        setBusinesses(res.data || []);
    };

    const togglePremium = async (id: string, activate: boolean) => {
        if (!window.confirm(activate ? "Activate this user's premium plan?" : "Revoke / Expire this user's plan?")) return;
        await BusinessAPI.togglePremium(id, activate);
        loadBusinesses();
    };

    const filteredBusinesses = businesses.filter(b => {
        const matchesSearch =
            (b.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.phone || '').includes(searchTerm) ||
            (b.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'ALL' ||
            (filterStatus === 'PENDING' && b.paymentStatus === 'PENDING_APPROVAL') ||
            (filterStatus === 'PAID' && b.paymentStatus === 'PAID');

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h2 className="font-black text-xs uppercase tracking-widest text-emerald-600 mb-8 italic flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Pending Requests & Active Users
                </h2>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Name / Phone..."
                            className="w-full pl-12 pr-4 py-3 bg-[#F7F9FC] border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-300 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-[#F7F9FC] p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                        {[
                            { id: 'ALL', label: 'All', icon: Users },
                            { id: 'PENDING', label: 'Pending', icon: Filter },
                            { id: 'PAID', label: 'Premium', icon: ShieldCheck },
                        ].map((f) => {
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterStatus(f.id as any)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${filterStatus === f.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Icon className="w-3 h-3" /> {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredBusinesses.length === 0 ? (
                        <div className="text-center py-12 opacity-40">
                            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">No matching businesses</p>
                        </div>
                    ) : (
                        filteredBusinesses.map((b) => (
                            <div key={b._id} className="bg-[#F7F9FC] p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-black text-slate-900 text-lg tracking-tight">{b.businessName}</p>
                                        {b.paymentStatus === 'PENDING_APPROVAL' && (
                                            <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase border border-amber-200">Pending Approval</span>
                                        )}
                                        {b.paymentStatus === 'PAID' && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase border border-emerald-200">PREMIUM ACTIVE</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{b.phone} • {b.ownerName}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {b.paymentStatus === 'PAID' ? (
                                        <button
                                            onClick={() => togglePremium(b._id, false)}
                                            className="px-4 py-2 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 border border-rose-100"
                                        >
                                            <XCircle className="w-3 h-3" /> Revoke
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => togglePremium(b._id, true)}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 animate-pulse"
                                        >
                                            <CheckCircle2 className="w-3 h-3" /> Activate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function CouponManager() {
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [coupons, setCoupons] = useState<any[]>([]);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        const res = await CouponAPI.getAll();
        setCoupons(res.data || []);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !discount) return;
        setIsLoading(true);
        try {
            await CouponAPI.create({ code: code.toUpperCase(), discount: Number(discount), isActive: true });
            alert(`Coupon ${code.toUpperCase()} Created!`);
            setCode('');
            setDiscount('');
            loadCoupons();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this coupon?")) return;
        await CouponAPI.delete(id);
        loadCoupons();
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h2 className="font-black text-xs uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create New
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Code</label>
                            <input
                                type="text"
                                placeholder="SALE50"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-300"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Discount (₹)</label>
                            <input
                                type="number"
                                placeholder="50"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-300"
                                value={discount}
                                onChange={e => setDiscount(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-100 active:scale-95 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Generate Coupon'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <h2 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-8 italic">Active Coupons</h2>
                    <div className="space-y-4">
                        {coupons.length === 0 ? (
                            <div className="text-center py-12 opacity-40">
                                <Ticket className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No active coupons</p>
                            </div>
                        ) : (
                            coupons.map((cp) => (
                                <div key={cp._id} className="bg-[#F7F9FC] p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 border border-emerald-100 shadow-inner">
                                            <Ticket className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg tracking-tight">{cp.code}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Save ₹{cp.discount}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cp._id)}
                                        className="p-3 text-slate-300 hover:text-rose-500 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck, Zap } from 'lucide-react';
import { CustomerAPI } from '../api';

export default function AddCustomer() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: 'GYM',
        monthlyFee: 1500,
        amountDue: 0,
        billingCycle: 'MONTHLY',
        startDate: new Date(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Next month
        billingDuration: 1,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Default 1 year
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Creating customer:', formData);
            await CustomerAPI.create(formData);
            alert('Member Onboarded Successfully!');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to onboard member. Make sure backend is running!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
            <div className="max-w-xl mx-auto">
                <button onClick={() => navigate(-1)} className="group flex items-center text-slate-500 mb-8 hover:text-indigo-600 transition font-bold text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition" /> BTN_BACK
                </button>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Zap className="w-20 h-20 text-indigo-600" />
                    </div>

                    <header className="mb-10">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Onboard Member</h1>
                        <p className="text-slate-500 mt-2 font-medium">Add details to start automatic payment tracking</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Member Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">WhatsApp Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-4 font-bold text-slate-400">+91</span>
                                    <input
                                        required
                                        type="tel"
                                        pattern="[0-9]{10}"
                                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="9123456789"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 appearance-none cursor-pointer"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="GYM">Gym Member</option>
                                        <option value="TUITION">Tuition Student</option>
                                        <option value="RENT">Rent Collector</option>
                                        <option value="KIRANA">Kirana Credit</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                        value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                                        onChange={e => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">First Payment Due Date</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900 shadow-inner"
                                    value={formData.nextDueDate ? new Date(formData.nextDueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => setFormData({ ...formData, nextDueDate: new Date(e.target.value) })}
                                />
                                <p className="text-[10px] text-slate-400 mt-2 ml-1 font-bold">MoneyMitra will remind you on this day.</p>
                            </div>
                        </div>

                        <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 space-y-6">
                            <h3 className="text-indigo-900 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Billing Automation
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-indigo-400 mb-2 uppercase">Billing Cycle</label>
                                    <select
                                        className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
                                        value={formData.billingCycle}
                                        onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="WEEKLY">Weekly</option>
                                        <option value="FIXED">One-Time Fee</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-indigo-400 mb-2 uppercase">Fee (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
                                        value={formData.monthlyFee}
                                        onChange={e => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-indigo-100/50">
                                <label className="block text-[10px] font-black text-indigo-400 mb-2 uppercase">Advance/Joining Due (₹)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount if any"
                                    className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
                                    value={formData.amountDue}
                                    onChange={e => setFormData({ ...formData, amountDue: Number(e.target.value) })}
                                />
                            </div>

                            <p className="text-[11px] text-indigo-400 font-bold leading-relaxed">
                                MoneyMitra will automatically detect when payment is due and suggest a WhatsApp reminder.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <><Save className="w-5 h-5 text-indigo-200" /> Start Tracking Now</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

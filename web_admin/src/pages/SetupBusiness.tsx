import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dumbbell, GraduationCap, Home, Users,
    ShoppingBag, PenTool, Calendar, CheckCircle2,
    ChevronRight, Languages, MapPin, User, Building
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BusinessAPI } from '../api';

const businessTypes = [
    { id: 'GYM', label: 'Gym', icon: Dumbbell, color: 'bg-orange-500' },
    { id: 'TUITION', label: 'Tuition', icon: GraduationCap, color: 'bg-blue-500' },
    { id: 'COLLEGE', label: 'College', icon: GraduationCap, color: 'bg-indigo-500' },
    { id: 'RENT', label: 'Rent', icon: Home, color: 'bg-emerald-500' },
    { id: 'SOCIETY', label: 'Society', icon: Users, color: 'bg-indigo-500' },
    { id: 'SHOP', label: 'Retail Shop', icon: ShoppingBag, color: 'bg-rose-500' },
    { id: 'WORKSHOP', label: 'Workshop', icon: PenTool, color: 'bg-slate-500' },
    { id: 'SUBSCRIPTION', label: 'Subscription', icon: Calendar, color: 'bg-purple-500' },
];

export default function SetupBusinessPage() {
    const navigate = useNavigate();
    const setSetupData = useAppStore((state) => state.setSetupData);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        phone: '',
        city: '',
        language: 'ENGLISH',
        businessType: ''
    });

    const handleSubmit = async () => {
        if (!formData.businessType || !formData.phone) return;
        setLoading(true);
        try {
            const res = await BusinessAPI.save(formData);
            setSetupData(res.data, { enabledModules: ['members', 'attendance', 'reminders'] });
            navigate('/');
        } catch (error) {
            console.error('Setup failed:', error);
            alert('Failed to setup business. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
            <div className="w-full max-w-xl">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                </div>

                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Setup Your Business</h1>
                    <p className="text-slate-500 font-medium mt-1">We will customize the app for you.</p>
                </header>

                {step === 1 ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                            <div className="space-y-5">
                                <InputField
                                    label="Business Name"
                                    icon={Building}
                                    placeholder="e.g. Rahul Gym"
                                    value={formData.businessName}
                                    onChange={(v) => setFormData({ ...formData, businessName: v })}
                                />
                                <InputField
                                    label="Owner Name"
                                    icon={User}
                                    placeholder="Your Name"
                                    value={formData.ownerName}
                                    onChange={(v) => setFormData({ ...formData, ownerName: v })}
                                />
                                <InputField
                                    label="Phone Number"
                                    icon={CheckCircle2}
                                    placeholder="10 digit number"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(v) => setFormData({ ...formData, phone: v })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="City"
                                        icon={MapPin}
                                        placeholder="e.g. Pune"
                                        value={formData.city}
                                        onChange={(v) => setFormData({ ...formData, city: v })}
                                    />
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Language</label>
                                        <div className="relative">
                                            <Languages className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <select
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            >
                                                <option value="ENGLISH">English</option>
                                                <option value="HINDI">Hindi</option>
                                                <option value="MARATHI">Marathi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.businessName || !formData.phone}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
                        >
                            Next Step <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 ml-1 text-center">Select Business Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                {businessTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, businessType: type.id })}
                                            className={`flex flex-col items-center p-6 rounded-[2rem] border-4 transition-all active:scale-95 ${formData.businessType === type.id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 grayscale hover:grayscale-0'}`}
                                        >
                                            <div className={`p-4 rounded-2xl ${type.color} text-white mb-3 shadow-lg`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <span className="font-black text-slate-800 text-sm tracking-tight">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-5 bg-slate-200 text-slate-600 rounded-2xl font-black active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.businessType || loading}
                                className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {loading ? 'Setting up...' : 'Setup My Business'} <CheckCircle2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InputField({ label, icon: Icon, placeholder, type = "text", value, onChange }: { label: string, icon: any, placeholder: string, type?: string, value: string, onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{label}</label>
            <div className="relative">
                <Icon className="absolute left-6 top-5 w-5 h-5 text-slate-400" />
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
                />
            </div>
        </div>
    );
}

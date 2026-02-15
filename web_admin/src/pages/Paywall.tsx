import { useState } from 'react';
import { Lock, Zap, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CouponAPI, BusinessAPI } from '../api';

export default function Paywall() {
    const { business, refreshBusiness } = useAppStore();
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [appliedCode, setAppliedCode] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    const applyCoupon = async () => {
        // ... (Keep existing coupon logic)
        if (!coupon) return;
        setIsLoading(true);
        try {
            const res = await CouponAPI.validate(coupon);
            if (res.data && res.data.discount !== undefined) {
                setDiscount(res.data.discount);
                setAppliedCode(coupon.toUpperCase());
            } else {
                alert("Invalid or Expired Coupon");
                setDiscount(0);
                setAppliedCode('');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            await BusinessAPI.requestActivation(business);
            setRequestSent(true);
            alert("Payment Verified! Activation Request Sent to Admin. \n\nPlease wait for approval.");
        } catch (e) {
            console.error(e);
            alert("Failed to send request.");
        } finally {
            setIsLoading(false);
        }
    };

    const checkActivationStatus = () => {
        refreshBusiness();
        // Force a small delay to ensure state updates
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    if (requestSent) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center max-w-md">
                    <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">Request Sent!</h1>
                    <p className="text-slate-500 font-bold mt-4">Your activation request has been sent to the admin.</p>
                    <p className="text-slate-400 text-xs mt-2">Please contact support or wait for confirmation.</p>
                    <button
                        onClick={checkActivationStatus}
                        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition"
                    >
                        Check Activation Status
                    </button>

                    <button
                        onClick={() => navigate('/admin-login')}
                        className="block w-full mt-10 text-[10px] uppercase font-black text-slate-300 hover:text-indigo-500"
                    >
                        Admin: Verify Payment
                    </button>
                </div>
            </div>
        );
    }

    const finalPrice = Math.max(0, 199 - discount);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 italic">
                <div className="bg-indigo-600 p-10 text-white text-center">
                    <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Access Locked</h1>
                    <p className="text-indigo-100 mt-2 font-medium">Your 3-day free trial has expired.</p>
                </div>

                <div className="p-10 space-y-8">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Monthly Plan</p>
                        <div className="flex items-center justify-center gap-2">
                            {discount > 0 && <span className="text-xl text-slate-300 line-through">₹199</span>}
                            <span className="text-5xl font-black text-slate-800">₹{finalPrice}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">Unlimited Members • Automatic Reminders</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-1 bg-indigo-100 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-600">Track all pending dues in one look</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1 bg-indigo-100 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-600">Automated WhatsApp Reminders</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter Coupon Code"
                                className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={coupon}
                                onChange={e => setCoupon(e.target.value)}
                            />
                            <button
                                onClick={applyCoupon}
                                className="px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-xs uppercase"
                            >
                                Apply
                            </button>
                        </div>
                        {appliedCode && (
                            <p className="text-center text-emerald-600 font-black text-[10px] uppercase">
                                <Zap className="w-3 h-3 inline mr-1" /> Coupon {appliedCode} Applied!
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm"
                    >
                        {isLoading ? 'Processing...' : 'Subscribe Now'}
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Secure SSL Encryption • UPI Supported
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate('/admin-login')}
                className="mt-8 text-slate-400 font-bold text-xs hover:text-indigo-600 transition"
            >
                ADMIN ACCESS
            </button>
        </div>
    );
}

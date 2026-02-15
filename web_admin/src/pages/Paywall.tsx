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
            const data = res.data as any; // Cast to any to avoid TS error for 'discount'
            if (data && data.discount !== undefined) {
                setDiscount(data.discount);
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

    const [isChecking, setIsChecking] = useState(false);

    const checkActivationStatus = async () => {
        setIsChecking(true);
        await refreshBusiness();
        // Create a seamless transition
        setTimeout(() => {
            navigate('/');
        }, 1000);
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
                        disabled={isChecking}
                        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {isChecking ? 'Checking...' : 'Check Activation Status'}
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
        <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-sm overflow-hidden border border-slate-100 italic">
                <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lock className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black tracking-tight leading-tight">Stop Chasing Payments Manually</h1>
                        <p className="text-slate-400 mt-2 font-medium text-xs">Unlock Automatic WhatsApp Reminders</p>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Price Box */}
                    <div className="bg-[#F7F9FC] p-6 rounded-3xl border border-slate-100 text-center relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg shadow-orange-200">
                            🔥 Most Popular
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Premium Plan</p>
                        <div className="flex items-center justify-center gap-2 my-2">
                            {discount > 0 && <span className="text-xl text-slate-300 line-through">₹199</span>}
                            <span className="text-5xl font-black text-slate-900">₹{finalPrice}</span>
                            <span className="text-xs font-bold text-slate-400 self-end mb-2">/month</span>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                            Less than ₹7 / day
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {[
                            "Unlimited Members",
                            "Auto WhatsApp Reminders",
                            "Track Dues in One Click",
                            "Priority Support"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="p-1 bg-emerald-100 rounded-full">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-600 italic">
                            "Saved me 3 hours daily. No more awkward calls for money."
                        </p>
                        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                            - Rajesh, Gym Owner (Ahmedabad)
                        </p>
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Coupon Code"
                                className="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold border border-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm outline-none placeholder:text-slate-300"
                                value={coupon}
                                onChange={e => setCoupon(e.target.value)}
                            />
                            <button
                                onClick={applyCoupon}
                                className="px-5 py-3 bg-slate-800 text-white rounded-xl font-black text-xs uppercase hover:bg-slate-700 transition"
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
                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm hover:bg-emerald-600"
                    >
                        {isLoading ? 'Processing...' : 'Unlock Premium Now'}
                    </button>

                    {/* FAQ Mini */}
                    <div className="text-center space-y-2 pt-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Secure SSL Encryption • UPI Supported
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                            Money Back Guarantee if not satisfied in 7 days.
                        </p>
                    </div>
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

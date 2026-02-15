import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CreditCard, Clock, Calendar, Printer, Save } from 'lucide-react';
import { CustomerAPI, TransactionAPI } from '../api';

export default function CustomerDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showPayModal, setShowPayModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        try {
            const [custRes, txRes] = await Promise.all([
                CustomerAPI.getById(id),
                TransactionAPI.getHistory(id)
            ]);
            setCustomer(custRes.data);
            setTransactions(txRes.data);
        } catch (e) {
            console.error("Failed to load customer details", e);
        }
    };

    const handlePayment = async (amount: number, mode: string, nextDate: string) => {
        if (!id) return;
        await TransactionAPI.recordPayment({
            customerId: id,
            amount,
            mode,
            notes: 'Manual Entry'
        });

        // Update next due date
        await CustomerAPI.update(id, { nextDueDate: nextDate });

        setShowPayModal(false);
        loadData(); // Refresh data
    };

    const printReceipt = (tx: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const receiptHtml = `
            <html>
                <head>
                    <title>Payment Receipt</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; text-align: center; }
                        .receipt-box { border: 2px solid #000; padding: 15px; display: inline-block; width: 300px; }
                        h1 { font-size: 20px; margin-bottom: 5px; }
                        p { margin: 5px 0; font-size: 14px; }
                        .amount { font-size: 24px; font-weight: bold; margin: 15px 0; }
                        .footer { font-size: 10px; color: #666; margin-top: 20px; }
                        hr { border: 0; border-top: 1px dashed #000; }
                    </style>
                </head>
                <body>
                    <div class="receipt-box">
                        <h1>MoneyMitra Receipt</h1>
                        <p>Merchant Name: [Your Shop Name]</p>
                        <hr/>
                        <p>Customer: <strong>${customer.name}</strong></p>
                        <p>Date: ${new Date(tx.date).toLocaleDateString()}</p>
                        <p>Mode: ${tx.mode}</p>
                        <div class="amount">₹${tx.amount}</div>
                        <p>Remaining Balance: ₹${customer.amountDue}</p>
                        <hr/>
                        <p class="footer">Thank you for your payment!</p>
                        <p class="footer">Paise Vasooli ka Tension Khatam</p>
                    </div>
                    <script>window.print(); window.close();</script>
                </body>
            </html>
        `;
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    };

    const sendWhatsApp = () => {
        if (!customer) return;
        const msg = `🙏 Namaste ${customer.name},\n\nYour balance of *₹${customer.amountDue}* is pending at our shop.\n\nPlease clear it at your earliest convenience. \n\n_Sent via MoneyMitra – Paise Vasooli ka Tension Khatam_ 🚀`;
        window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (!customer) return <div className="p-20 text-center font-bold text-slate-400">⚡ Loading Member Data...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto bg-[#F8FAFC] min-h-screen">
            <button onClick={() => navigate(-1)} className="group flex items-center text-slate-500 mb-8 hover:text-indigo-600 transition font-black text-sm uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition" /> BTN_BACK
            </button>

            {/* Header Card */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-wrap justify-between items-center mb-8 gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-3xl font-black text-indigo-600 shadow-sm border border-indigo-100">
                        {customer.name[0]}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">{customer.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                                <MessageCircle className="w-4 h-4" /> +91 {customer.phone}
                            </span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                            <span className="uppercase text-[10px] font-black tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">{customer.category}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[200px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Outstanding</p>
                    <p className={`text-4xl font-black ${customer.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{customer.amountDue}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <button
                    onClick={sendWhatsApp}
                    className="flex items-center justify-center gap-3 bg-emerald-500 text-white py-5 rounded-2xl hover:bg-emerald-600 font-black transition shadow-lg shadow-emerald-100 active:scale-95"
                >
                    <MessageCircle className="w-5 h-5" /> Send Reminder (WhatsApp)
                </button>
                <button
                    onClick={() => setShowPayModal(true)}
                    className="flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-2xl hover:bg-indigo-700 font-black transition shadow-lg shadow-indigo-200 active:scale-95"
                >
                    <CreditCard className="w-5 h-5" /> Record New Payment
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl mb-8 w-fit">
                {['overview', 'history', 'attendance'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-sm uppercase tracking-wider">
                                <Clock className="w-5 h-5 text-indigo-500" /> Plan & Schedule
                            </h3>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Next Due Date</span>
                                    <span className={`font-black ${new Date(customer.nextDueDate) < new Date() ? 'text-rose-600' : 'text-slate-800'}`}>
                                        {customer.nextDueDate ? new Date(customer.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'NOT SET'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Billing Cycle</span>
                                    <span className="font-black text-slate-800 uppercase">{customer.billingCycle || 'MONTHLY'}</span>
                                </div>
                                <div className="flex justify-between items-center py-4">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Joining Date</span>
                                    <span className="font-black text-slate-800">
                                        {new Date(customer.joiningDate || customer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#FBFCFE] border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx: any) => (
                                    <tr key={tx._id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-8 py-6 text-slate-600 font-bold">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${tx.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-slate-800 text-lg">₹{tx.amount}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => printReceipt(tx)}
                                                className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition shadow-sm"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No payment records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                            <div>
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Attendance Log</h3>
                                <p className="text-xs text-slate-400 mt-1 font-bold italic">Last 30 Days visualization</p>
                            </div>
                            <button
                                onClick={() => navigate('/attendance')}
                                className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition border border-indigo-100"
                            >
                                <Calendar className="w-4 h-4" /> Open Manual Register
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                            {Array.from({ length: 30 }).map((_, i) => {
                                const day = 30 - i;
                                const isPresent = [1, 3, 4, 6, 7, 10, 11, 13, 14, 15, 18, 20, 21, 25, 26, 28].includes(day);
                                return (
                                    <div key={i} className={`h-14 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${isPresent ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <PaymentModal
                    onClose={() => setShowPayModal(false)}
                    onSubmit={handlePayment}
                    customerName={customer.name}
                    currentDue={customer.amountDue}
                />
            )}
        </div>
    );
}

function PaymentModal({ onClose, onSubmit, customerName, currentDue }: any) {
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState('CASH');
    const [nextDate, setNextDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl shadow-indigo-900/20 border border-indigo-50">
                <header className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">Record Payment</h2>
                    <p className="text-slate-400 font-bold text-center mt-1">Collecting for {customerName}</p>
                </header>

                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Amount</label>
                            <button
                                onClick={() => setAmount(String(currentDue))}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full transition"
                            >
                                Pay Full: ₹{currentDue}
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-6 top-5 font-black text-slate-400">₹</span>
                            <input
                                type="number"
                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-800 text-2xl transition"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Update Next Due Date</label>
                        <input
                            type="date"
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-900"
                            value={nextDate}
                            onChange={(e) => setNextDate(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 mt-2 font-bold italic ml-1">Suggested: 1 Month from today</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Payment Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['CASH', 'UPI', 'GPAY'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`py-4 rounded-xl text-xs font-black transition-all border-2 ${mode === m ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-10">
                    <button
                        onClick={() => onSubmit(Number(amount), mode, nextDate)}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5 opacity-50" /> Confirm Receipt
                    </button>
                    <button onClick={onClose} className="w-full py-4 text-slate-400 hover:text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition">
                        Cancel Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

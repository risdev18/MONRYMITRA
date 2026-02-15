import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Search, CreditCard, Users, Calendar, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomerAPI, AttendanceAPI } from '../api';

export default function Attendance() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        try {
            const res = await CustomerAPI.getAll();
            // In a real app, we'd fetch attendance for the specific selectedDate
            setCustomers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const markAttendance = async (id: string, status: 'PRESENT' | 'ABSENT') => {
        try {
            await AttendanceAPI.mark({
                customerId: id,
                status,
                date: selectedDate // Passing the specific date
            });

            setCustomers(prev => prev.map(c =>
                c._id === id ? { ...c, [`status_${selectedDate}`]: status } : c
            ));
        } catch (e) {
            alert("Failed to mark attendance");
        }
    };

    const printSheet = () => {
        window.print();
    };

    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex print:bg-white">
            {/* Sidebar - Hide on print */}
            <aside className="w-64 bg-slate-900 text-white hidden md:block fixed h-full shadow-2xl print:hidden">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        MoneyMitra
                    </h1>
                </div>
                <nav className="mt-8 px-4">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition group">
                        <Users className="w-5 h-5 group-hover:text-emerald-400" /> Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-emerald-400 rounded-xl font-semibold border-l-4 border-emerald-500 mt-2">
                        <Calendar className="w-5 h-5" /> Attendance
                    </button>
                </nav>
            </aside>

            <main className="flex-1 p-8 md:ml-64 print:ml-0 print:p-0">
                <header className="flex justify-between items-center mb-10 print:hidden">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Register</h2>
                        <p className="text-slate-500 mt-1 font-medium italic">Paise Vasooli and Presence Tracking Combined</p>
                    </div>
                    <button
                        onClick={printSheet}
                        className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition shadow-sm"
                    >
                        <Printer className="w-5 h-5" /> Print Sheet
                    </button>
                </header>

                {/* Date Selector Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center justify-between gap-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl">
                            <Calendar className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Date</p>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-lg font-black text-slate-800 border-none p-0 focus:ring-0 cursor-pointer bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-100"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-100"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Print Header */}
                    <div className="hidden print:block p-8 border-b-2 border-slate-100 mb-6">
                        <h1 className="text-2xl font-bold">MoneyMitra Attendance Sheet</h1>
                        <p className="text-slate-500">Date: {new Date(selectedDate).toLocaleDateString()}</p>
                    </div>

                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-[#FBFCFE] print:hidden">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-50 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 placeholder:text-slate-300 transition"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((cust) => {
                                    const status = cust[`status_${selectedDate}`] || 'NONE';
                                    return (
                                        <tr key={cust._id} className="hover:bg-indigo-50/30 transition group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                                                        {cust.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-lg">{cust.name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{cust.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-4 print:hidden">
                                                    <button
                                                        onClick={() => markAttendance(cust._id, 'ABSENT')}
                                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all active:scale-95 ${status === 'ABSENT' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
                                                    >
                                                        <XCircle className="w-4 h-4" /> Absent
                                                    </button>
                                                    <button
                                                        onClick={() => markAttendance(cust._id, 'PRESENT')}
                                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all active:scale-95 ${status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Present
                                                    </button>
                                                </div>
                                                <div className="hidden print:block font-black text-sm">
                                                    {status === 'PRESENT' ? (
                                                        <span className="text-emerald-600">✅ PRESENT</span>
                                                    ) : status === 'ABSENT' ? (
                                                        <span className="text-rose-600">❌ ABSENT</span>
                                                    ) : (
                                                        <span className="text-slate-300 underline underline-offset-4 decoration-dotted">NOT MARKED</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

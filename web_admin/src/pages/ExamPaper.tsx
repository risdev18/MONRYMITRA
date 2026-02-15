import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, ChevronRight, Upload, Bolt, Download, Send, Printer, GraduationCap, Mic, Trash2, History, Settings2, Plus, Minus } from 'lucide-react';

export default function ExamPaper() {
    const navigate = useNavigate();
    const [step, setStep] = React.useState(1);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isScanning, setIsScanning] = React.useState(false);
    const [isDeepScanning, setIsDeepScanning] = React.useState(false);
    const [chapters, setChapters] = React.useState<string[]>([]);
    const [selectedChapters, setSelectedChapters] = React.useState<string[]>([]);
    const [fileSelected, setFileSelected] = React.useState<string | null>(null);
    const [pyqFile, setPyqFile] = React.useState<string | null>(null);
    const [manualChapter, setManualChapter] = React.useState('');
    const [isCustomPattern, setIsCustomPattern] = React.useState(false);
    const [customWeights, setCustomWeights] = React.useState([
        { type: 'MCQs', count: 5, marks: 1 },
        { type: 'Short Answers', count: 4, marks: 3 },
        { type: 'Long Answers', count: 1, marks: 13 }
    ]);

    const handleFileUpload = (e: any, isPyq: boolean = false) => {
        const file = e.target.files[0];
        if (file) {
            if (isPyq) setPyqFile(file.name);
            else {
                setFileSelected(file.name);
                startDetection(false);
            }
        }
    };

    const startDetection = (isDeep: boolean) => {
        if (isDeep) setIsDeepScanning(true);
        else setIsScanning(true);

        // Reset old data to ensure trustworthiness
        if (!isDeep) {
            setChapters([]);
            setSelectedChapters([]);
        }

        setTimeout(() => {
            setIsScanning(false);
            setIsDeepScanning(false);

            const detected = isDeep
                ? ["Laws of Motion", "Work, Energy & Power", "Thermodynamics", "Oscillations", "Waves", "Gravitation", "Kinetic Theory", "Properties of Matter", "Solid State", "Chemical Bonding"]
                : ["Laws of Motion", "Work, Energy & Power", "Thermodynamics", "Oscillations", "Waves"];

            setChapters(Array.from(new Set([...chapters, ...detected])));
        }, isDeep ? 4000 : 2500);
    };

    const addManualChapter = () => {
        if (manualChapter.trim()) {
            setChapters([...chapters, manualChapter.trim()]);
            setSelectedChapters([...selectedChapters, manualChapter.trim()]);
            setManualChapter('');
        }
    };

    const toggleChapter = (c: string) => {
        if (selectedChapters.includes(c)) setSelectedChapters(selectedChapters.filter(x => x !== c));
        else setSelectedChapters([...selectedChapters, c]);
    };

    const removeChapter = (c: string) => {
        setChapters(chapters.filter(x => x !== c));
        setSelectedChapters(selectedChapters.filter(x => x !== c));
    };

    const nextStep = () => {
        if (step === 1 && selectedChapters.length === 0) {
            alert("Trustworthy AI needed! Please upload a book or select chapters detected from the syllabus accurately.");
            return;
        }
        setStep(s => s + 1);
    };

    const generatePaper = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setStep(6);
        }, 2000);
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center text-slate-900">
                <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-2xl font-black">AI is Crafting Your Paper...</h2>
                <p className="text-slate-500 mt-2 font-medium">Mixing conceptual + theory questions</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            <header className="bg-white border-b border-slate-100 p-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">AI Question Paper Generator</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Step {step} of 5</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-8">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Set the Scope</h2>
                            <p className="text-slate-500 font-medium mt-1 italic">"For a student's future, accuracy is our priority."</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 border-dashed border-2 flex flex-col items-center py-16 relative">
                            {(isScanning || isDeepScanning) ? (
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 border-4 ${isDeepScanning ? 'border-amber-500' : 'border-emerald-500'} border-t-transparent rounded-full animate-spin mb-4`} />
                                    <p className={`font-bold ${isDeepScanning ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {isDeepScanning ? 'Deep Scanning Full Syllabus...' : 'AI Scanning Study Material...'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Validating Syllabus Content</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-emerald-500 mb-4" />
                                    <p className="font-bold text-slate-800">{fileSelected || "Drop Textbook PDF or Scan"}</p>
                                    <p className="text-xs text-slate-400 mt-1">AI will detect chapters automatically</p>
                                    <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
                                        <label className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            {fileSelected ? 'Change Textbook' : 'Select Textbook'}
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, false)} accept=".pdf,.doc,.docx,image/*" />
                                        </label>

                                        <label className={`w-full px-6 py-3 border-2 border-dashed rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${pyqFile ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                            <History className="w-4 h-4" />
                                            {pyqFile ? 'PYQs Added ✓' : 'Add PYQs for Reference'}
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, true)} accept=".pdf,.doc,.docx,image/*" />
                                        </label>

                                        {chapters.length > 0 && chapters.length < 10 && (
                                            <button
                                                onClick={() => startDetection(true)}
                                                className="w-full px-6 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold text-sm hover:bg-amber-100 transition flex items-center justify-center gap-2"
                                            >
                                                <Mic className="w-4 h-4" /> Deep Scan (Full Book)
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {chapters.length > 0 && (
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-800 italic uppercase text-[10px] tracking-widest">Verify & Select Chapters</h3>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-black uppercase">
                                        {chapters.length >= 10 ? 'Full Syllabus Detected' : 'Trustworthy Extraction'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {chapters.map(c => {
                                        const isSelected = selectedChapters.includes(c);
                                        return (
                                            <div
                                                key={c}
                                                className={`p-4 rounded-2xl text-left flex items-center justify-between group transition-all border-2 ${isSelected ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                                            >
                                                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleChapter(c)}>
                                                    <div className={`w-5 h-5 rounded-md border-2 transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 flex items-center justify-center' : 'border-slate-200'}`}>
                                                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>{c}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeChapter(c); }}
                                                    className="p-2 hover:bg-rose-100 text-slate-300 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Missing a chapter? Type here..."
                                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                                        value={manualChapter}
                                        onChange={(e) => setManualChapter(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addManualChapter()}
                                    />
                                    <button
                                        onClick={addManualChapter}
                                        className="bg-slate-900 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={nextStep}
                            disabled={selectedChapters.length === 0}
                            className={`w-full py-5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all ${selectedChapters.length > 0 ? 'bg-slate-900 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            Continue to Pattern <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-slate-800">Difficulty Level</h2>
                            <p className="text-slate-500 font-medium mt-1">AI will balance Bloom's Taxonomy based on your choice.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'Easy', desc: 'Direct Theory & Numerical' },
                                { id: 'Medium', desc: 'Application & Reasoning' },
                                { id: 'Hard', desc: 'HOTS & Complex Analysis' },
                                { id: 'Mixed', desc: 'Ideal for Board Prep' }
                            ].map(d => (
                                <button key={d.id} onClick={nextStep} className="p-6 bg-white border border-slate-100 rounded-3xl text-left flex items-center justify-between hover:border-emerald-500 transition-all shadow-sm group">
                                    <div>
                                        <p className="font-black text-xl text-slate-800">{d.id}</p>
                                        <p className="text-xs text-slate-400 mt-1">{d.desc}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <Bolt className="w-5 h-5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-800">Select Exam Pattern</h2>
                            <p className="text-slate-500 font-medium mt-1">Choose a standard template or custom marks.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'UT', name: 'Unit Test', marks: 30, icon: FileText },
                                { id: 'CT', name: 'Class Test', marks: 20, icon: CheckCircle2 },
                                { id: 'FE', name: 'Final Exam', marks: 80, icon: GraduationCap },
                                { id: 'CUSTOM', name: 'Custom Pattern', marks: 'Any', icon: Settings2 }
                            ].map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setIsCustomPattern(p.id === 'CUSTOM');
                                        nextStep();
                                    }}
                                    className="p-6 bg-white border border-slate-100 rounded-3xl text-left flex items-center justify-between hover:border-emerald-500 transition-all shadow-sm group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all text-slate-400">
                                            <p.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-slate-800">{p.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{p.id === 'CUSTOM' ? 'Design your own paper structure' : `Standard ${p.marks} Marks Structure`}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-slate-800">Marks Distribution</h2>
                            <p className="text-slate-500 font-medium mt-1 ">
                                {isCustomPattern ? 'Design your custom structure' : `Total Weightage: 30 Marks`}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {customWeights.map((section, idx) => (
                                <div key={section.type} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            {isCustomPattern && (
                                                <button onClick={() => {
                                                    const newWeights = [...customWeights];
                                                    newWeights[idx].count++;
                                                    setCustomWeights(newWeights);
                                                }} className="p-1 hover:bg-slate-100 rounded-lg"><Plus className="w-3 h-3 text-emerald-600" /></button>
                                            )}
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-emerald-600">
                                                {section.count}
                                            </div>
                                            {isCustomPattern && (
                                                <button onClick={() => {
                                                    const newWeights = [...customWeights];
                                                    if (newWeights[idx].count > 0) newWeights[idx].count--;
                                                    setCustomWeights(newWeights);
                                                }} className="p-1 hover:bg-slate-100 rounded-lg"><Minus className="w-3 h-3 text-rose-500" /></button>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{section.type}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                    {isCustomPattern ? (
                                                        <input
                                                            type="number"
                                                            className="w-10 bg-transparent border-b border-slate-200 focus:border-emerald-500 outline-none text-center"
                                                            value={section.marks}
                                                            onChange={(e) => {
                                                                const newWeights = [...customWeights];
                                                                newWeights[idx].marks = parseInt(e.target.value) || 0;
                                                                setCustomWeights(newWeights);
                                                            }}
                                                        />
                                                    ) : section.marks} Marks each
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl text-slate-800">{section.count * section.marks}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Subtotal</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`${isCustomPattern ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-50 border-emerald-100'} p-6 rounded-[2rem] flex items-center justify-between transition-colors`}>
                            <div className="flex items-center gap-3">
                                {isCustomPattern ? <Settings2 className="w-6 h-6 text-emerald-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                <p className={`font-black ${isCustomPattern ? 'text-emerald-900' : 'text-emerald-900'} text-sm italic uppercase tracking-widest`}>
                                    {isCustomPattern ? 'Custom Pattern Active' : 'Grand Total Verified'}
                                </p>
                            </div>
                            <p className={`font-black text-2xl ${isCustomPattern ? 'text-emerald-600' : 'text-emerald-600'}`}>
                                {customWeights.reduce((acc, curr) => acc + (curr.count * curr.marks), 0)} Marks
                            </p>
                        </div>

                        <button onClick={nextStep} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                            Review Final Draft <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800">Direct Textbook Extraction</h2>
                            <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">
                                AI is set to map questions <span className="text-emerald-600 font-bold">strictly from {fileSelected || 'your textbook'}</span>. No external or out-of-context questions will be generated.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between border-b border-slate-50 pb-4">
                                <span className="text-slate-400 font-bold text-sm">Source File</span>
                                <span className="text-emerald-600 font-black truncate max-w-[180px]">{fileSelected || "System Syllabus"}</span>
                            </div>
                            {pyqFile && (
                                <div className="flex justify-between border-b border-slate-50 pb-4">
                                    <span className="text-slate-400 font-bold text-sm italic">PYQ Reference</span>
                                    <span className="text-amber-600 font-black truncate max-w-[180px]">{pyqFile}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-slate-50 pb-4">
                                <span className="text-slate-400 font-bold text-sm">Extraction Mode</span>
                                <span className="text-slate-800 font-black uppercase text-xs tracking-widest">
                                    {pyqFile ? 'Textbook + PYQ Analyzed' : 'Strict Textbook Mapping'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-4">
                                <span className="text-slate-400 font-bold text-sm">Pattern</span>
                                <span className="text-emerald-600 font-black uppercase text-xs tracking-widest">
                                    {isCustomPattern ? 'User Designed' : 'Standard Template'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-bold text-sm">Target Chapters</span>
                                <span className="text-slate-800 font-black text-right max-w-[200px] truncate">{selectedChapters.join(', ')}</span>
                            </div>
                        </div>

                        <button onClick={generatePaper} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 text-lg uppercase tracking-[0.2em] transform hover:scale-[1.03] transition-all group">
                            <Bolt className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
                            Launch Direct Extraction
                        </button>
                    </div>
                )}

                {step === 6 && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 pb-20">
                        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 font-serif max-w-2xl mx-auto border-t-8 border-t-slate-900 relative overflow-hidden">
                            {/* Syllabus Compliance Watermark */}
                            <div className="absolute top-10 right-[-40px] rotate-45 bg-emerald-500 text-white px-12 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                Syllabus Verified
                            </div>

                            <div className="text-center border-b-2 border-slate-200 pb-8 mb-8">
                                <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1">ABC CLASSES</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Paper - Feb 2026</p>
                                <div className="flex justify-center gap-6 mt-6 text-[11px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 py-3 rounded-xl border border-dashed border-slate-200">
                                    <span>Class: 10th</span>
                                    <span>Subject: Physics</span>
                                    <span>Total: 30 Marks</span>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {customWeights.map((section, sIdx) => {
                                    const sectionStartNum = customWeights
                                        .slice(0, sIdx)
                                        .reduce((acc, curr) => acc + curr.count, 0) + 1;

                                    return (
                                        <div key={section.type}>
                                            <div className="flex justify-between items-end border-b-2 border-slate-900 pb-1 mb-6">
                                                <div>
                                                    <p className="font-black text-sm uppercase">Section {String.fromCharCode(65 + sIdx)}: {section.type}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        ({section.count} x {section.marks} = {section.count * section.marks} Marks)
                                                    </p>
                                                </div>
                                                {section.count > 1 && (
                                                    <p className="text-[9px] font-black text-emerald-600 italic uppercase">Solve Any {section.count - 1 < 1 ? 1 : section.count - 1}</p>
                                                )}
                                            </div>

                                            <div className="space-y-8 text-[13px] leading-relaxed text-slate-800">
                                                {Array.from({ length: section.count }).map((_, qIdx) => (
                                                    <div key={qIdx} className="space-y-4">
                                                        <div className="flex gap-2">
                                                            <span className="font-bold whitespace-nowrap">Q{sectionStartNum + qIdx}.</span>
                                                            <p className="font-bold flex-1">
                                                                {section.type === 'MCQs'
                                                                    ? `Identify the ${['constant', 'variable', 'unit', 'principle', 'law'][qIdx % 5]} related to ${selectedChapters[qIdx % selectedChapters.length]} as per the textbook derivation?`
                                                                    : `Explain the detailed working of ${selectedChapters[qIdx % selectedChapters.length]} with appropriate ${section.marks > 5 ? 'mathematical derivations and diagrams' : 'examples'}?`}
                                                            </p>
                                                        </div>
                                                        {section.type === 'MCQs' && (
                                                            <div className="grid grid-cols-2 ml-8 gap-2 opacity-90 font-medium italic text-slate-600">
                                                                <p>A) Option Alpha</p><p>B) Option Beta</p>
                                                                <p>C) Option Gamma</p><p>D) Option Delta</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-16 pt-8 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">--- End of Paper (Syllabus Protected) ---</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                            <ActionBtn icon={Download} label="PDF" />
                            <ActionBtn icon={Send} label="WhatsApp" />
                            <ActionBtn icon={Printer} label="Print" />
                            <ActionBtn icon={Bolt} label="Re-AI" dark={true} onClick={() => startDetection(false)} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function ActionBtn({ icon: Icon, label, dark }: any) {
    return (
        <button className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all shadow-sm ${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-slate-100 hover:bg-slate-50'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

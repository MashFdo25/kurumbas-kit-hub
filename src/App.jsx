import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Lock, PlusCircle, Trash2, X, Share2, Heart, Shirt, 
  FileText, Ruler, Sparkles, Wand2, ShoppingBag, ArrowRight, 
  ChevronLeft, Layout, Type, Banknote, FileSpreadsheet, Download,
  CheckCircle2, AlertTriangle, Database, Loader2
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// --- ASSETS & CONFIG ---
const TEAM_LOGO = "Kurumba_Logo.png";
const FRONT_VIEW_IMG = "Front.jpg";
const BACK_VIEW_IMG = "Back.jpg";

const MATCH_KIT_IMG = FRONT_VIEW_IMG;
const TRAINING_KIT_IMG = FRONT_VIEW_IMG;
const PREVIEW_CARD_IMG = BACK_VIEW_IMG;

const POLO_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.21 PM.png";
const TSHIRT_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.58 PM.png";
const PANTS_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.50 PM.png";
const SHORTS_MEASURE_IMG = "Screenshot 2026-02-24 at 12.10.08 PM.png";

// --- ENVIRONMENT & FIREBASE INIT ---
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) return import.meta.env[key];
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
  return "";
};

// --- PRODUCTION CONFIGURATION (NETLIFY) ---
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
};

// Singleton pattern for Netlify/Vite stability
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const projectAppId = "kurumbas-kit-hub";

// --- DATA ---
const SIZE_CHARTS = {
  adultJersey: [
    { size: 'XS', width: '16.5"', height: '24.5"' },
    { size: 'S', width: '17.5"', height: '25.5"' },
    { size: 'M', width: '18.5"', height: '26.5"' },
    { size: 'L', width: '20"', height: '28.5"' },
    { size: 'XL', width: '21"', height: '29.5"' },
    { size: '2XL', width: '22.5"', height: '30.5"' },
    { size: '3XL', width: '26"', height: '32"' },
  ],
  kidsJersey: [
    { size: '9XS', width: '9"', height: '12.5"' },
    { size: '8XS', width: '10"', height: '13.5"' },
    { size: '7XS', width: '11"', height: '15.5"' },
    { size: '6XS', width: '12.5"', height: '17.5"' },
    { size: '5XS', width: '13.5"', height: '19"' },
    { size: '4XS', width: '14.5"', height: '20.5"' },
    { size: '3XS', width: '15"', height: '22"' },
    { size: '2X', width: '15.5"', height: '23.5"' },
  ],
  bottoms: [
    { size: 'XS', waist: '26/28', length: '39.5"', short: '18"' },
    { size: 'S', waist: '26/28', length: '39.5"', short: '18"' },
    { size: 'M', waist: '30/32', length: '40"', short: '19"' },
    { size: 'L', waist: '30/32', length: '40"', short: '19"' },
    { size: 'XL', waist: '34/36', length: '40.5"', short: '20"' },
    { size: '2XL', waist: '34/36', length: '40.5"', short: '20"' },
    { size: '3XL', waist: '38/40', length: '41.25"', short: '21"' },
  ]
};

// --- COMPONENTS ---
const SizeSelector = ({ label, value, options, onChange, customValue, onCustomChange }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button 
          key={opt} type="button" 
          onClick={() => { onChange(opt); if (onCustomChange) onCustomChange(""); }} 
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${value === opt && !customValue ? 'bg-orange-500 text-black border-orange-500' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'}`}
        >
          {opt}
        </button>
      ))}
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors"><Type size={14} /></div>
      <input placeholder="Or Enter Custom Size..." value={customValue || ""} onChange={(e) => onCustomChange(e.target.value)} className={`w-full bg-slate-950/50 border ${customValue ? 'border-orange-500 text-orange-500' : 'border-slate-800 text-slate-400'} p-3 pl-10 rounded-xl text-[10px] outline-none transition-all placeholder:text-slate-800 focus:border-orange-500`} />
    </div>
  </div>
);

const SizeChartModal = ({ activeChartTab, setActiveChartTab, setShowSizeChart }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
    <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[85vh] lg:h-auto overflow-y-auto shadow-2xl">
      <div className="flex-1 p-8 md:p-12 space-y-8">
        <div className="flex justify-between items-center"><h3 className="text-3xl font-black italic uppercase">Tech Sizing</h3><button onClick={() => setShowSizeChart(false)} className="bg-slate-800 p-3 rounded-full hover:bg-orange-500 transition-all"><X size={20}/></button></div>
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          {Object.keys(SIZE_CHARTS).map(t => (
            <button key={t} onClick={() => setActiveChartTab(t)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${activeChartTab === t ? 'bg-orange-500 text-black shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}>
              {t.replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
        <div className="bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/40 text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 text-[10px]">
                <th className="p-6">Size</th>
                {activeChartTab.includes('Jersey') ? (
                  <><th className="p-6">Width (In)</th><th className="p-6">Height (In)</th></>
                ) : (
                  <><th className="p-6">Waist</th><th className="p-6">Pants Len</th><th className="p-6">Shorts Len</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHARTS[activeChartTab].map((r, i) => (
                <tr key={i} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors text-sm font-bold">
                  <td className="p-6 font-black text-orange-500 italic">{r.size}</td>
                  {activeChartTab.includes('Jersey') ? (
                    <><td className="p-6">{r.width}</td><td className="p-6">{r.height}</td></>
                  ) : (
                    <><td className="p-6">{r.waist}</td><td className="p-6">{r.length}</td><td className="p-6">{r.short}</td></>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full md:w-80 bg-slate-950/50 p-8 flex flex-col items-center justify-start gap-6 border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto">
         <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest w-full text-center mb-2">How to Measure</p>
         {activeChartTab.includes('Jersey') ? (
           <div className="space-y-6 w-full">
             <div className="bg-white p-4 rounded-3xl w-full shadow-lg"><p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Match Polo</p><img src={POLO_MEASURE_IMG} alt="Polo Measurement" className="w-full object-contain" /></div>
             <div className="bg-white p-4 rounded-3xl w-full shadow-lg"><p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Training T-Shirt</p><img src={TSHIRT_MEASURE_IMG} alt="T-Shirt Measurement" className="w-full object-contain" /></div>
           </div>
         ) : (
           <div className="space-y-6 w-full">
             <div className="bg-white p-4 rounded-3xl w-full shadow-lg"><p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Long Pants</p><img src={PANTS_MEASURE_IMG} alt="Pants Measurement" className="w-full object-contain" /></div>
             <div className="bg-white p-4 rounded-3xl w-full shadow-lg"><p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Shorts</p><img src={SHORTS_MEASURE_IMG} alt="Shorts Measurement" className="w-full object-contain" /></div>
           </div>
         )}
      </div>
    </div>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('landing');
  const [adminPass, setAdminPass] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('adultJersey');
  const [extraJerseyPrice, setExtraJerseyPrice] = useState(2800);
  
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    playerName: '', jerseyName: '', number: '',
    jerseySize: 'M', customJerseySize: '',
    pantSize: 'M', customPantSize: '',
    shortSize: 'M', customShortSize: '',
    skinnySize: 'M', customSkinnySize: '',
    familyKits: [], extraPaidJerseys: []
  });

  const [lastOrder, setLastOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [adminAiBrief, setAdminAiBrief] = useState("");
  const [isAdminAiLoading, setIsAdminAiLoading] = useState(false);

  // Load Scripts
  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const totalPrintsRequired = useMemo(() => {
    return orders.reduce((sum, o) => {
      const familyPrints = o.familyKits?.filter(k => k.name || k.number).length || 0;
      const extraPrints = o.extraPaidJerseys?.filter(k => k.name || k.number).length || 0;
      return sum + familyPrints + extraPrints;
    }, 0);
  }, [orders]);

  // Auth & Database Sync
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { 
        setErrorMessage("Connection Error: Check Netlify variables.");
        setDbStatus('error'); 
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setDbStatus('connected');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ordersRef = collection(db, 'artifacts', projectAppId, 'public', 'data', 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const fetched = [];
      snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
      setOrders(fetched.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }, (error) => setDbStatus('error'));
    return () => unsubscribe();
  }, [user]);

  // AI Helpers
  const callGemini = async (prompt, systemInstruction = "") => {
    if (!apiKey) return null;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) { return null; }
  };

  const generateAIPersona = async () => {
    if (!formData.playerName) return;
    setIsAiLoading(true);
    const res = await callGemini(`3 nicknames for ${formData.playerName}. Format: NAME1, NAME2, NAME3`, "Sports creative.");
    if (res) setAiSuggestions(res.split(',').map(n => n.trim().toUpperCase()));
    setIsAiLoading(false);
  };

  const generateAdminBrief = async () => {
    setIsAdminAiLoading(true);
    const res = await callGemini(`Summary for ${orders.length} orders. Highlight custom sizes.`, "Logistics.");
    if (res) setAdminAiBrief(res);
    setIsAdminAiLoading(false);
  };

  // Exports
  const exportManufacturerReport = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.text("Kurumbas CC - Order Report", 14, 20);
    const tableColumn = ["Player", "Squad Print", "Bundle Sizes", "Family", "Extra Paid"];
    const tableRows = orders.map(o => [
      o.playerName, 
      `${o.jerseyName} #${o.number}`,
      `J:${o.customJerseySize || o.jerseySize} P:${o.customPantSize || o.pantSize}`,
      o.familyKits?.length || 0,
      o.extraPaidJerseys?.length || 0
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("KCC_Manufacturer_Report.pdf");
  };

  const exportToExcel = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const XLSX = window.XLSX;
    const rows = [["Player", "Polo", "Pants", "Shorts", "Skinny", "Family Qty", "Extra Qty"]];
    orders.forEach(o => rows.push([o.playerName, o.customJerseySize || o.jerseySize, o.customPantSize || o.pantSize, o.customShortSize || o.shortSize, o.customSkinnySize || o.skinnySize, o.familyKits?.length || 0, o.extraPaidJerseys?.length || 0]));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "KCC_Orders.xlsx");
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !user) return;
    setIsSubmitting(true);
    try {
      const orderId = Date.now().toString();
      const finalOrder = { ...formData, timestamp: Date.now() };
      await setDoc(doc(db, 'artifacts', projectAppId, 'public', 'data', 'orders', orderId), finalOrder);
      setLastOrder(finalOrder);
      setView('success');
      await loadScript("https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js");
      if(window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (err) { setErrorMessage("Failed: " + err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', projectAppId, 'public', 'data', 'orders', id));
  };

  const handleDownload = async (elId, fname) => {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    const canvas = await window.html2canvas(document.getElementById(elId), { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = fname;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Views Logic (Landing, Customize, Success, AdminAuth, Admin)
  if (view === 'landing') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-5 bg-center bg-cover scale-110" style={{backgroundImage: `url(${MATCH_KIT_IMG})`}}></div>
      <div className="z-10 flex flex-col items-center">
        <img src={TEAM_LOGO} className="w-40 h-40 md:w-56 md:h-56 mb-12 drop-shadow-[0_0_60px_rgba(249,115,22,0.4)]" />
        <h1 className="text-7xl md:text-[10rem] font-black text-white italic tracking-tighter uppercase mb-8 leading-none">Kurumbas <span className="text-orange-500">CC.</span></h1>
        <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mb-16 font-black uppercase tracking-[0.4em] italic">Squad Registration 2026</p>
        <button onClick={() => setView('customize')} className="group bg-white text-black px-12 md:px-20 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-orange-500 transition-all flex items-center gap-4 shadow-2xl">ENTER HUB <ArrowRight className="group-hover:translate-x-2 transition-transform"/></button>
        <button onClick={() => setView('admin-auth')} className="mt-16 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2 transition-all"><Lock size={12}/> Admin Access</button>
      </div>
    </div>
  );

  if (view === 'customize') return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 font-sans">
      {showSizeChart && <SizeChartModal activeChartTab={activeChartTab} setActiveChartTab={setActiveChartTab} setShowSizeChart={setShowSizeChart} />}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <button onClick={() => setView('landing')} className="text-slate-400 flex items-center gap-2 hover:text-white transition font-black uppercase text-xs"><ChevronLeft size={20}/> Back</button>
        <button onClick={() => setShowSizeChart(true)} className="bg-slate-900 border border-slate-800 px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase hover:border-orange-500 transition shadow-2xl group"><Ruler size={18} className="text-orange-500 group-hover:rotate-45 transition-transform" /> Tech Sizing Chart</button>
      </div>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        <div className="bg-slate-900 p-8 md:p-14 rounded-[3.5rem] border border-slate-800 shadow-2xl space-y-16">
          <form onSubmit={handleOrderSubmit} className="space-y-16">
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-5"><div className="bg-orange-500 p-3 rounded-2xl shadow-inner"><Users size={24} className="text-black"/></div><h3 className="text-3xl font-black uppercase tracking-tighter italic">1. Identity</h3></div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Legal Name</label><input required placeholder="Your Full Name" value={formData.playerName} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-bold" onChange={e => setFormData({...formData, playerName: e.target.value})} /></div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jersey Print</label><button type="button" onClick={generateAIPersona} className="text-orange-500 text-[10px] font-black uppercase flex items-center gap-1 hover:text-white"><Sparkles size={12}/> AI</button></div>
                  <input required maxLength={12} placeholder="JOHN" value={formData.jerseyName} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none uppercase font-black focus:border-orange-500" onChange={e => setFormData({...formData, jerseyName: e.target.value})} />
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Squad #</label><input required type="number" placeholder="00" value={formData.number} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-black text-2xl" onChange={e => setFormData({...formData, number: e.target.value})} /></div>
              </div>
            </div>
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-5"><div className="bg-orange-500 p-3 rounded-2xl shadow-inner"><Shirt size={24} className="text-black"/></div><h3 className="text-3xl font-black uppercase tracking-tighter italic">2. Squad Sizing</h3></div>
              <div className="grid md:grid-cols-2 gap-12 pt-4">
                <SizeSelector label="Jersey Size" value={formData.jerseySize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(prev => ({...prev, jerseySize: v}))} customValue={formData.customJerseySize} onCustomChange={val => setFormData(prev => ({...prev, customJerseySize: val}))} />
                <SizeSelector label="Long Pants" value={formData.pantSize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(prev => ({...prev, pantSize: v}))} customValue={formData.customPantSize} onCustomChange={val => setFormData(prev => ({...prev, customPantSize: val}))} />
              </div>
            </div>
            <button disabled={isSubmitting || !formData.playerName} type="submit" className="w-full bg-white text-black py-8 rounded-[3rem] font-black text-3xl hover:bg-orange-500 transition-all shadow-2xl disabled:opacity-30 uppercase italic tracking-tighter flex items-center justify-center gap-4">
              {isSubmitting ? <><Loader2 className="animate-spin" size={32}/> CONFIRMING...</> : "REGISTER FOR 2026"}
            </button>
          </form>
        </div>
        <div className="flex flex-col items-center sticky top-10 space-y-12">
          <div id="jersey-preview" className="relative w-[380px] h-[520px] md:w-[440px] md:h-[600px] bg-slate-900 rounded-t-[100px] shadow-2xl overflow-hidden border-b-[60px] border-black">
            <div className="absolute inset-0 bg-cover bg-top" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${PREVIEW_CARD_IMG})`}}></div>
            <div className="absolute top-[28%] w-full flex flex-col items-center px-12 text-center">
              <h2 className="text-white font-black text-4xl md:text-5xl tracking-tighter uppercase mb-4">{formData.jerseyName || "JOHN"}</h2>
              <span className="text-[#D4AF37] font-black text-[180px] md:text-[240px] leading-[0.7] italic">{formData.number || "00"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (view === 'success') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <div className="bg-green-500 p-10 rounded-full mb-12 shadow-[0_0_120px_rgba(34,197,94,0.4)] animate-bounce"><CheckCircle2 size={80}/></div>
      <h1 className="text-8xl md:text-9xl font-black italic uppercase mb-8 tracking-tighter leading-none">LOCKED <span className="text-orange-500">IN.</span></h1>
      <div id="share-card" className="w-[360px] h-[640px] bg-black rounded-[4rem] overflow-hidden relative shadow-2xl border border-white/5 mb-10">
        <div className="absolute inset-0 bg-cover bg-top opacity-80" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${PREVIEW_CARD_IMG})`}}></div>
        <div className="absolute inset-0 p-16 flex flex-col justify-end text-left">
          <img src={TEAM_LOGO} className="w-24 h-24 mb-10" />
          <h2 className="text-8xl font-black italic tracking-tighter uppercase leading-none mb-4">{lastOrder?.jerseyName}</h2>
          <span className="text-orange-500 font-black text-7xl italic">#{lastOrder?.number}</span>
        </div>
      </div>
      <div className="flex gap-6">
        <button onClick={() => handleDownload('share-card', `KCC_Signing.png`)} className="bg-white text-black px-16 py-6 rounded-[3rem] font-black text-lg uppercase flex items-center gap-4 hover:bg-orange-500">Share My Signing</button>
        <button onClick={() => setView('landing')} className="bg-slate-900 text-slate-500 px-12 py-6 rounded-[3rem] font-black text-lg uppercase hover:text-white">Home</button>
      </div>
    </div>
  );

  if (view === 'admin-auth') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-slate-900 p-16 md:p-24 rounded-[5rem] border border-slate-800 shadow-2xl max-w-xl w-full text-center space-y-14">
        <div className="bg-orange-500/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto border border-orange-500/20"><Lock className="text-orange-500" size={56} /></div>
        <input type="password" placeholder="••••" className="w-full bg-slate-950 border border-slate-800 p-8 rounded-[3rem] text-center text-7xl text-white outline-none focus:border-orange-500 font-mono tracking-[0.6em]" onChange={(e) => setAdminPass(e.target.value)} />
        <button onClick={() => adminPass === 'TEAM2026' ? setView('admin') : alert('Denied')} className="w-full bg-orange-500 text-black py-8 rounded-[3rem] font-black uppercase text-2xl shadow-2xl">Authenticate</button>
      </div>
    </div>
  );

  if (view === 'admin') return (
    <div className="min-h-screen bg-slate-950 p-8 md:p-14 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="flex justify-between items-end"><h1 className="text-6xl font-black text-orange-500 uppercase italic tracking-tighter">Control</h1><div className="flex gap-6"><button onClick={() => setView('landing')} className="bg-slate-800 p-5 rounded-[2rem] hover:text-white"><X size={32}/></button></div></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
           <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl"><p className="text-[11px] opacity-40 uppercase font-black mb-5">Squad</p><p className="text-6xl font-black text-white italic">{orders.length}</p></div>
           <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl"><p className="text-[11px] opacity-40 uppercase font-black mb-5">Custom Prints</p><p className="text-6xl font-black text-white italic">{totalPrintsRequired}</p></div>
        </div>
        <div className="bg-slate-900 rounded-[5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-12 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row gap-6 justify-between items-center">
            <h4 className="text-2xl font-black uppercase flex items-center gap-6">Sponsoring Manifest</h4>
            <div className="flex gap-4">
              <button onClick={exportManufacturerReport} className="bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3 hover:bg-orange-500">PDF</button>
              <button onClick={exportToExcel} className="bg-green-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3">Excel</button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead><tr className="bg-slate-800/40 text-slate-500 text-[12px] font-black uppercase border-b border-slate-800"><th className="p-12">Member</th><th className="p-12">Sizing</th><th className="p-12 text-right">Delete</th></tr></thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map(o => (
                <tr key={o.id} className="text-white group hover:bg-slate-800/20">
                  <td className="p-12"><p className="font-black text-3xl italic uppercase leading-none">{o.playerName}</p><p className="text-sm text-orange-500 font-black mt-3">{o.jerseyName} #{o.number}</p></td>
                  <td className="p-12"><span className="bg-slate-950 px-4 py-2 rounded-2xl text-xs font-black border border-slate-800">J:{o.customJerseySize || o.jerseySize} P:{o.customPantSize || o.pantSize}</span></td>
                  <td className="p-12 text-right"><button onClick={() => handleDeleteOrder(o.id)} className="bg-slate-800 p-5 rounded-[2rem] text-red-500 hover:bg-red-500 hover:text-white shadow-2xl"><Trash2 size={28}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return null;
};

export default App;
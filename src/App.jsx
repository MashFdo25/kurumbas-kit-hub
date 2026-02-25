import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Lock, PlusCircle, Trash2, X, Share2, Heart, Shirt, Edit3, Search,
  FileText, Ruler, Sparkles, Wand2, ShoppingBag, ArrowRight, 
  ChevronLeft, Layout, Type, Banknote, FileSpreadsheet, Download,
  CheckCircle2, AlertTriangle, Database, Loader2, Settings2, Package
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// --- ASSETS & CONFIG ---
const TEAM_LOGO = "Kurumba_Logo.png";
const FRONT_VIEW_IMG = "Front.jpg";  
const BACK_VIEW_IMG = "Back.jpg";    
const PREVIEW_CARD_IMG = BACK_VIEW_IMG;

const POLO_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.21 PM.png";
const TSHIRT_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.58 PM.png";
const PANTS_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.50 PM.png";
const SHORTS_MEASURE_IMG = "Screenshot 2026-02-24 at 12.10.08 PM.png";

const getEnv = (key) => {
  try { return import.meta.env[key] || process.env[key] || ""; } 
  catch (e) { return ""; }
};

const apiKey = getEnv('VITE_GEMINI_API_KEY');
const GEMINI_MODEL = "gemini-2.0-flash";

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const projectAppId = "kurumbas-kit-hub";

const SIZE_CHARTS = {
  adultJersey: [
    { size: 'XS', width: '16.5"', height: '24.5"' }, { size: 'S', width: '17.5"', height: '25.5"' },
    { size: 'M', width: '18.5"', height: '26.5"' }, { size: 'L', width: '20"', height: '28.5"' },
    { size: 'XL', width: '21"', height: '29.5"' }, { size: '2XL', width: '22.5"', height: '30.5"' },
    { size: '3XL', width: '26"', height: '32"' },
  ],
  kidsJersey: [
    { size: '9XS', width: '9"', height: '12.5"' }, { size: '8XS', width: '10"', height: '13.5"' },
    { size: '7XS', width: '11"', height: '15.5"' }, { size: '6XS', width: '12.5"', height: '17.5"' },
    { size: '5XS', width: '13.5"', height: '19"' }, { size: '4XS', width: '14.5"', height: '20.5"' },
    { size: '3XS', width: '15"', height: '22"' }, { size: '2X', width: '15.5"', height: '23.5"' },
  ],
  bottoms: [
    { size: 'XS', waist: '26/28', length: '39.5"', short: '18"' }, { size: 'S', waist: '26/28', length: '39.5"', short: '18"' },
    { size: 'M', waist: '30/32', length: '40"', short: '19"' }, { size: 'L', waist: '30/32', length: '40"', short: '19"' },
    { size: 'XL', waist: '34/36', length: '40.5"', short: '20"' }, { size: '2XL', waist: '34/36', length: '40.5"', short: '20"' },
    { size: '3XL', waist: '38/40', length: '41.25"', short: '21"' },
  ]
};

const SizeSelector = ({ label, value, options, onChange, customValue, onCustomChange }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => { onChange(opt); if (onCustomChange) onCustomChange(""); }} 
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${value === opt && !customValue ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'}`}>
          {opt}
        </button>
      ))}
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors"><Type size={14} /></div>
      <input placeholder="Or Enter Custom Size..." value={customValue || ""} onChange={(e) => onCustomChange(e.target.value)} 
        className={`w-full bg-slate-950/50 border ${customValue ? 'border-orange-500 text-orange-500' : 'border-slate-800 text-slate-400'} p-3 pl-10 rounded-xl text-[10px] outline-none transition-all placeholder:text-slate-800 focus:border-orange-500`} />
    </div>
  </div>
);

const SizeChartModal = ({ activeChartTab, setActiveChartTab, setShowSizeChart }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
    <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto overflow-y-auto shadow-2xl">
      <div className="flex-1 p-6 md:p-12 space-y-8">
        <div className="flex justify-between items-center"><h3 className="text-3xl font-black italic uppercase">Tech Sizing</h3><button onClick={() => setShowSizeChart(false)} className="bg-slate-800 p-3 rounded-full hover:bg-orange-500 transition-all"><X size={20}/></button></div>
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          {Object.keys(SIZE_CHARTS).map(t => (
            <button key={t} onClick={() => setActiveChartTab(t)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${activeChartTab === t ? 'bg-orange-500 text-black shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}>{t.replace(/([A-Z])/g, ' $1')}</button>
          ))}
        </div>
        <div className="bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/40 text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 text-[10px]">
                <th className="p-6">Size</th>
                {activeChartTab.includes('Jersey') ? (<><th className="p-6">Width (In)</th><th className="p-6">Height (In)</th></>) : (<><th className="p-6">Waist</th><th className="p-6">Pants Len</th><th className="p-6">Shorts Len</th></>)}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHARTS[activeChartTab].map((r, i) => (
                <tr key={i} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors text-sm font-bold">
                  <td className="p-6 font-black text-orange-500 italic">{r.size}</td>
                  {activeChartTab.includes('Jersey') ? (<><td className="p-6">{r.width}</td><td className="p-6">{r.height}</td></>) : (<><td className="p-6">{r.waist}</td><td className="p-6">{r.length}</td><td className="p-6">{r.short}</td></>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full md:w-80 bg-slate-950/50 p-6 md:p-8 flex flex-col items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800">
         <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest w-full text-center">How to Measure</p>
         <div className="grid grid-cols-1 gap-4 w-full">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={activeChartTab.includes('Jersey') ? POLO_MEASURE_IMG : PANTS_MEASURE_IMG} className="w-full h-auto object-contain" />
            </div>
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={activeChartTab.includes('Jersey') ? TSHIRT_MEASURE_IMG : SHORTS_MEASURE_IMG} className="w-full h-auto object-contain" />
            </div>
         </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState('landing');
  const [adminPass, setAdminPass] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('adultJersey');
  const [extraJerseyPrice, setExtraJerseyPrice] = useState(25.00); 
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  
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
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.jerseyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { setDbStatus('error'); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); if (u) setDbStatus('connected'); });
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

  const callGemini = async (prompt, systemInstruction = "") => {
    if (!apiKey) return null;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) { return null; }
  };

  const generateAIPersona = async () => {
    if (!formData.playerName) return;
    setIsAiLoading(true);
    const res = await callGemini(`3 nicknames for ${formData.playerName}. Format: N1, N2, N3`, "Sports branding.");
    if (res) setAiSuggestions(res.split(',').map(n => n.trim().toUpperCase()));
    setIsAiLoading(false);
  };

  const exportManufacturerReport = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.text("Kurumbas CC - Manufacturer Order Report", 14, 20);
    
    const tableColumn = ["Player Name", "Squad Print", "Squad Bundle", "Family Jersey", "Extra Gear"];
    const tableRows = orders.map(o => [
      (o.playerName || "").toUpperCase(),
      `Name: ${(o.jerseyName || "").toUpperCase()}\nNo: ${o.number}`,
      `Polo/Vest: ${o.customJerseySize || o.jerseySize}\nPants: ${o.customPantSize || o.pantSize}\nShorts: ${o.customShortSize || o.shortSize}\nSkinny: ${o.customSkinnySize || o.skinnySize}`,
      o.familyKits?.map(k => `1x ${k.name?.toUpperCase() || ''} #${k.number || ''} | Size: ${k.customSize || k.size}`).join('\n') || "-",
      o.extraPaidJerseys?.map(k => `1x ${k.type || 'Jersey'} | ${k.name?.toUpperCase() || ''} #${k.number || ''} | Size: ${k.customSize || k.size}`).join('\n') || "-"
    ]);
    
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 34, theme: 'grid', styles: { fontSize: 8 } });
    doc.save("Kurumbas_CC_Manufacturer_Report.pdf");
  };

  const exportToExcel = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const XLSX = window.XLSX;
    const rows = [["Associated Member", "Category", "Garment Type", "Print Name", "Print Number", "Size", "Custom Size Note"]];

    orders.forEach(o => {
      const pName = (o.playerName || "").toUpperCase();
      const pPrint = (o.jerseyName || "").toUpperCase();

      rows.push([pName, "Squad Bundle", "Match Polo", pPrint, o.number, o.jerseySize, o.customJerseySize || ""]);
      rows.push([pName, "Squad Bundle", "Training Vest", pPrint, o.number, o.jerseySize, o.customJerseySize || ""]);
      rows.push([pName, "Squad Bundle", "Long Pants", "", "", o.pantSize, o.customPantSize || ""]);
      rows.push([pName, "Squad Bundle", "Training Shorts", "", "", o.shortSize, o.customShortSize || ""]);
      rows.push([pName, "Squad Bundle", "Training Skinny", "", "", o.skinnySize, o.customSkinnySize || ""]);

      o.familyKits?.forEach(fk => rows.push([pName, "Family Jersey", "Match Polo", (fk.name || "").toUpperCase(), fk.number || "", fk.size, fk.customSize || ""]));
      o.extraPaidJerseys?.forEach(ek => rows.push([pName, "Extra Gear", ek.type || "Jersey", (ek.name || "").toUpperCase(), ek.number || "", ek.size, ek.customSize || ""]));
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Order Sheet");
    XLSX.writeFile(wb, "Kurumbas_CC_Order_Sheet.xlsx");
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !user) return;
    setIsSubmitting(true);
    try {
      const orderId = editingOrder ? editingOrder.id : Date.now().toString();
      const finalOrder = { ...formData, id: orderId, timestamp: Date.now() };
      await setDoc(doc(db, 'artifacts', projectAppId, 'public', 'data', 'orders', orderId), finalOrder);
      setLastOrder(finalOrder); setEditingOrder(null); setView('success');
      await loadScript("https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js");
      if(window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (err) { setErrorMessage(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleEditOrder = (order) => { setEditingOrder(order); setFormData(order); setView('customize'); };
  const handleDeleteOrder = async (id) => { if (window.confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', projectAppId, 'public', 'data', 'orders', id)); };
  const handleDownload = async (elId, fname) => {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    const canvas = await window.html2canvas(document.getElementById(elId), { scale: 2, useCORS: true });
    const link = document.createElement('a'); link.download = fname; link.href = canvas.toDataURL('image/png'); link.click();
  };

  if (view === 'landing') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-5 bg-center bg-cover scale-110" style={{backgroundImage: `url(${FRONT_VIEW_IMG})`}}></div>
      <div className="z-10 flex flex-col items-center max-w-4xl">
        <img src={TEAM_LOGO} className="w-40 h-40 md:w-56 md:h-56 mb-12 drop-shadow-[0_0_60px_rgba(249,115,22,0.4)]" />
        <h1 className="text-7xl md:text-[10rem] font-black text-white italic tracking-tighter uppercase mb-8 leading-none">Kurumbas <span className="text-orange-500">CC.</span></h1>
        <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mb-16 font-black uppercase tracking-[0.4em] italic">Squad Registration 2026</p>
        <button onClick={() => setView('customize')} className="group bg-white text-black px-12 md:px-20 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-orange-500 transition-all flex items-center gap-4 shadow-2xl">ENTER HUB <ArrowRight className="group-hover:translate-x-2 transition-transform"/></button>
        <button onClick={() => setView('admin-auth')} className="mt-16 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2 transition-all"><Lock size={12}/> Admin Access</button>
      </div>
    </div>
  );

  if (view === 'customize') return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 overflow-y-auto font-sans">
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
              <div className="grid md:grid-cols-3 gap-8 items-end">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label><input required placeholder="Your Full Name" value={formData.playerName} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-bold transition-all" onChange={e => setFormData({...formData, playerName: e.target.value})} /></div>
                <div className="space-y-2"><div className="flex justify-between items-center h-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jersey Print</label><button type="button" onClick={generateAIPersona} className="text-orange-500 text-[10px] font-black uppercase flex items-center gap-1 hover:text-white"><Sparkles size={12}/> AI</button></div><input required placeholder="NAME" value={formData.jerseyName} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none uppercase font-black focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, jerseyName: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Squad #</label><input required type="number" placeholder="00" value={formData.number} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-black text-2xl transition-all" onChange={e => setFormData({...formData, number: e.target.value})} /></div>
              </div>
            </div>
            
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-5"><div className="bg-orange-500 p-3 rounded-2xl shadow-inner"><Shirt size={24} className="text-black"/></div><h3 className="text-3xl font-black uppercase tracking-tighter italic">2. Squad Sizing</h3></div>
              <div className="grid md:grid-cols-2 gap-12 pt-4">
                <SizeSelector label="Jersey Size" value={formData.jerseySize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(p => ({...p, jerseySize: v}))} customValue={formData.customJerseySize} onCustomChange={val => setFormData(p => ({...p, customJerseySize: val}))} />
                <SizeSelector label="Long Pants" value={formData.pantSize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(p => ({...p, pantSize: v}))} customValue={formData.customPantSize} onCustomChange={val => setFormData(p => ({...p, customPantSize: val}))} />
                <SizeSelector label="Shorts Size" value={formData.shortSize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(p => ({...p, shortSize: v}))} customValue={formData.customShortSize} onCustomChange={val => setFormData(p => ({...p, customShortSize: val}))} />
                <SizeSelector label="Training Skinny" value={formData.skinnySize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(p => ({...p, skinnySize: v}))} customValue={formData.customSkinnySize} onCustomChange={val => setFormData(p => ({...p, customSkinnySize: val}))} />
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5"><div className="flex items-center gap-4"><div className="bg-pink-600 p-3 rounded-2xl"><Heart size={24} className="text-white"/></div><h3 className="text-3xl font-black uppercase italic text-pink-500">3. Family Jersey</h3></div><button type="button" onClick={() => setFormData({...formData, familyKits: [...formData.familyKits, { id: Date.now(), name: '', number: '', size: 'W-M' }]})} className="bg-pink-600/10 border border-pink-600/20 text-pink-500 px-6 py-3 rounded-2xl text-xs font-black hover:bg-pink-600 hover:text-white transition-all shadow-xl"><PlusCircle size={18}/></button></div>
              <div className="space-y-6">
                {formData.familyKits.map(k => (
                  <div key={k.id} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col gap-6 relative">
                    <button type="button" onClick={() => setFormData({...formData, familyKits: formData.familyKits.filter(x => x.id !== k.id)})} className="absolute -top-3 -right-3 bg-slate-800 p-2.5 rounded-full text-slate-600 hover:text-red-500 border border-slate-700 shadow-2xl transition-colors"><Trash2 size={18}/></button>
                    <div className="grid grid-cols-3 gap-6">
                      <input placeholder="NAME" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs uppercase font-black outline-none focus:border-pink-600" value={k.name} onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, name: e.target.value} : x)})} />
                      <input placeholder="NO" type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-black outline-none focus:border-pink-600" value={k.number} onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, number: e.target.value} : x)})} />
                      <select className="w-full bg-slate-900 border border-pink-500/20 p-4 rounded-xl text-xs font-black outline-none" value={k.size} onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, size: e.target.value} : x)})}>
                        <optgroup label="Adults">{['W-XS','W-S','W-M','W-L'].map(sz => <option key={sz} value={sz}>{sz}</option>)}</optgroup>
                        <optgroup label="Kids">{['9XS','8XS','7XS','6XS','5XS','4XS','3XS','2X'].map(sz => <option key={sz} value={sz}>{sz}</option>)}</optgroup>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5"><div className="flex items-center gap-4"><div className="bg-yellow-500 p-3 rounded-2xl"><ShoppingBag size={24} className="text-black"/></div><h3 className="text-3xl font-black uppercase italic text-yellow-500">4. Extra Gear</h3></div><button type="button" onClick={() => setFormData({...formData, extraPaidJerseys: [...formData.extraPaidJerseys, { id: Date.now(), type: 'Jersey', name: '', number: '', size: 'M' }]})} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-6 py-3 rounded-2xl text-xs font-black hover:bg-yellow-500 hover:text-black transition-all shadow-xl"><PlusCircle size={18}/></button></div>
              <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-3xl flex items-center gap-4">
                <Banknote size={24} className="text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-500 font-black uppercase tracking-widest leading-relaxed">Unit Cost: ${extraJerseyPrice}</p>
              </div>
              <div className="space-y-6">
                {formData.extraPaidJerseys.map(k => (
                  <div key={k.id} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col gap-6 relative">
                    <button type="button" onClick={() => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.filter(x => x.id !== k.id)})} className="absolute -top-3 -right-3 bg-slate-800 p-2.5 rounded-full text-slate-600 hover:text-red-500 border border-slate-700 shadow-2xl transition-colors"><Trash2 size={18}/></button>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="col-span-1"><label className="text-[8px] font-black text-slate-700 uppercase mb-1 block">Item</label><select className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-black outline-none" value={k.type} onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, type: e.target.value} : x)})}>{['Jersey','Skinny','Pants','Shorts'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                      <div className="col-span-1"><label className="text-[8px] font-black text-slate-700 uppercase mb-1 block">Name</label><input placeholder="PRINT" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs uppercase font-black outline-none" value={k.name} onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, name: e.target.value} : x)})} /></div>
                      <div className="col-span-1"><label className="text-[8px] font-black text-slate-700 uppercase mb-1 block">No</label><input placeholder="NO" type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-black outline-none" value={k.number} onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, number: e.target.value} : x)})} /></div>
                      <div className="col-span-1"><label className="text-[8px] font-black text-slate-700 uppercase mb-1 block">Size</label><select className="w-full bg-slate-900 border border-orange-500/20 p-4 rounded-xl text-xs font-black outline-none" value={k.size} onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, size: e.target.value} : x)})}>{['XS','S','M','L','XL','2XL','3XL'].map(sz => <option key={sz} value={sz}>{sz}</option>)}</select></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button disabled={isSubmitting || !formData.playerName} type="submit" className="w-full bg-white text-black py-8 rounded-[3rem] font-black text-3xl hover:bg-orange-500 transition-all shadow-2xl disabled:opacity-30 uppercase italic flex items-center justify-center gap-4">
              {isSubmitting ? <Loader2 className="animate-spin" size={32}/> : (editingOrder ? "UPDATE ENTRY" : "REGISTER FOR 2026")}
            </button>
          </form>
        </div>
        <div className="flex flex-col items-center sticky top-10 space-y-12">
          <div id="jersey-preview" className="relative w-[380px] h-[520px] md:w-[440px] md:h-[600px] bg-slate-900 rounded-t-[100px] shadow-2xl overflow-hidden border-b-[60px] border-black">
            <div className="absolute inset-0 bg-cover bg-top opacity-30" style={{backgroundImage: `url(${PREVIEW_CARD_IMG})`}}></div>
            <div className="absolute top-[28%] w-full flex flex-col items-center px-12 text-center">
              <h2 className="text-white font-black text-4xl md:text-5xl uppercase mb-4 drop-shadow-2xl">{formData.jerseyName || "NAME"}</h2>
              <span className="text-[#D4AF37] font-black text-[180px] md:text-[240px] leading-[0.7] italic drop-shadow-2xl">{formData.number || "00"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (view === 'success') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-sans overflow-hidden">
      <h1 className="text-4xl md:text-7xl font-black italic uppercase mb-8 leading-none">LOCKED <span className="text-orange-500">IN.</span></h1>
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto transform scale-90 md:scale-100">
        <div id="share-card" className="aspect-[9/16] bg-black rounded-[2rem] md:rounded-[4rem] overflow-hidden relative shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-cover bg-top opacity-80" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${PREVIEW_CARD_IMG})`}}></div>
          <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
            <img src={TEAM_LOGO} className="w-20 h-20 mb-10 opacity-90" />
            <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">{lastOrder?.jerseyName || "NAME"}</h2>
            <span className="text-orange-500 font-black text-7xl md:text-9xl italic leading-none mt-2">#{lastOrder?.number || "00"}</span>
            <div className="mt-12 bg-orange-500 text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Official Signing 2026</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-8 justify-center"><button onClick={() => handleDownload('share-card', `KCC_Signing.png`)} className="bg-white text-black px-12 py-4 rounded-[2rem] font-black text-lg uppercase flex items-center gap-3 hover:bg-orange-500 transition-all shadow-2xl active:scale-95">Share Card</button><button onClick={() => setView('landing')} className="bg-slate-900 text-slate-500 px-8 py-4 rounded-[2rem] font-black text-lg uppercase hover:text-white transition-all shadow-xl">Home</button></div>
    </div>
  );

  if (view === 'admin-auth') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-slate-900 p-16 md:p-24 rounded-[5rem] border border-slate-800 shadow-2xl max-w-xl w-full text-center space-y-14">
        <div className="bg-orange-500/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto border border-orange-500/20 shadow-inner"><Lock className="text-orange-500" size={56} /></div>
        <input type="password" placeholder="••••" className="w-full bg-slate-950 border border-slate-800 p-8 rounded-[3rem] text-center text-7xl text-white outline-none focus:border-orange-500 font-mono" onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adminPass === 'TEAM2026' && setView('admin')} />
        <button onClick={() => adminPass === 'TEAM2026' ? setView('admin') : alert('Denied')} className="w-full bg-orange-500 text-black py-8 rounded-[3rem] font-black uppercase text-2xl shadow-2xl transition-all">Authenticate</button>
      </div>
    </div>
  );

  if (view === 'admin') return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end"><h1 className="text-6xl font-black text-orange-500 uppercase italic">Control</h1><button onClick={() => setView('landing')} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:text-white shadow-xl"><X size={24}/></button></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col justify-between group hover:border-orange-500/50 transition-all"><div className="flex justify-between items-start mb-4"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Extra Gear Price</p><Settings2 size={16} className="text-slate-700" /></div><div className="relative"><span className="absolute left-0 top-1/2 -translate-y-1/2 text-orange-500 text-3xl font-black italic">$</span><input type="number" value={extraJerseyPrice} onChange={(e) => setExtraJerseyPrice(e.target.value)} className="bg-transparent pl-8 border-none text-5xl font-black text-white w-full outline-none italic tracking-tighter" /></div></div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl"><p className="text-[10px] text-slate-500 uppercase font-black mb-4">Total Squad</p><p className="text-6xl font-black italic">{orders.length}</p></div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl"><p className="text-[10px] text-slate-500 uppercase font-black mb-4">Total Prints</p><p className="text-6xl font-black italic">{totalPrintsRequired}</p></div>
        </div>
        <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row gap-6 justify-between items-center"><h4 className="text-xl font-black uppercase flex items-center gap-4"><FileText size={24} className="text-orange-500" /> Sponsoring Manifest</h4><div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-full md:w-64"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Search players..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs outline-none focus:border-orange-500 transition-all" /></div>
            <button onClick={exportManufacturerReport} className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-500 transition-colors">PDF Report</button>
            <button onClick={exportToExcel} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-500 transition-colors shadow-lg">Excel Export</button>
          </div></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase border-b border-slate-800 tracking-widest"><th className="p-10">Member / Entry</th><th className="p-10">Sizing Data</th><th className="p-10">Add-Ons</th><th className="p-10 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="text-white group hover:bg-slate-800/10 transition-all">
                    <td className="p-10"><p className="font-black text-2xl italic uppercase tracking-tighter leading-none mb-2">{o.playerName}</p><span className="text-orange-500 font-black text-xs uppercase tracking-widest">{o.jerseyName} #{o.number}</span></td>
                    <td className="p-10"><div className="flex flex-wrap gap-2">{['jersey','pant','short','skinny'].map(t => <span key={t} className="bg-slate-950 px-3 py-1.5 rounded-lg text-[9px] font-black border border-slate-800 text-slate-400 uppercase">{t[0]}: {o[`custom${t.charAt(0).toUpperCase()+t.slice(1)}Size`] || o[`${t}Size`]}</span>)}</div></td>
                    <td className="p-10"><div className="flex gap-2">
                        {o.familyKits?.length > 0 && <span className="bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-lg text-[9px] font-black border border-pink-500/20 uppercase">FAM: {o.familyKits.length}</span>}
                        {o.extraPaidJerseys?.length > 0 && <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-[9px] font-black border border-yellow-500/20 uppercase">PAID: {o.extraPaidJerseys.length}</span>}
                    </div></td>
                    <td className="p-10 text-right space-x-2"><button onClick={() => handleEditOrder(o)} className="bg-slate-800 p-4 rounded-xl text-slate-500 hover:text-orange-500 transition-all"><Edit3 size={20}/></button><button onClick={() => handleDeleteOrder(o.id)} className="bg-slate-800 p-4 rounded-xl text-slate-500 hover:text-red-500 transition-all shadow-2xl active:scale-90"><Trash2 size={20}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
  return null;
};

export default App;

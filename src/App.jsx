import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Trophy, 
  Users, 
  Settings, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Trash2, 
  X, 
  Share2, 
  Lock, 
  Camera, 
  Plus, 
  Heart, 
  Shirt, 
  BarChart3, 
  FileText, 
  Ruler, 
  Info, 
  Sparkles, 
  Wand2, 
  Send,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  Layout,
  Type,
  PlusCircle,
  Banknote,
  FileSpreadsheet
} from 'lucide-react';

// --- ASSETS & CONFIG ---
const TEAM_LOGO = "Kurumba_Logo.png";
const MATCH_KIT_IMG = "1000097529.jpg";
const TRAINING_KIT_IMG = "1000097528.jpg";

const POLO_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.21 PM.png";
const TSHIRT_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.58 PM.png";
const PANTS_MEASURE_IMG = "Screenshot 2026-02-24 at 12.09.50 PM.png";
const SHORTS_MEASURE_IMG = "Screenshot 2026-02-24 at 12.10.08 PM.png";

const BUDGET_LIMIT = 1000000;
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- SCRIPT LOADER ---
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

// --- EXACT MANUFACTURER DATA ---
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

const App = () => {
  const [view, setView] = useState('landing');
  const [adminPass, setAdminPass] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('adultJersey');
  const [extraJerseyPrice, setExtraJerseyPrice] = useState(2800);
  
  const [orders, setOrders] = useState([
    {
      id: 1708800000001,
      playerName: 'Jude Fernando',
      jerseyName: 'MADHUSHA',
      number: '23',
      jerseySize: 'L', customJerseySize: '',
      pantSize: 'L', customPantSize: '',
      shortSize: 'M', customShortSize: '',
      skinnySize: 'M', customSkinnySize: '',
      familyKits: [
        { id: 101, name: 'Kian', number: '10', size: '7XS', customSize: '' },
        { id: 102, name: 'Kriska', number: '08', size: '6XS', customSize: '' },
        { id: 103, name: 'Priyashi', number: '', size: 'W-M', customSize: '' }
      ],
      extraPaidJerseys: [],
      currentPriceAtOrder: 2800
    },
    {
      id: 1708800000002,
      playerName: 'Thaal',
      jerseyName: 'THAAL',
      number: '07',
      jerseySize: 'M', customJerseySize: '',
      pantSize: 'M', customPantSize: '32',
      shortSize: 'M', customShortSize: '',
      skinnySize: 'M', customSkinnySize: '',
      familyKits: [],
      extraPaidJerseys: [
        { id: 201, name: 'SARA', number: '07', size: 'S', customSize: '' }
      ],
      currentPriceAtOrder: 2800
    }
  ]);
  
  const [formData, setFormData] = useState({
    playerName: '',
    jerseyName: '',
    number: '',
    jerseySize: 'M',
    customJerseySize: '',
    pantSize: 'M',
    customPantSize: '',
    shortSize: 'M',
    customShortSize: '',
    skinnySize: 'M',
    customSkinnySize: '',
    familyKits: [], 
    extraPaidJerseys: []
  });

  const [lastOrder, setLastOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [adminAiBrief, setAdminAiBrief] = useState("");
  const [isAdminAiLoading, setIsAdminAiLoading] = useState(false);

  // --- DERIVED METRICS ---
  const totalPrintsRequired = useMemo(() => {
    return orders.reduce((sum, o) => {
      const familyPrints = o.familyKits.filter(k => k.name || k.number).length;
      const extraPrints = o.extraPaidJerseys.filter(k => k.name || k.number).length;
      return sum + familyPrints + extraPrints;
    }, 0);
  }, [orders]);

  // --- API LOGIC (Gemini) ---
  const callGemini = async (prompt, systemInstruction = "", retryCount = 0) => {
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
      if (!response.ok && retryCount < 5) {
        await new Promise(res => setTimeout(res, Math.pow(2, retryCount) * 1000));
        return callGemini(prompt, systemInstruction, retryCount + 1);
      }
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) { return null; }
  };

  const generateAIPersona = async () => {
    if (!formData.playerName) return;
    setIsAiLoading(true);
    const prompt = `Suggest 3 high-energy jersey nicknames for "${formData.playerName}". Return format: NAME1, NAME2, NAME3`;
    const res = await callGemini(prompt, "Creative sports branding assistant.");
    if (res) setAiSuggestions(res.split(',').map(n => n.trim().toUpperCase()));
    setIsAiLoading(false);
  };

  const generateAdminBrief = async () => {
    setIsAdminAiLoading(true);
    const summary = JSON.stringify(orders);
    const prompt = `Analyze these ${orders.length} orders for Kurumbas CC. Create a production summary. Highlight custom sizes, additional paid jerseys, and specifically mention that ${totalPrintsRequired} extra/family jerseys require custom name/number printing.`;
    const res = await callGemini(prompt, "Logistics Manager.");
    if (res) setAdminAiBrief(res);
    setIsAdminAiLoading(false);
  };

  const exportManufacturerReport = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.text("Kurumbas CC - Manufacturer Order Report", 14, 20);
    
    // Add summary stats to the top of the PDF
    doc.setFontSize(10);
    doc.text(`Total Squad Bundles: ${orders.length}  |  Family Jerseys: ${orders.reduce((s,o)=>s+o.familyKits.length,0)}  |  Extra Paid Gear: ${orders.reduce((s,o)=>s+o.extraPaidJerseys.length,0)}  |  Extra/Family Prints Req: ${totalPrintsRequired}`, 14, 28);

    const tableColumn = [
      "Player Name", 
      "Squad Print\n(Name & No.)", 
      "Squad Bundle Sizes\n(Jersey / Pants / Shorts / Skinny)", 
      "Family Jerseys\n(Qty | Name | No. | Size)", 
      "Extra Paid Gear\n(Qty | Name | No. | Size)"
    ];
    
    const tableRows = orders.map(o => {
      const printDetails = `Name: ${o.jerseyName}\nNo: ${o.number}`;
      const squadSizes = `Polo/Vest: ${o.customJerseySize || o.jerseySize}\nPants: ${o.customPantSize || o.pantSize}\nShorts: ${o.customShortSize || o.shortSize}\nSkinny: ${o.customSkinnySize || o.skinnySize}`;
      
      const formatKitItem = (kit) => {
        let details = [];
        if (kit.name) details.push(kit.name);
        if (kit.number) details.push(`#${kit.number}`);
        details.push(`Size: ${kit.customSize || kit.size}`);
        return `1x ${details.join(' | ')}`;
      };

      const family = o.familyKits.length > 0 
        ? o.familyKits.map(formatKitItem).join('\n\n') 
        : "-";
        
      const extra = o.extraPaidJerseys.length > 0
        ? o.extraPaidJerseys.map(formatKitItem).join('\n\n')
        : "-";

      return [o.playerName, printDetails, squadSizes, family, extra];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 34,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
      headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] } 
    });

    doc.save("Kurumbas_CC_Grouped_Order_Report.pdf");
  };

  const exportToExcel = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const XLSX = window.XLSX;
    
    const rows = [
      ["Order Category", "Associated Player", "Garment Type", "Print Name", "Print Number", "Standard Size", "Custom Size Note"]
    ];

    orders.forEach(o => {
      rows.push(["Squad Bundle", o.playerName, "Match Polo", o.jerseyName, o.number, o.jerseySize, o.customJerseySize || ""]);
      rows.push(["Squad Bundle", o.playerName, "Training Vest", o.jerseyName, o.number, o.jerseySize, o.customJerseySize || ""]);
      rows.push(["Squad Bundle", o.playerName, "Long Pants", "", "", o.pantSize, o.customPantSize || ""]);
      rows.push(["Squad Bundle", o.playerName, "Training Shorts", "", "", o.shortSize, o.customShortSize || ""]);
      rows.push(["Squad Bundle", o.playerName, "Training Skinny", "", "", o.skinnySize, o.customSkinnySize || ""]);

      o.familyKits.forEach(fk => {
        rows.push(["Family Support", o.playerName, "Match Polo", fk.name || "", fk.number || "", fk.size, fk.customSize || ""]);
      });

      o.extraPaidJerseys.forEach(ek => {
        rows.push(["Extra Paid Gear", o.playerName, "Match Polo", ek.name || "", ek.number || "", ek.size, ek.customSize || ""]);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kit Orders");
    XLSX.writeFile(workbook, "Kurumbas_CC_Manufacturer_Report.xlsx");
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const finalOrder = { ...formData, id: Date.now(), currentPriceAtOrder: extraJerseyPrice };
      setOrders(prev => [...prev, finalOrder]);
      setLastOrder(finalOrder);
      setIsSubmitting(false);
      setView('success');
      
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
      document.head.appendChild(script);
      script.onload = () => { if(window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); };
    }, 1500);
  };

  const handleDownload = async (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    
    try {
      const canvas = await window.html2canvas(element, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  // --- UI COMPONENTS ---
  const SizeSelector = ({ label, value, options, onChange, customValue, onCustomChange }) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button 
            key={opt} 
            type="button" 
            onClick={() => {
              onChange(opt);
              if (onCustomChange) onCustomChange(""); 
            }} 
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${value === opt && !customValue ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors">
          <Type size={14} />
        </div>
        <input 
          placeholder="Or Enter Custom Size..." 
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          className={`w-full bg-slate-950/50 border ${customValue ? 'border-orange-500 text-orange-500' : 'border-slate-800 text-slate-400'} p-3 pl-10 rounded-xl text-[10px] outline-none transition-all placeholder:text-slate-800 focus:border-orange-500`}
        />
      </div>
    </div>
  );

  const SizeChartModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[85vh] lg:h-auto overflow-y-auto shadow-2xl">
        <div className="flex-1 p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-center"><h3 className="text-3xl font-black italic uppercase">Tech Sizing</h3><button onClick={() => setShowSizeChart(false)} className="bg-slate-800 p-3 rounded-full hover:bg-orange-500 transition-all"><X size={20}/></button></div>
          <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            {Object.keys(SIZE_CHARTS).map(t => (
              <button 
                key={t} 
                onClick={() => setActiveChartTab(t)} 
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${activeChartTab === t ? 'bg-orange-500 text-black shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
              >
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
               <div className="bg-white p-4 rounded-3xl w-full shadow-lg">
                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Match Polo</p>
                 <img src={POLO_MEASURE_IMG} alt="Polo Measurement" className="w-full object-contain" />
               </div>
               <div className="bg-white p-4 rounded-3xl w-full shadow-lg">
                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Training T-Shirt</p>
                 <img src={TSHIRT_MEASURE_IMG} alt="T-Shirt Measurement" className="w-full object-contain" />
               </div>
             </div>
           ) : (
             <div className="space-y-6 w-full">
               <div className="bg-white p-4 rounded-3xl w-full shadow-lg">
                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Long Pants</p>
                 <img src={PANTS_MEASURE_IMG} alt="Pants Measurement" className="w-full object-contain" />
               </div>
               <div className="bg-white p-4 rounded-3xl w-full shadow-lg">
                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center mb-2">Shorts</p>
                 <img src={SHORTS_MEASURE_IMG} alt="Shorts Measurement" className="w-full object-contain" />
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  // --- VIEWS ---

  if (view === 'landing') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative font-sans">
      <div className="absolute inset-0 opacity-5 bg-center bg-cover scale-110" style={{backgroundImage: `url(${MATCH_KIT_IMG})`}}></div>
      <div className="z-10 flex flex-col items-center max-w-4xl">
        <img src={TEAM_LOGO} className="w-40 h-40 md:w-56 md:h-56 mb-12 drop-shadow-[0_0_60px_rgba(249,115,22,0.4)]" />
        <h1 className="text-7xl md:text-[10rem] font-black text-white italic tracking-tighter uppercase mb-8 leading-none select-none">
          Kurumbas <span className="text-orange-500">CC.</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mb-16 font-black uppercase tracking-[0.4em] italic">
          Squad Registration 2026
        </p>
        <button 
          onClick={() => setView('customize')} 
          className="group bg-white text-black px-12 md:px-20 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-orange-500 transition-all flex items-center gap-4 shadow-2xl hover:-translate-y-1 active:scale-95"
        >
          ENTER HUB <ArrowRight className="group-hover:translate-x-2 transition-transform"/>
        </button>
        <button onClick={() => setView('admin-auth')} className="mt-16 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2 transition-all"><Lock size={12}/> Admin Access</button>
      </div>
    </div>
  );

  if (view === 'customize') return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 overflow-y-auto font-sans">
      {showSizeChart && <SizeChartModal />}
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
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Legal Name</label><input required placeholder="Your Full Name" value={formData.playerName} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-bold transition-all" onChange={e => setFormData({...formData, playerName: e.target.value})} /></div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jersey Print</label><button type="button" onClick={generateAIPersona} className="text-orange-500 text-[10px] font-black uppercase flex items-center gap-1 hover:text-white transition-all"><Sparkles size={12}/> AI</button></div>
                  <input required maxLength={12} placeholder="THAAL" value={formData.jerseyName} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none uppercase font-black focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, jerseyName: e.target.value})} />
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Squad #</label><input required type="number" placeholder="00" value={formData.number} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-black text-2xl transition-all" onChange={e => setFormData({...formData, number: e.target.value})} /></div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-5"><div className="bg-orange-500 p-3 rounded-2xl shadow-inner"><Shirt size={24} className="text-black"/></div><h3 className="text-3xl font-black uppercase tracking-tighter italic">2. Squad Sizing</h3></div>
              <div className="grid md:grid-cols-2 gap-12 pt-4">
                <SizeSelector label="Jersey Size (Match & Training)" value={formData.jerseySize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(prev => ({...prev, jerseySize: v}))} customValue={formData.customJerseySize} onCustomChange={val => setFormData(prev => ({...prev, customJerseySize: val}))} />
                <SizeSelector label="Long Pants" value={formData.pantSize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(prev => ({...prev, pantSize: v}))} customValue={formData.customPantSize} onCustomChange={val => setFormData(prev => ({...prev, customPantSize: val}))} />
                <SizeSelector label="Shorts Size" value={formData.shortSize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(prev => ({...prev, shortSize: v}))} customValue={formData.customShortSize} onCustomChange={val => setFormData(prev => ({...prev, customShortSize: val}))} />
                <SizeSelector label="Training Skinny" value={formData.skinnySize} options={['XS','S','M','L','XL','2XL','3XL']} onChange={v => setFormData(prev => ({...prev, skinnySize: v}))} customValue={formData.customSkinnySize} onCustomChange={val => setFormData(prev => ({...prev, customSkinnySize: val}))} />
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="bg-pink-600 p-3 rounded-2xl"><Heart size={24} className="text-white"/></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-pink-500">3. Family Support</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, familyKits: [...formData.familyKits, { id: Date.now(), name: '', number: '', size: 'W-M', customSize: '' }]})} 
                  className="bg-pink-600/10 border border-pink-600/20 text-pink-500 px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 hover:bg-pink-600 hover:text-white transition-all shadow-xl"
                >
                  <PlusCircle size={18}/> Add Member
                </button>
              </div>
              
              <div className="space-y-6">
                {formData.familyKits.map(k => (
                  <div key={k.id} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col gap-6 relative animate-in slide-in-from-right">
                    <button type="button" onClick={() => setFormData({...formData, familyKits: formData.familyKits.filter(x => x.id !== k.id)})} className="absolute -top-3 -right-3 bg-slate-800 p-2.5 rounded-full text-slate-600 hover:text-red-500 transition-colors shadow-2xl border border-slate-700"><Trash2 size={18}/></button>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">Name (Optional)</label>
                        <input placeholder="OPTIONAL" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs uppercase font-black outline-none focus:border-pink-600 transition-all" onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, name: e.target.value} : x)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">No. (Optional)</label>
                        <input placeholder="OPTIONAL" type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-black outline-none focus:border-pink-600 transition-all" onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, number: e.target.value} : x)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-pink-500 uppercase tracking-[0.2em]">Size (Required)</label>
                        <select className="w-full bg-slate-900 border border-pink-500/20 p-4 rounded-xl text-xs font-black outline-none appearance-none" onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, size: e.target.value} : x)})}>
                          <optgroup label="Adults">{['W-XS','W-S','W-M','W-L'].map(sz => <option key={sz} value={sz}>{sz}</option>)}</optgroup>
                          <optgroup label="Kids">{['9XS','8XS','7XS','6XS','5XS','4XS','3XS','2X'].map(sz => <option key={sz} value={sz}>{sz}</option>)}</optgroup>
                        </select>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors"><Type size={14}/></div>
                      <input placeholder="Or Enter Custom Size for relative..." className="w-full bg-slate-900/50 border border-slate-800 p-3 pl-10 rounded-xl text-[10px] text-orange-500 outline-none transition-all focus:border-orange-500" onChange={e => setFormData({...formData, familyKits: formData.familyKits.map(x => x.id === k.id ? {...x, customSize: e.target.value} : x)})} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500 p-3 rounded-2xl"><ShoppingBag size={24} className="text-black"/></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">4. Extra Gear</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, extraPaidJerseys: [...formData.extraPaidJerseys, { id: Date.now(), name: '', number: '', size: 'M', customSize: '' }]})} 
                  className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 hover:bg-yellow-500 hover:text-black transition-all shadow-xl"
                >
                  <PlusCircle size={18}/> Order Extra
                </button>
              </div>
              
              <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-3xl flex items-center gap-4">
                <Banknote size={24} className="text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-500/80 font-black uppercase tracking-widest leading-relaxed">Unit Cost: {extraJerseyPrice} LKR. (Sponsorship limit exceeded item)</p>
              </div>

              <div className="space-y-6">
                {formData.extraPaidJerseys.map(k => (
                  <div key={k.id} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col gap-6 relative animate-in slide-in-from-right">
                    <button type="button" onClick={() => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.filter(x => x.id !== k.id)})} className="absolute -top-3 -right-3 bg-slate-800 p-2.5 rounded-full text-slate-600 hover:text-red-500 transition-colors shadow-2xl border border-slate-700"><Trash2 size={18}/></button>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">Name (Optional)</label>
                        <input placeholder="OPTIONAL" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs uppercase font-black outline-none focus:border-yellow-500 transition-all" onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, name: e.target.value} : x)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">No. (Optional)</label>
                        <input placeholder="OPTIONAL" type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-black outline-none focus:border-yellow-500 transition-all" onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, number: e.target.value} : x)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-orange-500 uppercase tracking-[0.2em]">Size (Required)</label>
                        <select className="w-full bg-slate-900 border border-orange-500/20 p-4 rounded-xl text-xs font-black outline-none" onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, size: e.target.value} : x)})}>{['XS','S','M','L','XL','2XL','3XL'].map(sz => <option key={sz} value={sz}>{sz}</option>)}</select>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors"><Type size={14}/></div>
                      <input placeholder="Or Enter Custom Size for this item..." className="w-full bg-slate-900/50 border border-slate-800 p-3 pl-10 rounded-xl text-[10px] text-orange-500 outline-none transition-all focus:border-orange-500" onChange={e => setFormData({...formData, extraPaidJerseys: formData.extraPaidJerseys.map(x => x.id === k.id ? {...x, customSize: e.target.value} : x)})} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button disabled={isSubmitting || !formData.playerName} type="submit" className="w-full bg-white text-black py-8 rounded-[3rem] font-black text-3xl hover:bg-orange-500 transition-all shadow-2xl disabled:opacity-30 uppercase italic tracking-tighter">{isSubmitting ? 'Confirming...' : 'REGISTER FOR 2026'}</button>
          </form>
        </div>

        <div className="flex flex-col items-center sticky top-10 space-y-12">
          <div id="jersey-preview" className="relative group perspective-1000">
             <div className="absolute -inset-20 bg-orange-500/10 blur-[150px] rounded-full opacity-30"></div>
             <div className="relative w-[380px] h-[520px] md:w-[440px] md:h-[600px] bg-slate-900 rounded-t-[100px] shadow-[0_80px_160px_rgba(0,0,0,0.9)] overflow-hidden border-b-[60px] border-black transition-all duration-700 hover:rotate-y-6">
                <div className="absolute inset-0 bg-cover bg-top" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${MATCH_KIT_IMG})`}}></div>
                <div className="absolute top-[28%] w-full flex flex-col items-center px-12 text-center">
                   <h2 className="text-white font-black text-4xl md:text-5xl tracking-tighter uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,1)] break-all leading-tight mb-4">{formData.jerseyName || "PLAYER"}</h2>
                   <span className="text-[#D4AF37] font-black text-[180px] md:text-[240px] leading-[0.7] drop-shadow-[0_10px_60px_rgba(0,0,0,1)] italic">{formData.number || "00"}</span>
                </div>
                <div className="absolute bottom-12 left-12 flex items-center gap-4"><img src={TEAM_LOGO} className="w-16 h-16 opacity-90" /><div className="h-12 w-px bg-white/20"></div><div><p className="text-white text-xs font-black uppercase tracking-widest">KCC Squad</p><p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Official Gear</p></div></div>
             </div>
          </div>
          <div className="w-full bg-slate-900 p-8 rounded-[3.5rem] border border-slate-800 shadow-2xl space-y-8">
             <div className="flex items-center gap-3 border-b border-slate-800 pb-4"><Layout size={18} className="text-orange-500" /><h4 className="text-sm font-black uppercase italic tracking-widest text-slate-300 leading-none">Gear Reference</h4></div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><div className="h-40 rounded-3xl overflow-hidden border border-slate-800 grayscale hover:grayscale-0 transition-all duration-500"><img src={MATCH_KIT_IMG} className="w-full h-full object-cover" /></div><p className="text-[9px] text-center font-black text-slate-600 uppercase tracking-widest italic">Match Polo</p></div>
                <div className="space-y-2"><div className="h-40 rounded-3xl overflow-hidden border border-slate-800 grayscale hover:grayscale-0 transition-all duration-500"><img src={TRAINING_KIT_IMG} className="w-full h-full object-cover" /></div><p className="text-[9px] text-center font-black text-slate-600 uppercase tracking-widest italic">Training Vest</p></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (view === 'success') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="bg-green-500 p-10 rounded-full mb-12 shadow-[0_0_120px_rgba(34,197,94,0.4)] animate-bounce"><CheckCircle2 size={80}/></div>
      <h1 className="text-8xl md:text-9xl font-black italic uppercase mb-8 tracking-tighter leading-none">LOCKED <span className="text-orange-500">IN.</span></h1>
      <div id="share-card" className="w-[360px] h-[640px] bg-black rounded-[4rem] overflow-hidden relative shadow-[0_60px_140px_rgba(0,0,0,1)] border border-white/5 mb-10">
        <div className="absolute inset-0 bg-cover bg-top opacity-80" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${MATCH_KIT_IMG})`}}></div>
        <div className="absolute inset-0 p-16 flex flex-col justify-end text-left">
          <img src={TEAM_LOGO} className="w-24 h-24 mb-10" />
          <span className="bg-orange-500 text-black px-6 py-2 text-[11px] font-black uppercase tracking-widest w-fit mb-8 rounded-full">Official Signing 2026</span>
          <h2 className="text-8xl font-black italic tracking-tighter uppercase leading-none mb-4">{lastOrder?.jerseyName}</h2>
          <div className="flex items-center gap-8"><div className="h-1 w-24 bg-orange-500"></div><span className="text-orange-500 font-black text-7xl italic">#{lastOrder?.number}</span></div>
        </div>
      </div>
      <div className="flex gap-6"><button onClick={() => handleDownload('share-card', `${lastOrder?.jerseyName}_KCC.png`)} className="bg-white text-black px-16 py-6 rounded-[3rem] font-black text-lg uppercase flex items-center gap-4 hover:bg-orange-500 transition-all shadow-2xl active:scale-95"><Share2 size={24}/> Share My Signing</button><button onClick={() => setView('landing')} className="bg-slate-900 text-slate-500 px-12 py-6 rounded-[3rem] font-black text-lg uppercase hover:text-white transition-all">Home</button></div>
    </div>
  );

  if (view === 'admin-auth') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="bg-slate-900 p-16 md:p-24 rounded-[5rem] border border-slate-800 shadow-2xl max-w-xl w-full text-center space-y-14">
        <div className="bg-orange-500/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto border border-orange-500/20 shadow-inner"><Lock className="text-orange-500" size={56} /></div>
        <input type="password" placeholder="••••" className="w-full bg-slate-950 border border-slate-800 p-8 rounded-[3rem] text-center text-7xl text-white outline-none focus:border-orange-500 transition-all font-mono tracking-[0.6em]"
          onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adminPass === 'TEAM2026' && setView('admin')} />
        <button onClick={() => adminPass === 'TEAM2026' ? setView('admin') : alert('Denied')} className="w-full bg-orange-500 text-black py-8 rounded-[3rem] font-black uppercase text-2xl shadow-2xl transition-all">Authenticate</button>
      </div>
    </div>
  );

  if (view === 'admin') return (
    <div className="min-h-screen bg-slate-950 p-8 md:p-14 overflow-y-auto text-white">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="flex justify-between items-end"><h1 className="text-6xl font-black text-orange-500 uppercase italic tracking-tighter leading-none">Control</h1><div className="flex gap-6"><button onClick={generateAdminBrief} disabled={isAdminAiLoading} className="bg-orange-500 text-black px-10 py-4 rounded-[2rem] text-sm font-black uppercase flex items-center gap-4 hover:scale-105 transition-all italic">{isAdminAiLoading ? <Wand2 className="animate-spin" size={20}/> : <Sparkles size={20}/>} ✨ AI Brief</button><button onClick={() => setView('landing')} className="bg-slate-800 p-5 rounded-[2rem] hover:text-white transition-all shadow-xl"><X size={32}/></button></div></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
           <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl flex flex-col justify-between">
              <div><p className="text-[11px] opacity-40 uppercase font-black mb-5 tracking-widest">Extra Price</p><input type="number" value={extraJerseyPrice} className="bg-slate-950 border border-orange-500/30 p-3 rounded-xl text-3xl font-black w-full outline-none focus:border-orange-500 transition-all" onChange={(e) => setExtraJerseyPrice(Number(e.target.value))} /></div>
              <p className="text-[9px] text-orange-500/50 font-bold uppercase mt-4">Current Unit Cost (LKR)</p>
           </div>
           <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl"><p className="text-[11px] opacity-40 uppercase font-black mb-5 tracking-widest">Squad</p><p className="text-6xl font-black text-white italic">{orders.length}</p></div>
           <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl"><p className="text-[11px] opacity-40 uppercase font-black mb-5 tracking-widest">Family</p><p className="text-6xl font-black text-white italic">{orders.reduce((s,o)=>s+o.familyKits.length,0)}</p></div>
           <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl">
              <p className="text-[11px] opacity-40 uppercase font-black mb-5 tracking-widest">Custom Prints</p>
              <p className="text-6xl font-black text-white italic">{totalPrintsRequired}</p>
              <p className="text-[9px] text-pink-500 font-bold uppercase mt-4">Extra/Fam Names & Nos</p>
           </div>
        </div>

        {adminAiBrief && <div className="bg-orange-500/5 border border-orange-500/20 p-12 rounded-[5rem] animate-in zoom-in relative shadow-2xl"><button onClick={() => setAdminAiBrief("")} className="absolute top-12 right-12 text-slate-500 hover:text-white"><X size={32}/></button><div className="flex items-center gap-6 mb-10"><Sparkles className="text-orange-500" size={40}/><h3 className="text-3xl font-black uppercase italic tracking-widest text-white">Production Brief</h3></div><div className="bg-black/50 p-12 rounded-[3.5rem] font-mono text-sm leading-relaxed text-slate-300 border border-white/5 whitespace-pre-wrap">{adminAiBrief}</div><button onClick={() => window.location.href = `mailto:supplier@kits.com?body=${encodeURIComponent(adminAiBrief)}`} className="mt-10 bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 hover:bg-orange-500 transition-colors shadow-2xl">Push to Manufacturer</button></div>}

        <div className="bg-slate-900 rounded-[5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-12 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row gap-6 justify-between items-center">
            <h4 className="text-2xl font-black uppercase tracking-widest flex items-center gap-6"><FileText size={32} className="text-orange-500" /> Sponsoring Manifest</h4>
            <div className="flex gap-4">
              <button onClick={exportManufacturerReport} className="bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3 hover:bg-orange-500 transition-colors shadow-xl active:scale-95">
                <Download size={18} /> PDF
              </button>
              <button onClick={exportToExcel} className="bg-green-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3 hover:bg-green-500 transition-colors shadow-xl active:scale-95">
                <FileSpreadsheet size={18} /> Excel
              </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead><tr className="bg-slate-800/40 text-slate-500 text-[12px] font-black uppercase border-b border-slate-800 tracking-widest"><th className="p-12">Member</th><th className="p-12">Sizing Config</th><th className="p-12 text-center">Add-ons</th><th className="p-12 text-right">Delete</th></tr></thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map(o => (
                <tr key={o.id} className="text-white group hover:bg-slate-800/20 transition-all">
                  <td className="p-12"><p className="font-black text-3xl italic uppercase tracking-tighter leading-none">{o.playerName}</p><p className="text-sm text-orange-500 font-black mt-3">{o.jerseyName} #{o.number}</p></td>
                  <td className="p-12"><div className="flex flex-wrap gap-3">
                    <span className="bg-slate-950 px-4 py-2 rounded-2xl text-xs font-black border border-slate-800">J:{o.customJerseySize || o.jerseySize}</span>
                    <span className="bg-slate-950 px-4 py-2 rounded-2xl text-xs font-black border border-slate-800">P:{o.customPantSize || o.pantSize}</span>
                    <span className="bg-slate-950 px-4 py-2 rounded-2xl text-xs font-black border border-slate-800">S:{o.customShortSize || o.shortSize}</span>
                    <span className="bg-slate-950 px-4 py-2 rounded-2xl text-xs font-black border border-slate-800">Sk:{o.customSkinnySize || o.skinnySize}</span>
                  </div></td>
                  <td className="p-12 text-center"><div className="flex flex-col items-center gap-2">
                    <span className="bg-pink-500/10 text-pink-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Fam: {o.familyKits.length}</span>
                    <span className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Paid: {o.extraPaidJerseys.length}</span>
                  </div></td>
                  <td className="p-12 text-right"><button onClick={() => setOrders(orders.filter(ord => ord.id !== o.id))} className="bg-slate-800 p-5 rounded-[2rem] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-2xl active:scale-90"><Trash2 size={28}/></button></td>
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
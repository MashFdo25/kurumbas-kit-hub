<div className="space-y-10">
  <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
    <div className="bg-orange-500 p-3 rounded-2xl shadow-inner"><Users size={24} className="text-black"/></div>
    <h3 className="text-3xl font-black uppercase tracking-tighter italic">1. Identity</h3>
  </div>
  {/* Added items-end to keep inputs aligned */}
  <div className="grid md:grid-cols-3 gap-8 items-end">
    
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Legal Name</label>
      <input required placeholder="Your Full Name" value={formData.playerName || ""} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-bold" onChange={e => setFormData({...formData, playerName: e.target.value})} />
    </div>

    <div className="space-y-2">
      {/* Combined label and button into a flex row to save vertical space */}
      <div className="flex justify-between items-center h-4"> 
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jersey Print</label>
        <button type="button" onClick={generateAIPersona} className="text-orange-500 text-[10px] font-black uppercase flex items-center gap-1 hover:text-white transition-all">
          <Sparkles size={12}/> AI
        </button>
      </div>
      <input required maxLength={12} placeholder="JOHN" value={formData.jerseyName || ""} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none uppercase font-black focus:border-orange-500" onChange={e => setFormData({...formData, jerseyName: e.target.value})} />
    </div>

    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Squad #</label>
      <input required type="number" placeholder="00" value={formData.number || ""} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl outline-none focus:border-orange-500 font-black text-2xl" onChange={e => setFormData({...formData, number: e.target.value})} />
    </div>

  </div>
</div>
// At the very end of your App.jsx file
export default App;

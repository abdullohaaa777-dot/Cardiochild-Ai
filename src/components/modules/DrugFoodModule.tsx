import React, { useState, useEffect } from 'react';
import { analyzeDrugFoodCompatibility } from '../../services/ai';
import { addStorageItem, getOrCreateTodayLog, saveDailyLog } from '../../services/storage';
import { Child, DrugFoodCompatibility } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, Pill, CheckCircle2 } from 'lucide-react';

export default function DrugFoodModule({ child }: { child: Child }) {
  const [medication, setMedication] = useState('');
  const [schedule, setSchedule] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<DrugFoodCompatibility | null>(null);
  const [meds, setMeds] = useState<any[]>([]);

  useEffect(() => {
    const todayLog = getOrCreateTodayLog(child.id);
    setMeds(todayLog.medications || []);
  }, [child.id]);

  const handleGenerate = async () => {
    if (!medication) return;
    setIsGenerating(true);
    
    // Save medication taking log
    const todayLog = getOrCreateTodayLog(child.id);
    const newMed = { id: generateId(), name: medication, schedule, time: new Date().toLocaleTimeString() };
    const newMeds = [...(todayLog.medications || []), newMed];
    todayLog.medications = newMeds;
    saveDailyLog(todayLog);
    setMeds(newMeds);
    
    const res = await analyzeDrugFoodCompatibility(child, medication, schedule);
    
    if (res) {
      const fullItem: DrugFoodCompatibility = {
        ...res,
        id: generateId(),
        childId: child.id,
        dose: '',
        createdAt: new Date().toISOString()
      };
      addStorageItem('drugFoodCompatibility', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
    
    setMedication('');
    setSchedule('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Pill className="text-emerald-500 w-5 h-5"/>
          Dori va Ovqat Mosligi
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dori nomi</label>
            <input type="text" value={medication} onChange={e => setMedication(e.target.value)} placeholder="Masalan: Veroshpiron, Furosemid, Digoksin..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Qabul vaqti/miqdori</label>
             <input type="text" value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="Kuniga 1 mahal ertalab" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !medication}
          className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isGenerating ? "Tekshirilmoqda..." : "Kiritish va mosligini tekshirish"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
         <h4 className="font-semibold text-slate-800 mb-3">Bugun ichilgan dorilar:</h4>
         {meds.length === 0 ? <p className="text-sm text-slate-500">Hali ichilmadi.</p> : (
            <ul className="space-y-2">
                {meds.map((m, i) => (
                    <li key={i} className="flex justify-between items-center text-sm bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <span className="font-medium text-emerald-900">{m.name} <span className="text-emerald-600 text-xs ml-1">({m.schedule})</span></span>
                        <span className="text-emerald-700 font-bold">{m.time}</span>
                    </li>
                ))}
            </ul>
         )}
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-2">{result.medicationName} tahlili</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <h4 className="font-semibold text-red-800 mb-2 text-sm">Birga mumkin bo'lmagan narsalar</h4>
                    <ul className="list-disc pl-4 text-xs text-red-700 space-y-1">
                        {result.avoidOrMonitorFoods.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 text-sm">Ehtiyot bo'lish kerak</h4>
                    <ul className="list-disc pl-4 text-xs text-yellow-700 space-y-1">
                        {result.foodCautions.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            </div>

            <div className="mt-6 bg-slate-50 text-slate-800 p-4 rounded-xl text-sm border border-slate-200">
                <span className="font-bold block mb-1">Muhim xulosa:</span> {result.parentAdvice}
            </div>
        </div>
      )}
    </div>
  );
}

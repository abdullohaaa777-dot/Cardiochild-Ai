import React, { useState, useEffect } from 'react';
import { correlateSymptomsWithFood } from '../../services/ai';
import { addStorageItem, getOrCreateTodayLog, saveDailyLog, getStorageArray } from '../../services/storage';
import { Child, SymptomFoodCorrelation, DailyLog } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, Activity, AlertTriangle, Clock } from 'lucide-react';

export default function SymptomFoodModule({ child }: { child: Child }) {
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState<'mild'|'moderate'|'severe'>('mild');
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [latestLogs, setLatestLogs] = useState<DailyLog[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SymptomFoodCorrelation | null>(null);

  useEffect(() => {
    const logs = getStorageArray<DailyLog>('cardiochild_dailyLogs').filter(l => l.childId === child.id);
    setLatestLogs(logs.slice(-3));

    const todayLog = getOrCreateTodayLog(child.id);
    setSymptoms(todayLog.symptoms || []);
  }, [child.id]);

  const handleAddSymptom = () => {
      if(!symptomName) return;
      
      const newSymptom = { id: generateId(), name: symptomName, severity, time: new Date().toLocaleTimeString(), startedAt: new Date().toISOString() };
      const newSymptoms = [...symptoms, newSymptom];
      setSymptoms(newSymptoms);
      
      const todayLog = getOrCreateTodayLog(child.id);
      todayLog.symptoms = newSymptoms;
      saveDailyLog(todayLog);
      
      setSymptomName('');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const res = await correlateSymptomsWithFood(child, symptoms, latestLogs);
    
    if (res) {
      const fullItem: SymptomFoodCorrelation = {
        ...res,
        id: generateId(),
        childId: child.id,
        symptoms,
        analyzedPeriodHours: 24,
        createdAt: new Date().toISOString()
      };
      addStorageItem('symptomFoodCorrelations', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="text-amber-500 w-5 h-5"/>
          Simptom va Ovqatlanish Tahlili
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Simptom (masalan, hansirash, shish)</label>
            <input type="text" value={symptomName} onChange={e => setSymptomName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Darajasi</label>
            <div className="flex gap-2">
                <select value={severity} onChange={e => setSeverity(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-xl">
                    <option value="mild">Yengil</option>
                    <option value="moderate">O'rtacha</option>
                    <option value="severe">Og'ir</option>
                </select>
                <button onClick={handleAddSymptom} className="px-4 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200">Qo'shish</button>
            </div>
          </div>
        </div>

        <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Bugungi kuzatilgan simptomlar:</h4>
            {symptoms.length === 0 ? <p className="text-xs text-slate-400">Hali qo'shilmagan.</p> : (
            <>
                {symptoms.map((s, i) => (
                    <div key={i} className="text-sm flex justify-between items-center bg-amber-50 px-3 py-2 rounded-xl mb-2 border border-amber-100">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-amber-900">{s.name}</span>
                           <span className="text-amber-600/70 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {s.time}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${s.severity === 'severe' ? 'bg-red-100 text-red-600' : s.severity === 'moderate' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}>
                           {s.severity === 'severe' ? "Og'ir" : s.severity === 'moderate' ? "O'rtacha" : "Yengil"}
                        </span>
                    </div>
                ))}
            </>
            )}
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || symptoms.length === 0}
          className="w-full flex justify-center items-center gap-2 bg-amber-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
          {isGenerating ? "Tahlil qilinmoqda..." : "Ovqat/holat bilan bog'liqlikni qidirish"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-6">
            {result.emergencyWarning && (
                <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">DIQQAT: TEZ YORDAM CHAQIRING!</h4>
                        <p className="text-sm mt-1">Ushbu simptomlar yurak etishmovchiligining o'tkir palla belgisi bo'lishi mumkin.</p>
                    </div>
                </div>
            )}
            
            <h3 className="font-bold text-slate-800 mb-3 text-lg">Tahlil natijasi</h3>
            
            <div className="space-y-4 text-sm text-slate-600 mb-6">
               <p><span className="font-semibold text-slate-800">Tuz bilan bog'liqlik:</span> {result.saltRelation}</p>
               <p><span className="font-semibold text-slate-800">Suyuqlik bilan bog'liqlik:</span> {result.fluidRelation}</p>
               <p><span className="font-semibold text-slate-800">Ehtimoliy sababchilar (oxirgi taomlardan):</span> {result.possibleTriggers.join(', ')}</p>
            </div>

            <div className="bg-slate-50 text-slate-800 p-4 rounded-xl text-sm border border-slate-200 shadow-inner">
                <span className="font-bold block mb-1">Ota-onaga tezkor maslahat:</span> {result.parentAdvice}
            </div>
        </div>
      )}
    </div>
  );
}

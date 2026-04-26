import React, { useState, useEffect } from 'react';
import { analyzeSaltRisk } from '../../services/ai';
import { addStorageItem, getStorageArray } from '../../services/storage';
import { Child, SaltRiskLog, DailyLog } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, Refrigerator } from 'lucide-react';

export default function SaltRiskModule({ child }: { child: Child }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SaltRiskLog | null>(null);
  const [latestLog, setLatestLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    const logs = getStorageArray<DailyLog>('cardiochild_dailyLogs').filter(l => l.childId === child.id);
    if (logs.length > 0) {
      setLatestLog(logs[logs.length - 1]);
    }
  }, [child.id]);

  const handleGenerate = async () => {
    if (!latestLog) return;
    setIsGenerating(true);
    
    const res = await analyzeSaltRisk(child, latestLog);
    
    if (res) {
      const fullItem: SaltRiskLog = {
        ...res,
        id: generateId(),
        childId: child.id,
        createdAt: new Date().toISOString()
      };
      addStorageItem('saltRiskLogs', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Refrigerator className="text-indigo-500 w-5 h-5"/>
          Tuz Xavfi Radari
        </h2>
        <p className="text-sm text-slate-500 mb-4">Bugungi iste'mol qilingan taomlar asosida tuz (natriy) miqdorining yurakka xavfini tahlil qiling.</p>

        {!latestLog ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                Bugun uchun kunlik rasion kiritilmagan. Iltimos, kunlik nazorat bo'limidan ovqat qo'shing.
            </div>
        ) : (
            <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
            >
            {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Refrigerator className="w-5 h-5" />}
            {isGenerating ? "Tahlil qilinmoqda..." : "Tuz radarini ishga tushirish"}
            </button>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
             <div>
                <h3 className="font-bold text-slate-900">Natriy iste'moli</h3>
                <div className="text-2xl font-bold text-indigo-700 mt-1">{result.sodiumMg} mg</div>
             </div>
             <div className="text-right">
                <div className="text-sm text-slate-500">Maksimal me'yor</div>
                <div className="font-bold text-slate-800">{result.sodiumLimitMg} mg/kun</div>
             </div>
          </div>
          
          {/* Progress bar */}
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50">
             <div className="flex justify-between text-xs mb-1 font-medium">
                 <span className="text-slate-600">Foydalanildi: {result.usagePercent}%</span>
                 <span className={result.usagePercent > 100 ? 'text-red-500' : 'text-slate-500'}>
                     {result.usagePercent > 100 ? 'Me\'yor oshib ketdi!' : 'Xavfsiz hudud'}
                 </span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2.5">
                 <div className={`h-2.5 rounded-full ${result.usagePercent > 100 ? 'bg-red-500' : result.usagePercent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${Math.min(result.usagePercent, 100)}%`}}></div>
             </div>
          </div>

          <div className="p-6">
            <h4 className="font-semibold text-slate-800 mb-3 text-sm">Eng ko'p tuz saqlovchi ovqatlar (Bugun):</h4>
            <div className="space-y-2 mb-6">
                {result.topSaltFoods.map((f, i) => (
                    <div key={i} className="flex justify-between items-center bg-white border border-slate-100 rounded-lg p-2 text-sm">
                        <span className="text-slate-700">{f.foodName}</span>
                        <span className="text-red-600 font-bold">{f.sodiumMg} mg</span>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
              <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl text-sm border border-indigo-100">
                 <span className="font-semibold block mb-1">Ota-onaga maxsus ko'rsatma:</span> {result.parentAdvice}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

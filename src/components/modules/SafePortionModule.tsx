import React, { useState } from 'react';
import { generateSafePortion } from '../../services/ai';
import { addStorageItem } from '../../services/storage';
import { Child, SafePortionResult } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, PieChart } from 'lucide-react';

export default function SafePortionModule({ child }: { child: Child }) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number>(100);
  const [fat, setFat] = useState<number>(5);
  const [sodium, setSodium] = useState<number>(100);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SafePortionResult | null>(null);

  const handleGenerate = async () => {
    if (!foodName) return;
    setIsGenerating(true);
    
    const res = await generateSafePortion(child, foodName, calories, fat, sodium);
    
    if (res) {
      const fullItem: SafePortionResult = {
        ...res,
        id: generateId(),
        childId: child.id,
        createdAt: new Date().toISOString()
      };
      addStorageItem('safePortionResults', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PieChart className="text-red-500 w-5 h-5"/>
          Yurak uchun xavfsiz porsiya kalkulyatori
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taom nomi</label>
            <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Taqqoslash uchun taom..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kaloriya (har 100g da)</label>
            <input type="number" value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yog' miqdori (g)</label>
            <input type="number" value={fat} onChange={e => setFat(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Natriy (Tuz) miqdori (mg)</label>
            <input type="number" value={sodium} onChange={e => setSodium(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !foodName.trim()}
          className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PieChart className="w-5 h-5" />}
          {isGenerating ? "Hisoblanmoqda..." : "Xavfsiz porsiyani hisoblash"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className={`p-6 border-b flex justify-between items-center ${result.riskLevel === 'green' ? 'bg-green-50' : result.riskLevel === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'}`}>
            <div>
              <h3 className="font-bold text-slate-900">{result.foodName}</h3>
              <p className="text-sm text-slate-600">Tasdiqlangan porsiya o'lchamlari</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${result.riskLevel === 'green' ? 'bg-green-500' : result.riskLevel === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}>
              Xavf: {result.riskLevel}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="text-slate-500 text-xs mb-1">Minimal</div>
                 <div className="font-bold text-slate-800 text-lg">{result.minPortionG}g</div>
               </div>
               <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm relative -top-2">
                 <div className="text-blue-500 text-xs mb-1">Optimal (Tavsiya)</div>
                 <div className="font-bold text-blue-700 text-xl">{result.optimalPortionG}g</div>
               </div>
               <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                 <div className="text-red-500 text-xs mb-1">Maksimal (Chegara)</div>
                 <div className="font-bold text-red-700 text-lg">{result.maxSafePortionG}g</div>
               </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 text-slate-800 p-3 rounded-xl text-sm border border-slate-100">
                 <span className="font-semibold block mb-1">Xavf sababi:</span> {result.riskReason}
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm border border-blue-100">
                 <span className="font-semibold block mb-1">Ota-onaga maxsus ko'rsatma:</span> {result.parentAdvice}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

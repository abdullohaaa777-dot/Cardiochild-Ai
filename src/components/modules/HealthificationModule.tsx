import React, { useState } from 'react';
import { transformFoodToHealthierVersion } from '../../services/ai';
import { addStorageItem } from '../../services/storage';
import { Child, HealthyFoodTransformation } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, HeartPulse } from 'lucide-react';

export default function HealthificationModule({ child }: { child: Child }) {
  const [foodName, setFoodName] = useState('');
  const [riskLevel, setRiskLevel] = useState('red');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HealthyFoodTransformation | null>(null);

  const handleGenerate = async () => {
    if (!foodName) return;
    setIsGenerating(true);
    
    const res = await transformFoodToHealthierVersion(child, foodName, riskLevel);
    
    if (res) {
      const fullItem: HealthyFoodTransformation = {
        ...res,
        id: generateId(),
        childId: child.id,
        createdAt: new Date().toISOString()
      };
      addStorageItem('healthyFoodTransformations', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HeartPulse className="text-red-500 w-5 h-5"/>
          Taomni sog'lomlashtirish tugmasi
        </h2>
        <p className="text-sm text-slate-500 mb-4">Bolangiz qandaydir xavfli taom yegisi kelyaptimi? Uni yurakka xavfsiz holatga qanday keltirishni bilib oling.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taom nomi</label>
            <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Masalan: Tushonka, Kfc tovuq, Qovurdoq..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xavf darajasi</label>
            <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-red-50 text-red-700">
              <option value="red">Qizil (Juda xavfli - sho'r/yog'li)</option>
              <option value="yellow">Sariq (Ehtiyot bo'lish kerak)</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !foodName.trim()}
          className="w-full flex justify-center items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <HeartPulse className="w-5 h-5" />}
          {isGenerating ? "O'zgartirilmoqda..." : "Sog'lom versiyasini yaratish"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white flex justify-between items-center">
            <div>
              <div className="text-red-100 text-sm line-through opacity-80">{result.originalFoodName}</div>
              <h3 className="font-bold text-xl">{result.healthierVersionName}</h3>
            </div>
          </div>
          <div className="p-6">
            <h4 className="font-bold text-slate-800 mb-2">Qanday tayyorlanadi? (O'zgarishlar)</h4>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                {result.transformationSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
               <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                 <div className="text-red-400 text-xs mb-1">Natriy (Tuz)</div>
                 <div className="font-bold text-red-700">{result.newEstimatedSodiumMg} mg</div>
               </div>
               <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                 <div className="text-amber-500 text-xs mb-1">Yog'</div>
                 <div className="font-bold text-amber-700">{result.newEstimatedFatG} g</div>
               </div>
               <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                 <div className="text-emerald-500 text-xs mb-1">Kaloriya</div>
                 <div className="font-bold text-emerald-700">{result.newEstimatedCalories}</div>
               </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm border border-blue-100">
                 <span className="font-semibold block mb-1">Foydasi:</span> {result.benefitForChild}
              </div>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-sm border border-amber-100">
                 <span className="font-semibold block mb-1">Ota-onaga maxsus ko'rsatma:</span> {result.parentInstruction}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

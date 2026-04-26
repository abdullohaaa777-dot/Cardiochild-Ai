import React, { useState } from 'react';
import { generateBudgetMenu } from '../../services/ai';
import { addStorageItem } from '../../services/storage';
import { Child, BudgetMenu } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, Wallet } from 'lucide-react';

export default function BudgetMenuModule({ child }: { child: Child }) {
  const [dailyBudget, setDailyBudget] = useState<number>(30000);
  const [days, setDays] = useState<number>(3);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BudgetMenu | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const res = await generateBudgetMenu(child, dailyBudget, days);
    
    if (res) {
      const fullItem: BudgetMenu = {
        ...res,
        id: generateId(),
        childId: child.id,
        dailyBudgetUZS: dailyBudget,
        weeklyBudgetUZS: dailyBudget * 7,
        durationDays: days,
        createdAt: new Date().toISOString()
      };
      addStorageItem('budgetMenus', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Wallet className="text-emerald-500 w-5 h-5"/>
          Byudjetga mos menyu
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kunlik byudjet (UZS)</label>
            <input type="number" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Davomiyligi (kun)</label>
            <select value={days} onChange={e => setDays(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl">
              <option value={1}>1 kun</option>
              <option value={3}>3 kun</option>
              <option value={7}>7 kun</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || dailyBudget <= 0}
          className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isGenerating ? "Hisoblanmoqda..." : "Arzon va foydali menyu tuzish"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="font-bold text-emerald-900">Menyu hisoboti</h3>
            <div className="text-right">
              <div className="text-emerald-700 font-bold">{result.estimatedTotalCostUZS.toLocaleString()} UZS</div>
              <div className="text-emerald-600 text-xs">Jami taxminiy xarajat</div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">{result.parentAdvice}</p>
            
            <div className="mb-6">
              <h4 className="font-semibold text-slate-800 mb-2">Arzon alternativalar</h4>
              <div className="flex flex-wrap gap-2">
                {result.cheapAlternatives.map((alt, i) => (
                  <span key={i} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-md">{alt}</span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {result.menu.map((dayPlan, idx) => (
                <div key={idx}>
                  <h4 className="font-bold text-slate-900 border-b pb-2 mb-3">{dayPlan.day}-KUN</h4>
                  <div className="grid gap-3">
                    {dayPlan.meals.map((meal, mIdx) => (
                      <div key={mIdx} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                         <div>
                           <span className="text-xs text-slate-500 font-medium">{meal.mealTime}</span>
                           <h5 className="font-bold text-slate-800">{meal.foodName}</h5>
                           <p className="text-xs text-slate-500">{meal.portionG}g • {meal.calories} kcal</p>
                           <p className="text-xs text-slate-600 mt-1 italic">{meal.advice}</p>
                         </div>
                         <div className="text-right hidden sm:block">
                           <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-sm font-semibold">{meal.estimatedCostUZS.toLocaleString()} UZS</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

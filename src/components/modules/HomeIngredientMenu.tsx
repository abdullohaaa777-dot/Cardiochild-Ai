import React, { useState } from 'react';
import { generateMenuFromHomeIngredients } from '../../services/ai';
import { addStorageItem } from '../../services/storage';
import { Child, HomeIngredientMenu as HomeIngredientMenuType } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function HomeIngredientMenu({ child }: { child: Child }) {
  const [ingredients, setIngredients] = useState('');
  const [methods, setMethods] = useState('');
  const [mealTime, setMealTime] = useState('Tushlik');
  const [notes, setNotes] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HomeIngredientMenuType | null>(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setIsGenerating(true);
    const splitIngs = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    const splitMets = methods.split(',').map(s => s.trim()).filter(Boolean);
    
    const res = await generateMenuFromHomeIngredients(child, splitIngs, splitMets, mealTime, notes);
    
    if (res) {
      const fullItem: HomeIngredientMenuType = {
        ...res,
        id: generateId(),
        childId: child.id,
        ingredients: splitIngs,
        cookingMethods: splitMets,
        mealTime,
        createdAt: new Date().toISOString()
      };
      addStorageItem('homeIngredientMenus', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Uyda bor mahsulotlardan menyu</h2>
        
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mavjud mahsulotlar (vergul bilan)</label>
            <input type="text" value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Kartoshka, sabzi, ozgina tovuq go'shti, guruch..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ovqatlanish vaqti</label>
              <select value={mealTime} onChange={e => setMealTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl">
                <option value="Nonushta">Nonushta</option>
                <option value="Tushlik">Tushlik</option>
                <option value="Kechki ovqat">Kechki ovqat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pishirish usuli imkoniyatlari</label>
              <input type="text" value={methods} onChange={e => setMethods(e.target.value)} placeholder="Qaynatish, pechda" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Qo'shimcha izohlar</label>
             <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Qo'shimcha..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !ingredients.trim()}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isGenerating ? "Menyu tuzilmoqda..." : "Menyu ko'rish"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-900 p-6 border-b border-slate-100">Tavsiya etilgan menyu variantlari</h3>
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">{result.parentAdvice}</p>
            <div className="space-y-4">
              {result.generatedMenu.map((meal, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-slate-900">{meal.foodName}</h4>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${meal.suitability === 'mos' ? 'bg-green-100 text-green-700' : meal.suitability === 'ehtiyot' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {meal.suitability}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Masalliqlar: {meal.usedIngredients.join(', ')}</p>
                  <p className="text-sm text-slate-500 mb-4">Usul: {meal.cookingMethod}</p>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4 text-xs text-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <div className="text-slate-400 mb-1">Porsiya</div>
                      <div className="font-bold text-slate-800">{meal.portionG}g</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <div className="text-slate-400 mb-1">Kaloriya</div>
                      <div className="font-bold text-slate-800">{meal.calories}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <div className="text-slate-400 mb-1">Tuz</div>
                      <div className="font-bold text-slate-800">{meal.sodiumMg}mg</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <div className="text-slate-400 mb-1">Oqsil</div>
                      <div className="font-bold text-slate-800">{meal.proteinG}g</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm border border-blue-100">
                     <span className="font-semibold">Tavsiya:</span> {meal.advice}
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

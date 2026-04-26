import React, { useState, useEffect } from 'react';
import { analyzeFluidBalance } from '../../services/ai';
import { addStorageItem, getOrCreateTodayLog, saveDailyLog } from '../../services/storage';
import { Child, FluidBalanceLog } from '../../types';
import { generateId } from '../../lib/utils';
import { RefreshCw, Droplet } from 'lucide-react';

export default function FluidBalanceModule({ child }: { child: Child }) {
  const [fluidName, setFluidName] = useState('');
  const [amountMl, setAmountMl] = useState(200);
  const [items, setItems] = useState<any[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const todayLog = getOrCreateTodayLog(child.id);
    setItems(todayLog.consumedFluids || []);
  }, [child.id]);

  const handleAddFluid = () => {
      if(!fluidName) return;
      const newItem = { id: generateId(), name: fluidName, amountMl, time: new Date().toLocaleTimeString(), pureWaterMl: amountMl, minerals: [] };
      const newItems = [...items, newItem];
      setItems(newItems);
      
      const todayLog = getOrCreateTodayLog(child.id);
      todayLog.consumedFluids = newItems;
      saveDailyLog(todayLog);
      
      setFluidName('');
      setAmountMl(200);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const res = await analyzeFluidBalance(child, items);
    
    if (res) {
      // Sync detailed analyses back to today's log
      const enrichedItems = items.map(item => {
          const analysis = res.itemAnalyses?.find((a: any) => a.name.includes(item.name) || item.name.includes(a.name));
          if (analysis) {
             return { ...item, pureWaterMl: analysis.pureWaterMl, minerals: analysis.minerals };
          }
          return item;
      });
      setItems(enrichedItems);
      
      const todayLog = getOrCreateTodayLog(child.id);
      todayLog.consumedFluids = enrichedItems;
      saveDailyLog(todayLog);

      const fullItem: FluidBalanceLog = {
        ...res,
        id: generateId(),
        childId: child.id,
        items: enrichedItems,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
      };
      addStorageItem('fluidBalanceLogs', fullItem);
      setResult(fullItem);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Droplet className="text-blue-500 w-5 h-5"/>
          Suyuqlik Balansi AI
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ichimlik/Suyuqlik turi</label>
            <input type="text" value={fluidName} onChange={e => setFluidName(e.target.value)} placeholder="Suv, sho'rva, choy, kola..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Miqdori (ml da)</label>
            <div className="flex gap-2">
                <input type="number" value={amountMl} onChange={e => setAmountMl(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                <button onClick={handleAddFluid} className="px-4 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200">Qo'shish</button>
            </div>
          </div>
        </div>

        <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Bugungi qabul qilingan suyuqliklar (Kunlik nazoratga saqlanadi):</h4>
            {items.length === 0 ? <p className="text-xs text-slate-400">Hali qo'shilmagan.</p> : (
                <ul className="space-y-1">
                    {items.map(i => (
                        <li key={i.id} className="text-sm flex flex-col bg-slate-50 px-3 py-2 rounded-xl mb-2 border border-slate-100">
                            <div className="flex justify-between font-medium">
                                <span>{i.name} <span className="text-slate-400 font-normal text-xs ml-1">({i.time})</span></span>
                                <span className="font-bold text-blue-600">{i.amountMl} ml</span>
                            </div>
                            {i.minerals && i.minerals.length > 0 && (
                                <div className="mt-2 text-xs border-t border-slate-200 pt-2">
                                  <span className="text-slate-500 block">AI Tahlil: Sof suv ~{i.pureWaterMl}ml</span>
                                  <span className="text-slate-500">Minerallar: {i.minerals.map((m:any) => `${m.name}: ${m.amount}`).join(', ')}</span>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || items.length === 0}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Droplet className="w-5 h-5" />}
          {isGenerating ? "Tarkibni internetdan izlash va AI tahlili..." : "AI orqali chuqur tahlil qilish"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-6">
            <div className="text-center mb-6">
                <div className="text-blue-500 text-sm font-semibold mb-1">Jami qabul qilndi</div>
                <div className="text-4xl font-bold text-blue-700">{result.totalMl} <span className="text-lg">ml</span></div>
                <div className="text-slate-500 text-sm mt-1">Kunlik norma: {result.limitMl} ml</div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-4 mb-6 relative overflow-hidden">
                <div className={`h-4 rounded-full ${result.usagePercent > 100 ? 'bg-red-500' : result.usagePercent > 80 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{width: `${Math.min(result.usagePercent, 100)}%`}}></div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 mb-4">
                <span className="font-semibold block mb-1">Ota-onaga maslahat:</span> {result.parentAdvice}
            </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, FileText, ShoppingCart, Wallet, HeartPulse } from 'lucide-react';
import { getChildById, saveDietPlan, getDietPlansByChildId } from '../services/storage';
import { generateDietPlan } from '../services/ai';
import { Child, DietPlan } from '../types';
import { generateId } from '../lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import HomeIngredientMenu from '../components/modules/HomeIngredientMenu';
import BudgetMenuModule from '../components/modules/BudgetMenuModule';
import HealthificationModule from '../components/modules/HealthificationModule';

export default function DietGenerator() {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<Child | null>(null);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [duration, setDuration] = useState<number>(7);
  const [parentNotes, setParentNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'standard' | 'home' | 'budget' | 'health'>('standard');

  useEffect(() => {
    if (childId) {
      const c = getChildById(childId);
      if (c) {
        setChild(c);
        const existingPlans = getDietPlansByChildId(c.id);
        if (existingPlans.length > 0) {
          setPlan(existingPlans[existingPlans.length - 1]);
        }
      } else {
        navigate('/parent');
      }
    }
  }, [childId, navigate]);

  const handleGenerate = async () => {
    if (!child) return;
    setIsGenerating(true);
    setError('');

    const newPlan = await generateDietPlan(child, duration, parentNotes);
    
    if (newPlan) {
      newPlan.id = generateId();
      newPlan.childId = child.id;
      newPlan.duration = duration;
      newPlan.generatedAt = new Date().toISOString();
      
      saveDietPlan(newPlan);
      setPlan(newPlan);
    } else {
      setError("Parhez tuzishda xatolik yuz berdi. Iltimos qayta urining.");
    }
    
    setIsGenerating(false);
  };

  if (!child) return null;

  const macroData = plan ? [
    { name: 'Oqsil', value: plan.macros.protein_g, color: '#3b82f6' },
    { name: "Yog'", value: plan.macros.fat_g, color: '#f59e0b' },
    { name: 'Uglevod', value: plan.macros.carbs_g, color: '#10b981' }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/parent" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">Sun'iy intellekt parhez</h1>
            <p className="text-xs text-slate-500">{child.name} uchun</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b px-4 py-0 flex overflow-x-auto gap-4 hide-scrollbar">
        <button onClick={() => setActiveTab('standard')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'standard' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Standart Menyu
        </button>
        <button onClick={() => setActiveTab('home')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'home' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <ShoppingCart className="w-4 h-4"/> Uy Mahsulotlari
        </button>
        <button onClick={() => setActiveTab('budget')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'budget' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Wallet className="w-4 h-4"/> Byudjet Menyu
        </button>
        <button onClick={() => setActiveTab('health')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'health' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <HeartPulse className="w-4 h-4"/> Sog'lomlashtirish
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {activeTab === 'home' && <HomeIngredientMenu child={child} />}
        {activeTab === 'budget' && <BudgetMenuModule child={child} />}
        {activeTab === 'health' && <HealthificationModule child={child} />}

        {activeTab === 'standard' && (
          <>
            {/* Generation Controls */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Yangi standart parhez yaratish</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="sm:w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Davomiyligi (kun)</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm">
                    <option value={1}>1 kunlik</option>
                    <option value={3}>3 kunlik</option>
                    <option value={7}>7 kunlik</option>
                    <option value={14}>14 kunlik</option>
                    <option value={30}>30 kunlik</option>
                  </select>
                </div>
                <div className="sm:w-2/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qo'shimcha izoh (AI uchun)</label>
                  <input type="text" value={parentNotes} onChange={e => setParentNotes(e.target.value)} placeholder="Masalan: bola nonni yoqtirmaydi..." className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                </div>
              </div>
              
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</div>}
              
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {isGenerating ? "AI o'ylamoqda..." : 'Yangi parhez yaratish'}
              </button>
            </div>

            {/* Display Plan */}
            {plan && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <FileText className="absolute -right-6 -top-6 w-32 h-32 text-white/10" />
                  <h2 className="text-xl font-bold mb-2">AI Parhez xulosasi</h2>
                  <p className="text-indigo-100 text-sm leading-relaxed mb-4 relative z-10">{plan.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="text-indigo-200 text-xs mb-1">Kunlik kaloriya</div>
                      <div className="font-bold text-2xl">{plan.dailyCalories} <span className="text-sm font-normal">kcal</span></div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="text-indigo-200 text-xs mb-1">Tuz cheklovi</div>
                      <div className="font-bold text-xl">{plan.limits.salt_g}g <span className="text-sm font-normal">({plan.limits.sodium_mg}mg)</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Makronutrientlar</h3>
                    <div className="flex items-center">
                      <div className="w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={macroData} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2}>
                              {macroData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 ml-4 flex-1">
                        {macroData.map(m => (
                          <div key={m.name} className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }}></span>
                              <span className="text-slate-600">{m.name}</span>
                            </span>
                            <span className="font-semibold text-slate-900">{m.value}g</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Muhim tavsiyalar
                    </h3>
                     <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 mb-1">Tavsiya qilinadi</h4>
                        <p className="text-sm text-slate-600">{plan.recommendedFoods.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-amber-600 mb-1">Ehtiyot bo'lish kerak</h4>
                        <p className="text-sm text-slate-600">{plan.cautionFoods.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-red-600 mb-1">Qat'iyan cheklanadi</h4>
                        <p className="text-sm text-slate-600">{plan.restrictedFoods.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                   <h3 className="font-bold text-slate-900 p-6 border-b border-slate-100">Tavsiya etilgan menyu</h3>
                   <div className="divide-y divide-slate-100">
                     {plan.meals.map((meal, idx) => (
                       <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                         <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                           <div>
                             <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium mb-2">{meal.time}</span>
                             <h4 className="text-lg font-bold text-slate-900">{meal.foodName}</h4>
                             <p className="text-sm text-slate-500 mt-1">{meal.portion_g}g • {meal.calories} kcal</p>
                           </div>
                           <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-sm border border-emerald-100 md:max-w-xs">
                             <div className="font-medium flex items-center gap-1.5 mb-1"><CheckCircle2 className="w-4 h-4" /> Foydasi</div>
                             {meal.benefit}
                           </div>
                         </div>
                         <div className="mt-4 flex flex-wrap gap-2 text-xs">
                           <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">Oqsil: {meal.protein_g}g</span>
                           <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">Yog': {meal.fat_g}g</span>
                           <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">Ugl: {meal.carbs_g}g</span>
                           <span className={`px-2 py-1 rounded-md ${meal.sodium_mg > 400 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>Tuz: {meal.sodium_mg}mg</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                 <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                    <h3 className="font-bold text-blue-900 mb-2">Ota-ona uchun qisqacha xulosa</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">{plan.parentAdvice}</p>
                 </div>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

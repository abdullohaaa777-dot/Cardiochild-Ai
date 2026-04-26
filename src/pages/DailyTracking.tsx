import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, FileText, Droplet, Activity, RefreshCw, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { getChildById, getDietPlansByChildId, getDailyLogsByChildId, saveDailyLog, getTodayLog } from '../services/storage';
import { analyzeDailySummary } from '../services/ai';
import { Child, DietPlan, DailyLog } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DailyTracking() {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<Child | null>(null);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (childId) {
      const c = getChildById(childId);
      if (c) {
        setChild(c);
        const plans = getDietPlansByChildId(c.id);
        if (plans.length > 0) setPlan(plans[plans.length - 1]);
        
        const todayL = getTodayLog(c.id);
        if (todayL) {
          setLog(todayL);
        } else if (plans.length > 0) {
          // Empty dummy log if none
          const dummy: DailyLog = {
            id: 'dummy',
            childId: c.id,
            date: new Date().toISOString(),
            consumedMeals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            totalSodium: 0,
            totalFluid: 0,
          }
          setLog(dummy);
        }
      } else {
        navigate('/parent');
      }
    }
  }, [childId, navigate]);

  const handleFetchAiSummary = async () => {
    if (!child || !log || isAnalyzing) return;
    setIsAnalyzing(true);
    const summary = await analyzeDailySummary(child, log);
    if (summary) {
      const updatedLog = { ...log, aiFeedback: summary };
      if (log.id !== 'dummy') {
        saveDailyLog(updatedLog);
      }
      setLog(updatedLog);
    }
    setIsAnalyzing(false);
  };

  if (!child || !plan || !log) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl border">
          <p className="text-slate-600 mb-4">Ushbu bola uchun hali parhez tuzilmagan.</p>
          <Link to={`/diet/${childId}`} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600">Parhez tuzish</Link>
        </div>
      </div>
    );
  }

  const caloriePercent = Math.min(100, Math.round((log.totalCalories / plan.dailyCalories) * 100));
  const sodiumPercent = Math.min(100, Math.round((log.totalSodium / plan.limits.sodium_mg) * 100));

  const macroData = [
    { name: 'Oqsil', Maqsad: plan.macros.protein_g, Iste_mol: log.totalProtein },
    { name: "Yog'", Maqsad: plan.macros.fat_g, Iste_mol: log.totalFat },
    { name: 'Uglevod', Maqsad: plan.macros.carbs_g, Iste_mol: log.totalCarbs },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-lg text-slate-900 leading-tight">Kunlik nazorat</h1>
          <p className="text-xs text-slate-500">Bugun</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Main Rings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-slate-100"><div className="h-full bg-red-500" style={{width: `${caloriePercent}%`}}></div></div>
            <Activity className="w-6 h-6 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-slate-900">{log.totalCalories}</div>
            <div className="text-xs text-slate-500 mb-1">/ {plan.dailyCalories} kcal qabul qilindi</div>
            <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mt-1">{caloriePercent}%</div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute top-0 w-full h-1 bg-slate-100"><div className={`h-full ${sodiumPercent > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${sodiumPercent}%`}}></div></div>
            <Droplet className="w-6 h-6 text-emerald-500 mb-2" />
            <div className="text-2xl font-bold text-slate-900">{log.totalSodium}</div>
            <div className="text-xs text-slate-500 mb-1">/ {plan.limits.sodium_mg} mg natriy</div>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-md mt-1 bg-emerald-50 text-emerald-600">{sodiumPercent}%</div>
          </div>
        </div>

        {/* Consumed Meals List */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Bugungi iste'mol ro'yxati</h2>
          {log.consumedMeals.length > 0 ? (
            <div className="space-y-4">
              {log.consumedMeals.map((meal, index) => (
                <div key={index} className="flex flex-col gap-2 p-4 rounded-xl border bg-slate-50 border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{meal.foodName}</h3>
                      <p className="text-xs text-slate-500">
                        {meal.timestamp 
                          ? new Date(meal.timestamp).toLocaleString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : meal.time}
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-white px-3 py-1 rounded-lg border text-slate-700 shadow-sm">{meal.portion_g}g</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 mt-2">
                    <span className="font-medium bg-slate-200/50 px-2 py-0.5 rounded text-slate-700">{meal.calories} kcal</span>
                    <span><span className="text-slate-400">Oqsil:</span> {meal.protein_g}g</span>
                    <span><span className="text-slate-400">Yog':</span> {meal.fat_g}g</span>
                    <span><span className="text-slate-400">Ugl:</span> {meal.carbs_g}g</span>
                    <span className={meal.sodium_mg > 400 ? 'text-red-500 font-semibold' : ''}><span className={meal.sodium_mg > 400 ? 'text-red-400' : 'text-slate-400'}>Tuz:</span> {meal.sodium_mg}mg</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-slate-500 flex items-center justify-center h-24 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Hali ovqat kiritilmagan.
            </p>
          )}

          {/* Consumed Fluids */}
          {(log.consumedFluids && log.consumedFluids.length > 0) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Ichilgan suyuqliklar</h3>
              <div className="space-y-2">
                 {log.consumedFluids.map((fluid, i) => (
                    <div key={i} className="flex flex-col text-sm bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                        <div className="flex justify-between font-medium">
                            <span>{fluid.name} <span className="text-blue-500 font-normal ml-1">({fluid.time})</span></span>
                            <span className="font-bold text-blue-700">{fluid.amountMl} ml</span>
                        </div>
                        {fluid.pureWaterMl && (
                           <div className="text-xs text-slate-500 mt-1">AI Tahlil: {fluid.pureWaterMl}ml sof suv</div>
                        )}
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {(log.symptoms && log.symptoms.length > 0) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Simptomlar</h3>
              <div className="space-y-2">
                 {log.symptoms.map((symp, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                        <span className="font-semibold text-amber-900">{symp.name} <span className="text-amber-600/70 font-normal ml-1">({symp.time})</span></span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${symp.severity === 'severe' ? 'bg-red-100 text-red-600' : symp.severity === 'moderate' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}>
                           {symp.severity}
                        </span>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {(log.medications && log.medications.length > 0) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Ichilgan dorilar</h3>
              <div className="space-y-2">
                 {log.medications.map((med, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <span className="font-medium text-emerald-900">{med.name}</span>
                        <span className="text-emerald-700 font-bold">{med.time}</span>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="font-bold text-slate-900 mb-6">Makronutrientlar</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macroData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="Maqsad" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Iste_mol" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Minerals & Vitamins */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Minerallar va Vitaminlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border">
              <div className="text-xs text-slate-500 font-medium mb-1">Kaliy</div>
              <div className="font-semibold text-slate-900">{log.totalPotassium || 0} mg</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border">
              <div className="text-xs text-slate-500 font-medium mb-1">Kalsiy</div>
              <div className="font-semibold text-slate-900">{log.totalCalcium || 0} mg</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border">
              <div className="text-xs text-slate-500 font-medium mb-1">Magniy</div>
              <div className="font-semibold text-slate-900">{log.totalMagnesium || 0} mg</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border">
              <div className="text-xs text-slate-500 font-medium mb-1">Temir</div>
              <div className="font-semibold text-slate-900">{log.totalIron || 0} mg</div>
            </div>
          </div>
          {log.consumedVitamins && log.consumedVitamins.length > 0 && (
            <div className="mt-2 text-sm text-slate-700 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
              <span className="font-semibold">Vitaminlar:</span> {log.consumedVitamins.join(', ')}
            </div>
          )}
        </div>

        {/* Daily Summary */}
         <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Bugungi xulosa (AI)
            </h2>
            <button onClick={handleFetchAiSummary} disabled={isAnalyzing} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 flex items-center gap-1">
              {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Tahlil qildirish
            </button>
          </div>
          
          {log.aiFeedback ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  log.aiFeedback.status.toLowerCase().includes('ajoyib') ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  log.aiFeedback.status.toLowerCase().includes('yaxshi') ? 'bg-blue-50 border-blue-100 text-blue-800' :
                  log.aiFeedback.status.toLowerCase().includes('ehtiyot') ? 'bg-amber-50 border-amber-100 text-amber-800' :
                  'bg-red-50 border-red-100 text-red-800'
              }`}>
                {log.aiFeedback.status.toLowerCase().includes('yaxshi') || log.aiFeedback.status.toLowerCase().includes('ajoyib') ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : 
                 log.aiFeedback.status.toLowerCase().includes('ehtiyot') ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : 
                 <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-bold mb-1 capitalize">{log.aiFeedback.status}</p>
                  <p className="text-sm opacity-90">{log.aiFeedback.consequences}</p>
                </div>
              </div>
              
              {log.aiFeedback.recommendations.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Keyingi tavsiyalar:</h4>
                  <ul className="space-y-1">
                    {log.aiFeedback.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-indigo-500">•</span> {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-center text-slate-500 bg-slate-50 p-6 rounded-xl border border-slate-100 border-dashed">
              Hali bugungi natijalar AI tomonidan tahlil qilinmagan. Yuqoridagi tugmani bosing.
            </p>
          )}
        </div>

      </main>
    </div>
  );
}

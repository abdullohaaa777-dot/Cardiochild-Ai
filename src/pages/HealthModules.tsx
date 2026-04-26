import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Refrigerator, Activity, Droplet, Pill, PieChart } from 'lucide-react';
import { getChildById } from '../services/storage';
import { Child } from '../types';

import SafePortionModule from '../components/modules/SafePortionModule';
import SaltRiskModule from '../components/modules/SaltRiskModule';
import FluidBalanceModule from '../components/modules/FluidBalanceModule';
import SymptomFoodModule from '../components/modules/SymptomFoodModule';
import DrugFoodModule from '../components/modules/DrugFoodModule';

export default function HealthModules() {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<Child | null>(null);
  const [activeTab, setActiveTab] = useState<'portion' | 'salt' | 'fluid' | 'symptom' | 'drug'>('portion');

  useEffect(() => {
    if (childId) {
      const c = getChildById(childId);
      if (c) {
        setChild(c);
      } else {
        navigate('/parent');
      }
    }
  }, [childId, navigate]);

  if (!child) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/parent" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">Maxsus AI Modullar</h1>
            <p className="text-xs text-slate-500">{child.name} uchun</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b px-4 py-0 flex overflow-x-auto gap-4 hide-scrollbar">
        <button onClick={() => setActiveTab('portion')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'portion' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <PieChart className="w-4 h-4"/> Xavfsiz Porsiya
        </button>
        <button onClick={() => setActiveTab('salt')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'salt' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Refrigerator className="w-4 h-4"/> Tuz Radari
        </button>
        <button onClick={() => setActiveTab('fluid')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'fluid' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Droplet className="w-4 h-4"/> Suyuqlik
        </button>
        <button onClick={() => setActiveTab('symptom')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'symptom' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Activity className="w-4 h-4"/> Simptom Tahlili
        </button>
        <button onClick={() => setActiveTab('drug')} className={`shrink-0 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'drug' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Pill className="w-4 h-4"/> Dori-Ovqat Mosligi
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'portion' && <SafePortionModule child={child} />}
        {activeTab === 'salt' && <SaltRiskModule child={child} />}
        {activeTab === 'fluid' && <FluidBalanceModule child={child} />}
        {activeTab === 'symptom' && <SymptomFoodModule child={child} />}
        {activeTab === 'drug' && <DrugFoodModule child={child} />}
      </main>
    </div>
  );
}

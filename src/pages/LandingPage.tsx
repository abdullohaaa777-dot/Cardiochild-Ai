import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Camera, ListChecks, ShieldCheck, Activity } from 'lucide-react';
import React, { useEffect } from 'react';
import { getCurrentUser } from '../services/storage';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'parent') {
        navigate('/parent');
      } else {
        navigate('/doctor');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <HeartPulse className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">CardioChild AI Diet</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-full border">
            <Link to="/auth?role=parent" className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Ota-ona kirish</Link>
            <Link to="/auth?role=doctor" className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors border-l border-slate-300">Shifokor kirish</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Sun'iy intellekt yordamchi
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl">
            Yurak kasalligi bor bolalar uchun <span className="text-red-500">shaxsiy parhez nazorati</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            Bola ma'lumotlari, tashxisi va ovqatlanish holatiga qarab AI individual menyu, kaloriya, vitamin-mineral tahlil va xavfsiz ovqatlanish tavsiyalarini beradi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth?role=parent" className="px-8 py-3.5 bg-red-500 text-white rounded-full font-medium shadow-lg shadow-red-500/30 hover:bg-red-600 hover:-translate-y-0.5 transition-all">
              Ota-ona sifatida boshlash
            </Link>
            <Link to="/auth?role=doctor" className="px-8 py-3.5 bg-white text-slate-700 rounded-full font-medium border shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
              Shifokor sifatida kirish
            </Link>
          </div>
        </div>
        {/* Background gradient blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-400/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Nega CardioChild AI Diet?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Eng oxirgi texnologiyalar farzandingiz sog'lig'i xizmatida. Bizning maqsadimiz ota-onalar va shifokorlarga qulaylik yaratish.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<ListChecks className="text-blue-500 w-6 h-6" />}
              title="Individual parhez"
              desc="Tashxis, yosh, va cheklovlarga asoslangan moslashtirilgan o'zbek va xalqaro taomlar."
              color="bg-blue-50"
            />
            <FeatureCard 
              icon={<Camera className="text-emerald-500 w-6 h-6" />}
              title="Kamera tahlili"
              desc="Ovqat rasmini oling va uning kaloriyasi hamda bolaga mosligini AI yordamida tezkor biling."
              color="bg-emerald-50"
            />
            <FeatureCard 
              icon={<Activity className="text-amber-500 w-6 h-6" />}
              title="Kunlik nazorat"
              desc="Protein, yog', uglevod va asosiysi - tuz va suyuqlik miqdorini har kuni nazorat qiling."
              color="bg-amber-50"
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-purple-500 w-6 h-6" />}
              title="Tibbiy ishonch"
              desc="Asosiy yurak-qon tomir kasalliklari inobatga olingan holda ishlaydi. Shifokor bilan integratsiya."
              color="bg-purple-50"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

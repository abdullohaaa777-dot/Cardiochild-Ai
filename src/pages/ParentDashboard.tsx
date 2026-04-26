import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus, User, FileText, Camera, Activity, Calendar, HeartPulse } from 'lucide-react';
import { getCurrentUser, getChildrenByParentId, logoutUser, getDietPlansByChildId } from '../services/storage';
import { Child, User as UserType } from '../types';

export default function ParentDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setChildren(getChildrenByParentId(currentUser.id));
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-slate-900 hidden sm:block">CardioChild</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Salom, {user.name}</span>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mening farzandlarim</h1>
            <p className="text-slate-500 text-sm mt-1">Parhez va ovqatlanishni nazorat qiling</p>
          </div>
          <Link to="/child/new" className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Farzand qo'shish</span>
          </Link>
        </div>

        {children.length === 0 ? (
          <div className="text-center bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Farzandlar ro'yxati bo'sh</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Parhez rejasini tuzish va nazoratni boshlash uchun farzandingiz ma'lumotlarini kiriting.</p>
            <Link to="/child/new" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" />
              Yangi profil yaratish
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {children.map(child => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const ChildCard: React.FC<{ child: Child }> = ({ child }) => {
  const plans = getDietPlansByChildId(child.id);
  const activePlan = plans[plans.length - 1]; // simplifying: using latest plan

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
            {child.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{child.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{child.primaryDiagnosis}</p>
          </div>
        </div>
        <Link to={`/child/${child.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
          Profilni tahrirlash
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="text-sm">
          <span className="text-slate-500 block text-xs mb-0.5">Yoshi</span>
          <span className="font-medium text-slate-900">{new Date().getFullYear() - new Date(child.birthDate).getFullYear()} yosh</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-500 block text-xs mb-0.5">Tuz/Suyuqlik</span>
          <span className="font-medium flex items-center gap-1">
            {child.saltRestriction ? <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> : <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
            Cheklov {(child.saltRestriction || child.fluidRestriction) ? 'bor' : "yo'q"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-auto text-sm">
        <Link to={`/diet/${child.id}`} className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 p-3 rounded-xl hover:bg-indigo-100 transition-colors">
          <FileText className="w-5 h-5" />
          <span className="font-medium text-xs text-center">Parhez tuzish</span>
        </Link>
        <Link to={`/camera/${child.id}`} className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 p-3 rounded-xl hover:bg-emerald-100 transition-colors">
          <Camera className="w-5 h-5" />
          <span className="font-medium text-xs text-center">Rasm tahlili</span>
        </Link>
        <Link to={`/tracking/${child.id}`} className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-amber-50 text-amber-700 p-3 rounded-xl hover:bg-amber-100 transition-colors">
          <Activity className="w-5 h-5" />
          <span className="font-medium text-xs text-center">Kunlik nazorat</span>
        </Link>
        <Link to={`/modules/${child.id}`} className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-red-50 text-red-700 p-3 rounded-xl hover:bg-red-100 transition-colors">
          <HeartPulse className="w-5 h-5" />
          <span className="font-medium text-xs text-center">Maxsus modullar</span>
        </Link>
      </div>
    </div>
  );
}

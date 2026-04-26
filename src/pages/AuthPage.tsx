import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { getUsers, saveUser, setCurrentUser, getCurrentUser } from '../services/storage';
import { generateId } from '../lib/utils';
import { Role } from '../types';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as Role) || 'parent';
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(defaultRole);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate(user.role === 'parent' ? '/parent' : '/doctor');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = getUsers();

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password && u.role === role);
      if (user) {
        setCurrentUser(user);
        navigate(user.role === 'parent' ? '/parent' : '/doctor');
      } else {
        setError("Email, parol yoki rol noto'g'ri.");
      }
    } else {
      if (!name || !email || !password) {
        setError("Barcha maydonlarni to'ldiring");
        return;
      }
      if (users.find(u => u.email === email)) {
        setError("Bu email allaqachon ro'yxatdan o'tgan");
        return;
      }

      const newUser = {
        id: generateId(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
      };
      
      saveUser(newUser);
      setCurrentUser(newUser);
      navigate(newUser.role === 'parent' ? '/parent' : '/doctor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
            <HeartPulse className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">CardioChild AI Diet</span>
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          {isLogin ? 'Hisobga kirish' : "Ro'yxatdan o'tish"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To'liq ism</label>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email manzil</label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parol</label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-slate-700 mb-2">Rolingizni tanlang</legend>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  border rounded-xl px-4 py-3 cursor-pointer text-center transition-all
                  ${role === 'parent' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}>
                  <input type="radio" className="sr-only" name="role" value="parent" checked={role === 'parent'} onChange={() => setRole('parent')} />
                  <span className="font-medium text-sm">Ota-ona</span>
                </label>
                <label className={`
                  border rounded-xl px-4 py-3 cursor-pointer text-center transition-all
                  ${role === 'doctor' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}>
                  <input type="radio" className="sr-only" name="role" value="doctor" checked={role === 'doctor'} onChange={() => setRole('doctor')} />
                  <span className="font-medium text-sm">Shifokor</span>
                </label>
              </div>
            </fieldset>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${role === 'doctor' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'}`}
              >
                {isLogin ? 'Kirish' : "Ro'yxatdan o'tish"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {isLogin ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Kirish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

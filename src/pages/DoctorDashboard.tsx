import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Users, Search, Activity, HeartPulse } from 'lucide-react';
import { getCurrentUser, getChildren, logoutUser, getDietPlans } from '../services/storage';
import { Child, User as UserType } from '../types';

export default function DoctorDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [patients, setPatients] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // In MVP, doctor sees all children in the system. 
      // In a real app, there would be a link mechanism.
      setPatients(getChildren());
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <HeartPulse className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 hidden sm:block">Shifokor Paneli</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-right hidden sm:block">
            <div className="font-medium text-slate-900">Dr. {user.name}</div>
            <div className="text-xs text-slate-500">Kardiolog</div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border p-4 shadow-sm sticky top-24">
            <h2 className="font-semibold text-slate-900 mb-4 px-2">Menyu</h2>
            <nav className="space-y-1">
              <Link to="/doctor" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm">
                <Users className="w-5 h-5" />
                Mening bemorlarim
              </Link>
            </nav>
            <div className="mt-8 border-t border-slate-100 pt-6 px-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Statistika</div>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{patients.length}</div>
                  <div className="text-sm text-slate-500">Jami bemorlar</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-xl font-bold text-slate-900">Bemorlar ro'yxati</h1>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Ism yoki tashxis bo'yicha izlash..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Bemor</th>
                    <th className="px-6 py-4">Tashxis</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-500">
                        Bemorlar topilmadi
                      </td>
                    </tr>
                  ) : filteredPatients.map(patient => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{patient.name}</div>
                        <div className="text-xs text-slate-500">{new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} yosh</div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-slate-600">
                        {patient.primaryDiagnosis}
                      </td>
                      <td className="px-6 py-4">
                        {(patient.saltRestriction || patient.fluidRestriction) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Cheklovlar bor
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Oddiy parhez
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {/* Shifokor uchun hozircha tracking dashboardiga havola */}
                        <Link to={`/tracking/${patient.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Batafsil</Link>
                        <Link to={`/modules/${patient.id}`} className="text-red-600 hover:text-red-800 font-medium">Analitika/Modullar</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

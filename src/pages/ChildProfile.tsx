import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getCurrentUser, getChildById, addChild, updateChild } from '../services/storage';
import { Child, ChildLabs } from '../types';
import { generateId } from '../lib/utils';

const diagnosesOptions = [
  "Tug'ma yurak nuqsoni",
  "Yurak yetishmovchiligi",
  "Arterial gipertenziya",
  "Aritmiya",
  "Revmatik yurak kasalligi",
  "Kardiomiopatiya",
  "Yurak operatsiyasidan keyingi holat",
  "Semizlik bilan bog'liq yurak-qon tomir xavfi",
  "Boshqa"
];

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [formData, setFormData] = useState<Partial<Child>>({
    gender: 'Male',
    activityLevel: 'Medium',
    primaryDiagnosis: diagnosesOptions[0]
  });
  const [labs, setLabs] = useState<ChildLabs>({});
  const [otherDiagnosis, setOtherDiagnosis] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      const child = getChildById(id);
      if (child) {
        setFormData(child);
        if (child.labs) setLabs(child.labs);
        if (!diagnosesOptions.includes(child.primaryDiagnosis)) {
          setFormData(prev => ({...prev, primaryDiagnosis: 'Boshqa'}));
          setOtherDiagnosis(child.primaryDiagnosis);
        }
      } else {
        navigate('/parent');
      }
    }
  }, [id, isNew, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLabs(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const finalDiagnosis = formData.primaryDiagnosis === 'Boshqa' ? otherDiagnosis : formData.primaryDiagnosis;

    const childData: Child = {
      id: isNew ? generateId() : (formData.id as string),
      parentId: isNew ? user.id : (formData.parentId as string),
      name: formData.name!,
      birthDate: formData.birthDate!,
      gender: formData.gender as 'Male'|'Female',
      height: Number(formData.height),
      weight: Number(formData.weight),
      disabilityType: formData.disabilityType || "Yo'q",
      primaryDiagnosis: finalDiagnosis!,
      optionalDiseases: formData.optionalDiseases,
      allergies: formData.allergies,
      medications: formData.medications,
      doctorAdvice: formData.doctorAdvice,
      activityLevel: formData.activityLevel as 'Low'|'Medium'|'High',
      fluidRestriction: formData.fluidRestriction,
      saltRestriction: formData.saltRestriction,
      labs: Object.keys(labs).length > 0 ? labs : undefined,
      createdAt: isNew ? new Date().toISOString() : (formData.createdAt as string)
    };

    if (isNew) {
      addChild(childData);
    } else {
      updateChild(childData);
    }
    navigate('/parent');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/parent" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg text-slate-900">{isNew ? 'Yangi profil' : 'Profilni tahrirlash'}</h1>
        </div>
        <button onClick={handleSubmit} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
          <Save className="w-4 h-4" />
          Saqlash
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form id="child-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Asosiy */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Shaxsiy ma'lumotlar</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ism <span className="text-red-500">*</span></label>
                <input type="text" required name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tug'ilgan sana <span className="text-red-500">*</span></label>
                <input type="date" required name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jinsi <span className="text-red-500">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm">
                  <option value="Male">O'g'il</option>
                  <option value="Female">Qiz</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bo'y (cm) <span className="text-red-500">*</span></label>
                  <input type="number" required name="height" value={formData.height || ''} onChange={handleChange} placeholder="120" className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vazn (kg) <span className="text-red-500">*</span></label>
                  <input type="number" required step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} placeholder="25.5" className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Medical */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Tibbiy ma'lumotlar</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Asosiy tashxis <span className="text-red-500">*</span></label>
                <select name="primaryDiagnosis" value={formData.primaryDiagnosis} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm">
                  {diagnosesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {formData.primaryDiagnosis === 'Boshqa' && (
                  <input type="text" placeholder="Tashxisni kiriting" value={otherDiagnosis} onChange={e => setOtherDiagnosis(e.target.value)} required className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nogironlik turi <span className="text-red-500">*</span></label>
                <input type="text" required name="disabilityType" placeholder="Masalan: 2-guruh, DA" value={formData.disabilityType || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qo'shimcha kasalliklar</label>
                <input type="text" name="optionalDiseases" value={formData.optionalDiseases || ''} onChange={handleChange} placeholder="Ixtiyoriy" className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Allergiyalar</label>
                <input type="text" name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="Sut, yong'oq..." className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Doimiy dorilar</label>
                <input type="text" name="medications" value={formData.medications || ''} onChange={handleChange} placeholder="Veroshpiron, Digoksin..." className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
            </div>
          </section>

          {/* Section 3: Restrictions */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Parhez cheklovlari va faollik</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tuz cheklovi</label>
                <input type="text" name="saltRestriction" value={formData.saltRestriction || ''} onChange={handleChange} placeholder="Masalan: kuniga 2 grammgacha" className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Suyuqlik cheklovi</label>
                <input type="text" name="fluidRestriction" value={formData.fluidRestriction || ''} onChange={handleChange} placeholder="Masalan: kuniga 800ml gacha" className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Jismoniy faollik darajasi</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm">
                  <option value="Low">Past (Asoan yotadi yoki kam harakat)</option>
                  <option value="Medium">O'rta (Uy ichida harakatlanadi)</option>
                  <option value="High">Yuqori (Faol, maktab/bog'chaga boradi)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 4: Labs (Optional) */}
          <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="border-b pb-2 mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-slate-900">Laborator tahlillar</h2>
              <span className="text-xs text-slate-500">Ixtiyoriy (AI aniqligi uchun tavsiya etiladi)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gemoglobin (g/L)</label>
                <input type="number" name="hemoglobin" value={labs.hemoglobin || ''} onChange={handleLabChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kaliy (mmol/L)</label>
                <input type="number" step="0.1" name="potassium" value={labs.potassium || ''} onChange={handleLabChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Natriy (mmol/L)</label>
                <input type="number" name="sodium" value={labs.sodium || ''} onChange={handleLabChange} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm" />
              </div>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

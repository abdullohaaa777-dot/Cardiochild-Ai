import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert, Video, XCircle } from 'lucide-react';
import { getChildById, saveFoodAnalysis, addFoodToDailyLog } from '../services/storage';
import { analyzeFoodImage } from '../services/ai';
import { Child, FoodAnalysis } from '../types';
import { generateId } from '../lib/utils';

export default function CameraAnalysis() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveAnalysisRef = useRef<boolean>(false);
  
  const [child, setChild] = useState<Child | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState('');
  
  type ViewMode = 'idle' | 'photo' | 'live' | 'result';
  const [viewMode, setViewMode] = useState<ViewMode>('idle');

  useEffect(() => {
    if (childId) {
      const c = getChildById(childId);
      if (c) setChild(c);
      else navigate('/parent');
    }
  }, [childId, navigate]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = async (mode: 'photo' | 'live') => {
    try {
      setError('');
      setAnalysis(null);
      setImageSrc(null);
      setViewMode(mode);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (mode === 'live') {
        liveAnalysisRef.current = true;
        setTimeout(() => runLiveAnalysisLoop(), 1000);
      }
    } catch (err) {
      console.error(err);
      setError("Kameraga ruxsat berilmadi yoki qurilmada kamera yo'q.");
      setViewMode('idle');
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  const handleCapturePhoto = async () => {
    const base64 = captureFrame();
    if (base64) {
      stopCamera();
      setImageSrc(base64);
      setViewMode('result');
      await startAnalysis(base64, true);
    }
  };

  const runLiveAnalysisLoop = async () => {
    if (!liveAnalysisRef.current || !child) return;
    
    setIsAnalyzing(true);
    const base64 = captureFrame();
    if (base64) {
      const result = await analyzeFoodImage(child, base64);
      if (result && liveAnalysisRef.current) {
        const fullAnalysis: FoodAnalysis = {
          ...result,
          id: generateId(),
          childId: child.id,
          image: base64,
          createdAt: new Date().toISOString()
        };
        setAnalysis(fullAnalysis);
      }
    }
    setIsAnalyzing(false);

    if (liveAnalysisRef.current) {
      setTimeout(runLiveAnalysisLoop, 3000); // Analyze every 3 seconds
    }
  };

  const stopLiveAnalysis = () => {
    liveAnalysisRef.current = false;
    stopCamera();
    setViewMode('idle');
    setAnalysis(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setViewMode('result');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageSrc(base64);
      setAnalysis(null);
      await startAnalysis(base64, true);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64: string, shouldSave = false) => {
    if (!child) return;
    setIsAnalyzing(true);
    setError('');

    const result = await analyzeFoodImage(child, base64);
    if (result) {
      const fullAnalysis: FoodAnalysis = {
        ...result,
        id: generateId(),
        childId: child.id,
        image: base64,
        createdAt: new Date().toISOString()
      };
      setAnalysis(fullAnalysis);
      if (shouldSave) {
        saveFoodAnalysis(fullAnalysis);
      }
    } else {
      setError("Suratni tahlil qilishda xatolik yuz berdi. Iltimos qayta urining.");
      setViewMode('idle');
    }
    setIsAnalyzing(false);
  };

  const cancelAndGoBack = () => {
    stopCamera();
    liveAnalysisRef.current = false;
    setViewMode('idle');
    setAnalysis(null);
    setImageSrc(null);
  };

  const handleAte = () => {
    if (child && analysis) {
      addFoodToDailyLog(child.id, analysis);
      navigate(`/tracking/${child.id}`);
    }
  };

  if (!child) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onClick={() => {
          stopCamera();
          liveAnalysisRef.current = false;
          navigate('/parent');
        }} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-lg text-slate-900 leading-tight">Ovqat tahlili</h1>
          <p className="text-xs text-slate-500">{child.name}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        
        {error && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 mb-6"><AlertCircle className="shrink-0 w-5 h-5" /> {error}</div>}

        {/* View Mode: Idle */}
        {viewMode === 'idle' && (
          <div className="bg-white rounded-2xl border p-8 shadow-sm text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <Camera className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Ovqatni tahlil qilish</h2>
            <p className="text-slate-500 text-sm max-w-sm mb-4">
              AI yordamida ovqat tarkibi va farzandingizga mosligini aniqlang. O'zingizga qulay usulni tanlang.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                <Upload className="w-5 h-5" />
                Rasmni yuklash
              </button>

              <button onClick={() => startCamera('photo')} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                <Camera className="w-5 h-5" />
                Kamera (Rasmga olish)
              </button>

              <button onClick={() => startCamera('live')} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-500/20">
                <Video className="w-5 h-5" />
                Jonli tahlil (Video)
              </button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* View Mode: Photo or Live (Camera is active) */}
        {(viewMode === 'photo' || viewMode === 'live') && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-sm border bg-black flex flex-col">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-[60vh] object-cover"
              />
              
              {/* Overlays */}
              <div className="absolute top-4 right-4 z-10">
                <button onClick={cancelAndGoBack} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {viewMode === 'live' && isAnalyzing && !analysis && (
                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 text-sm font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Kuzatilmoqda...
                </div>
              )}

              {/* Live Analysis Compact Result overlayed on video */}
              {viewMode === 'live' && analysis && (
                <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 leading-tight pr-4">{analysis.detectedFood}</h3>
                    <div className={`shrink-0 rounded-full p-1.5 ${
                      analysis.riskLevel === 'green' ? 'bg-emerald-100 text-emerald-600' :
                      analysis.riskLevel === 'yellow' ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {analysis.riskLevel === 'green' ? <CheckCircle2 className="w-4 h-4" /> :
                       analysis.riskLevel === 'yellow' ? <AlertTriangle className="w-4 h-4" /> :
                       <ShieldAlert className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-600 mb-2">
                    <span className="font-medium">{analysis.calories} kcal</span>
                    <span>Tuz: <span className={analysis.minerals.sodium_mg > 400 ? 'text-red-500 font-semibold' : ''}>{analysis.minerals.sodium_mg}mg</span></span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">{analysis.reason}</p>
                </div>
              )}

            </div>

            {/* Controls specific to photo mode */}
            {viewMode === 'photo' && (
               <div className="flex justify-center mt-6">
                 <button onClick={handleCapturePhoto} className="w-16 h-16 rounded-full bg-red-500 border-4 border-white shadow-[0_0_0_2px_rgba(239,68,68,1)] flex items-center justify-center hover:bg-red-600 transition-colors">
                 </button>
               </div>
            )}
            
            {/* Controls specific to live mode */}
            {viewMode === 'live' && (
              <div className="text-center mt-6">
                <button onClick={cancelAndGoBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium pb-1 border-b border-transparent hover:border-slate-300 transition-all">
                  Jonli tahlilni to'xtatish
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Result (After Capture or Upload) */}
        {viewMode === 'result' && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-sm border bg-black">
              {imageSrc && <img src={imageSrc} alt="Food" className="w-full h-auto max-h-[300px] object-contain" />}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <RefreshCw className="w-10 h-10 animate-spin mb-4 text-red-400" />
                  <p className="font-medium animate-pulse">AI ovqatni tahlil qilmoqda...</p>
                </div>
              )}
            </div>

            {analysis && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Risk Notice */}
                <div className={`p-4 rounded-2xl border flex items-start gap-4 ${
                  analysis.riskLevel === 'green' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  analysis.riskLevel === 'yellow' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                  'bg-red-50 border-red-100 text-red-800'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {analysis.riskLevel === 'green' ? <CheckCircle2 className="w-6 h-6" /> :
                     analysis.riskLevel === 'yellow' ? <AlertTriangle className="w-6 h-6" /> :
                     <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">
                      {analysis.suitability === 'mos' ? "Farzandingiz uchun xavfsiz" :
                       analysis.suitability === 'ehtiyot' ? "Ehtiyotkorlik bilan berish mumkin" :
                       "Tavsiya qilinmaydi!"}
                    </h3>
                    <p className="text-sm opacity-90">{analysis.reason}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">{analysis.detectedFood}</h2>
                    <div className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded-lg">~{analysis.estimatedPortion_g}g</div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Kcal</div>
                      <div className="font-semibold text-slate-900">{analysis.calories}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2 border border-blue-100 text-blue-900">
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Oqsil</div>
                      <div className="font-semibold">{analysis.macros.protein_g}g</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2 border border-amber-100 text-amber-900">
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Yog'</div>
                      <div className="font-semibold">{analysis.macros.fat_g}g</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100 text-emerald-900">
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Ugl</div>
                      <div className="font-semibold">{analysis.macros.carbs_g}g</div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Muhim minerallar va Vitaminlar</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Natriy (Tuz)</span>
                        <span className={`font-medium ${analysis.minerals.sodium_mg > 400 ? 'text-red-500' : 'text-slate-900'}`}>{analysis.minerals.sodium_mg} mg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Kaliy</span>
                        <span className="font-medium text-slate-900">{analysis.minerals.potassium_mg} mg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Kalsiy</span>
                        <span className="font-medium text-slate-900">{analysis.minerals.calcium_mg} mg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Magniy</span>
                        <span className="font-medium text-slate-900">{analysis.minerals.magnesium_mg} mg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Temir</span>
                        <span className="font-medium text-slate-900">{analysis.minerals.iron_mg} mg</span>
                      </div>
                    </div>
                    {analysis.vitamins.length > 0 && (
                      <div className="mt-3 text-sm">
                        <span className="hidden">vitamins</span>
                        <p className="text-slate-600"><span className="font-medium text-slate-900">Vitaminlar:</span> {analysis.vitamins.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {analysis.alternativeFoods && analysis.alternativeFoods.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Eng yaxshi muqobillar 🍲</h4>
                      <ul className="space-y-1.5">
                        {analysis.alternativeFoods.map((alt, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Tavsiyalar</h4>
                      <ul className="space-y-1.5">
                        {analysis.recommendations.map((r, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3">
                    <h4 className="text-center text-sm font-medium text-slate-700">Tasdiqlash</h4>
                    <div className="flex gap-3">
                      <button onClick={handleAte} className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Yedim
                      </button>
                      <button onClick={cancelAndGoBack} className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" /> Yemadi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

import { GoogleGenAI } from '@google/genai';
import { 
  Child, DietPlan, FoodAnalysis, DailyLog,
  SafePortionResult, SaltRiskLog, FluidBalanceLog,
  SymptomFoodCorrelation, HealthyFoodTransformation,
  HomeIngredientMenu, BudgetMenu, DrugFoodCompatibility
} from '../types';

// O'zgartirildi: foydalanuvchi bergan API_KEY
// "ulandi api key"
const ai = new GoogleGenAI({ apiKey: 'AIzaSyDoAHwGU8NIuoeWbOsZ41ZgNIykGkd7ETA' });
const model = 'gemini-2.5-flash';


export const generateDietPlan = async (child: Child, duration: number, parentNotes: string = ''): Promise<DietPlan | null> => {
  try {
    const prompt = `
Siz pediatrik kardiologik parhez bo'yicha yordamchi AI tizimsiz. 
Sizga nogironligi bor va yurak-qon tomir kasalligi mavjud bolaning ma'lumotlari berildi:

Bemor: ${child.name}, Yoshi: ${child.birthDate} (tug'ilgan sana), Jinsi: ${child.gender}
Bo'yi: ${child.height} cm, Vazni: ${child.weight} kg
Asosiy tashxis: ${child.primaryDiagnosis}
Nogironlik turi: ${child.disabilityType}
Qo'shimcha kasalliklar: ${child.optionalDiseases || "Yo'q"}
Allergiyalar: ${child.allergies || "Yo'q"}
Qabul qilayotgan dorilari: ${child.medications || 'Kiritilmagan'}
Shifokor tavsiyalari: ${child.doctorAdvice || 'Kiritilmagan'}
Jismoniy faollik darajasi: ${child.activityLevel}
Tuz cheklovi: ${child.saltRestriction || "Yo'q"}
Suyuqlik cheklovi: ${child.fluidRestriction || "Yo'q"}
${child.labs ? `Laborator ma'lumotlari: Hemoglobin: ${child.labs.hemoglobin}, Glucose: ${child.labs.glucose}, Sodium: ${child.labs.sodium}, Potassium: ${child.labs.potassium}` : "Laborator ma'lumotlari mavjud emas."}

Ota-onaning qo'shimcha izohi: ${parentNotes}

Shu ma'lumotlar asosida ${duration} kunlik ehtiyotkor, individual, ota-onaga tushunarli, o'zbek tilidagi ovqatlanish rejasini tizimli tuzing.
Aniq kaloriya, makronutrient, vitamin-mineral va porsiya raqamlarini bering.
Agar ma'lumot yetarli bo'lmasa, xavfsiz taxmin qiling. O'zbek taomlarini ham, sog'lom xalqaro taomlarni ham tavsiya qiling.

Natijani FAKAT VA FAQAT haqiqiy, xatosiz JSON formatda qaytaring (Boshqa izoh yozmang!):
{
  "summary": "Umumiy tushuntirish",
  "dailyCalories": 1500,
  "macros": { "protein_g": 60, "fat_g": 50, "carbs_g": 200 },
  "limits": { "sodium_mg": 1500, "salt_g": 3, "fluid_ml": 1200 },
  "minerals": { "potassium_mg": 2000, "magnesium_mg": 130, "calcium_mg": 800, "iron_mg": 10, "vitaminD_IU": 400 },
  "meals": [
    {
      "time": "Nonushta",
      "foodName": "Suli bo'tqasi va olma",
      "portion_g": 150,
      "calories": 200,
      "protein_g": 5, "fat_g": 3, "carbs_g": 40, "sodium_mg": 50,
      "benefit": "Yurak uchun foydali",
      "caution": "Shakar qo'shmang",
      "alternative": "Loviya va sabzavot"
    }
  ],
  "recommendedFoods": ["Olma", "Qaynatilgan go'sht"],
  "cautionFoods": ["Juda sho'r pishloq"],
  "restrictedFoods": ["Gazli ichimliklar", "Kolbasa"],
  "parentAdvice": "Tuzni minimallashtiring.",
  "doctorSummary": "Kaliy darajasini nazorat qilish kerak."
}
`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as DietPlan;
    }
    return null;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};

export const analyzeDailySummary = async (child: Child, log: DailyLog): Promise<DailyLog['aiFeedback']> => {
  try {
    const prompt = `
Siz bolalar diyetologi va kardiologiya bo'yicha mutaxassis AI tizimisiz.
Bemor ma'lumoti: Ismi: ${child.name}, Yoshi: ${child.birthDate}, Jinsi: ${child.gender}.
Asosiy kasallik: ${child.primaryDiagnosis}. 
Tuz cheklovi: ${child.saltRestriction || "Yo'q"}, Suyuqlik cheklovi: ${child.fluidRestriction || "Yo'q"}.

Bugungi qabul qilingan ozuqalar hisoboti:
Jami kaloriya: ${log.totalCalories}
Oqsil: ${log.totalProtein}g, Yog': ${log.totalFat}g, Uglevod: ${log.totalCarbs}g
Tuz(Natriy): ${log.totalSodium}mg
Minerallar: Kaliy ${log.totalPotassium || 0}mg, Magniy ${log.totalMagnesium || 0}mg, Kalsiy ${log.totalCalcium || 0}mg, Temir ${log.totalIron || 0}mg
Vitaminlar: ${(log.consumedVitamins || []).join(', ') || "Kiritilmagan"}
Iste'mol qilingan ovqatlar: ${log.consumedMeals.map(m => m.foodName).join(', ')}

Suyuqliklar ro'yxati: ${JSON.stringify(log.consumedFluids || [])}
Simptomlar ro'yxati: ${JSON.stringify(log.symptoms || [])}
Qabul qilingan dorilar ro'yxati: ${JSON.stringify(log.medications || [])}

Iltimos, ushbu holatni kompleks (ovqat, suyuqlik, simptom, dori) tahlil qiling. 
Suyuqlik tahlili: Umumiy ichilgan haqiqiy suv miqdorini tahlil qiling. Agar cheklovdan oshib yoki kamayib ketgan bo'lsa xabar bering.
Simptomlar: Yuqorida aytilgan ovqat yoki dorilarga qanday aloqasi borligini va ularning kelib chiqishi nimadan bo'lishini tushuntiring. Agar qaysidir mineral yoki makronutrient (ayniqsa tuz yoki suyuqlik) belgilangan me'yordan oshib ketsa xavfini ogohlantiring. Dorilar bilan ovqatning ziddiyati bo'lsa ayting. 

"status" maydoni: "ajoyib", "yaxshi", "ehtiyot bo'ling" yoki "xavfli yomon oqibatlar chiqishi mumkin"
"consequences" maydonida simptomlar sababi, xatolarni ko'rsatib, nima bo'lishi mumkinligini tushuntiring.
Qat'iy faqat quyidagi JSON formatida javob bering, hech qanday qo'shimcha matn qo'shmang (lekin stringlar ichida istalgancha yozishingiz mumkin):
{
  "status": "yaxshi",
  "consequences": "Suyuqlik va tuz me'yordan oshdi... ",
  "recommendations": ["Tavsiya 1...", "Tavsiya 2..."]
}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...parsed,
        generatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error("AI Error:", error);
  }
  return undefined;
};
export const analyzeFoodImage = async (child: Child, imageBase64: string): Promise<Omit<FoodAnalysis, 'id' | 'childId' | 'createdAt'> | null> => {
  try {
    const prompt = `
Siz xalqaro darajali diyetolog, pediatr va ovqat rasmini tahlil qiluvchi AI tizimsiz. 
Bemor ma'lumoti: Ismi: ${child.name}, Yoshi: ${child.birthDate}, Jinsi: ${child.gender}, Bo'yi: ${child.height}cm, Vazni: ${child.weight}kg.
Asosiy kasallik: ${child.primaryDiagnosis}. 
Qo'shimcha kasalliklar: ${child.optionalDiseases || "Yo'q"}.
Allergiyalar: ${child.allergies || "Yo'q"}.
Tuz cheklovi: ${child.saltRestriction || "Yo'q"}, Suyuqlik cheklovi: ${child.fluidRestriction || "Yo'q"}.
Jismoniy faolligi: ${child.activityLevel}.
Qabul qilayotgan dorilari: ${child.medications || "Yo'q"}.

Rasmda ko'rinayotgan ovqatni batafsil aniqlang, uning taxminiy og'irligini porsiyada ko'rsating.
Ovqatning kaloriya, makronutrientlar (oqsil, yog', uglevod) va muhim minerallar (natriy, kaliy, magniy, kalsiy, temir) hamda vitaminlarini aniq taxminan hisoblab chiqing.

ENG MUHIMI: Bolaning holatiga (yurak kasalliklari, tuz cheklovi, qon bosimi va h.k) qarab bu ovqat mosmi, ehtiyotkorlik talab qiladimi yoki umuman tavsiya qilinmaydimi baholang.
"reason" maydonida Nima uchun mos ekanligini yoki Nima uchun mos emasligini judayam batafsil ota-onaga tushunarli sodda tilda tushuntirib bering (minerallar va kasallikka qarab).
"alternativeFoods" maydonida agar bu ovqat mos kelmasa yoki ozgina ehtiyot bo'lish kerak bo'lsa, buning o'rniga aynan qanday foydali ovqat yoki taom eyish mumkinligini (3-4 ta O'zbek yoki universal taomlar) yozib bering.

Faqat va faqat quyidagi JSON formatda qaytaring (hech qanday markdown, \`\`\`json yoki qo'shimcha matnlarsiz):

{
  "detectedFood": "Osh va salat (Misol)",
  "confidence": 85,
  "estimatedPortion_g": 250,
  "calories": 400,
  "macros": { "protein_g": 15, "fat_g": 20, "carbs_g": 40 },
  "minerals": { "sodium_mg": 800, "potassium_mg": 300, "magnesium_mg": 40, "calcium_mg": 50, "iron_mg": 3 },
  "vitamins": ["Vitamin A", "Vitamin C", "B kompleks"],
  "suitability": "ehtiyot",
  "riskLevel": "yellow",
  "reason": "Bu ovqatning tarkibida yog' va tuz (natriy) miqdori yurak kasalligi bor bolalar uchun biroz yuqori. Natriy qon bosimini oshirishi mumkin, shuning uchun ehtiyot bo'lib, kamroq iste'mol qilish tavsiya etiladi.",
  "alternativeFoods": ["Qaynatilgan go'sht va dimlangan sabzavotlar", "Tuzsiz grechka va tovuq toshi", "Shavla (tuz va yog'sizroq pishirilgan)"],
  "recommendations": ["Porsiyani yarmiga kamaytiring", "Salatga tuz umuman qo'shmang"],
  "modificationAdvice": "Tuzni o'rniga limon suvi ishlating.",
  "askUserConfirmation": true
}
`;

    // Strip data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("AI Image Analysis Error:", error);
    return null;
  }
};

export const generateSafePortion = async (child: Child, foodName: string, calories: number, fatG: number, sodiumMg: number): Promise<Omit<SafePortionResult, 'id' | 'childId' | 'createdAt'> | null> => {
  try {
    const prompt = `Siz kardiologiya va diyetologiya bo'yicha sun'iy intellektsiz. Bemor: ism ${child.name}, yosh ${child.birthDate}, jins ${child.gender}, tashxis: ${child.primaryDiagnosis}. 
Tuz cheklovi: ${child.saltRestriction || 'yoq'}. Suyuqlik cheklovi: ${child.fluidRestriction || 'yoq'}.
Taom: ${foodName} (100g hidobida taxminan kaloriya: ${calories}, yog': ${fatG}g, natriy: ${sodiumMg}mg).
Iltimos, ushbu bola uchun xavfsiz porsiyani hisoblang. Qat'iy faqat quyidagi JSON formatida javob bering, tekst qo'shmang:
{
  "foodName": "${foodName}",
  "currentPortionG": 0,
  "minPortionG": 50,
  "optimalPortionG": 100,
  "maxSafePortionG": 150,
  "riskLevel": "green",
  "riskReason": "",
  "parentAdvice": "",
  "doctorNote": ""
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch (err) { console.error(err); }
  return null;
};

export const analyzeSaltRisk = async (child: Child, logs: DailyLog): Promise<Omit<SaltRiskLog, 'id' | 'childId' | 'createdAt'> | null> => {
  try {
    const dailySodium = logs.totalSodium || 0;
    const items = logs.consumedMeals.map(m => ({ foodName: m.foodName, sodiumMg: m.sodium_mg }));
    const prompt = `Bola tashxisi: ${child.primaryDiagnosis}. Tuz cheklovi: ${child.saltRestriction || 'yoq'}. Qabul qilingan kunlik natriy: ${dailySodium}mg. 
Taomlar ro'yxati: ${JSON.stringify(items)}.
Natriy xavfini tahlil qiling va qat'iy javobni JSON shaklida qaytaring, boshqa gap qo'shmang:
{
  "sodiumMg": ${dailySodium},
  "saltG": ${dailySodium * 2.5 / 1000},
  "sodiumLimitMg": 1500,
  "usagePercent": 0,
  "topSaltFoods": [{"foodName": "osh", "sodiumMg": 100}],
  "riskLevel": "green",
  "parentAdvice": "",
  "doctorNote": ""
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch (err) { console.error(err); }
  return null;
};

export const analyzeFluidBalance = async (child: Child, items: any[]): Promise<Omit<FluidBalanceLog, 'id' | 'childId' | 'createdAt' | 'date' | 'items'> & { eveningAdjustment: string, itemAnalyses: any[] } | null> => {
  try {
    const totalMl = items.reduce((acc, i) => acc + i.amountMl, 0);
    const prompt = `Bola tashxisi: ${child.primaryDiagnosis}. Suyuqlik cheklovi: ${child.fluidRestriction || 'yoq'}. Bugungacha qabul qilingan suyuqliklar: ${JSON.stringify(items)}. 
Har bir suyuqlikning internetdagi ma'lumotlarga asoslanib tarkibini o'rganing. Haqiqiy toza suv miqdori qancha (masalan meva sharbatida 80-90% suv bo'lishi mumkin) va barcha qo'shimchalar, mineral moddalar miqdori qancha ekanligini ichilgan miqdorga (amountMl) proporsional ravishda hisoblab chiqing (masalan 100ml dagi qiymatni ichilgan hajmga ko'paytirib aniq hisoblang). 
Qat'iy faqat JSON qaytaring (hech qanday tekst qo'shmang):
{
  "itemAnalyses": [
    {
      "name": "Suv / Choy ..",
      "amountMl": 200,
      "pureWaterMl": 200,
      "minerals": [{"name": "Natriy", "amount": "10mg"}]
    }
  ],
  "totalMl": ${totalMl},
  "limitMl": 1000,
  "usagePercent": 0,
  "riskLevel": "green",
  "parentAdvice": "Bola holati va qabul qilingan suyuqlikdan kelib chiqib ota-onalarga nima qilish kerakligi bo'yicha batafsil maslahat yozing.",
  "doctorNote": "Shifokorga xulosa yozing",
  "eveningAdjustment": "Kechqurun ichadigan suyuqlik haqida ko'rsatma yozing"
}`;
    const res = await ai.models.generateContent({ 
      model, 
      contents: prompt, 
      config: { 
        tools: [{ googleSearch: {} }]
      }
    });
    if (res.text) {
      const rawText = res.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(rawText);
    }
  } catch (err) { console.error(err); }
  return null;
};

export const correlateSymptomsWithFood = async (child: Child, symptoms: any[], dailyLogs: DailyLog[]): Promise<Omit<SymptomFoodCorrelation, 'id' | 'childId' | 'createdAt' | 'symptoms' | 'analyzedPeriodHours'> | null> => {
  try {
    const prompt = `Bemor: ${child.name}, tashxis: ${child.primaryDiagnosis}. Simptomlar: ${JSON.stringify(symptoms)}.
Oxirgi ovqatlanishlar: ${JSON.stringify(dailyLogs.map(l => l.consumedMeals))}. 
Ushbu simptomlarning ovqatlanish bilan qanday bog'liqlik ehtimoli borligini tahlil qiling. Agar lab ko'karishi, kuchli hansirash bo'lsa emergencyWarning=true qiling. Qat'iy format:
{
  "possibleTriggers": [""],
  "saltRelation": "",
  "fluidRelation": "",
  "fatCalorieRelation": "",
  "riskLevel": "green",
  "parentAdvice": "",
  "doctorSummary": "",
  "emergencyWarning": false
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch(err) { console.error(err); }
  return null;
};

export const transformFoodToHealthierVersion = async (child: Child,  foodName: string, riskLevel: string): Promise<Omit<HealthyFoodTransformation, 'id' | 'childId' | 'createdAt'> | null> => {
  try {
    const prompt = `Bola tashxisi: ${child.primaryDiagnosis}. Asks for a healthier alternative to: ${foodName} with current risk level: ${riskLevel}.
Yurakka do'stona, xavfsiz holatga tushirish qadamlarini batafsil JSONda yozib bering:
{
  "originalFoodName": "${foodName}",
  "originalRiskLevel": "${riskLevel}",
  "transformationSteps": [""],
  "healthierVersionName": "",
  "newEstimatedCalories": 0,
  "newEstimatedSodiumMg": 0,
  "newEstimatedFatG": 0,
  "benefitForChild": "",
  "parentInstruction": ""
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch(err) { console.error(err); }
  return null;
};

export const generateMenuFromHomeIngredients = async (child: Child, ingredients: string[], methods: string[], mealTime: string, notes: string): Promise<Omit<HomeIngredientMenu, 'id' | 'childId' | 'createdAt' | 'ingredients' | 'cookingMethods' | 'mealTime'> | null> => {
  try {
    const prompt = `Bor mahsulotlar: ${ingredients.join(', ')}. Pishirish: ${methods.join(', ')}. Vaqt: ${mealTime}. Izoh: ${notes}. Bola tashxisi: ${child.primaryDiagnosis}.
JSON menyu yarating:
{
  "generatedMenu": [
    {
      "foodName": "",
      "usedIngredients": [""],
      "portionG": 100,
      "calories": 100,
      "proteinG": 10,
      "fatG": 10,
      "carbsG": 10,
      "sodiumMg": 10,
      "cookingMethod": "",
      "suitability": "mos",
      "advice": ""
    }
  ],
  "parentAdvice": ""
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch(err) { console.error(err); }
  return null;
};

export const generateBudgetMenu = async (child: Child, dailyBudget: number, days: number): Promise<Omit<BudgetMenu, 'id' | 'childId' | 'createdAt' | 'dailyBudgetUZS' | 'weeklyBudgetUZS' | 'durationDays'> | null> => {
  try {
    const prompt = `Byudjet/kun: ${dailyBudget}. Kunlar: ${days}. Bola tashxisi: ${child.primaryDiagnosis}.
JSON qaytaring:
{
  "estimatedDailyCostUZS": ${dailyBudget},
  "estimatedTotalCostUZS": ${dailyBudget * days},
  "menu": [
    {
      "day": 1,
      "meals": [
        {
          "mealTime": "",
          "foodName": "",
          "portionG": 100,
          "calories": 100,
          "estimatedCostUZS": 100,
          "advice": ""
        }
      ]
    }
  ],
  "cheapAlternatives": [""],
  "nutritionAdequacy": "",
  "parentAdvice": ""
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch(err) { console.error(err); }
  return null;
};

export const analyzeDrugFoodCompatibility = async (child: Child, medication: string, schedule: string): Promise<Omit<DrugFoodCompatibility, 'id' | 'childId' | 'createdAt' | 'medicationName' | 'dose' | 'schedule'> | null> => {
  try {
    const prompt = `Dori nomi: ${medication}. Qabul: ${schedule}. Bola tashxisi: ${child.primaryDiagnosis}. 
FAQAT OVQATLANISH BO'YICHA EHTIYOT CHORALARI. Qat'iy shu JSON formatida:
{
  "medicationName": "${medication}",
  "foodCautions": [""],
  "nutrientFocus": [""],
  "avoidOrMonitorFoods": [""],
  "riskLevel": "green",
  "parentAdvice": "",
  "doctorSummary": ""
}`;
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    if (res.text) return JSON.parse(res.text);
  } catch(err) { console.error(err); }
  return null;
};

import { User, Child, DietPlan, FoodAnalysis, DailyLog, Role } from '../types';

const STORAGE_KEYS = {
  USERS: 'cardiochild_users',
  CURRENT_USER: 'cardiochild_currentUrl',
  CHILDREN: 'cardiochild_children',
  DIET_PLANS: 'cardiochild_dietPlans',
  FOOD_ANALYSES: 'cardiochild_foodAnalyses',
  DAILY_LOGS: 'cardiochild_dailyLogs',
  FOOD_DATABASE: 'cardiochild_foodDatabase',
  SAFE_PORTION: 'safePortionResults',
  SALT_RISK: 'saltRiskLogs',
  FLUID_BALANCE: 'fluidBalanceLogs',
  SYMPTOM_FOOD: 'symptomFoodCorrelations',
  HEALTHY_TRANSFORM: 'healthyFoodTransformations',
  HOME_INGREDIENT_MENU: 'homeIngredientMenus',
  BUDGET_MENU: 'budgetMenus',
  DRUG_FOOD: 'drugFoodCompatibility'
};

export const getStorageArray = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};
export const setStorageArray = <T>(key: string, value: T[]) => {
  localStorage.setItem(key, JSON.stringify(value));
};
export const addStorageItem = <T extends { id: string }>(key: string, item: T) => {
  const items = getStorageArray<T>(key);
  items.push(item);
  setStorageArray(key, items);
};
export const updateStorageItem = <T extends { id: string }>(key: string, id: string, updates: Partial<T>) => {
  let items = getStorageArray<T>(key);
  items = items.map(t => t.id === id ? { ...t, ...updates } : t);
  setStorageArray(key, items);
};
export const deleteStorageItem = <T extends { id: string }>(key: string, id: string) => {
  let items = getStorageArray<T>(key);
  items = items.filter(t => t.id !== id);
  setStorageArray(key, items);
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Users
export const getUsers = (): User[] => getFromStorage(STORAGE_KEYS.USERS, []);
export const saveUser = (user: User) => {
  const users = getUsers();
  saveToStorage(STORAGE_KEYS.USERS, [...users, user]);
};
export const getCurrentUser = (): User | null => getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
export const setCurrentUser = (user: User | null) => saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
export const logoutUser = () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

// Children
export const getChildren = (): Child[] => getFromStorage(STORAGE_KEYS.CHILDREN, []);
export const getChildrenByParentId = (parentId: string): Child[] => getChildren().filter(c => c.parentId === parentId);
export const getChildById = (id: string): Child | undefined => getChildren().find(c => c.id === id);
export const addChild = (child: Child) => {
  const children = getChildren();
  saveToStorage(STORAGE_KEYS.CHILDREN, [...children, child]);
};
export const updateChild = (child: Child) => {
  let children = getChildren();
  children = children.map(c => c.id === child.id ? child : c);
  saveToStorage(STORAGE_KEYS.CHILDREN, children);
};

// Diet Plans
export const getDietPlans = (): DietPlan[] => getFromStorage(STORAGE_KEYS.DIET_PLANS, []);
export const getDietPlansByChildId = (childId: string): DietPlan[] => getDietPlans().filter(dp => dp.childId === childId);
export const saveDietPlan = (plan: DietPlan) => {
  const plans = getDietPlans();
  saveToStorage(STORAGE_KEYS.DIET_PLANS, [...plans, plan]);
};

// Food Analysis
export const getFoodAnalyses = (): FoodAnalysis[] => getFromStorage(STORAGE_KEYS.FOOD_ANALYSES, []);
export const getFoodAnalysesByChildId = (childId: string): FoodAnalysis[] => getFoodAnalyses().filter(fa => fa.childId === childId);
export const saveFoodAnalysis = (analysis: FoodAnalysis) => {
  const analyses = getFoodAnalyses();
  saveToStorage(STORAGE_KEYS.FOOD_ANALYSES, [...analyses, analysis]);
};

// Daily Logs
export const getDailyLogs = (): DailyLog[] => getFromStorage(STORAGE_KEYS.DAILY_LOGS, []);
export const getDailyLogsByChildId = (childId: string): DailyLog[] => getDailyLogs().filter(dl => dl.childId === childId);
export const saveDailyLog = (log: DailyLog) => {
  let logs = getDailyLogs();
  const existingIndex = logs.findIndex(l => l.id === log.id || (l.childId === log.childId && l.date.split('T')[0] === log.date.split('T')[0]));
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs = [...logs, log];
  }
  saveToStorage(STORAGE_KEYS.DAILY_LOGS, logs);
}

export const getTodayLog = (childId: string): DailyLog | undefined => {
  const today = new Date().toISOString().split('T')[0];
  const logs = getDailyLogsByChildId(childId);
  return logs.find(l => l.date.startsWith(today));
};

export const getOrCreateTodayLog = (childId: string): DailyLog => {
  let log = getTodayLog(childId);
  if (!log) {
    log = {
       id: crypto.randomUUID(),
       childId,
       date: new Date().toISOString(),
       consumedMeals: [],
       totalCalories: 0,
       totalProtein: 0,
       totalFat: 0,
       totalCarbs: 0,
       totalSodium: 0,
       totalFluid: 0,
       totalPotassium: 0,
       totalMagnesium: 0,
       totalCalcium: 0,
       totalIron: 0,
       consumedVitamins: [],
       consumedFluids: [],
       symptoms: [],
       medications: []
    };
    saveDailyLog(log);
  }
  return log;
};

export const addFoodToDailyLog = (childId: string, analysis: FoodAnalysis): DailyLog => {
  const todayDate = new Date().toISOString().split('T')[0];
  let todayLog = getTodayLog(childId);
  
  if (!todayLog) {
     todayLog = {
        id: crypto.randomUUID(), // or generateId if imported
        childId,
        date: new Date().toISOString(),
        consumedMeals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        totalSodium: 0,
        totalFluid: 0,
        totalPotassium: 0,
        totalMagnesium: 0,
        totalCalcium: 0,
        totalIron: 0,
        consumedVitamins: [],
        consumedFluids: [],
        symptoms: [],
        medications: []
     };
  }

  const newMeal = {
     time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
     timestamp: new Date().toISOString(),
     foodName: analysis.detectedFood,
     portion_g: analysis.estimatedPortion_g,
     calories: analysis.calories,
     protein_g: analysis.macros.protein_g,
     fat_g: analysis.macros.fat_g,
     carbs_g: analysis.macros.carbs_g,
     sodium_mg: analysis.minerals.sodium_mg,
     benefit: 'Kameradan orqali kiritildi',
     caution: analysis.reason,
     alternative: ''
  };

  todayLog.consumedMeals.push(newMeal);
  todayLog.totalCalories += analysis.calories;
  todayLog.totalProtein += analysis.macros.protein_g;
  todayLog.totalFat += analysis.macros.fat_g;
  todayLog.totalCarbs += analysis.macros.carbs_g;
  todayLog.totalSodium += analysis.minerals.sodium_mg;
  
  todayLog.totalPotassium = (todayLog.totalPotassium || 0) + analysis.minerals.potassium_mg;
  todayLog.totalMagnesium = (todayLog.totalMagnesium || 0) + analysis.minerals.magnesium_mg;
  todayLog.totalCalcium = (todayLog.totalCalcium || 0) + analysis.minerals.calcium_mg;
  todayLog.totalIron = (todayLog.totalIron || 0) + analysis.minerals.iron_mg;
  
  todayLog.consumedVitamins = [...new Set([...(todayLog.consumedVitamins || []), ...(analysis.vitamins || [])])];

  saveDailyLog(todayLog);
  return todayLog;
};

// Initial Food Database
const initialFoods = [
  { name: 'Osh', calories: 200, protein: 5, fat: 10, carbs: 20, isUzbek: true, status: 'ehtiyot' },
  { name: "Qaynatma sho'rva", calories: 80, protein: 6, fat: 3, carbs: 10, isUzbek: true, status: 'tavsiya qilinadi' },
  { name: 'Mastava', calories: 120, protein: 4, fat: 4, carbs: 18, isUzbek: true, status: 'tavsiya qilinadi' },
  { name: 'Dimlama', calories: 140, protein: 8, fat: 6, carbs: 12, isUzbek: true, status: 'tavsiya qilinadi' },
  { name: "Qaynatilgan tovuq go'shti (100g)", calories: 165, protein: 31, fat: 3.6, carbs: 0, isUzbek: false, status: 'tavsiya qilinadi' },
  { name: 'Grechka (100g)', calories: 343, protein: 13, fat: 3.4, carbs: 71, isUzbek: false, status: 'tavsiya qilinadi' }
];
export const getFoodDatabase = () => getFromStorage(STORAGE_KEYS.FOOD_DATABASE, initialFoods);


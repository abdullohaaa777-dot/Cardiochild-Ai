export type Role = 'parent' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: string;
}

export interface ChildLabs {
  hemoglobin?: number;
  glucose?: number;
  cholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  sodium?: number;
  potassium?: number;
  creatinine?: number;
  urineAnalysis?: string;
  vitaminD?: number;
  ferritin?: number;
  calcium?: number;
  magnesium?: number;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  birthDate: string;
  gender: 'Male' | 'Female';
  height: number;
  weight: number;
  disabilityType: string;
  primaryDiagnosis: string;
  optionalDiseases?: string;
  allergies?: string;
  medications?: string;
  doctorAdvice?: string;
  activityLevel: 'Low' | 'Medium' | 'High';
  fluidRestriction?: string;
  saltRestriction?: string;
  labs?: ChildLabs;
  createdAt: string;
}

export interface Meal {
  time: string;
  timestamp?: string;
  foodName: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  sodium_mg: number;
  benefit: string;
  caution: string;
  alternative: string;
}

export interface DietPlan {
  id: string;
  childId: string;
  duration: number;
  generatedAt: string;
  summary: string;
  dailyCalories: number;
  macros: {
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  limits: {
    sodium_mg: number;
    salt_g: number;
    fluid_ml: number;
  };
  minerals: {
    potassium_mg: number;
    magnesium_mg: number;
    calcium_mg: number;
    iron_mg: number;
    vitaminD_IU: number;
  };
  meals: Meal[];
  recommendedFoods: string[];
  cautionFoods: string[];
  restrictedFoods: string[];
  parentAdvice: string;
  doctorSummary: string;
}

export interface FoodAnalysis {
  id: string;
  childId: string;
  image?: string;
  detectedFood: string;
  confidence: number;
  estimatedPortion_g: number;
  calories: number;
  macros: {
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  minerals: {
    sodium_mg: number;
    potassium_mg: number;
    magnesium_mg: number;
    calcium_mg: number;
    iron_mg: number;
  };
  vitamins: string[];
  suitability: 'mos' | 'ehtiyot' | 'tavsiya_qilinmaydi';
  riskLevel: 'green' | 'yellow' | 'red';
  reason: string;
  recommendations: string[];
  alternativeFoods: string[];
  modificationAdvice: string;
  askUserConfirmation: boolean;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  childId: string;
  date: string;
  consumedMeals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalSodium: number;
  totalFluid: number;
  totalPotassium?: number;
  totalMagnesium?: number;
  totalCalcium?: number;
  totalIron?: number;
  consumedVitamins?: string[];
  consumedFluids?: {
    id: string;
    name: string;
    amountMl: number;
    time: string;
    pureWaterMl?: number;
    minerals?: { name: string; amount: string }[];
  }[];
  symptoms?: {
    id: string;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    time: string;
  }[];
  medications?: {
    id: string;
    name: string;
    time: string;
  }[];
  aiFeedback?: {
    status: string;
    consequences: string;
    recommendations: string[];
    generatedAt: string;
  };
}

export interface SafePortionResult {
  id: string;
  childId: string;
  foodName: string;
  currentPortionG: number;
  minPortionG: number;
  optimalPortionG: number;
  maxSafePortionG: number;
  riskLevel: 'green' | 'yellow' | 'red';
  riskReason: string;
  parentAdvice: string;
  doctorNote: string;
  createdAt: string;
}

export interface SaltRiskLog {
  id: string;
  childId: string;
  date: string;
  sodiumMg: number;
  saltG: number;
  sodiumLimitMg: number;
  usagePercent: number;
  topSaltFoods: { foodName: string; sodiumMg: number; }[];
  riskLevel: 'green' | 'yellow' | 'red';
  parentAdvice: string;
  doctorNote: string;
  createdAt: string;
}

export interface FluidBalanceLog {
  id: string;
  childId: string;
  date: string;
  items: { id: string; name: string; amountMl: number; time: string; note: string; }[];
  totalMl: number;
  limitMl: number;
  usagePercent: number;
  riskLevel: 'green' | 'yellow' | 'red';
  parentAdvice: string;
  doctorNote: string;
  createdAt: string;
}

export interface SymptomFoodCorrelation {
  id: string;
  childId: string;
  symptoms: { name: string; severity: 'mild' | 'moderate' | 'severe'; startedAt: string; afterMeal: boolean; note: string; }[];
  analyzedPeriodHours: number;
  possibleTriggers: string[];
  saltRelation: string;
  fluidRelation: string;
  fatCalorieRelation: string;
  riskLevel: 'green' | 'yellow' | 'red';
  parentAdvice: string;
  doctorSummary: string;
  emergencyWarning: boolean;
  createdAt: string;
}

export interface HealthyFoodTransformation {
  id: string;
  childId: string;
  originalFoodName: string;
  originalRiskLevel: 'green' | 'yellow' | 'red';
  transformationSteps: string[];
  healthierVersionName: string;
  newEstimatedCalories: number;
  newEstimatedSodiumMg: number;
  newEstimatedFatG: number;
  benefitForChild: string;
  parentInstruction: string;
  createdAt: string;
}

export interface HomeIngredientMenu {
  id: string;
  childId: string;
  ingredients: string[];
  cookingMethods: string[];
  mealTime: string;
  generatedMenu: {
    foodName: string;
    usedIngredients: string[];
    portionG: number;
    calories: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
    sodiumMg: number;
    cookingMethod: string;
    suitability: 'mos' | 'ehtiyot' | 'tavsiya_qilinmaydi';
    advice: string;
  }[];
  parentAdvice: string;
  createdAt: string;
}

export interface BudgetMenu {
  id: string;
  childId: string;
  dailyBudgetUZS: number;
  weeklyBudgetUZS: number;
  durationDays: number;
  estimatedDailyCostUZS: number;
  estimatedTotalCostUZS: number;
  menu: {
    day: number;
    meals: {
      mealTime: string;
      foodName: string;
      portionG: number;
      calories: number;
      estimatedCostUZS: number;
      advice: string;
    }[];
  }[];
  cheapAlternatives: string[];
  nutritionAdequacy: string;
  parentAdvice: string;
  createdAt: string;
}

export interface DrugFoodCompatibility {
  id: string;
  childId: string;
  medicationName: string;
  dose: string;
  schedule: string;
  foodCautions: string[];
  nutrientFocus: string[];
  avoidOrMonitorFoods: string[];
  riskLevel: 'green' | 'yellow' | 'red';
  parentAdvice: string;
  doctorSummary: string;
  createdAt: string;
}

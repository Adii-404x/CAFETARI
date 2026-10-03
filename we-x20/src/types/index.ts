export type UserRole = 'student' | 'staff' | 'admin';

export interface UserPreferences {
  dietaryPreference?: 'all' | 'veg_only' | 'jain' | 'vegan';
  notificationsEnabled?: boolean;
  smsAlerts?: boolean;
  soundAlerts?: boolean;
  defaultPaymentMethod?: 'CAMPUS_CARD' | 'UPI_QR' | 'PAY_AT_COUNTER';
  hostelOrBlock?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  walletBalance?: number;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type FoodCategory = 'Breakfast' | 'Snacks' | 'Meals' | 'Beverages' | 'Desserts';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: FoodCategory;
  price: number;
  image: string;
  available: boolean;
  preparationTime: number; // in minutes
  calories?: number;
  isVegetarian?: boolean;
  isPopular?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export type PaymentMethod = 'PAY_AT_COUNTER' | 'CAMPUS_CARD' | 'UPI_QR';

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-1024
  tokenNumber: number; // e.g. 124
  userId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID';
  estimatedPreparationTime: number; // total estimated minutes
  notes?: string;
  placedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  userId: string;
  studentName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface MLModelMetrics {
  name: string;
  mae: number;
  rmse: number;
  r2Score: number;
  accuracyPercent: number;
  isBest: boolean;
}

export interface ItemPrediction {
  foodItemId: string;
  name: string;
  category: FoodCategory;
  predictedDemand: number;
  historicalAvg: number;
  confidenceRange: [number, number];
  prepRecommendation: string;
  bufferStock: number;
  expectedRevenue: number;
}

export interface AiDemandInsights {
  executiveSummary: string;
  peakRushHours: string;
  perishableWasteAdvice: string;
  procurementRecommendation: string;
  rawMarkdown?: string;
}

export interface IngredientDepletionForecast {
  ingredient: string;
  totalRequired: string;
  stockAvailable: string;
  status: 'SAFE' | 'WARNING' | 'REORDER_NOW';
  daysUntilStockout?: number;
  unit: string;
}

export interface HourlyRushForecastItem {
  hour: string;
  rushLevel: 'Low' | 'Moderate' | 'High' | 'Severe Peak';
  orderVelocity: number;
  staffNeeded: number;
  focus: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  description: string;
}

export interface DemandPredictionResponse {
  date: string;
  dayOfWeek: string;
  scenario?: string;
  weatherCondition?: string;
  modelVersion: string;
  selectedModel: string;
  modelsCompared: MLModelMetrics[];
  predictions: ItemPrediction[];
  totalExpectedPortions: number;
  totalProjectedRevenue: number;
  factorsConsidered: string[];
  aiInsights?: AiDemandInsights | string;
  lastTrained: string;
  ingredientRequirements?: IngredientDepletionForecast[];
  hourlyRushForecast?: HourlyRushForecastItem[];
  featureImportance?: FeatureImportanceItem[];
  validationMae?: number | null;
  validationErrorBand?: number | null;
}

export interface AnalyticsDashboardData {
  overview: {
    totalOrdersToday: number;
    revenueToday: number;
    pendingOrders: number;
    completedOrders: number;
    averageRating: number;
    totalRatingsCount: number;
    mostPopularItem: string;
    avgPrepTimeMinutes: number;
    totalRevenueAllTime?: number;
    totalOrdersAllTime?: number;
    averageOrderValue?: number;
  };
  dailyRevenueTrend: {
    date: string;
    day: string;
    revenue: number;
    ordersCount: number;
    avgOrderValue?: number;
    completedCount?: number;
  }[];
  weeklyOrdersTrend?: {
    weekLabel: string;
    startDate: string;
    ordersCount: number;
    revenue: number;
    targetOrders: number;
  }[];
  monthlyOrdersTrend?: {
    month: string;
    shortMonth: string;
    year: number;
    ordersCount: number;
    revenue: number;
    avgOrderValue: number;
    growthPercent: number;
  }[];
  revenuePeriods?: {
    last7Days: { date: string; day: string; revenue: number; ordersCount: number }[];
    last30Days: { date: string; day: string; revenue: number; ordersCount: number }[];
    last12Months: { month: string; revenue: number; ordersCount: number }[];
  };
  paymentMethodDistribution?: {
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }[];
  hourlyRushData: {
    hour: string;
    orders: number;
    revenue?: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    revenue: number;
    percentage?: number;
  }[];
  popularItems: {
    name: string;
    category: string;
    orderCount: number;
    totalRevenue: number;
    price?: number;
    trend?: 'up' | 'stable' | 'down';
  }[];
  leastPopularItems: {
    name: string;
    category: string;
    orderCount: number;
    totalRevenue?: number;
    price?: number;
    turnoverRate?: string;
    recommendation?: string;
  }[];
  statusDistribution: {
    status: OrderStatus;
    count: number;
    percentage?: number;
    color?: string;
  }[];
}

export interface QueueStatus {
  currentlyServingToken: number;
  totalActiveOrders: number;
  ordersAheadOfUser?: number;
  userTokenNumber?: number;
  estimatedWaitMinutes: number;
  rushLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK';
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface RecommendedAddOn {
  foodItem: FoodItem;
  matchScore: number; // 0-100%
  confidence: number; // 0.0-1.0
  lift: number; // e.g. 3.4x
  support?: number;
  jaccardSimilarity?: number;
  reason: string;
  pairedWithItemName?: string;
  pairedWithItemId?: string;
  algorithm?: 'Apriori Association Rules' | 'Item-Item Collaborative Filtering' | 'Hybrid Meal Affinity';
  category: FoodCategory;
  affinityTags?: string[];
}

export interface MLRecommendationMeta {
  algorithm: string;
  totalTransactionsAnalyzed: number;
  primaryCartItem?: string;
}

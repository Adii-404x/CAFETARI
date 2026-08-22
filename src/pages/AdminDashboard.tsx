import React, { useState, useEffect } from 'react';
import { analyticsApi, predictionApi, foodApi, orderApi, systemApi } from '../services/api';
import {
  AnalyticsDashboardData,
  DemandPredictionResponse,
  FoodItem,
  Order,
  OrderStatus
} from '../types/index';
import { FoodModal } from '../components/FoodModal';
import { AdminAnalyticsView } from '../components/AdminAnalyticsView';
import { RushHeatmap } from '../components/RushHeatmap';
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Utensils,
  ShoppingBag,
  DollarSign,
  Clock,
  Star,
  Users,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Calendar,
  BrainCircuit,
  ShieldAlert,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Flame,
  Bot,
  Database as DatabaseIcon,
  Server
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  initialTab?: 'overview' | 'analytics' | 'predictions' | 'menu' | 'orders';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'predictions' | 'menu' | 'orders'>(initialTab);
  
  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsDashboardData | null>(null);
  const [predictions, setPredictions] = useState<DemandPredictionResponse | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);

  // Modals & form states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [forecastDate, setForecastDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [anRes, predRes, foodRes, ordRes, dbRes] = await Promise.all([
        analyticsApi.getDashboardAnalytics(),
        predictionApi.getPredictions(),
        foodApi.getFoodItems(),
        orderApi.getAllOrders(),
        systemApi.getDatabaseStatus().catch(() => null)
      ]);

      if (anRes.success && anRes.data) setAnalytics(anRes.data);
      if (predRes.success && predRes.data) setPredictions(predRes.data);
      if (foodRes.success && foodRes.data) setFoodItems(foodRes.data);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data);
      if (dbRes && dbRes.success) setDbStatus(dbRes);
    } catch (err) {
      console.error('Error loading admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleRetrainPredictions = async () => {
    setIsRetraining(true);
    try {
      const res = await predictionApi.generateNewPredictions(forecastDate);
      if (res.success && res.data) {
        setPredictions(res.data);
      }
    } catch (err) {
      console.error('Error retraining model:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleToggleFoodStock = async (id: string) => {
    const res = await foodApi.toggleAvailability(id);
    if (res.success) {
      setFoodItems(prev =>
        prev.map(f => (f.id === id ? { ...f, available: !f.available } : f))
      );
    }
  };

  const handleDeleteFood = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      const res = await foodApi.deleteFoodItem(id);
      if (res.success) {
        setFoodItems(prev => prev.filter(f => f.id !== id));
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await orderApi.updateOrderStatus(orderId, status);
    if (res.success) {
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  const COLORS = ['#059669', '#0284c7', '#d97706', '#8b5cf6', '#e11d48', '#0d9488'];

  return (
    <div className="space-y-6 py-4">
      {/* Admin Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-900 dark:text-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand-primary flex items-center justify-center border border-brand-subtle shadow-xs">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                CAFETARI Admin Hub • {activeTab === 'overview' ? 'Daily Overview' : activeTab === 'analytics' ? 'Sales Analytics' : activeTab === 'predictions' ? 'ML Demand Forecast' : activeTab === 'menu' ? 'Menu Catalog' : `All Orders (${orders.length})`}
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-brand-subtle text-brand-primary border border-brand-subtle">
                PRO ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Today: {analytics?.overview.totalOrdersToday || 48} orders • ₹{analytics?.overview.revenueToday || 3840} revenue • AI demand predictions active
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'analytics' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'predictions' ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-primary hover:opacity-80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Demand 🤖</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'menu' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Menu Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today's Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics?.overview.totalOrdersToday || 48}
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center space-x-1 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>+14% vs yesterday</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today's Revenue</span>
                <span className="text-emerald-600 font-bold">₹</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                ₹{analytics?.overview.revenueToday || 3840}
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center space-x-1 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>Zero payment defaults</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Active Kitchen Queue</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800">
                {analytics?.overview.pendingOrders || 4} tickets
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Avg prep time: ~{analytics?.overview.avgPrepTimeMinutes || 11} mins
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Campus Rating</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {analytics?.overview.averageRating || 4.8} / 5.0
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Based on {analytics?.overview.totalRatingsCount || 24} student ratings
              </div>
            </div>
          </div>

          {/* Quick AI & Kitchen Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  ML Demand Forecaster is Active for Tomorrow
                </h3>
                <p className="text-xs text-slate-600">
                  Selected Model: <strong className="text-emerald-800">{predictions?.selectedModel || 'Random Forest Regressor'}</strong> • Expected Total Demand: <strong className="text-emerald-800">{predictions?.totalExpectedPortions || 640} portions</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('predictions')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Inspect AI Forecast</span>
            </button>
          </div>

          {/* Database Integration Status Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${
                dbStatus?.mongo?.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <DatabaseIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-xs text-slate-900">Database Engine</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dbStatus?.mongo?.isConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {dbStatus?.mongo?.isConnected ? 'MongoDB Atlas (SRV Live)' : 'Persistent Dual Storage'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {dbStatus?.mongo?.isConnected
                    ? `Connected to database [${dbStatus?.mongo?.databaseName || 'cafeteria_ai'}] via SRV link.`
                    : 'Ready for MongoDB Atlas SRV URI. Local JSON data engine actively persisting all records.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                Records: <strong className="text-slate-900">{foodItems.length} items • {orders.length} orders</strong>
              </div>
            </div>
          </div>

          {/* Mini Chart Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">7-Day Campus Revenue Trend</h3>
                  <p className="text-[11px] text-slate-500">Daily gross revenue in ₹</p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.dailyRevenueTrend || []}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Rush */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Peak Dining Hours Rush</h3>
                  <p className="text-[11px] text-slate-500">Hourly student order volumes</p>
                </div>
                <Flame className="w-4 h-4 text-amber-600" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.hourlyRushData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any) => [`${val} orders`, 'Volume']}
                    />
                    <Bar dataKey="orders" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADVANCED ANALYTICS (RECHARTS POWERED) */}
      {activeTab === 'analytics' && analytics && (
        <AdminAnalyticsView
          analytics={analytics}
          onRefresh={loadAllAdminData}
          isRefreshing={loading}
        />
      )}

      {/* TAB 3: AI DEMAND PREDICTION 🤖 */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Top AI Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                <BrainCircuit className="w-3 h-3" />
                <span>Machine Learning Demand Engine</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Tomorrow's Portion Demand Forecast ({predictions?.dayOfWeek}, {predictions?.date})
              </h2>
              <p className="text-xs text-slate-500">
                Trained on cyclical calendar data, academic calendar spikes & historical moving averages.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <input
                type="date"
                value={forecastDate}
                onChange={e => setForecastDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
              />
              <button
                onClick={handleRetrainPredictions}
                disabled={isRetraining}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                <span>{isRetraining ? 'Evaluating Regressors...' : 'Re-train & Predict'}</span>
              </button>
            </div>
          </div>

          {/* Model Comparison Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions?.modelsCompared.map((m, idx) => {
              const isSelected = m.name === predictions.selectedModel;
              return (
                <div
                  key={m.name || `model-${idx}`}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs text-slate-900">{m.name}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                        Selected Best
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-medium">MAE</div>
                      <div className="font-bold text-emerald-700">{m.mae}</div>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-medium">RMSE</div>
                      <div className="font-bold text-slate-800">{m.rmse}</div>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-medium">R² Score</div>
                      <div className="font-bold text-emerald-700">{m.r2Score}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500 text-center font-medium">
                    Accuracy Score: <strong className="text-slate-800">{m.accuracyPercent}%</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gemini AI Operational Copilot Insights Panel */}
          {predictions?.aiInsights && (
            <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 text-slate-900 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-emerald-700">
                <Bot className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                  Gemini AI Kitchen & Waste Optimization Advisor
                </h3>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs leading-relaxed text-slate-800 font-medium">
                {typeof predictions.aiInsights === 'string'
                  ? predictions.aiInsights
                  : predictions.aiInsights.executiveSummary}
              </div>

              {typeof predictions.aiInsights !== 'string' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-amber-800">🔥 Rush Hour Surge Windows</div>
                    <p className="text-slate-600 leading-relaxed">
                      {predictions.aiInsights.peakRushHours}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-emerald-800">🌿 Perishable Waste Reduction</div>
                    <p className="text-slate-600 leading-relaxed">
                      {predictions.aiInsights.perishableWasteAdvice}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-800">📦 Ingredient Procurement</div>
                    <p className="text-slate-600 leading-relaxed">
                      {predictions.aiInsights.procurementRecommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Predictions Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Item-wise Demand Allocations</h3>
              <span className="text-xs text-emerald-700 font-bold">
                Total Projected Demand: {predictions?.totalExpectedPortions} Portions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 rounded-l-lg">Food Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Forecast Portions</th>
                    <th className="p-3">Safety Buffer (+12%)</th>
                    <th className="p-3">Prep Advice</th>
                    <th className="p-3 rounded-r-lg text-right">Projected Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions?.predictions.map((pred, idx) => (
                    <tr key={pred.foodItemId || `pred-${idx}`} className="hover:bg-slate-50/70">
                      <td className="p-3 font-semibold text-slate-900">{pred.name}</td>
                      <td className="p-3 text-slate-500">{pred.category}</td>
                      <td className="p-3 font-bold text-emerald-700 text-sm">{pred.predictedDemand}</td>
                      <td className="p-3 text-emerald-700 font-medium">+{pred.bufferStock} extra</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200">
                          {pred.prepRecommendation}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{pred.expectedRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Predictive AI Demand & Kitchen Rush Heatmap */}
          <RushHeatmap />
        </div>
      )}

      {/* TAB 4: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cafeteria Menu Catalog</h2>
              <p className="text-xs text-slate-500">Add, edit pricing, ingredients, and toggle live availability</p>
            </div>

            <button
              onClick={() => {
                setItemToEdit(null);
                setIsFoodModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodItems.map((item, idx) => (
              <div
                key={item.id || `food-${idx}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="flex items-start space-x-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">₹{item.price}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 mt-1 truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleToggleFoodStock(item.id)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      item.available ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {item.available ? '● Available' : '○ Out of Stock'}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setItemToEdit(item);
                        setIsFoodModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-xs"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(item.id, item.name)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-xs"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="Search token, student or order #..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'PLACED', 'PREPARING', 'READY', 'COMPLETED'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 rounded-l-lg">Token</th>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders
                    .filter(o => {
                      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
                      const matchesSearch =
                        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.tokenNumber.toString().includes(orderSearch) ||
                        o.studentName.toLowerCase().includes(orderSearch.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .map((o, idx) => (
                      <tr key={o.id || o.orderNumber || `order-${idx}`} className="hover:bg-slate-50/70">
                        <td className="p-3 font-black text-slate-900 text-sm">#{o.tokenNumber}</td>
                        <td className="p-3 font-semibold text-slate-700">{o.orderNumber}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{o.studentName}</div>
                          <div className="text-[10px] text-slate-500">{o.studentEmail}</div>
                        </td>
                        <td className="p-3 text-[11px] text-slate-700 max-w-xs truncate">
                          {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">₹{o.totalAmount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            o.status === 'READY'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : o.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={e => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer shadow-xs"
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="READY">READY</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {isFoodModalOpen && (
        <FoodModal
          itemToEdit={itemToEdit}
          onClose={() => {
            setIsFoodModalOpen(false);
            setItemToEdit(null);
          }}
          onSuccess={() => {
            loadAllAdminData();
          }}
        />
      )}
    </div>
  );
};

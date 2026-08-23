import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Layers,
  ChefHat,
  CloudRain,
  Sun,
  PartyPopper,
  GraduationCap,
  Trophy,
  PackageCheck,
  Bot,
  Zap,
  BarChart3,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { DemandPredictionResponse, ItemPrediction } from '../../types';

interface AdminMlDemandHubProps {
  predictions: DemandPredictionResponse | null;
  onScenarioChange: (scenario: string, date?: string) => Promise<void>;
  onRetrain: (targetDate: string, scenario: string) => Promise<void>;
  isRetraining: boolean;
  forecastDate: string;
  setForecastDate: (date: string) => void;
}

const SCENARIOS = [
  { id: 'normal', name: 'Regular Campus Day', icon: Sun, desc: 'Standard weekday lecture schedule (28°C sunny)', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'rainy_monsoon', name: 'Heavy Monsoon Rain', icon: CloudRain, desc: 'Hot Chai & Crispy Samosas surge +40%, cold drinks -25%', color: 'border-blue-400 bg-blue-50/20' },
  { id: 'college_fest', name: 'Annual Campus Fest', icon: PartyPopper, desc: 'Hackathons & cultural events: Footfall +60% grab-and-go surge', color: 'border-purple-400 bg-purple-50/20' },
  { id: 'exam_week', name: 'Final Exam Period', icon: GraduationCap, desc: 'Night canteen rush & energy coffee +45%, sit-down meals -20%', color: 'border-amber-400 bg-amber-50/20' },
  { id: 'sports_day', name: 'Inter-College Sports Meet', icon: Trophy, desc: 'High hydration beverages, power protein rolls & meal platters', color: 'border-emerald-400 bg-emerald-50/20' }
];

export const AdminMlDemandHub: React.FC<AdminMlDemandHubProps> = ({
  predictions,
  onScenarioChange,
  onRetrain,
  isRetraining,
  forecastDate,
  setForecastDate
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>(predictions?.scenario || 'normal');
  const [viewSubTab, setViewSubTab] = useState<'forecast' | 'ingredients' | 'rush' | 'explainability' | 'combos'>('forecast');
  const [testCartItems, setTestCartItems] = useState<string[]>(['Crispy Samosa (2 pcs)']);

  const handleSelectScenario = async (scId: string) => {
    setSelectedScenario(scId);
    await onScenarioChange(scId, forecastDate);
  };

  const toggleTestCartItem = (itemName: string) => {
    setTestCartItems(prev =>
      prev.includes(itemName) ? prev.filter(i => i !== itemName) : [...prev, itemName]
    );
  };

  // Mock recommendation response based on Apriori associations
  const getSimulatedCrossSells = () => {
    const list: Array<{ title: string; addon: string; confidence: string; lift: string; discount: string; reason: string }> = [];
    if (testCartItems.some(i => i.includes('Samosa'))) {
      list.push({
        title: 'Monsoon Pairing Special',
        addon: 'Adrak Elaichi Chai',
        confidence: '85%',
        lift: '2.15x',
        discount: '₹10 Off',
        reason: 'Students ordering Samosas purchase hot ginger chai 85% of the time.'
      });
    }
    if (testCartItems.some(i => i.includes('Burger'))) {
      list.push({
        title: 'Student Power Trio',
        addon: 'Thick Cold Coffee + Peri Peri Fries',
        confidence: '78%',
        lift: '1.95x',
        discount: '15% Combo Saver',
        reason: 'High affinity lunch pairing with highest campus repeat frequency.'
      });
    }
    if (testCartItems.some(i => i.includes('Dosa'))) {
      list.push({
        title: 'South Campus Morning Deal',
        addon: 'Filter Coffee / Cutting Chai',
        confidence: '68%',
        lift: '1.64x',
        discount: 'Free Upgrade',
        reason: 'Optimal breakfast complement during morning 8:00 AM - 10:00 AM slot.'
      });
    }
    if (list.length === 0) {
      list.push({
        title: 'Daily Refresh Combo',
        addon: 'Thick Cold Coffee',
        confidence: '62%',
        lift: '1.50x',
        discount: '₹15 Off',
        reason: 'Top trending beverage across all campus dining transactions.'
      });
    }
    return list;
  };

  const chartData = predictions?.predictions.slice(0, 8).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 13) + '...' : p.name,
    predicted: p.predictedDemand,
    historical: p.historicalAvg,
    buffer: p.bufferStock
  })) || [];

  const rushChartData = predictions?.hourlyRushForecast || [
    { hour: '08 AM', orderVelocity: 12, staffNeeded: 2 },
    { hour: '09 AM', orderVelocity: 28, staffNeeded: 3 },
    { hour: '10 AM', orderVelocity: 15, staffNeeded: 2 },
    { hour: '11 AM', orderVelocity: 22, staffNeeded: 3 },
    { hour: '12 PM', orderVelocity: 55, staffNeeded: 5 },
    { hour: '01 PM', orderVelocity: 85, staffNeeded: 6 },
    { hour: '02 PM', orderVelocity: 48, staffNeeded: 4 },
    { hour: '03 PM', orderVelocity: 18, staffNeeded: 2 },
    { hour: '04 PM', orderVelocity: 35, staffNeeded: 3 },
    { hour: '05 PM', orderVelocity: 78, staffNeeded: 6 },
    { hour: '06 PM', orderVelocity: 50, staffNeeded: 4 },
    { hour: '07 PM', orderVelocity: 30, staffNeeded: 3 },
    { hour: '08 PM', orderVelocity: 25, staffNeeded: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Top AI Controls & Scenario Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-subtle border border-brand-subtle text-brand-primary text-xs font-black uppercase tracking-wider">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>CafeteriaAI • ML Intelligence Hub v2.5</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Portion Demand Forecast & Kitchen Logistics ({predictions?.dayOfWeek || 'Tomorrow'}, {predictions?.date || forecastDate})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Model: <strong className="text-slate-800 dark:text-slate-200">{predictions?.selectedModel || 'Gradient Boosting Regressor'}</strong> • Weather: {predictions?.weatherCondition || 'Normal Campus Schedule'}
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input
              type="date"
              value={forecastDate}
              onChange={e => setForecastDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer shadow-xs font-semibold"
            />
            <button
              onClick={() => onRetrain(forecastDate, selectedScenario)}
              disabled={isRetraining}
              className="px-4 py-2.5 rounded-xl bg-brand-primary hover:opacity-90 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Retraining Models...' : 'Re-train & Predict'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Scenario Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-primary" />
            <span>Interactive Campus Event & Climate Simulator:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SCENARIOS.map(sc => {
              const IconComponent = sc.icon;
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-subtle border-brand-primary ring-2 ring-brand-primary/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-brand-primary' : 'text-slate-500'}`} />
                    <span className="text-xs font-black text-slate-900 dark:text-white">{sc.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                    {sc.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setViewSubTab('forecast')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              viewSubTab === 'forecast' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-brand-primary" />
            <span>Demand Allocations</span>
          </button>
          <button
            onClick={() => setViewSubTab('ingredients')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              viewSubTab === 'ingredients' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ingredient BOM & Stockout Guard</span>
          </button>
          <button
            onClick={() => setViewSubTab('rush')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              viewSubTab === 'rush' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
            <span>24-Hour Rush & Chef Allocator</span>
          </button>
          <button
            onClick={() => setViewSubTab('explainability')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              viewSubTab === 'explainability' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Model Explainability & Weights</span>
          </button>
          <button
            onClick={() => setViewSubTab('combos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              viewSubTab === 'combos' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-pink-500" />
            <span>Smart Combo Recommender</span>
          </button>
        </div>
      </div>

      {/* Model Benchmark Comparison Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions?.modelsCompared.map((m, idx) => {
          const isSelected = m.name === predictions.selectedModel || m.isBest;
          return (
            <div
              key={m.name || `model-${idx}`}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-brand-subtle/50 border-brand-primary shadow-xs ring-1 ring-brand-primary'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</h4>
                {isSelected && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-primary text-white shadow-xs">
                    Selected Best
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">MAE</div>
                  <div className="font-black text-brand-primary">{m.mae}</div>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">RMSE</div>
                  <div className="font-black text-slate-800 dark:text-slate-200">{m.rmse}</div>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">R² Score</div>
                  <div className="font-black text-emerald-600 dark:text-emerald-400">{m.r2Score}</div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                Accuracy Score: <strong className="text-slate-800 dark:text-slate-200">{m.accuracyPercent}%</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gemini AI Operational Copilot Insights Panel */}
      {predictions?.aiInsights && (
        <div className="bg-white dark:bg-slate-900 border border-brand-primary/40 rounded-3xl p-6 text-slate-900 dark:text-white shadow-xs space-y-4 transition-colors">
          <div className="flex items-center space-x-2 text-brand-primary">
            <Bot className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Gemini AI Kitchen & Waste Optimization Advisor
            </h3>
          </div>

          <div className="p-4 bg-brand-subtle/70 border border-brand-subtle rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
            {typeof predictions.aiInsights === 'string'
              ? predictions.aiInsights
              : predictions.aiInsights.executiveSummary}
          </div>

          {typeof predictions.aiInsights !== 'string' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Rush Hour Surge Windows</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {predictions.aiInsights.peakRushHours}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Perishable Waste Reduction</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {predictions.aiInsights.perishableWasteAdvice}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Ingredient Procurement</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {predictions.aiInsights.procurementRecommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 1: DEMAND ALLOCATIONS & VISUAL CHART */}
      {viewSubTab === 'forecast' && (
        <div className="space-y-6">
          {/* Chart View */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Predicted vs Historical Moving Average</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Portion requirements with safety stock buffers</p>
              </div>
              <span className="text-xs text-brand-primary font-bold">
                Total Projected Demand: {predictions?.totalExpectedPortions} Portions (₹{predictions?.totalProjectedRevenue})
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="predicted" fill="var(--color-brand-primary, #10b981)" radius={[6, 6, 0, 0]} name="Predicted Portions" />
                  <Bar dataKey="historical" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Historical Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Item-wise Demand Allocations</h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {predictions?.predictions.length || 0} active menu items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Food Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Forecast Portions</th>
                    <th className="p-3.5">Safety Buffer (+12%)</th>
                    <th className="p-3.5">Prep Advice</th>
                    <th className="p-3.5 rounded-r-xl text-right">Projected Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {predictions?.predictions.map((pred, idx) => (
                    <tr key={pred.foodItemId || `pred-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{pred.name}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{pred.category}</td>
                      <td className="p-3.5 font-black text-brand-primary text-sm">{pred.predictedDemand}</td>
                      <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-medium">+{pred.bufferStock} extra</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pred.prepRecommendation}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">₹{pred.expectedRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: INGREDIENT BOM & STOCKOUT GUARD */}
      {viewSubTab === 'ingredients' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Bill of Materials (BOM) & Inventory Depletion Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Translates tomorrow's {predictions?.totalExpectedPortions || 0} portions into exact raw materials required to avoid waste and stockouts.
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Waste Target: -28.5% Spoilage</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions?.ingredientRequirements?.map((ing, idx) => {
              const isWarning = ing.status === 'WARNING';
              const isReorder = ing.status === 'REORDER_NOW';
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isReorder
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      : isWarning
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs text-slate-900 dark:text-white">{ing.ingredient}</h4>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isReorder
                          ? 'bg-rose-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {ing.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Required Portion:</span>
                      <strong className="text-slate-900 dark:text-white">{ing.totalRequired}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kitchen Shelf Stock:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ing.stockAvailable}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-500">Runway to stockout:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ing.daysUntilStockout} days</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: 24-HOUR RUSH & CHEF STAFFING */}
      {viewSubTab === 'rush' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Kitchen Velocity & Chef Staffing Allocation Forecast</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Predictive kitchen ticket influx by hour, recommending station concurrency and chef staffing schedules.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rushChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rushGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-primary, #10b981)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-brand-primary, #10b981)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="orderVelocity" stroke="var(--color-brand-primary, #10b981)" fillOpacity={1} fill="url(#rushGradient)" name="Order Velocity (Tickets/hr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {predictions?.hourlyRushForecast?.slice(4, 8).map((hr, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
                <div className="text-[11px] font-bold text-slate-500">{hr.hour}</div>
                <div className="text-base font-black text-slate-900 dark:text-white">{hr.orderVelocity} tickets/hr</div>
                <div className="text-xs font-semibold text-brand-primary">Chef Staff Needed: {hr.staffNeeded}</div>
                <div className="text-[10px] text-slate-500 truncate">{hr.focus}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: MODEL EXPLAINABILITY & WEIGHTS */}
      {viewSubTab === 'explainability' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Feature Importance & Decision Tree Decomposition</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown of weighted signals driving our ensemble regressors.
            </p>
          </div>

          <div className="space-y-3">
            {predictions?.featureImportance?.map((feat, idx) => {
              const pct = Math.round(feat.importance * 100);
              return (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 dark:text-white">{feat.feature}</span>
                    <span className="font-black text-brand-primary">{pct}% Influence</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: SMART COMBO RECOMMENDER (APRIORI ASSOCIATION RULES) */}
      {viewSubTab === 'combos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Apriori Market Basket Association Rule Simulator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select items in a simulated cart to test real-time cross-selling add-ons and campus combo bundle savings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Test Cart Items:</div>
            <div className="flex flex-wrap gap-2">
              {['Crispy Samosa (2 pcs)', 'Classic Veg Burger', 'Masala Dosa', 'Paneer Tikka Roll', 'Peri Peri French Fries'].map(item => {
                const isSelected = testCartItems.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleTestCartItem(item)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {getSimulatedCrossSells().map((rec, idx) => (
              <div key={idx} className="p-5 bg-pink-50/30 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-500 text-white">
                    {rec.title}
                  </span>
                  <span className="text-xs font-black text-pink-600 dark:text-pink-400">{rec.discount}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">Recommended: {rec.addon}</div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Confidence: <strong className="text-slate-800 dark:text-slate-200">{rec.confidence}</strong></span>
                  <span>Lift: <strong className="text-emerald-600 dark:text-emerald-400">{rec.lift}</strong></span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { analyticsApi, predictionApi } from '../services/api';
import {
  Flame,
  Clock,
  TrendingUp,
  Sparkles,
  Users,
  AlertTriangle,
  RefreshCw,
  Zap,
  Info,
  Calendar,
  ChefHat
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface HourlyHeatmapCell {
  hour: string;
  hourNum: number;
  orders: number;
  intensity: 'calm' | 'moderate' | 'rush' | 'extreme';
  waitEstMin: number;
  topItem: string;
  surgeMultiplier: number;
}

const HEATMAP_HOURS: HourlyHeatmapCell[] = [
  { hour: '08:00', hourNum: 8, orders: 4, intensity: 'calm', waitEstMin: 3, topItem: 'Masala Chai & Samosa', surgeMultiplier: 1.0 },
  { hour: '09:00', hourNum: 9, orders: 12, intensity: 'moderate', waitEstMin: 6, topItem: 'South Indian Dosa', surgeMultiplier: 1.0 },
  { hour: '10:00', hourNum: 10, orders: 18, intensity: 'rush', waitEstMin: 10, topItem: 'Poha & Filter Coffee', surgeMultiplier: 1.1 },
  { hour: '11:00', hourNum: 11, orders: 9, intensity: 'calm', waitEstMin: 4, topItem: 'Cold Coffee Latte', surgeMultiplier: 1.0 },
  { hour: '12:00', hourNum: 12, orders: 38, intensity: 'extreme', waitEstMin: 18, topItem: 'Paneer Butter Thali', surgeMultiplier: 1.25 },
  { hour: '13:00', hourNum: 13, orders: 45, intensity: 'extreme', waitEstMin: 22, topItem: 'Chicken Biryani Special', surgeMultiplier: 1.3 },
  { hour: '14:00', hourNum: 14, orders: 24, intensity: 'rush', waitEstMin: 12, topItem: 'Veg Hakka Noodles', surgeMultiplier: 1.15 },
  { hour: '15:00', hourNum: 15, orders: 8, intensity: 'calm', waitEstMin: 4, topItem: 'Iced Tea & Fries', surgeMultiplier: 1.0 },
  { hour: '16:00', hourNum: 16, orders: 28, intensity: 'rush', waitEstMin: 14, topItem: 'Samosa Chaat & Chai', surgeMultiplier: 1.2 },
  { hour: '17:00', hourNum: 17, orders: 32, intensity: 'rush', waitEstMin: 16, topItem: 'Cheese Grilled Sandwich', surgeMultiplier: 1.2 },
  { hour: '18:00', hourNum: 18, orders: 15, intensity: 'moderate', waitEstMin: 7, topItem: 'Cold Coffee Latte', surgeMultiplier: 1.0 },
  { hour: '19:00', hourNum: 19, orders: 22, intensity: 'moderate', waitEstMin: 11, topItem: 'Butter Naan & Paneer', surgeMultiplier: 1.1 },
  { hour: '20:00', hourNum: 20, orders: 29, intensity: 'rush', waitEstMin: 15, topItem: 'Special Dinner Combo', surgeMultiplier: 1.2 },
  { hour: '21:00', hourNum: 21, orders: 11, intensity: 'calm', waitEstMin: 5, topItem: 'Dessert Brownie', surgeMultiplier: 1.0 }
];

export const RushHeatmap: React.FC = () => {
  const [selectedHour, setSelectedHour] = useState<HourlyHeatmapCell>(() => {
    const currentHour = new Date().getHours();
    const match = HEATMAP_HOURS.find(h => h.hourNum === currentHour);
    return match || HEATMAP_HOURS[4]; // Default to lunch 12:00
  });
  const [liveHeatmap, setLiveHeatmap] = useState<HourlyHeatmapCell[]>(HEATMAP_HOURS);
  const [loading, setLoading] = useState(false);
  const [aiRushInsight, setAiRushInsight] = useState<string>(
    'Peak lunch surge anticipated between 12:15 PM and 1:45 PM. Kitchen prep buffer recommends staging 35+ Thali bases and pre-steaming rice by 11:45 AM.'
  );

  const fetchLiveRushData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, predRes] = await Promise.all([
        analyticsApi.getDashboardAnalytics(),
        predictionApi.getPredictions()
      ]);

      if (analyticsRes.success && analyticsRes.data?.hourlyRushData) {
        const merged = HEATMAP_HOURS.map(slot => {
          const matched = analyticsRes.data?.hourlyRushData.find(
            d => d.hour.startsWith(slot.hour.substring(0, 2))
          );
          if (matched) {
            const count = matched.orders;
            let intensity: HourlyHeatmapCell['intensity'] = 'calm';
            if (count > 30) intensity = 'extreme';
            else if (count > 18) intensity = 'rush';
            else if (count > 8) intensity = 'moderate';

            return {
              ...slot,
              orders: count,
              intensity,
              waitEstMin: Math.max(3, Math.round(count * 0.48))
            };
          }
          return slot;
        });
        setLiveHeatmap(merged);
      }

      if (predRes.success && predRes.data?.aiInsights) {
        if (typeof predRes.data.aiInsights === 'object' && predRes.data.aiInsights.peakRushHours) {
          setAiRushInsight(predRes.data.aiInsights.peakRushHours);
        }
      }
    } catch (err) {
      console.error('Failed to load heatmap dynamics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRushData();
  }, []);

  const getIntensityColor = (intensity: HourlyHeatmapCell['intensity'], isSelected: boolean) => {
    switch (intensity) {
      case 'extreme':
        return isSelected
          ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400'
          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300';
      case 'rush':
        return isSelected
          ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300';
      case 'moderate':
        return isSelected
          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200';
      default:
        return isSelected
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const currentHourNum = new Date().getHours();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-base text-slate-900">Predictive AI Kitchen Rush & Demand Heatmap</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                LIVE DENSITY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Hour-by-hour dining congestion, prep bottlenecks & automated surge staffing radar
            </p>
          </div>
        </div>

        <button
          onClick={fetchLiveRushData}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {/* Interactive Timeline Heatmap Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
          <span>Campus Operating Hours (08:00 - 22:00)</span>
          <span className="text-emerald-700">Click any hour slot to inspect projected kitchen pressure</span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {liveHeatmap.map(slot => {
            const isCurrent = slot.hourNum === currentHourNum;
            const isSelected = selectedHour.hour === slot.hour;

            return (
              <motion.button
                key={slot.hour}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedHour(slot)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${getIntensityColor(
                  slot.intensity,
                  isSelected
                )}`}
              >
                {isCurrent && (
                  <span className="absolute -top-1.5 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}

                <span className="text-[10px] font-mono font-black">{slot.hour}</span>
                <span className="text-xs font-black mt-1">{slot.orders}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">
                  {slot.intensity === 'extreme' ? '🔥 Heavy' : slot.intensity === 'rush' ? '⚡ Rush' : slot.intensity === 'moderate' ? 'Mod' : 'Calm'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Slot Detailed Deep Dive & Sparkline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left: Sparkline Curve of Today's Rush Profile (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span className="font-black text-xs text-slate-800 uppercase tracking-wider">
                Full-Day Dining Velocity Curve
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              Peak: 13:00 (45 orders)
            </span>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveHeatmap} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="rushGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val: any) => [`${val} orders expected`, 'Projected Load']}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#rushGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Selected Hour Diagnostics Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-slate-800 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-sm font-black text-amber-300">
                  Window @ {selectedHour.hour}
                </span>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  selectedHour.intensity === 'extreme'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : selectedHour.intensity === 'rush'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedHour.intensity} Pressure
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Est. Ticket Velocity
                </span>
                <span className="text-lg font-black text-white">{selectedHour.orders} orders</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Avg Wait Time
                </span>
                <span className="text-lg font-black text-amber-400">~{selectedHour.waitEstMin} mins</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Primary Menu Driver:</span>
                <span className="text-emerald-400 font-bold">{selectedHour.topItem}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/40">
                <span className="text-slate-400 text-[11px]">Counter Staff Recommendation:</span>
                <span className="text-white font-bold">
                  {selectedHour.orders > 30 ? '3 Line Cooks + 2 Dispatch' : selectedHour.orders > 15 ? '2 Line Cooks + 1 Dispatch' : '1 Line Cook'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Auto-throttles prep notifications to students based on queue load</span>
          </div>
        </div>
      </div>

      {/* AI Kitchen Operations Insight Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-amber-950">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-black uppercase tracking-wider text-[10px] text-amber-800 block">
            Gemini Kitchen Dispatch Co-Pilot
          </span>
          <p className="font-medium text-amber-900 leading-relaxed">
            {aiRushInsight}
          </p>
        </div>
      </div>
    </div>
  );
};

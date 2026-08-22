import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { orderApi } from '../services/api';
import { Order } from '../types/index';
import {
  Clock,
  Flame,
  Users,
  Utensils,
  MapPin,
  CheckCircle2,
  ChefHat,
  Bell,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Calculator,
  RefreshCw,
  ShoppingBag,
  Coffee,
  Check
} from 'lucide-react';

interface CounterQueuePageProps {
  onNavigate: (view: string) => void;
}

export const CounterQueuePage: React.FC<CounterQueuePageProps> = ({ onNavigate }) => {
  const { queueStatus, refreshQueue } = useQueue();
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Interactive Wait Time Estimator State
  const [selectedItemTypes, setSelectedItemTypes] = useState<{ [key: string]: number }>({
    chai_tea: 0,
    beverage: 0,
    fries: 0,
    sandwich: 0,
    burger: 0,
    thali: 0
  });

  const fetchLiveCounterOrders = async () => {
    setLoading(true);
    try {
      await refreshQueue();
      // Fetch public queue snapshot
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Queue refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCounterOrders();
    const interval = setInterval(fetchLiveCounterOrders, 12000);
    return () => clearInterval(interval);
  }, []);

  const servingToken = queueStatus?.currentlyServingToken ?? 118;
  const activeQueueCount = queueStatus?.totalActiveOrders ?? 4;
  const estimatedWait = queueStatus?.estimatedWaitMinutes ?? 10;
  const rushLevel = queueStatus?.rushLevel ?? 'MODERATE';

  // Calculate customized estimated wait for walk-in items
  const calculateCustomWait = () => {
    let baseTime = activeQueueCount * 2.5; // base queue congestion
    const items = selectedItemTypes;
    let itemPrep = 0;
    if (items.chai_tea > 0) itemPrep = Math.max(itemPrep, 3 + (items.chai_tea - 1) * 1);
    if (items.beverage > 0) itemPrep = Math.max(itemPrep, 4 + (items.beverage - 1) * 1);
    if (items.fries > 0) itemPrep = Math.max(itemPrep, 5 + (items.fries - 1) * 1.5);
    if (items.sandwich > 0) itemPrep = Math.max(itemPrep, 7 + (items.sandwich - 1) * 2);
    if (items.burger > 0) itemPrep = Math.max(itemPrep, 9 + (items.burger - 1) * 2.5);
    if (items.thali > 0) itemPrep = Math.max(itemPrep, 11 + (items.thali - 1) * 3);

    const totalCalculated = Math.round(Math.max(itemPrep, baseTime + itemPrep * 0.4));
    return totalCalculated || estimatedWait;
  };

  const totalSelectedItems: number = (Object.values(selectedItemTypes) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-700" />
              <span>Floor 4th Main Counter</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
              INDIYA Cafeteria
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] uppercase tracking-wide">
              Counter Pickup Only • No Delivery
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Live Counter Queue & Wait-Time Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Planning to buy directly at the Floor 4th counter? Check real-time token queues, expected kitchen cooking durations, and current cafeteria traffic before walking up.
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
          <button
            onClick={fetchLiveCounterOrders}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-2 border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Live Queue'}</span>
          </button>
          <span className="text-[10px] text-slate-400">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Token Serving Card */}
        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Currently Serving At Counter
            </span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-600"></span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-purple-950 tracking-tight">
              #{servingToken}
            </span>
            <span className="text-xs text-purple-700 font-semibold">Floor 4th Display</span>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Staff is actively calling and handing over food tokens at the Floor 4th pickup window.
          </p>
        </div>

        {/* Queue Length Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Orders In Kitchen Queue
            </span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900">
              {activeQueueCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">tokens waiting ahead</span>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  activeQueueCount > 10 ? 'bg-rose-500' : activeQueueCount > 5 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(15, activeQueueCount * 10))}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              rushLevel === 'PEAK' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              rushLevel === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {rushLevel} Rush
            </span>
          </div>
        </div>

        {/* Expected Wait Time Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Expected Wait
            </span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-emerald-700">
              ~{estimatedWait}
            </span>
            <span className="text-base font-bold text-slate-700">mins</span>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Estimated time from order placement to counter readiness at Floor 4th.
          </p>
        </div>
      </div>

      {/* Critical Pickup Policy Callout */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Important: Counter Pickup Only (No Delivery)
            </h3>
            <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
              When your order status turns <strong>READY</strong>, you must collect it in-person at the <strong>Floor 4th Counter</strong>. Simply show your <strong>Order Number / Token Number</strong> on your mobile screen to the counter staff to receive your hot meal.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('menu')}
          className="shrink-0 px-4 py-2.5 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
        >
          <span>Order Ahead Online</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two Column Layout: Wait Time Calculator & Item Cooking Cheat Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Walk-In Wait Time Estimator */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Walk-In Wait Time Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Select items you wish to purchase to simulate estimated counter cooking time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'chai_tea', label: 'Tea / Masala Chai', time: '2-3 min', price: '₹20-25' },
              { key: 'beverage', label: 'Cold Coffee / Soda', time: '3-4 min', price: '₹35-65' },
              { key: 'fries', label: 'Peri-Peri / Salted Fries', time: '5 min', price: '₹50-85' },
              { key: 'sandwich', label: 'Grilled Sandwiches', time: '6-8 min', price: '₹65-80' },
              { key: 'burger', label: 'Crispy Veg / Cheese Burger', time: '8-10 min', price: '₹60-95' },
              { key: 'thali', label: 'INDIYA Special Thalis', time: '8-12 min', price: '₹85-150' }
            ].map(item => {
              const qty = selectedItemTypes[item.key] || 0;
              return (
                <div
                  key={item.key}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    qty > 0 ? 'bg-purple-50/50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 truncate pr-1">{item.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>{item.time}</span>
                    <span className="font-semibold text-slate-700">{item.price}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setSelectedItemTypes(prev => ({ ...prev, [item.key]: Math.max(0, qty - 1) }))}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-900">{qty}</span>
                    <button
                      onClick={() => setSelectedItemTypes(prev => ({ ...prev, [item.key]: qty + 1 }))}
                      className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center hover:bg-purple-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculator Output */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Simulated Wait Time at Floor 4th Counter
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl font-black text-emerald-400">
                  ~{calculateCustomWait()} mins
                </span>
                <span className="text-xs text-slate-300">
                  ({totalSelectedItems > 0 ? `${totalSelectedItems} items selected` : 'average ticket'})
                </span>
              </div>
            </div>

            <div className="flex space-x-2 w-full sm:w-auto">
              {totalSelectedItems > 0 && (
                <button
                  onClick={() => setSelectedItemTypes({ chai_tea: 0, beverage: 0, fries: 0, sandwich: 0, burger: 0, thali: 0 })}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => onNavigate('menu')}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Order on Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: How Counter Ordering Works */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Floor 4th Counter Guide
              </h2>
              <p className="text-xs text-slate-500">
                Walk-in purchase & order collection procedure
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Walk Up to Floor 4th Counter</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Head to INDIYA Cafeteria on the 4th floor. Order from the cashier terminal with Cash, UPI QR, or Campus Smart Card.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Receive Printed Token Number</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  The cashier gives you a physical slip with your 3-digit Token Number (e.g. Token #125).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Watch the Live Display or Web Screen</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Track the overhead LED token display or this live web page to see when your token reaches <strong>READY</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Show Token & Collect (No Delivery)</h4>
                <p className="text-[11px] text-emerald-900/80 mt-0.5 leading-relaxed">
                  Present your token slip or digital phone screen at the counter handover window to collect your hot meal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Average Cooking Durations Cheat Sheet */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              INDIYA Cafeteria Menu Prep Times & Pricing
            </h3>
            <p className="text-xs text-slate-500">
              Standard prep windows under normal kitchen operating loads
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full self-start sm:self-auto">
            100% Freshly Prepared
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {[
            { name: 'Kulhad Chai & Tea', time: '2 - 3 mins', price: 'From ₹20', icon: Coffee },
            { name: 'Cold Coffee & Drinks', time: '3 - 4 mins', price: 'From ₹35', icon: Sparkles },
            { name: 'Crispy Fries', time: '5 mins', price: 'From ₹50', icon: Utensils },
            { name: 'Grilled Sandwiches', time: '6 - 8 mins', price: 'From ₹65', icon: Utensils },
            { name: 'Veg & Paneer Burgers', time: '8 - 10 mins', price: 'From ₹60', icon: Utensils },
            { name: 'Special Thalis', time: '8 - 12 mins', price: 'From ₹85', icon: Utensils }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="w-8 h-8 rounded-xl bg-white text-purple-700 flex items-center justify-center mx-auto shadow-2xs border border-slate-200">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 pt-1">{item.name}</div>
                <div className="text-xs font-bold text-emerald-700">{item.time}</div>
                <div className="text-[10px] text-slate-500 font-medium">{item.price}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

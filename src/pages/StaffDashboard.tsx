import React, { useState, useEffect } from 'react';
import { orderApi, foodApi } from '../services/api';
import { Order, OrderStatus, FoodItem } from '../types/index';
import { socketService } from '../services/socket';
import { FlipDigit } from '../components/FlipDigit';
import { RushHeatmap } from '../components/RushHeatmap';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Bell,
  RefreshCw,
  Flame,
  AlertTriangle,
  Utensils,
  CheckCheck,
  XCircle,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StaffDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockFilterCategory, setStockFilterCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'kds' | 'heatmap' | 'stock'>('kds');
  const [buzzerActive, setBuzzerActive] = useState<string | null>(null);

  const fetchKdsData = async () => {
    setIsRefreshing(true);
    try {
      const [orderRes, foodRes] = await Promise.all([
        orderApi.getAllOrders(),
        foodApi.getFoodItems()
      ]);

      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
      if (foodRes.success && foodRes.data) {
        setFoodItems(foodRes.data);
      }
    } catch (err) {
      console.error('Error fetching KDS data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKdsData();

    const unsubOrderCreated = socketService.onOrderCreated(({ order }) => {
      setOrders(prev => {
        if (prev.some(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    const unsubStatusUpdated = socketService.onOrderStatusUpdated(({ order }) => {
      setOrders(prev => prev.map(o => (o.id === order.id ? order : o)));
    });

    const unsubStockUpdated = socketService.onFoodStockUpdated(({ foodItem }) => {
      setFoodItems(prev => prev.map(f => (f.id === foodItem.id ? foodItem : f)));
    });

    const interval = setInterval(fetchKdsData, 8000);

    return () => {
      unsubOrderCreated();
      unsubStatusUpdated();
      unsubStockUpdated();
      clearInterval(interval);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === 'READY') {
      setBuzzerActive(orderId);
      setTimeout(() => setBuzzerActive(null), 3000);
    }

    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() } : o))
    );

    try {
      const res = await orderApi.updateOrderStatus(orderId, nextStatus);
      if (res.success && res.data) {
        setOrders(prev => prev.map(o => (o.id === orderId ? res.data! : o)));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      fetchKdsData();
    }
  };

  const handleToggleStock = async (foodId: string) => {
    try {
      const res = await foodApi.toggleAvailability(foodId);
      if (res.success) {
        setFoodItems(prev =>
          prev.map(f => (f.id === foodId ? { ...f, available: !f.available } : f))
        );
      }
    } catch (err) {
      console.error('Error toggling item stock:', err);
    }
  };

  // Elapsed wait timer calculation
  const getOrderElapsedMinutes = (placedAt: string) => {
    const diffMs = Date.now() - new Date(placedAt).getTime();
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  const placedOrders = orders.filter(o => o.status === 'PLACED');
  const preparingOrders = orders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'READY');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').slice(0, 10);

  const totalActiveTickets = placedOrders.length + preparingOrders.length + readyOrders.length;

  return (
    <div className="space-y-6 py-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-900 dark:text-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Live Kitchen Display System ({totalActiveTickets} Active {totalActiveTickets === 1 ? 'Ticket' : 'Tickets'})
              </h1>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-brand-subtle text-brand-primary border border-brand-subtle">
                Floor 4th Express
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Live drag/tap order dispatching, visual urgency heatmaps & real-time counter calls
            </p>
          </div>
        </div>

        {/* View Switcher & Live Refresh */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'kds' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kitchen Tickets ({totalActiveTickets})
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'heatmap' ? 'bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Rush Heatmap</span>
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'stock' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Stock Control ({foodItems.filter(f => !f.available).length} Out)
            </button>
          </div>

          <button
            onClick={fetchKdsData}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Refresh KDS"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {activeTab === 'kds' ? (
        /* 4-Column Hyper-Dynamic Kanban KDS */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Col 1: Incoming Orders */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col h-[750px] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <h3 className="font-black text-xs uppercase tracking-wider text-amber-900">
                  1. Incoming ({placedOrders.length})
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {placedOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">No pending incoming tickets</div>
              ) : (
                placedOrders.map(order => {
                  const elapsed = getOrderElapsedMinutes(order.placedAt);
                  const isUrgent = elapsed > 6;

                  return (
                    <motion.div
                      layout
                      key={order.id}
                      className={`bg-slate-50 border-2 rounded-2xl p-4 space-y-3 shadow-sm transition-all ${
                        isUrgent ? 'border-rose-400 bg-rose-50/40 animate-pulse' : 'border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-amber-900">
                          Token #{order.tokenNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          {elapsed}m ago
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <div className="font-black text-slate-900">{order.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{order.paymentMethod}</div>
                      </div>

                      <div className="bg-white rounded-xl p-2.5 space-y-1.5 divide-y divide-slate-100 border border-slate-200">
                        {order.items.map(item => (
                          <div key={item.foodItemId} className="pt-1.5 first:pt-0 flex justify-between text-xs text-slate-800">
                            <span className="font-black text-emerald-700">{item.quantity}x</span>
                            <span className="truncate flex-1 ml-2 font-medium">{item.name}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200 font-medium">
                          ⚠️ {order.notes}
                        </div>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Accept & Start Cook 🍳</span>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Col 2: In Kitchen Prep */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col h-[750px] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                  2. In Preparation ({preparingOrders.length})
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">No active kitchen orders</div>
              ) : (
                preparingOrders.map(order => {
                  const elapsed = getOrderElapsedMinutes(order.placedAt);
                  const isDelayed = elapsed > 10;

                  return (
                    <motion.div
                      layout
                      key={order.id}
                      className={`bg-slate-50 border rounded-2xl p-4 space-y-3 shadow-sm ${
                        isDelayed ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-slate-900">
                          Token #{order.tokenNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDelayed ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                          Cooking {elapsed}m
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <div className="font-black text-slate-900">{order.studentName}</div>
                        <div className="text-[11px] text-slate-500">Target Prep: ~{order.estimatedPreparationTime} mins</div>
                      </div>

                      <div className="bg-white rounded-xl p-2.5 space-y-1.5 divide-y divide-slate-100 border border-slate-200">
                        {order.items.map(item => (
                          <div key={item.foodItemId} className="pt-1.5 first:pt-0 flex justify-between text-xs text-slate-800">
                            <span className="font-black text-emerald-700">{item.quantity}x</span>
                            <span className="truncate flex-1 ml-2 font-medium">{item.name}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md hover:scale-[1.02] active:scale-95"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Ready & Ring Counter Bell 🔔</span>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Col 3: Ready at Counter */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col h-[750px] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-600 animate-bounce" />
                <h3 className="font-black text-xs uppercase tracking-wider text-emerald-900">
                  3. Ready for Pickup ({readyOrders.length})
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {readyOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">No food waiting at counter</div>
              ) : (
                readyOrders.map(order => (
                  <motion.div
                    layout
                    key={order.id}
                    className="bg-emerald-50/80 border-2 border-emerald-400 rounded-2xl p-4 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-emerald-950">
                        Token #{order.tokenNumber}
                      </span>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                        Counter #1
                      </span>
                    </div>

                    <div className="text-xs font-black text-slate-900">
                      {order.studentName}
                    </div>

                    <div className="bg-white rounded-xl p-2.5 text-xs text-slate-700 space-y-1 border border-emerald-200">
                      {order.items.map(item => (
                        <div key={item.foodItemId} className="flex justify-between">
                          <span className="font-bold text-emerald-700">{item.quantity}x</span>
                          <span className="truncate flex-1 ml-2 font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Handover to Student</span>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Col 4: Completed History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col h-[750px] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-600">
                  4. Completed Today ({completedOrders.length})
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {completedOrders.map(order => (
                <div
                  key={order.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600"
                >
                  <div className="flex justify-between font-black text-slate-800">
                    <span>Token #{order.tokenNumber}</span>
                    <span className="text-emerald-700 font-bold">₹{order.totalAmount}</span>
                  </div>
                  <div className="text-[11px] truncate text-slate-500">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'heatmap' ? (
        /* Predictive AI Demand & Rush Heatmap */
        <RushHeatmap />
      ) : (
        /* Stock Management Screen */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">Instant Kitchen Inventory & Stock Toggle</h2>
              <p className="text-xs text-slate-500">
                1-Tap item blackout when an ingredient is exhausted to immediately stop student orders
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {['All', 'Breakfast', 'Snacks', 'Meals', 'Beverages', 'Desserts'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setStockFilterCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    stockFilterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodItems
              .filter(f => stockFilterCategory === 'All' || f.category === stockFilterCategory)
              .map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    item.available
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-rose-50/40 border-rose-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-slate-900 truncate">{item.name}</h4>
                      <div className="text-[11px] text-slate-500">
                        ₹{item.price} • {item.category}
                      </div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStock(item.id)}
                    className={`p-2.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                      item.available
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.available ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Out of Stock</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Restock</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

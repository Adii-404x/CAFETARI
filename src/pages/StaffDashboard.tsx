import React, { useState, useEffect } from 'react';
import { orderApi, foodApi } from '../services/api.ts';
import { Order, OrderStatus, FoodItem } from '../types/index.ts';
import { socketService } from '../services/socket.ts';
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
  ToggleLeft,
  ToggleRight,
  Radio
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockFilterCategory, setStockFilterCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'kds' | 'stock'>('kds');

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

    // Real-time socket listeners for KDS
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

    // Fallback polling interval
    const interval = setInterval(fetchKdsData, 10000);

    return () => {
      unsubOrderCreated();
      unsubStatusUpdated();
      unsubStockUpdated();
      clearInterval(interval);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() } : o)));
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

  // Group orders into KDS columns
  const placedOrders = orders.filter(o => o.status === 'PLACED');
  const preparingOrders = orders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'READY');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').slice(0, 10);

  return (
    <div className="space-y-6 py-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">Kitchen Display System (KDS)</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-purple-50 text-purple-800 border border-purple-200">
                Floor 4th Counter
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Kitchen ticket queue, prep timings & real-time stock availability
            </p>
          </div>
        </div>

        {/* View Switcher & Live Refresh */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'kds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Tickets ({placedOrders.length + preparingOrders.length + readyOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'stock' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Control ({foodItems.filter(f => !f.available).length} Out)
            </button>
          </div>

          <button
            onClick={fetchKdsData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {activeTab === 'kds' ? (
        /* 4-Column Kanban KDS */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Col 1: Incoming (PLACED) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-[750px] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                  1. Incoming Orders
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {placedOrders.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {placedOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No pending incoming orders</div>
              ) : (
                placedOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-slate-50 border-2 border-amber-300 rounded-xl p-3.5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-amber-800">
                        Token #{order.tokenNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-slate-900">{order.studentName}</div>
                      <div className="text-[11px] text-slate-500">{order.studentEmail}</div>
                    </div>

                    <div className="bg-white rounded-lg p-2 space-y-1 divide-y divide-slate-100 border border-slate-200">
                      {order.items.map(item => (
                        <div key={item.foodItemId} className="pt-1 first:pt-0 flex justify-between text-xs text-slate-800">
                          <span className="font-bold text-emerald-700">{item.quantity}x</span>
                          <span className="truncate flex-1 ml-2">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="text-[11px] bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                        ⚠️ Note: {order.notes}
                      </div>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Accept & Cook 🍳
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Col 2: In Preparation (PREPARING) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-[750px] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  2. In Kitchen Prep
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {preparingOrders.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No tickets in preparation</div>
              ) : (
                preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">
                        Token #{order.tokenNumber}
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                        Cooking...
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-slate-900">{order.studentName}</div>
                      <div className="text-[11px] text-slate-500">Prep time: ~{order.estimatedPreparationTime} mins</div>
                    </div>

                    <div className="bg-white rounded-lg p-2 space-y-1 divide-y divide-slate-100 border border-slate-200">
                      {order.items.map(item => (
                        <div key={item.foodItemId} className="pt-1 first:pt-0 flex justify-between text-xs text-slate-800">
                          <span className="font-bold text-emerald-700">{item.quantity}x</span>
                          <span className="truncate flex-1 ml-2">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="text-[11px] bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                        ⚠️ Note: {order.notes}
                      </div>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup 🔔</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Col 3: Ready for Pickup (READY) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-[750px] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-600 animate-bounce" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                  3. Ready at Counter
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {readyOrders.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {readyOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No orders waiting for pickup</div>
              ) : (
                readyOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-emerald-50/70 border-2 border-emerald-400 rounded-xl p-3.5 space-y-3 shadow-xs animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-emerald-800">
                        Token #{order.tokenNumber}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase shadow-xs">
                        Counter #1
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      {order.studentName}
                    </div>

                    <div className="bg-white rounded-lg p-2 text-xs text-slate-700 space-y-1 border border-emerald-200">
                      {order.items.map(item => (
                        <div key={item.foodItemId} className="flex justify-between">
                          <span className="font-bold text-emerald-700">{item.quantity}x</span>
                          <span className="truncate flex-1 ml-2">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Handover & Complete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Col 4: Completed (COMPLETED) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-[750px] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  4. Completed Today
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {completedOrders.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {completedOrders.map(order => (
                <div
                  key={order.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-600"
                >
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Token #{order.tokenNumber}</span>
                    <span className="text-emerald-700">₹{order.totalAmount}</span>
                  </div>
                  <div className="text-[11px] truncate text-slate-500">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Kitchen Quick Stock Management */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Item Stock Control</h2>
              <p className="text-xs text-slate-500">
                Quickly toggle food availability in 1 tap when an ingredient or batch runs out
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {['All', 'Breakfast', 'Snacks', 'Meals', 'Beverages', 'Desserts'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setStockFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    stockFilterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
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
                      ? 'bg-white border-slate-200 shadow-xs'
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
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      <div className="text-[11px] text-slate-500">
                        ₹{item.price} • {item.category}
                      </div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
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
                    className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${
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

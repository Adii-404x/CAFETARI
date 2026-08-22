import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useCart } from '../context/CartContext';
import { orderApi, foodApi } from '../services/api';
import { FoodItem, Order } from '../types/index';
import { initialFoodItems } from '../data/menuData';
import { QueueTicker } from '../components/QueueTicker';
import { MenuCard } from '../components/MenuCard';
import {
  Utensils,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  History,
  TrendingUp,
  Flame,
  Award,
  User as UserIcon,
  Wallet
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onTrackOrder }) => {
  const { user } = useAuth();
  const { activeOrder } = useQueue();
  const { addToCart, setDrawerOpen } = useCart();

  const [popularItems, setPopularItems] = useState<FoodItem[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [foodRes, orderRes] = await Promise.all([
          foodApi.getFoodItems({ availableOnly: true }),
          orderApi.getMyOrders()
        ]);

        if (foodRes.success && Array.isArray(foodRes.data) && foodRes.data.length > 0) {
          setPopularItems(foodRes.data.filter(f => f.isPopular).slice(0, 4));
        } else {
          setPopularItems(initialFoodItems.filter(f => f.isPopular).slice(0, 4));
        }

        if (orderRes.success && orderRes.data) {
          setPastOrders(orderRes.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleReorder = (order: Order) => {
    order.items.forEach(it => {
      // Find food item or create temporary object
      const foodItem: FoodItem = {
        id: it.foodItemId,
        name: it.name,
        description: 'Re-ordered campus favorite',
        category: 'Snacks',
        price: it.price,
        image: it.image,
        available: true,
        preparationTime: 10,
        isVegetarian: true,
        createdAt: '',
        updatedAt: ''
      };
      addToCart(foodItem, it.quantity);
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Student Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
              {user?.department || 'Department of Computer Science & Engineering'}
            </span>
            <span className="text-xs text-slate-500 font-medium">ID: {user?.studentId || 'CS2023089'}</span>
            <button
              onClick={() => onNavigate('user_profile')}
              className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
              title="Campus Card Balance - Click to Recharge"
            >
              <Wallet className="w-3 h-3 text-emerald-700" />
              <span>Campus Card: ₹{(user?.walletBalance ?? 500).toFixed(2)}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'} 👋
          </h1>
          <p className="text-xs text-slate-500">
            Check live queue times and place your order in 2 clicks.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate('user_profile')}
            className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
            title="View Profile & Settings"
          >
            <UserIcon className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Profile</span>
          </button>
          <button
            onClick={() => onNavigate('order_history')}
            className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
            title="Past Orders"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>Order Food</span>
          </button>
        </div>
      </div>

      {/* Active Order Card Alert */}
      {activeOrder && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm text-slate-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                #{activeOrder.tokenNumber}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base text-slate-900">
                    Order #{activeOrder.orderNumber}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${activeOrder.status === 'READY' ? 'bg-emerald-600 text-white animate-bounce shadow-xs' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Est. Prep: ~{activeOrder.estimatedPreparationTime} mins</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onTrackOrder(activeOrder.id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Live Order Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Live Campus Queue Ticker */}
      <QueueTicker onViewOrderTracker={() => onNavigate('order_tracking')} />

      {/* Popular Today Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Trending on Campus Today</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularItems.map(item => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      {pastOrders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-base text-slate-900">Recent Campus Orders</h3>
            </div>
            <button
              onClick={() => onNavigate('order_history')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              View All Past Receipts
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pastOrders.map(order => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-800">
                    #{order.tokenNumber}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ₹{order.totalAmount} • {new Date(order.placedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    {order.status}
                  </span>
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    Reorder ⚡
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

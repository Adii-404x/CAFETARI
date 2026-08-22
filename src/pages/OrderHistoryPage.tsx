import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { Order, FoodItem } from '../types/index';
import { useCart } from '../context/CartContext';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  History,
  Clock,
  CheckCircle2,
  Utensils,
  Star,
  Search,
  ArrowRight,
  Receipt
} from 'lucide-react';

interface OrderHistoryPageProps {
  onNavigate: (view: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate, onTrackOrder }) => {
  const { addToCart, setDrawerOpen } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await orderApi.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleReorder = (order: Order) => {
    order.items.forEach(it => {
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

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.tokenNumber.toString().includes(search) ||
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-subtle border border-brand-subtle text-brand-primary text-[10px] font-bold uppercase tracking-wider">
            <History className="w-3 h-3 text-brand-primary" />
            <span>Past Campus Dining</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {search.trim() ? `Order History • Search for "${search}" (${filteredOrders.length})` : `Your Order History (${orders.length} ${orders.length === 1 ? 'Receipt' : 'Receipts'})`}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            View receipts, live statuses, and re-order in 1 tap.
          </p>
        </div>

        <button
          onClick={() => onNavigate('menu')}
          className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
        >
          <Utensils className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order #, token, or item..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['ALL', 'PREPARING', 'READY', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl h-24 animate-pulse shadow-xs" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any orders matching these filters yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isOngoing = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 sm:p-6 transition-all text-slate-900 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-200">
                      #{order.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">Order #{order.orderNumber}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'READY'
                            ? 'bg-emerald-600 text-white animate-bounce shadow-xs'
                            : order.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(order.placedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">₹{order.totalAmount}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{order.paymentMethod.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap gap-2">
                  {order.items.map(item => (
                    <div
                      key={item.foodItemId}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center space-x-1.5"
                    >
                      <span className="font-bold text-emerald-700">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Reorder Tray ⚡
                    </button>
                    <button
                      onClick={() => setActiveFeedbackOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Review</span>
                    </button>
                  </div>

                  {isOngoing && (
                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Open Live Tracker</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {activeFeedbackOrder && (
        <FeedbackModal
          orderId={activeFeedbackOrder.id}
          orderNumber={activeFeedbackOrder.orderNumber}
          onClose={() => setActiveFeedbackOrder(null)}
          onSuccess={() => {
            alert('Feedback submitted!');
          }}
        />
      )}
    </div>
  );
};

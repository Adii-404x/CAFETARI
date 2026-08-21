import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api.ts';
import { Order } from '../types/index.ts';
import { socketService } from '../services/socket.ts';
import { OrderTimeline } from '../components/OrderTimeline.tsx';
import { FeedbackModal } from '../components/FeedbackModal.tsx';
import {
  Clock,
  CheckCircle2,
  Bell,
  ArrowLeft,
  Receipt,
  Star,
  RefreshCw,
  Utensils,
  AlertCircle,
  Radio
} from 'lucide-react';

interface OrderTrackingPageProps {
  orderId?: string | null;
  onNavigate: (view: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrder = async () => {
    setIsRefreshing(true);
    try {
      if (orderId) {
        const res = await orderApi.getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
          socketService.trackOrder(res.data.id);
        }
      } else {
        // Fetch active order
        const res = await orderApi.getMyOrders();
        if (res.success && res.data && res.data.length > 0) {
          // Find first ongoing or latest
          const ongoing = res.data.find(o => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
          const target = ongoing || res.data[0];
          setOrder(target);
          if (target) {
            socketService.trackOrder(target.id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching order for tracking:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Listen to real-time status updates from Socket.IO
    const unsubscribeStatus = socketService.onOrderStatusUpdated(({ order: updatedOrder }) => {
      setOrder(prev => {
        if (!prev) return updatedOrder;
        if (prev.id === updatedOrder.id) {
          return updatedOrder;
        }
        return prev;
      });
    });

    // Fallback polling every 8s
    const interval = setInterval(fetchOrder, 8000);

    return () => {
      unsubscribeStatus();
      clearInterval(interval);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Connecting to CAFETARI Live Token System...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No active order to track</h3>
        <p className="text-xs text-slate-500">
          Place an order from the CAFETARI menu to get your live queue token.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          Browse CAFETARI Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('student_dashboard')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={fetchOrder}
          className="flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Live Sync</span>
        </button>
      </div>

      {/* Main Token Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-900 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mb-4 shadow-xs">
          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
          <span>Order #{order.orderNumber}</span>
        </div>

        <div className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">
          Your Pickup Token Number
        </div>
        <div className="text-6xl sm:text-7xl font-black tracking-tight text-emerald-700 my-2">
          #{order.tokenNumber}
        </div>

        <div className="text-xs text-slate-500 mt-2 font-medium">
          Placed at: {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        {/* Timeline Component */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <OrderTimeline
            status={order.status}
            estimatedWaitMinutes={order.estimatedPreparationTime}
          />
        </div>
      </div>

      {/* Order Item Summary Receipt */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Order Breakdown</h3>
          <span className="text-xs font-semibold text-slate-500">{order.items.length} items</span>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map(item => (
            <div key={item.foodItemId} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                <div>
                  <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                  <div className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.price}</div>
                </div>
              </div>
              <div className="font-bold text-xs text-slate-900">
                ₹{item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Payment Method</span>
            <span className="font-semibold text-slate-800">{order.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Payment Status</span>
            <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {order.paymentStatus}
            </span>
          </div>
          {order.notes && (
            <div className="flex justify-between text-slate-500">
              <span>Chef Notes</span>
              <span className="italic text-slate-700">"{order.notes}"</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Bill Paid</span>
            <span className="text-emerald-700 text-base">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Action Footer: Feedback & Reorder */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="flex-1 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
        >
          <Star className="w-4 h-4 text-emerald-600" />
          <span>Rate Meal & Service</span>
        </button>

        <button
          onClick={() => onNavigate('menu')}
          className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
        >
          <Utensils className="w-4 h-4" />
          <span>Order Something Else</span>
        </button>
      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          onClose={() => setIsFeedbackOpen(false)}
          onSuccess={() => {
            alert('Thank you for rating your cafeteria meal!');
          }}
        />
      )}
    </div>
  );
};

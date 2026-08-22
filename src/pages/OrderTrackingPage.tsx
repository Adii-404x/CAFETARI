import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { Order, OrderStatus } from '../types/index';
import { socketService } from '../services/socket';
import { OrderTimeline } from '../components/OrderTimeline';
import { FeedbackModal } from '../components/FeedbackModal';
import { ThemeChooserModal } from '../components/ThemeChooserModal';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';
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
  Radio,
  ChefHat,
  Flame,
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
  QrCode,
  Share2,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTrackingPageProps {
  orderId?: string | null;
  onNavigate: (view: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const { colorTheme, isDark } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const playPickupChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext unavailable
    }
  };

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
          // If transitioning to READY, celebrate!
          if (prev.status !== 'READY' && updatedOrder.status === 'READY') {
            triggerCelebration();
            playPickupChime();
          }
          return updatedOrder;
        }
        return prev;
      });
    });

    const interval = setInterval(fetchOrder, 8000);

    return () => {
      unsubscribeStatus();
      clearInterval(interval);
    };
  }, [orderId]);

  const handleCopyToken = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.tokenNumber.toString());
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Demo status simulation for testing motion & progress animation
  const handleSimulateStatusCycle = async () => {
    if (!order) return;
    const statusCycle: OrderStatus[] = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
    const currentIndex = statusCycle.indexOf(order.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    if (nextStatus === 'READY') {
      triggerCelebration();
      playPickupChime();
    }

    setOrder(prev => (prev ? { ...prev, status: nextStatus } : null));

    try {
      await orderApi.updateOrderStatus(order.id, nextStatus);
    } catch (err) {
      console.error('Failed to simulate status transition:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"
        />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Connecting to CAFETARI Live Queue Satellite...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-sm"
      >
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white">No active order to track</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Place an order from the CAFETARI menu to receive your live digital token.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          Browse CAFETARI Menu
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto py-6 space-y-6 text-slate-900 dark:text-slate-100"
    >
      {/* Top Header & Actions Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => onNavigate('student_dashboard')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={soundEnabled ? 'Ready Bell Sound: ON' : 'Ready Bell Sound: MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Chooser Trigger */}
          <button
            onClick={() => setIsThemeOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Open Theme Chooser"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Live Sync */}
          <button
            onClick={fetchOrder}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Live Sync</span>
          </button>
        </div>
      </div>

      {/* Main Holographic Token Digital Board */}
      <motion.div
        layout
        className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-lg overflow-hidden space-y-6"
      >
        {/* Top Glowing Color Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Order Meta & Quick Copy */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold">
            <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Order #{order.orderNumber}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Floor 4th Express
            </span>
          </div>
        </div>

        {/* Dynamic Status Headline & Big Animated Token Number */}
        <div className="space-y-2">
          <motion.div
            key={order.status}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {order.status === 'READY'
                ? '🎉 Token is READY for Pickup!'
                : order.status === 'PREPARING'
                ? '🍳 Kitchen is Preparing Your Meal'
                : order.status === 'ACCEPTED'
                ? '👨‍🍳 Order Confirmed by Floor 4th Kitchen'
                : order.status === 'COMPLETED'
                ? '✨ Order Completed • Enjoy Your Meal'
                : '⏳ Order Placed • In Line'}
            </h2>
            <span className="text-xs uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mt-1 block">
              Official Pickup Token Number
            </span>
          </motion.div>

          <motion.div
            key={order.tokenNumber}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="flex items-center justify-center space-x-2 cursor-pointer group"
            onClick={handleCopyToken}
            title="Click to copy token number"
          >
            <span className="text-6xl sm:text-8xl font-black tracking-tight text-brand-primary select-all font-mono drop-shadow-xs">
              #{order.tokenNumber}
            </span>
            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-brand-subtle dark:bg-slate-800 dark:group-hover:bg-slate-700 text-slate-400 group-hover:text-brand-primary transition-colors">
              {copiedToken ? <Check className="w-4 h-4 text-brand-primary" /> : <Copy className="w-4 h-4" />}
            </div>
          </motion.div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Placed at: {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        {/* Live Framer-Motion Animated Timeline */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <OrderTimeline
            status={order.status}
            estimatedWaitMinutes={order.estimatedPreparationTime}
          />
        </div>

        {/* Interactive Kitchen Simulation Controls (Allows user to preview animated status updates) */}
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={handleSimulateStatusCycle}
            className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Simulate advancing the order status step to test framer-motion animations"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Simulate Kitchen Dispatch Step ➔ Next Status</span>
          </button>
        </div>
      </motion.div>

      {/* Order Item Summary Receipt Breakdown with Staggered Framer-Motion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Order Breakdown</h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{order.items.length} items</span>
        </div>

        <motion.div className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.items.map((item, idx) => (
            <motion.div
              key={item.foodItemId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Qty: {item.quantity} × ₹{item.price}</div>
                </div>
              </div>
              <div className="font-black text-xs text-slate-900 dark:text-white shrink-0">
                ₹{item.price * item.quantity}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Payment Method</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Payment Status</span>
            <span className={`font-black ${order.paymentStatus === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
              {order.paymentStatus}
            </span>
          </div>
          {order.notes && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Kitchen Notes</span>
              <span className="italic text-slate-700 dark:text-slate-300">"{order.notes}"</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Total Amount</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base">₹{order.totalAmount}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Footer: Feedback & Reorder */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="flex-1 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
        >
          <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Rate Meal & Service</span>
        </button>

        <button
          onClick={() => onNavigate('menu')}
          className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
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

      {/* Theme Chooser Modal */}
      <ThemeChooserModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />
    </motion.div>
  );
};

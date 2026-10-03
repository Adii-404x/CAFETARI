import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { orderApi, foodApi } from '../services/api';
import { FoodItem, PaymentMethod, RecommendedAddOn } from '../types/index';
import { CampusCard3D } from './CampusCard3D';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Wallet,
  QrCode,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Cpu,
  Check
} from 'lucide-react';

interface CartDrawerProps {
  onOrderPlaced: (orderId: string) => void;
  onOpenLogin: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderPlaced, onOpenLogin }) => {
  const { items, totalCount, totalAmount, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { colorTheme, currentConfig, isDark } = useTheme();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CAMPUS_CARD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedAddOn[]>([]);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [showMlInfoModal, setShowMlInfoModal] = useState<boolean>(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const walletBalance = user?.walletBalance ?? 500;
  const isInsufficientWallet = paymentMethod === 'CAMPUS_CARD' && walletBalance < totalAmount;

  // Calculate live cumulative prep time & calories
  const estimatedPrepTime = items.reduce((max, item) => Math.max(max, item.foodItem.preparationTime || 8), 0);
  const totalCalories = items.reduce((sum, item) => sum + (item.foodItem.calories || 220) * item.quantity, 0);

  // Fetch complementary ML recommendations based on active cart
  useEffect(() => {
    async function loadRecommendations() {
      if (items.length > 0) {
        setLoadingRecs(true);
        const itemIds = items.map(i => i.foodItem.id);
        const res = await foodApi.getRecommendations(itemIds, { limit: 3 });
        if (res.success && res.data) {
          setRecommendations(res.data);
        }
        setLoadingRecs(false);
      } else {
        // Empty tray: fetch trending meal starters
        const res = await foodApi.getRecommendations([], { limit: 2 });
        if (res.success && res.data) {
          setRecommendations(res.data);
        }
      }
    }
    if (drawerOpen) {
      loadRecommendations();
    }
  }, [items, drawerOpen]);

  if (!drawerOpen) return null;

  const handleAddRecommended = (rec: RecommendedAddOn) => {
    addToCart(rec.foodItem);
    setJustAddedId(rec.foodItem.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setDrawerOpen(false);
      onOpenLogin();
      return;
    }

    if (items.length === 0) return;

    if (paymentMethod === 'CAMPUS_CARD' && walletBalance < totalAmount) {
      setErrorMsg(`Insufficient Campus Wallet balance (₹${walletBalance.toFixed(2)}). Total is ₹${totalAmount}. Please top up your wallet or switch to UPI.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        items: items.map(ci => ({
          foodItemId: ci.foodItem.id,
          quantity: ci.quantity
        })),
        paymentMethod,
        notes: notes.trim() || undefined
      };

      const res = await orderApi.createOrder(payload);

      if (res.success && res.data) {
        if (paymentMethod === 'CAMPUS_CARD' && user) {
          const newBalance = Math.max(0, (user.walletBalance ?? 500) - totalAmount);
          updateUser({ ...user, walletBalance: newBalance });
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        clearCart();
        setDrawerOpen(false);
        onOrderPlaced(res.data.id);
      } else {
        setErrorMsg(res.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Could not connect to order server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-2 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-screen max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col justify-between"
        >
          {/* Header with Live Prep Meter */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand-primary flex items-center justify-center border border-brand-subtle shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">CAFETARI Meal Tray</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{totalCount} items selected • Floor 4th Counter</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Prep Time & Calorie Meter */}
            {items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Prep Time</div>
                    <div className="font-black text-slate-900 dark:text-white">~{estimatedPrepTime} mins</div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Energy</div>
                    <div className="font-black text-slate-900 dark:text-white">{totalCalories} kcal</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Body: Items List & Interactive Upsell Tray */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-black text-slate-700 dark:text-slate-300">Your meal tray is empty</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  Pick your favorites from today's menu to skip counter lines.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Your Selected Dishes</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear tray</span>
                  </button>
                </div>

                {/* Items in Tray */}
                <div className="space-y-3">
                  {items.map(item => (
                    <motion.div
                      layout
                      key={item.foodItem.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.foodItem.image}
                          alt={item.foodItem.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                            {item.foodItem.name}
                          </div>
                          <div className="text-[11px] font-bold text-brand-primary">
                            ₹{item.foodItem.price}
                          </div>
                        </div>
                      </div>

                      {/* Stepper Buttons */}
                      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity - 1)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs w-5 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity + 1)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ML-Powered Frequently Bought Together & Complementary Add-ons */}
                {recommendations.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              Frequently Bought Together
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              ML Apriori
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMlInfoModal(true)}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
                        title="View Machine Learning Association Rule metrics (Confidence, Lift, Co-occurrence)"
                      >
                        <Info className="w-3 h-3" />
                        <span>How ML works</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recommendations.map(rec => {
                        const isAdded = justAddedId === rec.foodItem.id;
                        return (
                          <motion.div
                            key={rec.foodItem.id}
                            layout
                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 hover:border-brand-primary/60 transition-all space-y-2 shadow-2xs group"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="relative shrink-0">
                                  <img
                                    src={rec.foodItem.image}
                                    alt={rec.foodItem.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-xs bg-slate-900/90 text-[8px] font-black text-amber-300 uppercase">
                                    {rec.foodItem.category.slice(0, 3)}
                                  </span>
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center space-x-1.5">
                                    <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                                      {rec.foodItem.name}
                                    </h4>
                                    <span className="shrink-0 text-[10px] font-black text-brand-primary bg-brand-subtle px-1.5 py-0.2 rounded-full">
                                      {rec.matchScore}% Match
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    <span className="font-black text-slate-900 dark:text-white">₹{rec.foodItem.price}</span>
                                    <span>•</span>
                                    <span className="flex items-center space-x-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>{rec.foodItem.preparationTime}m prep</span>
                                    </span>
                                    {rec.lift && rec.lift > 1.2 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                                          {rec.lift}x Lift
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddRecommended(rec)}
                                disabled={isAdded}
                                className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center space-x-1 shrink-0 transition-all cursor-pointer shadow-xs ${
                                  isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-brand-primary hover:bg-brand-hover text-white active:scale-95'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Natural ML Context Explanation Badge */}
                            <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/60 text-[10px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <Zap className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                <span className="truncate">{rec.reason}</span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0 pl-1">
                                {rec.confidence ? `${Math.round(rec.confidence * 100)}% Conf.` : 'Apriori'}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payment Selection with Digital Wallet Mode */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-900 dark:text-white">
                      Select Payment Mode
                    </label>
                    <span className={`text-[11px] font-bold ${walletBalance < totalAmount ? 'text-rose-600 dark:text-rose-400' : 'text-brand-primary'}`}>
                      Wallet: ₹{walletBalance.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Campus Wallet Button */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CAMPUS_CARD')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === 'CAMPUS_CARD'
                          ? 'bg-slate-950 text-white border-slate-800 shadow-lg ring-2 ring-brand'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Wallet className={`w-4 h-4 ${paymentMethod === 'CAMPUS_CARD' ? 'text-brand-accent' : 'text-slate-600 dark:text-slate-400'}`} />
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-brand-subtle text-brand-primary">
                          ₹{walletBalance.toFixed(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-black">Campus Wallet</div>
                        <div className="text-[10px] opacity-70">1-Tap balance deduction</div>
                      </div>
                    </button>

                    {/* UPI QR Code Button */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI_QR')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === 'UPI_QR'
                          ? 'bg-brand-subtle border-brand-primary text-brand-primary ring-2 ring-brand'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <QrCode className="w-4 h-4 text-brand-primary" />
                        <span className="text-[10px] font-bold text-slate-400">Instant</span>
                      </div>
                      <div>
                        <div className="text-xs font-black">UPI QR Code</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">GPay, PhonePe, Paytm</div>
                      </div>
                    </button>
                  </div>

                  {/* Insufficient Balance Notice */}
                  {isInsufficientWallet && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
                      <span>Wallet low (₹{walletBalance.toFixed(2)}). Need ₹{totalAmount}.</span>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI_QR')}
                        className="font-bold underline text-amber-950 dark:text-amber-300 ml-2 cursor-pointer"
                      >
                        Switch to UPI
                      </button>
                    </div>
                  )}
                </div>

                {/* Kitchen Special Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Kitchen Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Less spicy, extra coconut chutney, no onion"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal ({totalCount} items)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Campus Convenience Fee</span>
                  <span className="font-bold text-brand-primary">₹0 (Free)</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-brand-primary text-lg font-black">₹{totalAmount}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generating Token & Firing KDS...</span>
                ) : !isAuthenticated ? (
                  <span>Login & Place Order (₹{totalAmount})</span>
                ) : (
                  <>
                    <span>Confirm Order • ₹{totalAmount}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                <span>Express Floor 4th Counter Pickup • Instant Token Dispatch</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ML Explainability Dialog */}
      <AnimatePresence>
        {showMlInfoModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Market Basket Recommendation Engine
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Apriori Association Rule Mining + Collaborative Filtering
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMlInfoModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  Our cafeteria recommendation engine continuously analyzes real-time campus order transactions to predict items frequently purchased together.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] uppercase font-black text-purple-600 dark:text-purple-400 mb-1">
                      1. Support & Co-Occurrence
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Measures how frequently item sets (e.g. Burger + Fries) appear across historical orders: <code className="text-slate-800 dark:text-slate-200 font-mono">P(A ∩ B)</code>.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] uppercase font-black text-brand-primary mb-1">
                      2. Confidence & Lift
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Calculates the conditional probability and multiplier lift of adding item B when item A is in your tray: <code className="text-slate-800 dark:text-slate-200 font-mono">Lift(A→B) &gt; 1.0</code>.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center space-x-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Real-Time Context Adjustments</span>
                  </div>
                  <div className="text-[11px]">
                    The algorithm dynamically scales weights based on time of day (morning chai vs lunch thalis vs evening fries) and ensures complementary category pairing without redundant items.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowMlInfoModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-hover transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

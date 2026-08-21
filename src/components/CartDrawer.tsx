import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { orderApi, foodApi } from '../services/api.ts';
import { FoodItem, PaymentMethod } from '../types/index.ts';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface CartDrawerProps {
  onOrderPlaced: (orderId: string) => void;
  onOpenLogin: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderPlaced, onOpenLogin }) => {
  const { items, totalCount, totalAmount, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAY_AT_COUNTER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);

  // Fetch complementary recommendations based on active cart
  useEffect(() => {
    async function loadRecommendations() {
      if (items.length > 0) {
        const itemIds = items.map(i => i.foodItem.id);
        const res = await foodApi.getRecommendations(itemIds);
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

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setDrawerOpen(false);
      onOpenLogin();
      return;
    }

    if (items.length === 0) return;

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
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
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
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-2 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">INDIYA Meal Tray</h2>
                <p className="text-xs text-slate-500">{totalCount} items selected • Floor 4th Counter</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Your tray is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse through today's cafeteria menu and add your favorite breakfast, snacks, or meal items.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Selected Items</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map(({ foodItem, quantity }) => (
                    <div
                      key={foodItem.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <img
                        src={foodItem.image}
                        alt={foodItem.name}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {foodItem.name}
                        </h4>
                        <div className="text-xs font-black text-emerald-700 mt-0.5">
                          ₹{foodItem.price} <span className="text-[10px] text-slate-400 font-normal">each</span>
                        </div>
                      </div>

                      {/* Quantity Editor */}
                      <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(foodItem.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-slate-800">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(foodItem.id, 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Recommendations Upsell */}
                {recommendations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Recommended with this order</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendations.slice(0, 2).map(rec => (
                        <div
                          key={rec.id}
                          className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col justify-between"
                        >
                          <div className="flex items-center space-x-2 mb-1.5">
                            <img src={rec.image} alt={rec.name} className="w-8 h-8 rounded-md object-cover bg-slate-100" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-slate-900 truncate">{rec.name}</div>
                              <div className="text-[10px] text-emerald-700 font-bold">₹{rec.price}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(rec, 1)}
                            className="w-full py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors text-center cursor-pointer shadow-xs"
                          >
                            + Add ₹{rec.price}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAY_AT_COUNTER')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${paymentMethod === 'PAY_AT_COUNTER' ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Banknote className="w-4 h-4 mb-1 text-emerald-700" />
                      <span className="text-[11px] font-bold">Pay at Counter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CAMPUS_CARD')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${paymentMethod === 'CAMPUS_CARD' ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-emerald-700" />
                      <span className="text-[11px] font-bold">Campus Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI_QR')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${paymentMethod === 'UPI_QR' ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <QrCode className="w-4 h-4 mb-1 text-emerald-700" />
                      <span className="text-[11px] font-bold">UPI QR</span>
                    </button>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Kitchen Notes / Extra Requests (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Less spicy, extra green chutney, no sugar"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Counter Pickup Callout */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Floor 4th Counter Pickup Only:</strong> No delivery service. Collect your food in person by showing your Order / Token number when ready.
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Campus Convenience Fee</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-emerald-700 text-base font-black">₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generating Token...</span>
                ) : !isAuthenticated ? (
                  <span>Login & Place Order (₹{totalAmount})</span>
                ) : (
                  <>
                    <span>Confirm Order • ₹{totalAmount}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Estimated kitchen preparation: ~10-12 minutes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

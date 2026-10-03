import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Wallet, QrCode, Sparkles, Plus, Check, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface CampusCard3DProps {
  onTopUpSuccess?: (newAmount: number) => void;
  compact?: boolean;
}

export const CampusCard3D: React.FC<CampusCard3DProps> = ({ onTopUpSuccess, compact = false }) => {
  const { user, updateUser } = useAuth();
  const { colorTheme, currentConfig, isDark } = useTheme();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState<number>(200);
  const [isProcessing, setIsProcessing] = useState(false);

  const balance = user?.walletBalance ?? 500;
  const userName = user?.name || 'Aditya Singh';
  const studentId = user?.studentId || 'CS2023089';
  const department = user?.department || 'Computer Science & Engineering';

  const handleQuickRecharge = (amount: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      const newBal = balance + amount;
      if (user) {
        updateUser({ ...user, walletBalance: newBal });
      }
      setIsProcessing(false);
      setShowTopUpModal(false);
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
      if (onTopUpSuccess) onTopUpSuccess(newBal);
    }, 500);
  };

  return (
    <>
      {/* 3D Holographic Wallet Card View */}
      <div className="relative select-none perspective-1000">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-white/20 bg-brand-card transition-all duration-300"
          style={{ minHeight: compact ? '200px' : '230px' }}
        >
          {/* Holographic Sheen Layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
          
          {/* Background Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: currentConfig.primaryColor }}
          />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-800/40 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Row: Wallet Icon + Campus Name */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 shadow-md backdrop-blur-md"
                style={{ backgroundColor: `${currentConfig.primaryColor}33` }}
              >
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-white/90 font-black">
                  CAMPUS DIGITAL WALLET
                </div>
                <div className="text-[9px] text-white/60 font-medium">1-Tap Cafeteria Dining Pass</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white">CAFETARI PAY</span>
            </div>
          </div>

          {/* Card Middle: Live Balance + Quick Top Up */}
          <div className="relative z-10 my-4 sm:my-5 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-white/75">
                Available Wallet Balance
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white flex items-baseline space-x-1">
                <span>₹{balance.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-3.5 py-2 rounded-xl text-white font-black text-xs flex items-center space-x-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer bg-brand-primary hover:bg-brand-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Money</span>
            </button>
          </div>

          {/* Card Bottom: Holder Name + Student ID + QR Quick Tap */}
          <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
            <div>
              <div className="text-xs font-black tracking-wide text-white uppercase">{userName}</div>
              <div className="text-[11px] font-mono text-white/80 font-semibold">{studentId} • {department.split('&')[0]}</div>
            </div>

            <div className="flex items-center space-x-2 text-right">
              <span className="text-[9px] font-mono text-white/60 hidden sm:inline">FLOOR 4TH ACCESS</span>
              <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20">
                <QrCode className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Instant Wallet Recharge Modal */}
      <AnimatePresence>
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs cursor-pointer"
              onClick={() => setShowTopUpModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 z-10 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-brand-subtle text-brand-primary border border-brand-subtle">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">Top Up Campus Wallet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Instantly credited to {studentId} via UPI / NetBanking</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Recharge Denominations */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Top Up Amount</label>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 200, 500].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedTopUp(amt)}
                      className={`py-3 rounded-2xl border font-black text-sm transition-all cursor-pointer ${
                        selectedTopUp === amt
                          ? 'bg-brand-subtle border-brand-primary text-brand-primary ring-2 ring-brand'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Guarantee */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero convenience fees. Instant balance update for cafeteria orders.</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickRecharge(selectedTopUp)}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <span>Pay ₹{selectedTopUp} & Top Up Wallet</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

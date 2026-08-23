import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { FlipDigit } from './FlipDigit';
import {
  Clock,
  Users,
  Flame,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QueueTickerProps {
  onViewOrderTracker?: () => void;
}

export const QueueTicker: React.FC<QueueTickerProps> = ({ onViewOrderTracker }) => {
  const { queueStatus, activeOrder } = useQueue();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);

  const servingToken = queueStatus?.currentlyServingToken ?? 118;
  const totalActiveOrders = queueStatus?.totalActiveOrders ?? 4;
  const estimatedWaitMinutes = queueStatus?.estimatedWaitMinutes ?? 10;
  const rushLevel = queueStatus?.rushLevel || 'MODERATE';

  // Format token into padded string e.g. "118"
  const tokenStr = String(servingToken).padStart(3, '0');

  const getRushBadgeStyle = () => {
    switch (rushLevel) {
      case 'PEAK':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 ring-rose-500/20';
      case 'HIGH':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 ring-amber-500/20';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ring-emerald-500/20';
    }
  };

  return (
    <>
      <div className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-900/85 dark:to-slate-950/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-900 dark:text-slate-100 transition-all hover:shadow-md">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Interactive Live Split-Flap Token Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
            {/* Split-Flap Display Unit */}
            <div
              onClick={() => setShowLiveModal(true)}
              className="group cursor-pointer p-3 sm:p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 dark:border-slate-700/80 shadow-xl flex items-center space-x-3 transition-all hover:border-emerald-500/50 hover:scale-[1.02]"
              title="Click to view full Live Kitchen Flow"
            >
              <div className="text-left">
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                    Live Token
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-300 transition-colors flex items-center space-x-1">
                  <span>Floor 4th Counter</span>
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </div>

              {/* Split Flap Digits */}
              <div className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-xl sm:text-2xl font-mono font-black text-emerald-500 mr-1 select-none">#</span>
                {tokenStr.split('').map((digit, idx) => (
                  <FlipDigit key={idx} value={digit} size="md" variant="emerald" />
                ))}
              </div>
            </div>

            {/* Queue Metrics & Rush Meter */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>CAFETARI Express Queue</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1 border ring-2 ${getRushBadgeStyle()}`}>
                  <Flame className="w-3 h-3" />
                  <span>{rushLevel} Rush</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={soundEnabled ? 'Chime Alert Enabled' : 'Enable Chime Alert'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <strong className="text-slate-800 dark:text-slate-200">{totalActiveOrders}</strong> orders in prep
                </span>
                <span className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg text-emerald-900 dark:text-emerald-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Avg Wait: <strong className="text-emerald-950 dark:text-white">~{estimatedWaitMinutes}m</strong></span>
                </span>
                <button
                  onClick={() => setShowLiveModal(true)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Prep Line</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Active Order Notification Callout */}
          {activeOrder ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full lg:w-auto bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-emerald-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 border-2 border-emerald-400/80 dark:border-emerald-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white font-mono font-black text-base shadow-sm">
                    #{activeOrder.tokenNumber}
                  </div>
                  {activeOrder.status === 'READY' && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-black text-emerald-950 dark:text-emerald-300 flex items-center space-x-1.5">
                    <span>Your Order is {activeOrder.status}</span>
                    {activeOrder.status === 'READY' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {activeOrder.items.length} items • ₹{activeOrder.totalAmount} • Floor 4th
                  </div>
                </div>
              </div>

              {onViewOrderTracker && (
                <button
                  onClick={onViewOrderTracker}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                >
                  <span>Track Live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ) : (
            <div className="hidden lg:flex items-center space-x-3 text-right bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 px-4 py-3 rounded-2xl">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-end space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Skip the Counter Queue</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pre-order on phone • Collect hot when your token flashes
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Floor 4th Kitchen Flow Visualizer Modal */}
      <AnimatePresence>
        {showLiveModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowLiveModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">Floor 4th Express Kitchen Flow</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status of induction counters & plating stations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLiveModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Station Flow Grid */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      S1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Dosa & South Indian Station</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">2 chefs active • 4 min avg prep</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Smooth Flow
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                      S2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Sandwiches & Hot Snacks</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">3 chefs active • 6 min avg prep</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Moderate Load
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                      S3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Chai, Coffee & Beverages</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Express Barista • ~2 min prep</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Fast Track
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200">
                <span>Current Token Callout: <strong className="text-emerald-800 dark:text-emerald-400">#{servingToken}</strong></span>
                <span className="font-semibold">Ready at Counter #1 & #2</span>
              </div>

              <button
                onClick={() => setShowLiveModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Visualizer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

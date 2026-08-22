import React from 'react';
import { OrderStatus } from '../types/index';
import { CheckCircle2, Clock, ChefHat, Bell, CheckCheck, XCircle, Sparkles, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTimelineProps {
  status: OrderStatus;
  estimatedWaitMinutes?: number;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, estimatedWaitMinutes = 10 }) => {
  if (status === 'CANCELLED') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-800 dark:text-rose-300"
      >
        <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
        <div>
          <div className="font-black text-sm">Order Cancelled</div>
          <div className="text-xs text-rose-600/80 dark:text-rose-300/80">
            This order was cancelled by the cafeteria kitchen or counter dispatch.
          </div>
        </div>
      </motion.div>
    );
  }

  const steps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Token assigned', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Sent to Kitchen', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing', desc: 'Cooking hot', icon: ChefHat },
    { key: 'READY', label: 'Ready to Pickup', desc: 'Floor 4th Counter', icon: Bell },
    { key: 'COMPLETED', label: 'Collected', desc: 'Enjoy your meal!', icon: CheckCheck }
  ];

  const statusHierarchy: Record<OrderStatus, number> = {
    PLACED: 0,
    ACCEPTED: 1,
    PREPARING: 2,
    READY: 3,
    COMPLETED: 4,
    CANCELLED: -1
  };

  const currentStepIdx = statusHierarchy[status] ?? 0;
  const progressPercent = Math.min(100, (currentStepIdx / (steps.length - 1)) * 100);

  return (
    <div className="w-full py-2 space-y-6">
      {/* Visual Animated Progress Track */}
      <div className="relative px-2 sm:px-4">
        {/* Background Track Line */}
        <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full z-0" />

        {/* Dynamic Animated Active Progress Bar with Framer-Motion using Brand Gradient */}
        <motion.div
          className="absolute left-6 top-5 -translate-y-1/2 h-2 bg-brand-primary rounded-full z-0 shadow-brand"
          initial={{ width: '0%' }}
          animate={{ width: `calc((100% - 48px) * ${progressPercent / 100})` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />

        {/* Step Nodes */}
        <div className="relative z-10 flex items-center justify-between">
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center group">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.18 : 1,
                    y: isCurrent ? -2 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="relative cursor-default"
                >
                  {/* Glowing Radar Waves for current active step */}
                  {isCurrent && (
                    <motion.span
                      className="absolute -inset-1.5 rounded-full bg-brand-primary opacity-30"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0.05, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCurrent
                        ? step.key === 'PREPARING'
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 dark:ring-amber-900 shadow-amber-500/30'
                          : 'bg-brand-primary text-white ring-4 ring-brand-subtle shadow-brand'
                        : isDone
                        ? 'bg-brand-subtle border-2 border-brand-primary text-brand-primary'
                        : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent && step.key === 'READY' ? 'animate-bounce' : ''}`} />
                  </div>
                </motion.div>

                <div className="text-center mt-2.5 max-w-[70px] sm:max-w-[90px]">
                  <span
                    className={`block text-[11px] sm:text-xs font-black leading-tight transition-colors ${
                      isCurrent
                        ? 'text-brand-primary'
                        : isDone
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-none">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Animated Status Banner Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          {status === 'READY' ? (
            <div className="p-4 bg-brand-subtle border-2 border-brand-primary rounded-2xl text-slate-900 dark:text-slate-100 font-bold text-xs inline-block max-w-lg shadow-brand">
              <div className="flex items-center justify-center space-x-2 text-sm sm:text-base font-black text-brand-primary mb-1">
                <Sparkles className="w-4 h-4 text-brand-primary animate-spin" />
                <span>Your Order is Hot & Ready for Pickup!</span>
                <Sparkles className="w-4 h-4 text-brand-primary animate-spin" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Walk up to the <strong>Floor 4th Express Counter</strong> and present your digital token to collect your meal.
              </p>
            </div>
          ) : status === 'COMPLETED' ? (
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-2xl inline-flex items-center space-x-2 px-6 shadow-xs">
              <CheckCheck className="w-4 h-4 text-brand-primary" />
              <span>Meal collected at Floor 4th Counter. Enjoy your food!</span>
            </div>
          ) : status === 'PREPARING' ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 text-xs rounded-2xl inline-block max-w-lg shadow-xs">
              <div className="flex items-center justify-center space-x-2 font-black text-amber-900 dark:text-amber-300 mb-1">
                <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Chefs Are Cooking Your Items Hot & Fresh</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Estimated time remaining: <strong className="text-amber-700 dark:text-amber-400">~{estimatedWaitMinutes} mins</strong>. We will notify you the second it's plated!
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-2xl inline-block px-6 shadow-xs">
              <span>Estimated kitchen queue wait: <strong className="text-brand-primary">~{estimatedWaitMinutes} minutes</strong></span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Pickup exclusively at Floor 4th Counter • No room delivery
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

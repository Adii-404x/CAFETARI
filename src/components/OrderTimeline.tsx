import React from 'react';
import { OrderStatus } from '../types/index.ts';
import { CheckCircle2, Clock, ChefHat, Bell, CheckCheck, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus;
  estimatedWaitMinutes?: number;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, estimatedWaitMinutes = 10 }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-300">
        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
        <div>
          <div className="font-bold text-sm">Order Cancelled</div>
          <div className="text-xs text-rose-400/80">This order was cancelled by the cafeteria counter.</div>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Token generated', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Sent to Kitchen', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing', desc: 'Cooking hot', icon: ChefHat },
    { key: 'READY', label: 'Ready to Pickup', desc: 'Collect at Floor 4th', icon: Bell },
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

  return (
    <div className="w-full py-4">
      {/* Visual Progress Bar */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0 transition-all duration-500"
          style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isPending = idx > currentStepIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? step.key === 'READY'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-xs animate-bounce'
                      : 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                    : 'bg-slate-100 border-2 border-slate-200 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="text-center mt-2">
                <span
                  className={`block text-[11px] font-bold ${
                    isCurrent
                      ? 'text-emerald-700'
                      : isDone
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="hidden sm:block text-[9px] text-slate-500 mt-0.5 font-medium">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner message for status */}
      <div className="mt-6 text-center">
        {status === 'READY' ? (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-950 font-bold text-xs inline-block px-6 shadow-sm">
            <span className="text-base block mb-1">🎉 Your Food is HOT & READY!</span>
            <span>Walk up to <strong>Floor 4th Main Counter</strong> and show your <strong>Token / Order Number</strong> to pickup. (No Delivery)</span>
          </div>
        ) : status === 'COMPLETED' ? (
          <div className="p-3 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl inline-block px-6">
            ✓ Order collected from Floor 4th Counter. Thank you for dining with INDIYA!
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl inline-block px-6">
            <span>Estimated time remaining: <strong className="text-amber-950">~{estimatedWaitMinutes} minutes</strong></span>
            <span className="block text-[10px] text-amber-800/80 mt-0.5">Pickup at Floor 4th Counter when status changes to READY • No delivery</span>
          </div>
        )}
      </div>
    </div>
  );
};

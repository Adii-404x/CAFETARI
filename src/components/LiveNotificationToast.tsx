import React, { useEffect } from 'react';
import { useQueue } from '../context/QueueContext.tsx';
import { Bell, CheckCircle2, Flame, Clock, X, ArrowRight, Sparkles } from 'lucide-react';

interface LiveNotificationToastProps {
  onTrackOrder?: (orderId?: string) => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({ onTrackOrder }) => {
  const { liveNotification, clearNotification, activeOrder } = useQueue();

  useEffect(() => {
    if (liveNotification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [liveNotification, clearNotification]);

  if (!liveNotification) return null;

  const isReady = liveNotification.newStatus === 'READY';
  const isCooking = liveNotification.newStatus === 'PREPARING';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short shadow-2xl">
      <div
        className={`p-4 rounded-2xl border-2 flex items-start space-x-3 bg-white text-slate-900 ${
          isReady
            ? 'border-emerald-500 bg-emerald-50/90 shadow-emerald-500/20'
            : isCooking
            ? 'border-amber-500 bg-amber-50/90 shadow-amber-500/20'
            : 'border-blue-500 bg-blue-50/90 shadow-blue-500/20'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs text-white ${
            isReady ? 'bg-emerald-600' : isCooking ? 'bg-amber-600' : 'bg-blue-600'
          }`}
        >
          #{liveNotification.tokenNumber}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isReady
                  ? 'bg-emerald-200 text-emerald-900'
                  : isCooking
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-blue-200 text-blue-900'
              }`}
            >
              Order Status Update
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{liveNotification.timestamp}</span>
          </div>

          <p className="text-xs font-bold text-slate-900">{liveNotification.message}</p>

          {onTrackOrder && activeOrder && (
            <button
              onClick={() => {
                onTrackOrder(activeOrder.id);
                clearNotification();
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 pt-1 cursor-pointer"
            >
              <span>View live token timeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={clearNotification}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

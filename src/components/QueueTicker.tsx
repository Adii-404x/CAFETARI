import React from 'react';
import { useQueue } from '../context/QueueContext';
import { Clock, Users, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QueueTickerProps {
  onViewOrderTracker?: () => void;
}

export const QueueTicker: React.FC<QueueTickerProps> = ({ onViewOrderTracker }) => {
  const { queueStatus, activeOrder } = useQueue();

  const servingToken = queueStatus?.currentlyServingToken ?? 118;
  const totalActiveOrders = queueStatus?.totalActiveOrders ?? 4;
  const estimatedWaitMinutes = queueStatus?.estimatedWaitMinutes ?? 10;
  const rushLevel = queueStatus?.rushLevel || 'MODERATE';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-slate-900">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Main Queue Status */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[100px]">
            <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Now Serving</div>
            <div className="text-2xl font-black text-emerald-800">
              #{servingToken}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900">CAFETARI Express Queue</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 ${rushLevel === 'PEAK' ? 'bg-rose-50 text-rose-700 border border-rose-200' : rushLevel === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                <Flame className="w-3 h-3" />
                <span>{rushLevel} Rush</span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{totalActiveOrders} orders in preparation</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Avg Wait: ~{estimatedWaitMinutes} mins</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Student Active Order Highlight (if any) */}
        {activeOrder ? (
          <div className="w-full md:w-auto bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
                #{activeOrder.tokenNumber}
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                  <span>Your Order is {activeOrder.status}</span>
                  {activeOrder.status === 'READY' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />}
                </div>
                <div className="text-[11px] text-slate-600">
                  {activeOrder.items.length} items • ₹{activeOrder.totalAmount}
                </div>
              </div>
            </div>

            {onViewOrderTracker && (
              <button
                onClick={onViewOrderTracker}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors shadow-xs cursor-pointer"
              >
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 hidden lg:block text-right">
            <div className="font-medium text-slate-700">Place your order online to skip the counter queue</div>
            <div className="text-[11px] text-slate-400">Pick up hot when your token flashes green</div>
          </div>
        )}
      </div>
    </div>
  );
};

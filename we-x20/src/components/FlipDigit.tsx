import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FlipDigitProps {
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'amber' | 'purple' | 'slate';
}

export const FlipDigit: React.FC<FlipDigitProps> = ({
  value,
  label,
  size = 'md',
  variant = 'emerald'
}) => {
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState(value);

  useEffect(() => {
    if (value !== currentVal) {
      setPrevVal(currentVal);
      setCurrentVal(value);
    }
  }, [value, currentVal]);

  const sizeClasses = {
    sm: 'text-lg px-2 py-1 min-w-[32px] h-8',
    md: 'text-2xl sm:text-3xl px-3 py-1.5 min-w-[48px] h-12',
    lg: 'text-3xl sm:text-4xl px-4 py-2 min-w-[64px] h-16'
  }[size];

  const variantClasses = {
    emerald: 'bg-slate-900 text-emerald-400 border-slate-700 shadow-emerald-950/40',
    amber: 'bg-slate-900 text-amber-400 border-slate-700 shadow-amber-950/40',
    purple: 'bg-slate-900 text-purple-400 border-slate-700 shadow-purple-950/40',
    slate: 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/40'
  }[variant];

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative overflow-hidden rounded-xl border border-slate-800 shadow-lg bg-slate-950 p-0.5">
        {/* Split Flap Midline Groove */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-black/60 z-20 shadow-xs pointer-events-none" />
        
        {/* Flapping card container */}
        <div className={`relative flex items-center justify-center font-mono font-black tracking-tight ${sizeClasses} ${variantClasses}`}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={String(value)}
              initial={{ rotateX: -90, opacity: 0, y: -4 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={{ rotateX: 90, opacity: 0, y: 4 }}
              transition={{
                duration: 0.35,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="inline-block transform-gpu"
              style={{ transformOrigin: '50% 50%' }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
          {label}
        </span>
      )}
    </div>
  );
};

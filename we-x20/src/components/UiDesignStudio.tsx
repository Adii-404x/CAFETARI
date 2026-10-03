import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme, THEME_PRESETS, ThemeColor } from '../context/ThemeContext';
import {
  Palette,
  Check,
  X,
  Sun,
  Moon,
  Monitor,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CampusPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UiDesignStudio: React.FC<CampusPaletteModalProps> = ({ isOpen, onClose }) => {
  const { mode, setMode, colorTheme, setColorTheme } = useTheme();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-0 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-slate-900 dark:text-slate-100 space-y-5 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-sm shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      Campus Color Palettes
                    </h2>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active Theme: <span className="font-bold text-emerald-600 dark:text-emerald-400">Cyber Terminal & HUD</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campus Color Palettes Grid */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Campus Palette
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(THEME_PRESETS) as ThemeColor[]).map((themeKey) => {
                  const preset = THEME_PRESETS[themeKey];
                  const isSelected = colorTheme === themeKey;

                  return (
                    <motion.button
                      key={themeKey}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setColorTheme(themeKey)}
                      className={`relative p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-primary ring-2 ring-brand bg-brand-subtle'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      {/* Swatch Circle */}
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: preset.primaryColor }}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </span>
                          <span className="text-[10px] opacity-75">{preset.badge}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {preset.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Appearance Mode (Light / Dark / Auto) */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Appearance Mode
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setMode('light')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    mode === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('dark')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    mode === 'dark'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('system')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    mode === 'system'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Apply & Close */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-xs transition-colors cursor-pointer shadow-md"
              >
                Apply Campus Palette
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Sleek Floating Palette Trigger Button (Only Campus Colors)
export const FloatingUiSwitcher: React.FC<{ onOpenStudio: () => void }> = ({ onOpenStudio }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpenStudio}
      className="fixed bottom-5 right-5 z-40 flex items-center space-x-2 bg-slate-900/90 dark:bg-slate-800/90 text-white backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-700/80 shadow-2xl hover:border-brand-primary/80 transition-all cursor-pointer group"
      title="Campus Color Palettes"
    >
      <Palette className="w-4 h-4 text-brand-primary group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-black">Campus Colors</span>
    </motion.button>
  );
};

import React from 'react';
import { useTheme, THEME_PRESETS, ThemeColor, ThemeMode } from '../context/ThemeContext';
import { Palette, Sun, Moon, Monitor, Check, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeChooserModal: React.FC<ThemeChooserModalProps> = ({ isOpen, onClose }) => {
  const { mode, colorTheme, isDark, setMode, setColorTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Dialog Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 z-10 text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand-primary flex items-center justify-center border border-brand-subtle">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>CAFETARI Theme Chooser</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personalize the campus dining & live tracker ambiance
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Color Palettes Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Campus Color Palette
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(THEME_PRESETS) as ThemeColor[]).map((themeKey) => {
                const config = THEME_PRESETS[themeKey];
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
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {config.name}
                        </span>
                        <span className="text-[10px] opacity-75">{config.badge}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Appearance Mode (Light / Dark / System) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance Mode
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
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

          {/* Quick Apply / Done Button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-xs transition-colors cursor-pointer shadow-md"
            >
              Apply & Save Theme
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

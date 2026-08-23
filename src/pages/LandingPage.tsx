import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { QueueTicker } from '../components/QueueTicker';
import { CafetariLogo } from '../components/CafetariLogo';
import {
  Utensils,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  ChefHat,
  TrendingUp,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { UserRole } from '../types/index';
import { motion } from 'motion/react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { switchDemoAccount } = useAuth();
  const { currentArchetype } = useTheme();

  const handleQuickLogin = async (role: UserRole) => {
    await switchDemoAccount(role);
    if (role === 'admin') onNavigate('admin_dashboard');
    else if (role === 'staff') onNavigate('staff_kds');
    else onNavigate('student_dashboard');
  };

  return (
    <div className="space-y-8 sm:space-y-10 py-2 sm:py-4">
      {/* Live Queue Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <QueueTicker onViewOrderTracker={() => onNavigate('order_tracking')} />
      </motion.div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden archetype-card p-6 sm:p-10 md:p-12 text-slate-900 dark:text-slate-100 transition-colors duration-300"
      >
        {/* Ambient Glow behind Hero */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-subtle opacity-70 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-brand-subtle opacity-70 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <CafetariLogo size="responsive" showSubtitle={true} subtitleText="INDIYA Cafeteria • Floor 4th" className="scale-100 sm:scale-110" />
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-subtle border border-brand-subtle text-brand-primary text-xs font-black uppercase tracking-wider shadow-2xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>Express Pickup at Floor 4th Counter</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Order Ahead.{' '}
            <span className="text-brand-gradient">
              Skip The Queue.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
            Order fresh meals, snacks & barista brews directly from your phone. Pick up hot with your token number at the Floor 4th Counter.
          </p>

          {/* Action Buttons with Spring physics */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-brand transition-all cursor-pointer group"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('counter_queue')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-subtle hover:opacity-90 text-brand-primary border border-brand-subtle font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Live Token Queue</span>
            </motion.button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs"
          >
            <div className="text-2xl font-black text-slate-900 dark:text-white">~8 min</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Avg Pickup Time</div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 bg-brand-subtle rounded-2xl border border-brand-subtle shadow-xs"
          >
            <div className="text-2xl font-black text-brand-primary">Live</div>
            <div className="text-[11px] text-brand-primary mt-0.5 font-bold">Digital Token Display</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs"
          >
            <div className="text-2xl font-black text-slate-900 dark:text-white">0 min</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Counter Queue Wait</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs"
          >
            <div className="text-2xl font-black text-amber-500">4.9/5 ★</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Campus Rating</div>
          </motion.div>
        </div>
      </motion.section>

      {/* 1-Click Role Testing Showcase */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Experience All 3 Campus Roles</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Click any profile below to instantly log in and test its full workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Student Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary dark:hover:border-brand-primary rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-subtle border border-brand-subtle text-brand-primary flex items-center justify-center shadow-xs">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Student Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Browse hot menu, add items to tray, track live queue position, and pay with Digital Campus Wallet.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center space-x-1.5 text-brand-primary font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aditya Singh (CSE 3rd Year)</span>
                </div>
                <div className="text-slate-400">student@cafeteria.edu</div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLogin('student')}
              className="mt-5 w-full py-3 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-brand"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login as Student</span>
            </motion.button>
          </motion.div>

          {/* Staff KDS Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Kitchen Display (KDS)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kitchen chef console with 1-click status Kanban, live rush indicators & stock availability toggles.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Manoj Kumar (Kitchen Lead)</span>
                </div>
                <div className="text-slate-400">staff@cafeteria.edu</div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLogin('staff')}
              className="mt-5 w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ChefHat className="w-4 h-4" />
              <span>Login as Staff</span>
            </motion.button>
          </motion.div>

          {/* Admin & AI Analytics Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Admin & AI Forecast</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Live revenue analytics, multi-model ML demand prediction & Gemini food waste optimizer.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Prof. Rajesh Sharma (Dean)</span>
                </div>
                <div className="text-slate-400">admin@cafeteria.edu</div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLogin('admin')}
              className="mt-5 w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Login as Admin</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-black text-slate-900 dark:text-white text-center">Engineered for Fast, Zero-Waste Campus Dining</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center border border-brand-subtle">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Express Smart Tokens</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time countdown and dynamic queue estimations prevent crowded counter rushes during class breaks.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center border border-brand-subtle">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">ML Food Demand Forecaster</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ensemble regression evaluates Random Forest vs Gradient Boosting to estimate portion demand and trim perishable waste by 35%.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center border border-brand-subtle">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Secure Campus Auth</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Encrypted JWT session tokens, strict role-based access control, and robust Zod request verification.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

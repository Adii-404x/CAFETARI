import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { QueueTicker } from '../components/QueueTicker.tsx';
import { CafetariLogo } from '../components/CafetariLogo.tsx';
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
  MapPin
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { switchDemoAccount } = useAuth();

  const handleQuickLogin = async (role: UserRole) => {
    await switchDemoAccount(role);
    if (role === 'admin') onNavigate('admin_dashboard');
    else if (role === 'staff') onNavigate('staff_kds');
    else onNavigate('student_dashboard');
  };

  return (
    <div className="space-y-12 py-6">
      {/* Live Queue Banner */}
      <QueueTicker onViewOrderTracker={() => onNavigate('order_tracking')} />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 sm:p-10 md:p-12 text-center text-slate-900 shadow-sm">
        <div className="flex justify-center mb-5 sm:mb-6">
          <CafetariLogo size="responsive" showSubtitle={true} subtitleText="INDIYA Cafeteria • Floor 4th" className="scale-110 sm:scale-125" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-purple-600" />
          <span>Express Pickup at Floor 4th Counter</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Say Goodbye to Long Queues.{' '}
          <span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
            Welcome to INDIYA Cafeteria.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Craving fresh <strong>Burgers, Grilled Sandwiches, Crispy Fries, Cold Coffee, Kulhad Chai, or Delicious Thalis</strong>? Order ahead or check live counter queues — pick up hot & fresh at Floor 4th Counter with your Token number (No Delivery).
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('menu')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer group"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse INDIYA Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('counter_queue')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-purple-700" />
            <span>Check Counter Queue & Wait Time</span>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-slate-900">~8 min</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Average Order Pickup</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-emerald-700">92.4%</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">AI Prediction Accuracy</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-slate-900">0 min</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Counter Standing Time</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-amber-600">4.9/5 ★</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Campus Student Rating</div>
          </div>
        </div>
      </section>

      {/* 1-Click Role Testing Showcase */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Experience All 3 Campus Roles</h2>
          <p className="text-xs text-slate-500">Click any profile below to instantly log in and test its full workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Student Card */}
          <div className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 transition-all shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Student Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse hot menu, add items to tray, track live queue position, and rate food.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aditya Singh (CSE 3rd Year)</span>
                </div>
                <div className="text-slate-400">student@cafeteria.edu</div>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('student')}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login as Student</span>
            </button>
          </div>

          {/* Staff KDS Card */}
          <div className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 transition-all shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Kitchen Display (KDS)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kitchen chef console with 1-click status Kanban, live rush indicators & stock toggles.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center space-x-1.5 text-amber-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Manoj Kumar (Kitchen Lead)</span>
                </div>
                <div className="text-slate-400">staff@cafeteria.edu</div>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('staff')}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ChefHat className="w-4 h-4" />
              <span>Login as Staff</span>
            </button>
          </div>

          {/* Admin & AI Analytics Card */}
          <div className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 transition-all shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Admin & AI Forecast</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recharts revenue analytics, multi-model ML demand prediction & Gemini waste advisor.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center space-x-1.5 text-indigo-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Prof. Rajesh Sharma (Dean)</span>
                </div>
                <div className="text-slate-400">admin@cafeteria.edu</div>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 text-center">Engineered for Fast, Zero-Waste Campus Dining</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Express Smart Tokens</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time countdown and dynamic queue estimations prevent crowded counter rushes during class breaks.
            </p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">ML Food Demand Forecaster</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ensemble regression evaluates Random Forest vs Gradient Boosting to estimate portion demand and trim perishable waste by 35%.
            </p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Secure Campus Auth</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Encrypted JWT session tokens, strict role-based access control, and robust Zod request verification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CafetariLogo } from '../components/CafetariLogo';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types/index';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoAccount } = useAuth();
  const [email, setEmail] = useState('student@cafeteria.edu');
  const [password, setPassword] = useState('Student@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      const userRole = (res as any).user?.role;
      if (userRole === 'admin' || email.includes('admin')) onNavigate('admin_dashboard');
      else if (userRole === 'staff' || email.includes('staff')) onNavigate('staff_kds');
      else onNavigate('student_dashboard');
    } else {
      setErrorMsg(res.message || 'Invalid email or password');
    }
  };

  const handleDemoFill = async (role: UserRole) => {
    await switchDemoAccount(role);
    if (role === 'admin') onNavigate('admin_dashboard');
    else if (role === 'staff') onNavigate('staff_kds');
    else onNavigate('student_dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-slate-900">
        {/* Brand Icon */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <CafetariLogo size="lg" showSubtitle={false} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-2">Sign in to CAFETARI</h2>
          <p className="text-xs text-slate-500 mt-1">Access orders & live Floor 4th counter tokens</p>
        </div>

        {/* Demo 1-Click Fast Fill */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Demo Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('staff')}
              className="py-1.5 px-2 bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@cafeteria.edu"
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Don't have a campus dining account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-emerald-600 hover:text-emerald-700 ml-1 underline cursor-pointer"
            >
              Register Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

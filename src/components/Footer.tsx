import React from 'react';
import { CafetariLogo } from './CafetariLogo.tsx';
import { MapPin, Phone, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
          {/* Col 1: Brand info & Logo */}
          <div className="space-y-3">
            <CafetariLogo size="md" showSubtitle={true} subtitleText="Smart Campus Dining" />
            <p className="text-slate-500 leading-relaxed text-xs max-w-sm">
              CAFETARI is the unified digital campus cafeteria system for instant online ordering, live queue tracking, and contactless pickup.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-purple-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></span>
              <span>Floor 4th Express Counter Active</span>
            </div>
          </div>

          {/* Col 2: Campus Counter Location */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              <span>Counter Location</span>
            </h4>
            <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-purple-950 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>Floor 4th (Express Counter #1)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Central Academic Tower, 4th Floor Dining Wing & Student Food Court.
              </p>
            </div>
          </div>

          {/* Col 3: Support & Operations Desk */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-600" />
              <span>Counter Support Desk</span>
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-900">Floor 4th Supervisor Desk</div>
              <p className="text-slate-500">
                Direct Intercom Extension: <span className="font-bold text-slate-800">#4421</span>
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Show your active order token at the Floor 4th collection bay.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} CAFETARI. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Campus Verified Dining</span>
            </span>
            <span>•</span>
            <span className="text-slate-500">Floor 4th Service Station</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

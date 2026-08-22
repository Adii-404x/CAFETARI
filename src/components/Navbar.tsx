import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useQueue } from '../context/QueueContext';
import { CafetariLogo } from './CafetariLogo';
import {
  Utensils,
  ShoppingBag,
  Clock,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ChefHat,
  Sparkles,
  TrendingUp,
  History,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types/index';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const { totalCount, setDrawerOpen } = useCart();
  const { queueStatus, activeOrder } = useQueue();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleNav = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleRoleSwitch = async (role: UserRole) => {
    await switchDemoAccount(role);
    setDemoDropdownOpen(false);
    if (role === 'admin') setCurrentView('admin_dashboard');
    else if (role === 'staff') setCurrentView('staff_kds');
    else setCurrentView('student_dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-1 sm:gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer group shrink-0 min-w-0 pr-1"
            onClick={() => handleNav(isAuthenticated ? (user?.role === 'admin' ? 'admin_dashboard' : user?.role === 'staff' ? 'staff_kds' : 'student_dashboard') : 'landing')}
          >
            <CafetariLogo size="responsive" showSubtitle={true} subtitleText="INDIYA • Floor 4th" />
          </div>

          {/* Center: Live Queue Status Pill (Clickable to open Counter Queue Monitor) */}
          <div
            onClick={() => handleNav('counter_queue')}
            className="hidden md:flex items-center space-x-3 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer"
            title="Click to view full live counter queue length and wait-time monitor"
          >
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-slate-600 font-medium">Serving Token:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-xs">
                #{queueStatus?.currentlyServingToken || 118}
              </span>
            </div>

            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1 text-slate-600 font-medium hover:text-purple-700">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Wait: ~{queueStatus?.estimatedWaitMinutes || 10}m</span>
            </div>

            {activeOrder && (
              <>
                <span className="text-slate-300">|</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNav('order_tracking');
                  }}
                  className="flex items-center space-x-1.5 cursor-pointer text-emerald-700 hover:text-emerald-800 transition-colors font-medium"
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                  <span>Your Token #{activeOrder.tokenNumber}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    {activeOrder.status}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links according to User Role */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('landing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${currentView === 'landing' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${currentView === 'menu' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  INDIYA Menu
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'counter_queue' ? 'bg-purple-100 text-purple-900 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Floor 4th Queue</span>
                </button>
              </>
            ) : user?.role === 'student' ? (
              <>
                <button
                  onClick={() => handleNav('student_dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'student_dashboard' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'menu' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>INDIYA Menu</span>
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'counter_queue' ? 'bg-purple-100 text-purple-900 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Counter Queue</span>
                </button>
                <button
                  onClick={() => handleNav('order_tracking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'order_tracking' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Live Tracker</span>
                </button>
                <button
                  onClick={() => handleNav('order_history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'order_history' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => handleNav('user_profile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'user_profile' || currentView === 'profile' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
              </>
            ) : user?.role === 'staff' ? (
              <>
                <button
                  onClick={() => handleNav('staff_kds')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'staff_kds' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Kitchen Display (KDS)</span>
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'counter_queue' ? 'bg-purple-100 text-purple-900 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Counter Queue View</span>
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'menu' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Stock Availability</span>
                </button>
              </>
            ) : (
              // Admin Navigation
              <>
                <button
                  onClick={() => handleNav('admin_dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'admin_dashboard' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'counter_queue' ? 'bg-purple-100 text-purple-900 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Counter Queue</span>
                </button>
                <button
                  onClick={() => handleNav('admin_analytics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'admin_analytics' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => handleNav('admin_predictions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'admin_predictions' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Demand 🤖</span>
                </button>
                <button
                  onClick={() => handleNav('admin_menu')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${currentView === 'admin_menu' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Menu Mgmt</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Actions: Quick Role Switcher, Cart Button & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Switch between Student, Staff, and Admin roles instantly"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline capitalize text-[11px] font-semibold">{user ? user.role : 'Demo'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Student Account</div>
                      <div className="text-[10px] text-slate-500">Aditya Singh (CSE)</div>
                    </div>
                    {user?.role === 'student' && <span className="text-xs text-emerald-600 font-semibold">✓ Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Cafeteria Staff</div>
                      <div className="text-[10px] text-slate-500">Manoj Kumar (Kitchen Lead)</div>
                    </div>
                    {user?.role === 'staff' && <span className="text-xs text-emerald-600 font-semibold">✓ Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Cafeteria Admin</div>
                      <div className="text-[10px] text-slate-500">Prof. Rajesh Sharma</div>
                    </div>
                    {user?.role === 'admin' && <span className="text-xs text-emerald-600 font-semibold">✓ Active</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Cart Button with Item Counter */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-700 transition-all cursor-pointer group"
              aria-label="Open food cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full h-4.5 sm:h-5 min-w-[18px] sm:min-w-[20px] px-1 flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {user?.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleNav('user_profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Profile & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setCurrentView('landing');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors mt-1 cursor-pointer font-medium border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleNav('login')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Live Queue Ribbon on Small Screens */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-1 bg-slate-50 border-t border-slate-200/80 text-[11px]">
        <div
          onClick={() => handleNav('counter_queue')}
          className="flex items-center space-x-1.5 text-slate-700 cursor-pointer font-medium truncate"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
          </span>
          <span className="text-[10px] text-slate-500">Serving:</span>
          <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
            #{queueStatus?.currentlyServingToken || 118}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] text-slate-500">Wait ~{queueStatus?.estimatedWaitMinutes || 10}m</span>
        </div>

        <button
          onClick={() => handleNav('counter_queue')}
          className="text-[10px] font-bold text-purple-700 hover:text-purple-900 shrink-0 ml-2"
        >
          Floor 4th Queue →
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg text-xs mb-3">
            <span className="text-slate-600">Now Serving:</span>
            <span className="font-bold text-emerald-700">Token #{queueStatus?.currentlyServingToken || 118}</span>
          </div>

          <button
            onClick={() => handleNav('counter_queue')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 flex items-center space-x-2 border border-purple-200"
          >
            <Clock className="w-4 h-4 text-purple-700" />
            <span>Floor 4th Counter Queue & Wait Time</span>
          </button>

          <button
            onClick={() => handleNav('menu')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>INDIYA Menu Catalog</span>
          </button>

          {user?.role === 'student' && (
            <>
              <button
                onClick={() => handleNav('student_dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Student Dashboard</span>
              </button>
              <button
                onClick={() => handleNav('order_tracking')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Live Order Tracking</span>
              </button>
              <button
                onClick={() => handleNav('order_history')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <History className="w-4 h-4 text-emerald-600" />
                <span>Past Orders</span>
              </button>
              <button
                onClick={() => handleNav('user_profile')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>My Profile & Settings</span>
              </button>
            </>
          )}

          {user?.role === 'staff' && (
            <button
              onClick={() => handleNav('staff_kds')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
            >
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <span>Kitchen Display System (KDS)</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleNav('admin_dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Admin Overview</span>
              </button>
              <button
                onClick={() => handleNav('admin_analytics')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Analytics & Revenue</span>
              </button>
              <button
                onClick={() => handleNav('admin_predictions')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Demand Forecast 🤖</span>
              </button>
              <button
                onClick={() => handleNav('admin_menu')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Menu Item Management</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

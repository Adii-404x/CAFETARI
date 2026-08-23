import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useQueue } from '../context/QueueContext';
import { CafetariLogo } from './CafetariLogo';
import { UiDesignStudio } from './UiDesignStudio';
import { useTheme } from '../context/ThemeContext';
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
  ChevronDown,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { UserRole } from '../types/index';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const { totalCount, setDrawerOpen } = useCart();
  const { queueStatus, activeOrder } = useQueue();
  const { colorTheme, isDark, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs transition-colors">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer group shrink-0 min-w-0"
            onClick={() => handleNav(isAuthenticated ? (user?.role === 'admin' ? 'admin_dashboard' : user?.role === 'staff' ? 'staff_kds' : 'student_dashboard') : 'landing')}
          >
            <CafetariLogo size="responsive" showSubtitle={true} subtitleText="INDIYA • Floor 4th" />
          </div>

          {/* Center-Left: Live Queue Status Pill */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNav('counter_queue')}
            className="hidden xl:flex items-center space-x-2.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-full px-3.5 py-1.5 text-xs transition-colors cursor-pointer shrink-0"
            title="Click to view full live counter queue length and wait-time monitor"
          >
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Serving:</span>
              <span className="font-black text-brand-primary bg-brand-subtle px-1.5 py-0.5 rounded text-xs border border-brand-subtle">
                #{queueStatus?.currentlyServingToken || 118}
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              <span>~{queueStatus?.estimatedWaitMinutes || 10}m wait</span>
            </div>

            {activeOrder && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNav('order_tracking');
                  }}
                  className="flex items-center space-x-1.5 cursor-pointer text-brand-primary hover:opacity-80 transition-opacity font-bold"
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse text-brand-primary" />
                  <span>Token #{activeOrder.tokenNumber}</span>
                  <span className="text-[10px] bg-brand-subtle text-brand-primary px-1.5 py-0.5 rounded font-black border border-brand-subtle">
                    {activeOrder.status}
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Navigation Links according to User Role */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('landing')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'landing'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'menu'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  INDIYA Menu
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'counter_queue'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Floor 4th Queue</span>
                </button>
              </>
            ) : user?.role === 'student' ? (
              <>
                <button
                  onClick={() => handleNav('student_dashboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'student_dashboard'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'menu'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>INDIYA Menu</span>
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'counter_queue'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Counter Queue</span>
                </button>
                <button
                  onClick={() => handleNav('order_tracking')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'order_tracking'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Live Tracker</span>
                </button>
                <button
                  onClick={() => handleNav('order_history')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'order_history'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => handleNav('user_profile')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'user_profile' || currentView === 'profile'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
              </>
            ) : user?.role === 'staff' ? (
              <>
                <button
                  onClick={() => handleNav('staff_kds')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'staff_kds'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Kitchen Display (KDS)</span>
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'counter_queue'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Counter Queue View</span>
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'menu'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'admin_dashboard'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </button>
                <button
                  onClick={() => handleNav('counter_queue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'counter_queue'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Counter Queue</span>
                </button>
                <button
                  onClick={() => handleNav('admin_analytics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'admin_analytics'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => handleNav('admin_predictions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'admin_predictions'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  <span>AI Demand 🤖</span>
                </button>
                <button
                  onClick={() => handleNav('admin_menu')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    currentView === 'admin_menu'
                      ? 'bg-brand-subtle text-brand-primary border border-brand-subtle shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
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
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Switch between Student, Staff, and Admin roles instantly"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span className="hidden sm:inline capitalize text-[11px] font-black">{user ? user.role : 'Demo'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Student Account</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Aditya Singh (CSE)</div>
                    </div>
                    {user?.role === 'student' && <span className="text-xs text-brand-primary font-black">✓ Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Cafeteria Staff</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Manoj Kumar (Kitchen Lead)</div>
                    </div>
                    {user?.role === 'staff' && <span className="text-xs text-brand-primary font-black">✓ Active</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Cafeteria Admin</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Prof. Rajesh Sharma</div>
                    </div>
                    {user?.role === 'admin' && <span className="text-xs text-brand-primary font-black">✓ Active</span>}
                  </button>
                </div>
              )}
            </div>

            {/* 1-Click Dark/Light Mode Quick Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </motion.button>

            {/* Theme Chooser Trigger */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsThemeOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer group shadow-2xs"
              title="Campus Color Palettes"
              aria-label="Campus Color Palettes"
            >
              <Palette className="w-4.5 h-4.5 text-brand-primary group-hover:rotate-12 transition-transform" />
            </motion.button>

            {/* Cart Button with Item Counter */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer group shadow-2xs"
              aria-label="Open food cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-white font-black text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-brand animate-pulse">
                  {totalCount}
                </span>
              )}
            </motion.button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary font-black text-xs flex items-center justify-center border border-brand-subtle shrink-0">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="hidden md:block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-subtle text-brand-primary border border-brand-subtle">
                        {user?.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleNav('user_profile');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer font-bold"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-brand-primary" />
                      <span>My Profile & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setCurrentView('landing');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 transition-colors mt-1 cursor-pointer font-bold border-t border-slate-100 dark:border-slate-800"
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black bg-brand-primary hover:bg-brand-hover text-white shadow-brand transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Live Queue Ribbon on Small Screens */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-1 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 text-[11px]">
        <div
          onClick={() => handleNav('counter_queue')}
          className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 cursor-pointer font-medium truncate"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-primary"></span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Serving:</span>
          <span className="font-black text-brand-primary bg-brand-subtle px-1.5 py-0.5 rounded text-[10px] border border-brand-subtle">
            #{queueStatus?.currentlyServingToken || 118}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Wait ~{queueStatus?.estimatedWaitMinutes || 10}m</span>
        </div>

        <button
          onClick={() => handleNav('counter_queue')}
          className="text-[10px] font-black text-brand-primary hover:opacity-80 shrink-0 ml-2"
        >
          Floor 4th Queue →
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-xs mb-3">
              <span className="text-slate-600 dark:text-slate-400">Now Serving:</span>
              <span className="font-black text-brand-primary">Token #{queueStatus?.currentlyServingToken || 118}</span>
            </div>

            <button
              onClick={() => handleNav('counter_queue')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-primary bg-brand-subtle flex items-center space-x-2 border border-brand-subtle"
            >
              <Clock className="w-4 h-4" />
              <span>Floor 4th Counter Queue & Wait Time</span>
            </button>

            <button
              onClick={() => handleNav('menu')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
            >
              <Utensils className="w-4 h-4 text-brand-primary" />
              <span>INDIYA Menu Catalog</span>
            </button>

            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => handleNav('student_dashboard')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-primary" />
                  <span>Student Dashboard</span>
                </button>
                <button
                  onClick={() => handleNav('order_tracking')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <span>Live Order Tracking</span>
                </button>
                <button
                  onClick={() => handleNav('order_history')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <History className="w-4 h-4 text-brand-primary" />
                  <span>Past Orders</span>
                </button>
                <button
                  onClick={() => handleNav('user_profile')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <UserIcon className="w-4 h-4 text-brand-primary" />
                  <span>My Profile & Settings</span>
                </button>
              </>
            )}

            {user?.role === 'staff' && (
              <button
                onClick={() => handleNav('staff_kds')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
              >
                <ChefHat className="w-4 h-4 text-brand-primary" />
                <span>Kitchen Display System (KDS)</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => handleNav('admin_dashboard')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-primary" />
                  <span>Admin Overview</span>
                </button>
                <button
                  onClick={() => handleNav('admin_analytics')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4 text-brand-primary" />
                  <span>Analytics & Revenue</span>
                </button>
                <button
                  onClick={() => handleNav('admin_predictions')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span>AI Demand Forecast 🤖</span>
                </button>
                <button
                  onClick={() => handleNav('admin_menu')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Utensils className="w-4 h-4 text-brand-primary" />
                  <span>Menu Item Management</span>
                </button>
              </>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsThemeOpen(true);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer"
              >
                <Palette className="w-4 h-4 text-brand-primary" />
                <span>Campus Color Palettes</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Design Studio & Archetype Selector Modal */}
      <UiDesignStudio
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />
    </header>
  );
};

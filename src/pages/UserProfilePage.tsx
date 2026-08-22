import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, orderApi } from '../services/api';
import { User, Order } from '../types/index';
import {
  User as UserIcon,
  Mail,
  Phone,
  BookOpen,
  CreditCard,
  Bell,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Utensils,
  ChevronRight,
  ArrowLeft,
  Building2,
  Wallet,
  Settings,
  Heart,
  Volume2,
  MessageSquare,
  QrCode,
  BadgeCheck,
  RefreshCw,
  Plus
} from 'lucide-react';

interface UserProfilePageProps {
  onNavigate: (view: string) => void;
}

type TabType = 'overview' | 'personal' | 'preferences' | 'wallet' | 'security';

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUser, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Form states for Personal Info
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [hostelOrBlock, setHostelOrBlock] = useState(user?.preferences?.hostelOrBlock || 'Hostel Block B - Room 304');

  // Preferences
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'veg_only' | 'jain' | 'vegan'>(
    user?.preferences?.dietaryPreference || 'all'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.preferences?.notificationsEnabled ?? true
  );
  const [smsAlerts, setSmsAlerts] = useState<boolean>(user?.preferences?.smsAlerts ?? true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(user?.preferences?.soundAlerts ?? true);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'CAMPUS_CARD' | 'UPI_QR' | 'PAY_AT_COUNTER'>(
    user?.preferences?.defaultPaymentMethod || 'CAMPUS_CARD'
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Wallet top-up state
  const [selectedTopUp, setSelectedTopUp] = useState<number>(200);
  const [customTopUp, setCustomTopUp] = useState<string>('');

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Orders stats
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setStudentId(user.studentId || '');
      setDepartment(user.department || 'Computer Science & Engineering');
      setHostelOrBlock(user.preferences?.hostelOrBlock || 'Hostel Block B - Room 304');
      setDietaryPreference(user.preferences?.dietaryPreference || 'all');
      setNotificationsEnabled(user.preferences?.notificationsEnabled ?? true);
      setSmsAlerts(user.preferences?.smsAlerts ?? true);
      setSoundAlerts(user.preferences?.soundAlerts ?? true);
      setDefaultPaymentMethod(user.preferences?.defaultPaymentMethod || 'CAMPUS_CARD');
    }
  }, [user]);

  // Load user order stats
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await orderApi.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load user order stats:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadStats();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4500);
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification('Please enter your full name', true);
      return;
    }

    setSaving(true);
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        studentId: studentId.trim(),
        department: department.trim(),
        preferences: {
          ...user?.preferences,
          hostelOrBlock: hostelOrBlock.trim()
        }
      });

      if (res.success && res.data) {
        updateUser(res.data);
        showNotification('Personal details updated and saved successfully.');
      } else {
        showNotification(res.message || 'Failed to update personal details', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating profile', true);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile({
        preferences: {
          dietaryPreference,
          notificationsEnabled,
          smsAlerts,
          soundAlerts,
          defaultPaymentMethod,
          hostelOrBlock
        }
      });

      if (res.success && res.data) {
        updateUser(res.data);
        showNotification('Cafeteria & ordering preferences updated successfully.');
      } else {
        showNotification(res.message || 'Failed to update preferences', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating preferences', true);
    } finally {
      setSaving(false);
    }
  };

  const handleWalletRecharge = async () => {
    const amount = customTopUp ? parseFloat(customTopUp) : selectedTopUp;
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please select or enter a valid recharge amount.', true);
      return;
    }

    setSaving(true);
    try {
      const res = await authApi.updateProfile({
        walletRechargeAmount: amount
      });

      if (res.success && res.data) {
        updateUser(res.data);
        setCustomTopUp('');
        showNotification(`₹${amount} recharged to your Digital Campus Wallet successfully!`);
      } else {
        showNotification(res.message || 'Recharge failed', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error during wallet recharge', true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('Please enter your current password.', true);
      return;
    }
    if (newPassword.length < 6) {
      showNotification('New password must be at least 6 characters.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('New password and confirmation do not match.', true);
      return;
    }

    setSaving(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showNotification('Your account password was changed successfully.');
      } else {
        showNotification(res.message || 'Password update failed', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating password', true);
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const currentWalletBalance = user?.walletBalance ?? 500;

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to View Profile</h2>
        <p className="text-sm text-slate-500">
          Access your digital student ID, order history, wallet balance, and personal dietary preferences.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <button
              onClick={() => onNavigate(user.role === 'admin' ? 'admin_dashboard' : user.role === 'staff' ? 'staff_kds' : 'student_dashboard')}
              className="hover:text-emerald-700 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Account Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile & Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal profile, campus ID card, dietary choices, and digital wallet.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('order_history')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Order History</span>
          </button>

          <button
            onClick={() => onNavigate('menu')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Order Food</span>
          </button>
        </div>
      </div>

      {/* Global Alerts Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center space-x-3 text-xs sm:text-sm shadow-2xs animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center space-x-3 text-xs sm:text-sm shadow-2xs animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Horizontal Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar space-x-1 sm:space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>ID Card & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === 'personal'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Personal Info</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === 'preferences'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Dietary & Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === 'wallet'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Campus Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === 'security'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DIGITAL ID CARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Digital Student Cafeteria Card (Clean Minimalism Aesthetic) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between border border-slate-800">
              {/* Background watermark badge */}
              <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none">
                <Utensils className="w-64 h-64 text-white" />
              </div>

              {/* Top Card Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-emerald-400">
                      Digital Cafeteria Pass
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">INDIYA Smart Dining</h3>
                  <p className="text-xs text-slate-400">Floor 4th • Campus Center</p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                  <QrCode className="w-5 h-5 text-emerald-300" />
                </div>
              </div>

              {/* Card Body: User Details */}
              <div className="my-6 space-y-4 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-inner border border-emerald-400/30 shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      ID: <span className="text-emerald-300">{user.studentId || 'STU-2024-8912'}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.department || 'Computer Science & Engineering'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Role</span>
                    <span className="font-semibold text-white capitalize">{user.role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
                    <span className="font-bold text-emerald-300 font-mono">₹{currentWalletBalance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Contact</span>
                    <span className="font-medium text-slate-300 truncate block">{user.phone || '9876543210'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-slate-400 relative z-10">
                <span>Issued for Academic Year 2025–2026</span>
                <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Verified Student</span>
                </span>
              </div>
            </div>

            {/* Quick Stats & Wallet Widget */}
            <div className="space-y-4">
              {/* Wallet Summary Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Campus Balance</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Top Up →
                  </button>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-slate-900 font-mono">
                    ₹{currentWalletBalance.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fast 1-click contactless checkout at Floor 4th counters
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedTopUp(100);
                      setActiveTab('wallet');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors text-center cursor-pointer"
                  >
                    +₹100
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTopUp(200);
                      setActiveTab('wallet');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors text-center cursor-pointer"
                  >
                    +₹200
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTopUp(500);
                      setActiveTab('wallet');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors text-center cursor-pointer"
                  >
                    +₹500
                  </button>
                </div>
              </div>

              {/* Activity Summary Metrics */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cafeteria Activity
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Total Orders</span>
                    <span className="text-lg font-bold text-slate-900">{orders.length}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Completed</span>
                    <span className="text-lg font-bold text-emerald-700">{completedOrders}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('order_history')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>View All Past Receipts</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Settings Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div
              onClick={() => setActiveTab('personal')}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UserIcon className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Personal Info</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Update name, department, registration ID & phone
              </p>
            </div>

            <div
              onClick={() => setActiveTab('preferences')}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Dietary Preferences</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Veg, Jain, Vegan filters & instant counter alerts
              </p>
            </div>

            <div
              onClick={() => setActiveTab('security')}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Key className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Password & Security</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Change account password and view login state
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL INFORMATION */}
      {activeTab === 'personal' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Keep your official university and cafeteria contact details up to date.
            </p>
          </div>

          <form onSubmit={handleSavePersonalInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="Aditya Singh"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email (Read only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  University Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Student Registration / Roll No.
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="STU-2024-8912"
                  />
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Phone (For Token SMS)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="9876543210"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Department / Branch
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="Computer Science & Engineering"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Hostel / Campus Block */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Hostel Block / Residence
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={hostelOrBlock}
                    onChange={(e) => setHostelOrBlock(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="Hostel Block B - Room 304"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Personal Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DIETARY PREFERENCES & ALERTS */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Dietary & Notification Preferences</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Personalize cafeteria recommendations, food tag filters, and live token order alerts.
            </p>
          </div>

          <div className="space-y-6">
            {/* Dietary Preference Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dietary Preference Filter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'all', label: 'All Items', desc: 'Veg & Non-Veg' },
                  { id: 'veg_only', label: 'Pure Vegetarian', desc: '100% Green Tagged' },
                  { id: 'jain', label: 'Jain Friendly', desc: 'No root veggies' },
                  { id: 'vegan', label: 'Plant Based', desc: 'Dairy-free options' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietaryPreference(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      dietaryPreference === item.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Payment Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Default Checkout Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'CAMPUS_CARD', label: 'Digital Campus Card', desc: 'Instant 1-click contactless deduction' },
                  { id: 'UPI_QR', label: 'UPI / Bharat QR', desc: 'GPay, PhonePe, Paytm' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDefaultPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      defaultPaymentMethod === m.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{m.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Notifications Settings */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Alert & Token Channels
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Push Notifications</div>
                      <div className="text-[11px] text-slate-500">Live order status toast when tokens advance</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">SMS Ready Alerts</div>
                      <div className="text-[11px] text-slate-500">Receive text message when your token is ready at counter</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Sound & Counter Chimes</div>
                      <div className="text-[11px] text-slate-500">Audio chime when token is announced on screen</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Cafeteria Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPUS DIGITAL WALLET */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
          {/* Main Wallet Top-up Interface */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Digital Campus Wallet</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Top up your student card for fast, queue-free checkout at INDIYA Floor 4th.
              </p>
            </div>

            {/* Current Balance Display */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Available Balance
                </span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  ₹{currentWalletBalance.toFixed(2)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-300" />
              </div>
            </div>

            {/* Quick Top-up Amount Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Recharge Amount
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedTopUp(amt);
                      setCustomTopUp('');
                    }}
                    className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                      selectedTopUp === amt && !customTopUp
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Or enter custom amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={customTopUp}
                    onChange={(e) => setCustomTopUp(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Recharge Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleWalletRecharge}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Top-Up...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      Recharge ₹{customTopUp ? customTopUp : selectedTopUp} to Campus Wallet
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Wallet Perks & Benefits */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Campus Wallet Benefits
            </h4>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero transaction fee & instant confirmation on all cafeteria orders.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automated express pickup at Floor 4th designated quick tokens lane.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Auto-refunds for any cancelled orders back into wallet immediately.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-800">Support:</span> Need assistance with campus card balance? Visit Counter 1 at INDIYA Cafeteria.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Security & Password</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Update your account password to ensure your cafeteria orders and wallet remain secure.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                Demo Accounts default: <span className="font-mono font-semibold">Student@123</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign Out Card */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Session Management</h4>
              <p className="text-[11px] text-slate-500">Sign out of this browser or device</p>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

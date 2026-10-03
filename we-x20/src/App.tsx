import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { QueueProvider, useQueue } from './context/QueueContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { FloatingUiSwitcher, UiDesignStudio } from './components/UiDesignStudio';
import { OrganicFluidShaderCanvas } from './components/OrganicFluidShaderCanvas';
import { FloatingParticles } from './components/FloatingParticles';
import { getDynamicDocumentTitle } from './utils/dynamicTitles';
import { motion, AnimatePresence } from 'motion/react';

// Role views load on demand so the first visit does not download every dashboard.
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then(module => ({ default: module.MenuPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then(module => ({ default: module.OrderTrackingPage })));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage').then(module => ({ default: module.OrderHistoryPage })));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard').then(module => ({ default: module.StaffDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const CounterQueuePage = lazy(() => import('./pages/CounterQueuePage').then(module => ({ default: module.CounterQueuePage })));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then(module => ({ default: module.UserProfilePage })));

function MainApp() {
  const { user } = useAuth();
  const { queueStatus, activeOrder } = useQueue();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isUiStudioOpen, setIsUiStudioOpen] = useState(false);

  useEffect(() => {
    const title = getDynamicDocumentTitle({
      view: currentView,
      activeOrderToken: activeOrder?.tokenNumber,
      activeOrderStatus: activeOrder?.status,
      servingToken: queueStatus?.currentlyServingToken
    });
    document.title = title;
  }, [currentView, activeOrder?.tokenNumber, activeOrder?.status, queueStatus?.currentlyServingToken]);

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order_tracking');
  };

  const handleOrderPlaced = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order_tracking');
  };

  return (
    <div className="min-h-screen theme-canvas text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-primary selection:text-white font-sans antialiased transition-colors duration-300 relative overflow-x-clip">
      {/* Ambient Shader Canvas & Floating Particles */}
      <OrganicFluidShaderCanvas opacity={0.16} />
      <FloatingParticles />

      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Animated Content Area */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Suspense fallback={<div role="status" className="grid min-h-56 place-items-center text-sm font-medium text-slate-500">Loading your campus view…</div>}>
            {currentView === 'landing' && (
              <LandingPage onNavigate={setCurrentView} />
            )}

            {currentView === 'login' && (
              <LoginPage onNavigate={setCurrentView} />
            )}

            {currentView === 'register' && (
              <RegisterPage onNavigate={setCurrentView} />
            )}

            {currentView === 'menu' && (
              <MenuPage onOpenCart={() => {}} />
            )}

            {(currentView === 'counter_queue' || currentView === 'counter') && (
              <CounterQueuePage onNavigate={setCurrentView} />
            )}

            {currentView === 'student_dashboard' && (
              <StudentDashboard
                onNavigate={setCurrentView}
                onTrackOrder={handleTrackOrder}
              />
            )}

            {currentView === 'order_tracking' && (
              <OrderTrackingPage
                orderId={selectedOrderId}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'order_history' && (
              <OrderHistoryPage
                onNavigate={setCurrentView}
                onTrackOrder={handleTrackOrder}
              />
            )}

            {currentView === 'staff_kds' && (
              <StaffDashboard />
            )}

            {currentView === 'admin_dashboard' && (
              <AdminDashboard initialTab="overview" />
            )}

            {currentView === 'admin_analytics' && (
              <AdminDashboard initialTab="analytics" />
            )}

            {currentView === 'admin_predictions' && (
              <AdminDashboard initialTab="predictions" />
            )}

            {currentView === 'admin_menu' && (
              <AdminDashboard initialTab="menu" />
            )}

            {(currentView === 'user_profile' || currentView === 'profile') && (
              <UserProfilePage onNavigate={setCurrentView} />
            )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Shopping Cart Drawer */}
      <CartDrawer
        onOrderPlaced={handleOrderPlaced}
        onOpenLogin={() => setCurrentView('login')}
      />

      {/* Real-time Order Notification Toast */}
      <LiveNotificationToast
        onTrackOrder={(orderId) => {
          if (orderId) setSelectedOrderId(orderId);
          setCurrentView('order_tracking');
        }}
      />

      {/* Persistent Floating UI Archetype Switcher */}
      <FloatingUiSwitcher onOpenStudio={() => setIsUiStudioOpen(true)} />

      {/* Global UI Design Studio Modal */}
      <UiDesignStudio
        isOpen={isUiStudioOpen}
        onClose={() => setIsUiStudioOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <QueueProvider>
            <MainApp />
          </QueueProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

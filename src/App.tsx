import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { QueueProvider, useQueue } from './context/QueueContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { getDynamicDocumentTitle } from './utils/dynamicTitles';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MenuPage } from './pages/MenuPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CounterQueuePage } from './pages/CounterQueuePage';
import { UserProfilePage } from './pages/UserProfilePage';

function MainApp() {
  const { user } = useAuth();
  const { queueStatus, activeOrder } = useQueue();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    <div className="min-h-screen theme-canvas text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-primary selection:text-white font-sans antialiased transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Animated Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
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

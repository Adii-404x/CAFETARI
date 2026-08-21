import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { QueueProvider } from './context/QueueContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { LiveNotificationToast } from './components/LiveNotificationToast.tsx';

// Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.tsx';
import { OrderHistoryPage } from './pages/OrderHistoryPage.tsx';
import { StaffDashboard } from './pages/StaffDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { CounterQueuePage } from './pages/CounterQueuePage.tsx';
import { UserProfilePage } from './pages/UserProfilePage.tsx';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order_tracking');
  };

  const handleOrderPlaced = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order_tracking');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8">
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
    <AuthProvider>
      <CartProvider>
        <QueueProvider>
          <MainApp />
        </QueueProvider>
      </CartProvider>
    </AuthProvider>
  );
}

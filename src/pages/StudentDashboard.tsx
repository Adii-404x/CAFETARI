import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useCart } from '../context/CartContext';
import { orderApi, foodApi } from '../services/api';
import { FoodCategory, FoodItem, Order } from '../types/index';
import { initialFoodItems } from '../data/menuData';
import { QueueTicker } from '../components/QueueTicker';
import { MenuCard } from '../components/MenuCard';
import { getTimeGreeting } from '../utils/dynamicTitles';
import { useTheme } from '../context/ThemeContext';
import {
  Utensils,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  History,
  TrendingUp,
  Flame,
  User as UserIcon,
  Wallet,
  Zap,
  Plus,
  Coffee,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onTrackOrder }) => {
  const { user } = useAuth();
  const { activeOrder, queueStatus } = useQueue();
  const { addToCart, setDrawerOpen } = useCart();
  const { currentArchetype, archetype } = useTheme();

  const [popularItems, setPopularItems] = useState<FoodItem[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [foodRes, orderRes] = await Promise.all([
          foodApi.getFoodItems({ availableOnly: true }),
          orderApi.getMyOrders()
        ]);

        if (foodRes.success && Array.isArray(foodRes.data) && foodRes.data.length > 0) {
          setPopularItems(foodRes.data.filter(f => f.isPopular).slice(0, 4));
        } else {
          setPopularItems(initialFoodItems.filter(f => f.isPopular).slice(0, 4));
        }

        if (orderRes.success && orderRes.data) {
          setPastOrders(orderRes.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      }
    }
    loadData();
  }, []);

  const handleQuickAdd = (item: { name: string; price: number; category: string; image: string; desc: string }) => {
    let resolvedCategory: FoodCategory = 'Snacks';
    if (item.category === 'Beverages' || item.category === 'Breakfast' || item.category === 'Meals' || item.category === 'Desserts' || item.category === 'Snacks') {
      resolvedCategory = item.category as FoodCategory;
    }

    const foodItem: FoodItem = {
      id: `quick-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      description: item.desc,
      category: resolvedCategory,
      price: item.price,
      image: item.image,
      available: true,
      preparationTime: 5,
      isVegetarian: true,
      createdAt: '',
      updatedAt: ''
    };
    addToCart(foodItem, 1);
    setAddedItemName(item.name);
    setTimeout(() => setAddedItemName(null), 2000);
  };

  const handleReorderUsual = () => {
    // Re-order usual: Iced Oat Latte + Avocado Toast combo
    handleQuickAdd({
      name: 'Iced Oat Vanilla Latte',
      price: 140,
      category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
      desc: 'Chilled artisanal espresso with velvety oat milk & vanilla essence'
    });
    handleQuickAdd({
      name: 'Artisanal Avocado Toast',
      price: 180,
      category: 'Quick Bites',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
      desc: 'Toasted sourdough with seasoned crushed avocado and chili flakes'
    });
    setDrawerOpen(true);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(it => {
      const foodItem: FoodItem = {
        id: it.foodItemId,
        name: it.name,
        description: 'Re-ordered campus favorite',
        category: 'Snacks',
        price: it.price,
        image: it.image,
        available: true,
        preparationTime: 10,
        isVegetarian: true,
        createdAt: '',
        updatedAt: ''
      };
      addToCart(foodItem, it.quantity);
    });
    setDrawerOpen(true);
  };

  const timeContext = getTimeGreeting(user?.name);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';

  // Order status progress calculation for the energy bar
  const getOrderProgressPercent = (status?: string) => {
    switch (status) {
      case 'PLACED':
        return '25%';
      case 'PREPARING':
        return '65%';
      case 'READY':
        return '100%';
      case 'COMPLETED':
        return '100%';
      default:
        return '30%';
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Top Dashboard Grid: Hero & Live Order / Counter Pulse HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Student Welcome Hero Section */}
        <section className={`relative overflow-hidden archetype-card p-6 sm:p-8 lg:p-10 transition-all duration-300 flex flex-col justify-between ${
          activeOrder ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-8 xl:col-span-8'
        }`}>
          <div className="relative z-10 space-y-4 text-left">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-brand-primary border border-brand-subtle font-bold text-xs flex items-center space-x-1.5 shadow-2xs">
                <span>{timeContext.periodEmoji}</span>
                <span>{timeContext.mealPeriod}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                Floor 4th Express Dining
              </span>
              <button
                onClick={() => onNavigate('user_profile')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:opacity-85 transition-colors cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Wallet: ₹{(user?.walletBalance ?? 500).toFixed(2)}</span>
              </button>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight archetype-heading ${currentArchetype.heroGreetingStyle}`}>
              Good {timeContext.mealPeriod.includes('Breakfast') ? 'Morning' : timeContext.mealPeriod.includes('Lunch') ? 'Afternoon' : 'Evening'},<br />
              <span className="text-brand-primary">{firstName}.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
              Fuel up for lectures and finals. Fresh artisan bowls, sourdough sandwiches, cold brews & thalis are ready to pick up at Floor 4th.
            </p>
          </div>

          <div className="pt-6 relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={handleReorderUsual}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md hover:scale-102 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400 dark:text-amber-500 fill-current" />
              <span>Reorder Usual (Combo)</span>
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className="px-6 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-brand hover:scale-102 transition-all cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Full Menu</span>
            </button>
          </div>
        </section>

        {/* Right: Live Active Order HUD Card OR Live Counter Pulse Card */}
        {activeOrder ? (
          <section className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-gradient-to-br from-white to-brand-subtle/30 dark:from-slate-900 dark:to-slate-900/90 border-2 border-brand-primary/40 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-brand-primary bg-brand-subtle px-2.5 py-0.5 rounded-full border border-brand-subtle">
                    Active Order
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  #{activeOrder.orderNumber}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Token Number</div>
                <div className="text-4xl sm:text-5xl font-black text-brand-primary font-mono tracking-tight">
                  #{activeOrder.tokenNumber}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 line-clamp-2">
                  {activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(' + ')}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">
                    {activeOrder.status === 'READY' ? '🎉 Ready at counter' : 'Status:'}
                  </span>
                  <span className="text-brand-primary font-black">
                    {activeOrder.status === 'READY' ? 'Ready Now' : `~${activeOrder.estimatedPreparationTime} min remaining`}
                  </span>
                </div>
                <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                  <div
                    className="absolute top-0 left-0 h-full progress-bar-energy rounded-full transition-all duration-500"
                    style={{ width: getOrderProgressPercent(activeOrder.status) }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-0.5">
                  <span className={activeOrder.status === 'PLACED' ? 'text-brand-primary font-bold' : ''}>Placed</span>
                  <span className={activeOrder.status === 'PREPARING' ? 'text-brand-primary font-bold' : ''}>Cooking</span>
                  <span className={activeOrder.status === 'READY' ? 'text-emerald-500 font-black animate-pulse' : ''}>Ready</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Floor 4th Pickup Bay
              </span>
              <button
                onClick={() => onTrackOrder(activeOrder.id)}
                className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold flex items-center space-x-1.5 shadow-brand transition-all cursor-pointer"
              >
                <span>Live Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        ) : (
          <section className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  Floor 4th Live Counter
                </span>
                <span className="flex items-center space-x-1 text-xs text-brand-primary font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                  <span>Active</span>
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Currently Serving</div>
                <div className="text-4xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  #{queueStatus?.currentlyServingToken || 118}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Wait Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">~{queueStatus?.estimatedWaitMinutes || 10} mins</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Queue Length:</span>
                  <span className="font-bold text-brand-primary">{queueStatus?.totalOrdersInQueue || 4} orders ahead</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('counter_queue')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              <span>View Live Counter Board</span>
            </button>
          </section>
        )}
      </div>

      {/* Split-Flap Queue Ticker */}
      <QueueTicker onViewOrderTracker={() => onNavigate('order_tracking')} />

      {/* Bento Grid: Trending on Campus */}
      <section className="space-y-5 stagger-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Trending on Campus (Bento Specials)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                High-demand student favorites, fast-lane barista brews & study fuel combos
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold text-brand-primary hover:opacity-80 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Bento Card 1: Large Featured Combo (2 Cols) */}
          <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 relative h-88 sm:h-96 rounded-3xl overflow-hidden shadow-sm group hover-reveal-card border border-slate-200 dark:border-slate-800 tilt-card cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Study Fuel Combo</span>
              </span>
              <span className="bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                Save ₹40
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full text-white z-20 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black">
                Avocado Toast + Large Cold Brew Combo
              </h3>
              <p className="text-xs sm:text-sm text-slate-200/90 font-medium max-w-md">
                Artisanal toasted sourdough, crushed seasoned avocado paired with 16-hour slow steep cold brew.
              </p>
              <div className="reveal-content flex justify-between items-center pt-2">
                <span className="text-xl font-black text-amber-400">₹240 <span className="text-xs text-slate-400 line-through">₹280</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd({
                      name: 'Study Fuel Combo (Avo + Cold Brew)',
                      price: 240,
                      category: 'Combos',
                      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
                      desc: 'Combo: Avocado Toast + 16hr cold brew'
                    });
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-black text-xs px-5 py-2.5 rounded-full shadow-md hover:scale-105 transition-all spring-bouncy flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Quick Add Combo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Iced Matcha Latte (1 Col) */}
          <div className="relative h-88 sm:h-96 rounded-3xl overflow-hidden shadow-sm group hover-reveal-card border border-slate-200 dark:border-slate-800 tilt-card cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-4 left-4 z-20">
              <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                Antioxidant Boost
              </span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 w-full text-white z-20">
              <h3 className="text-xl font-black mb-1">Ceremonial Iced Matcha</h3>
              <p className="text-xs text-slate-200/80 mb-3">Oat milk default • Sustained focus</p>
              <div className="reveal-content flex justify-between items-center">
                <span className="text-lg font-black text-emerald-400">₹150</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd({
                      name: 'Ceremonial Iced Matcha',
                      price: 150,
                      category: 'Beverages',
                      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
                      desc: 'Ceremonial grade matcha with chilled oat milk'
                    });
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs p-2.5 rounded-full hover:scale-110 transition-transform spring-bouncy cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Flash Brew Japanese Filter (1 Col) */}
          <div className="relative h-88 sm:h-96 rounded-3xl overflow-hidden shadow-sm group hover-reveal-card border border-slate-200 dark:border-slate-800 tilt-card cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm pulse-vibrant">
                Live Brew
              </span>
              <span className="bg-amber-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                High Demand
              </span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 w-full text-white z-20">
              <h3 className="text-xl font-black mb-1">Flash Brew Coffee</h3>
              <p className="text-xs text-slate-200/80 mb-3">Japanese-style iced pour-over. Crisp energy.</p>
              <div className="reveal-content flex justify-between items-center">
                <span className="text-lg font-black text-brand-accent">₹120</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd({
                      name: 'Flash Brew Coffee',
                      price: 120,
                      category: 'Beverages',
                      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
                      desc: 'Japanese-style iced filter coffee with bright notes'
                    });
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs p-2.5 rounded-full hover:scale-110 transition-transform spring-bouncy cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Butter Croissant (1 Col) */}
          <div className="relative h-88 sm:h-96 rounded-3xl overflow-hidden shadow-sm group hover-reveal-card border border-slate-200 dark:border-slate-800 tilt-card cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-4 left-4 z-20">
              <span className="bg-amber-700 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm animate-bounce">
                Selling Fast (3 Left)
              </span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 w-full text-white z-20">
              <h3 className="text-xl font-black mb-1">Artisanal Butter Croissant</h3>
              <p className="text-xs text-slate-200/80 mb-3">Laminated dough, pure butter. Freshly baked.</p>
              <div className="reveal-content flex justify-between items-center">
                <span className="text-lg font-black text-amber-400">₹90</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd({
                      name: 'Artisanal Butter Croissant',
                      price: 90,
                      category: 'Snacks',
                      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
                      desc: 'Golden flaky laminated pastry'
                    });
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs p-2.5 rounded-full hover:scale-110 transition-transform spring-bouncy cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 5: Paneer Tikka Wrap (1 Col) */}
          <div className="relative h-88 sm:h-96 rounded-3xl overflow-hidden shadow-sm group hover-reveal-card border border-slate-200 dark:border-slate-800 tilt-card cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-4 left-4 z-20">
              <span className="bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                Chef's Special
              </span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 w-full text-white z-20">
              <h3 className="text-xl font-black mb-1">Tandoori Paneer Wrap</h3>
              <p className="text-xs text-slate-200/80 mb-3">Char-grilled cottage cheese with mint glaze.</p>
              <div className="reveal-content flex justify-between items-center">
                <span className="text-lg font-black text-purple-300">₹160</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd({
                      name: 'Tandoori Paneer Wrap',
                      price: 160,
                      category: 'Quick Bites',
                      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
                      desc: 'Char-grilled cottage cheese wrapped with mint chutney'
                    });
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs p-2.5 rounded-full hover:scale-110 transition-transform spring-bouncy cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Today Grid from Menu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campus Standard Menu</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold text-brand-primary hover:opacity-80 flex items-center space-x-1 cursor-pointer"
          >
            <span>Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          {popularItems.map(item => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Recent Orders Section with Instant Re-order */}
      {pastOrders.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Campus Orders</h3>
            </div>
            <button
              onClick={() => onNavigate('order_history')}
              className="text-xs font-bold text-brand-primary hover:opacity-80 cursor-pointer"
            >
              View All Past Receipts ({pastOrders.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pastOrders.map(order => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-800 dark:text-slate-200">
                    #{order.tokenNumber}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      ₹{order.totalAmount} • {new Date(order.placedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${order.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}`}>
                    {order.status}
                  </span>
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    Reorder ⚡
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

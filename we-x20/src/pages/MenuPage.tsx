import React, { useState, useEffect } from 'react';
import { FoodItem } from '../types/index';
import { foodApi } from '../services/api';
import { initialFoodItems } from '../data/menuData';
import { MenuCard } from '../components/MenuCard';
import { useCart } from '../context/CartContext';
import { getTimeGreeting } from '../utils/dynamicTitles';
import {
  Search,
  Utensils,
  ShoppingBag,
  Sparkles,
  Leaf
} from 'lucide-react';
import { motion } from 'motion/react';

interface MenuPageProps {
  onOpenCart?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onOpenCart }) => {
  const { totalCount, totalAmount, setDrawerOpen } = useCart();
  const [items, setItems] = useState<FoodItem[]>(() => initialFoodItems);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');

  const filterTabs = [
    { label: 'All Items', category: 'All', query: '' },
    { label: '🍔 Burgers', category: 'All', query: 'Burger' },
    { label: '🥪 Sandwiches', category: 'All', query: 'Sandwich' },
    { label: '🍱 Thalis', category: 'All', query: 'Thali' },
    { label: '🍟 Fries', category: 'All', query: 'Fries' },
    { label: '☕ Tea & Coffee', category: 'Beverages', query: 'Coffee' },
    { label: '🥤 Cold Drinks', category: 'Beverages', query: 'Drink' },
    { label: 'Breakfast', category: 'Breakfast', query: '' },
    { label: 'Snacks', category: 'Snacks', query: '' },
    { label: 'Desserts', category: 'Desserts', query: '' }
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await foodApi.getFoodItems({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: search.trim() || undefined,
        sort: sortBy
      });

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        let filtered = res.data;
        if (vegOnly) {
          filtered = filtered.filter(i => i.isVegetarian);
        }
        setItems(filtered);
      } else {
        // Fallback to client-side catalog if API is offline
        let catalog = [...initialFoodItems];
        if (selectedCategory && selectedCategory !== 'All') {
          catalog = catalog.filter(i => i.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          catalog = catalog.filter(
            i =>
              i.name.toLowerCase().includes(q) ||
              i.description.toLowerCase().includes(q) ||
              i.tags?.some(t => t.toLowerCase().includes(q))
          );
        }
        if (vegOnly) {
          catalog = catalog.filter(i => i.isVegetarian);
        }
        if (sortBy === 'price_asc') catalog.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') catalog.sort((a, b) => b.price - a.price);
        else if (sortBy === 'prep_time') catalog.sort((a, b) => a.preparationTime - b.preparationTime);
        else catalog.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));

        setItems(catalog);
      }
    } catch (err) {
      console.warn('Backend API unreachable, using local menu catalog:', err);
      let catalog = [...initialFoodItems];
      if (selectedCategory && selectedCategory !== 'All') {
        catalog = catalog.filter(i => i.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        catalog = catalog.filter(
          i =>
            i.name.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.tags?.some(t => t.toLowerCase().includes(q))
        );
      }
      if (vegOnly) {
        catalog = catalog.filter(i => i.isVegetarian);
      }
      setItems(catalog);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, search, sortBy, vegOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const timeContext = getTimeGreeting();

  const getDynamicTitle = () => {
    if (search.trim()) {
      return `Results for "${search.trim()}" (${items.length} ${items.length === 1 ? 'item' : 'items'})`;
    }
    if (selectedCategory === 'All') {
      return `INDIYA Fresh Kitchen Menu (${items.length} dishes)`;
    }
    return `${selectedCategory} Specials (${items.length} available)`;
  };

  return (
    <div className="space-y-6 py-2 sm:py-4">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-subtle border border-brand-subtle text-brand-primary text-[10px] font-black uppercase tracking-wider">
              <Utensils className="w-3 h-3 text-brand-primary" />
              <span>INDIYA Cafeteria • Floor 4th Counter</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
              <span>{timeContext.periodEmoji}</span>
              <span>{timeContext.mealPeriod}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
              Self Pickup Only • No Delivery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {getDynamicTitle()}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl font-medium">
            Order ahead or grab at the counter. Show your Token Number at Floor 4th pickup window to collect your freshly cooked food.
          </p>
        </div>

        {totalCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDrawerOpen(true)}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white font-black text-xs flex items-center justify-center space-x-2 shadow-brand transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Tray ({totalCount} items • ₹{totalAmount})</span>
          </motion.button>
        )}
      </motion.div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Burger, Sandwich, Thali, Cold Coffee, Tea, Fries..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 ring-brand font-medium"
            />
          </form>

          {/* Right Controls: Veg filter & Sort */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-1.5 border transition-all cursor-pointer ${
                vegOnly
                  ? 'bg-brand-subtle text-brand-primary border-brand-subtle shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-brand-primary" />
              <span>Veg Only</span>
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="popular">Popular First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="prep_time">Fastest Preparation</option>
            </select>
          </div>
        </div>

        {/* Category & Item Quick Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map(tab => {
            const active = (selectedCategory === tab.category && (!tab.query || search.toLowerCase().includes(tab.query.toLowerCase())));
            return (
              <motion.button
                key={tab.label}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedCategory(tab.category);
                  setSearch(tab.query);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-brand-primary text-white shadow-brand'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-7">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">No food items found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters or browse other food categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setVegOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-brand-subtle text-brand-primary font-black text-xs transition-colors cursor-pointer border border-brand-subtle"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-7"
        >
          {items.map(item => (
            <MenuCard key={item.id} item={item} />
          ))}
        </motion.div>
      )}

      {/* Floating Cart Bar on Mobile */}
      {totalCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 z-40 sm:hidden"
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-3.5 px-4 bg-brand-primary hover:bg-brand-hover text-white font-black rounded-2xl shadow-brand flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCount} items in tray</span>
            </div>
            <span>View & Checkout • ₹{totalAmount}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

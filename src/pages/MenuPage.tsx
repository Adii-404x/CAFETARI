import React, { useState, useEffect } from 'react';
import { FoodItem, FoodCategory } from '../types/index.ts';
import { foodApi } from '../services/api.ts';
import { MenuCard } from '../components/MenuCard.tsx';
import { useCart } from '../context/CartContext.tsx';
import {
  Search,
  Filter,
  Utensils,
  ShoppingBag,
  Sparkles,
  Leaf,
  Coffee,
  Check
} from 'lucide-react';

interface MenuPageProps {
  onOpenCart?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onOpenCart }) => {
  const { totalCount, totalAmount, setDrawerOpen } = useCart();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

      if (res.success && res.data) {
        let filtered = res.data;
        if (vegOnly) {
          filtered = filtered.filter(i => i.isVegetarian);
        }
        setItems(filtered);
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
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

  return (
    <div className="space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              <Utensils className="w-3 h-3 text-emerald-600" />
              <span>INDIYA Cafeteria • Floor 4th Counter</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Self Pickup Only • No Delivery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            INDIYA Fresh Kitchen Menu
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Order ahead or grab at the counter. Show your Token Number at Floor 4th pickup window to collect your freshly cooked food.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Tray ({totalCount} items • ₹{totalAmount})</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Burger, Sandwich, Thali, Cold Coffee, Tea, Fries..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </form>

          {/* Right Controls: Veg filter & Sort */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Veg Only</span>
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
              <button
                key={tab.label}
                onClick={() => {
                  setSelectedCategory(tab.category);
                  setSearch(tab.query);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No food items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or browse other food categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setVegOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Floating Cart Bar on Mobile */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCount} items in tray</span>
            </div>
            <span>View & Checkout • ₹{totalAmount}</span>
          </button>
        </div>
      )}
    </div>
  );
};

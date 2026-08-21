import React from 'react';
import { FoodItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { Clock, Flame, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface MenuCardProps {
  item: FoodItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(item.id);

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-xs ${item.available ? 'border-slate-200 hover:border-slate-300 hover:shadow-md' : 'border-slate-200/60 opacity-60'}`}>
      <div>
        {/* Card Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Category Chip */}
          <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200/80 shadow-xs">
              {item.category}
            </span>
            {item.isPopular && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white flex items-center space-x-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Popular</span>
              </span>
            )}
          </div>

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md p-1 rounded-md border border-slate-200 shadow-xs">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center p-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
            </div>
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
              {item.name}
            </h3>
            <span className="text-base font-black text-emerald-700 whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>

          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Metrics: Prep time & Calories */}
          <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{item.preparationTime} mins prep</span>
            </div>
            {item.calories && (
              <div className="flex items-center space-x-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>{item.calories} kcal</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        {item.available ? (
          quantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1 text-emerald-900">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-sm px-2 text-emerald-900">{quantityInCart} in cart</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, 1)}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
              <span>Add to Order</span>
            </button>
          )
        ) : (
          <button
            disabled
            className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed border border-slate-200"
          >
            Currently Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

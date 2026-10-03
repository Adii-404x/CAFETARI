import React, { useRef, useState } from 'react';
import { FoodItem } from '../types/index';
import { useCart } from '../context/CartContext';
import { Clock, Flame, Plus, Minus, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface MenuCardProps {
  item: FoodItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(item.id);
  const [isJustAdded, setIsJustAdded] = useState(false);

  // 3D Parallax Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.04);
    setRotateY(x * 0.04);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleAdd = () => {
    addToCart(item, 1);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 900);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`group relative bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-brand-primary ${
        item.available ? 'border-slate-200/80 dark:border-slate-800' : 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
      }`}
    >
      <div>
        {/* Card Image Container with Dynamic Badge Accents */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity" />

          {/* Category Chip */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs">
              {item.category}
            </span>
            {item.isPopular && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-primary text-white flex items-center space-x-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Trending</span>
              </span>
            )}
          </div>

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs z-10">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center p-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
            </div>
          </div>

          {/* Fast Prep Pill overlay */}
          <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-bold flex items-center space-x-1.5 drop-shadow-md z-10">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span>{item.preparationTime}m fast prep</span>
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="bg-rose-600 text-white font-black text-xs uppercase px-3.5 py-1.5 rounded-full tracking-wider shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-slate-900 dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-brand-primary transition-colors">
              {item.name}
            </h3>
            <span className="text-base font-black text-brand-primary whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">
            {item.description}
          </p>

          {/* Nutrition & Calories Tag */}
          <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            {item.calories && (
              <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 px-2 py-0.5 rounded-md font-semibold">
                <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{item.calories} kcal</span>
              </div>
            )}
            <span className="text-slate-400 text-[10px]">Indiya Special</span>
          </div>
        </div>
      </div>

      {/* Dynamic Action Footer with Morphing Button */}
      <div className="p-4 sm:p-5 pt-0">
        {item.available ? (
          quantityInCart > 0 ? (
            <motion.div
              layout
              className="flex items-center justify-between bg-brand-subtle border-2 border-brand-primary rounded-2xl p-1 text-brand-primary shadow-xs"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => updateQuantity(item.id, -1)}
                className="w-8 h-8 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-black flex items-center justify-center transition-all shadow-xs cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <span className="font-black text-sm px-2 text-brand-primary">{quantityInCart} in tray</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => updateQuantity(item.id, 1)}
                className="w-8 h-8 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-black flex items-center justify-center transition-all shadow-xs cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer ${
                isJustAdded
                  ? 'bg-brand-primary text-white shadow-brand'
                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-brand-primary text-white hover:shadow-brand'
              }`}
            >
              {isJustAdded ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  <span>Added to Tray!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
                  <span>+ Quick Add</span>
                </>
              )}
            </motion.button>
          )
        ) : (
          <button
            disabled
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200 dark:border-slate-700"
          >
            Currently Sold Out
          </button>
        )}
      </div>
    </motion.div>
  );
};

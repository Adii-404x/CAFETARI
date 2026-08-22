import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem } from '../types/index';

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addToCart: (item: FoodItem, quantity?: number) => void;
  updateQuantity: (foodItemId: string, delta: number) => void;
  removeFromCart: (foodItemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (foodItemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cafeteria_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cafeteria_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error persisting cart:', e);
    }
  }, [items]);

  const addToCart = (foodItem: FoodItem, quantity: number = 1) => {
    if (!foodItem.available) return;

    setItems(prev => {
      const existingIdx = prev.findIndex(ci => ci.foodItem.id === foodItem.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      }
      return [...prev, { foodItem, quantity }];
    });
  };

  const updateQuantity = (foodItemId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(ci => {
          if (ci.foodItem.id === foodItemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (foodItemId: string) => {
    setItems(prev => prev.filter(ci => ci.foodItem.id !== foodItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (foodItemId: string): number => {
    const found = items.find(ci => ci.foodItem.id === foodItemId);
    return found ? found.quantity : 0;
  };

  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalAmount = items.reduce((acc, it) => acc + it.foodItem.price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalAmount,
        drawerOpen,
        setDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { FoodItem, FoodCategory } from '../types/index';
import { foodApi } from '../services/api';
import { X, Utensils, Sparkles, Image as ImageIcon } from 'lucide-react';

interface FoodModalProps {
  itemToEdit: FoodItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const FoodModal: React.FC<FoodModalProps> = ({ itemToEdit, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Snacks');
  const [price, setPrice] = useState<number>(50);
  const [preparationTime, setPreparationTime] = useState<number>(8);
  const [calories, setCalories] = useState<number>(250);
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState<boolean>(true);
  const [isVegetarian, setIsVegetarian] = useState<boolean>(true);
  const [isPopular, setIsPopular] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description);
      setCategory(itemToEdit.category);
      setPrice(itemToEdit.price);
      setPreparationTime(itemToEdit.preparationTime);
      setCalories(itemToEdit.calories || 250);
      setImage(itemToEdit.image);
      setAvailable(itemToEdit.available);
      setIsVegetarian(itemToEdit.isVegetarian);
      setIsPopular(itemToEdit.isPopular || false);
    } else {
      setImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80');
    }
  }, [itemToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        preparationTime: Number(preparationTime),
        calories: Number(calories),
        image: image.trim(),
        available,
        isVegetarian,
        isPopular
      };

      let res;
      if (itemToEdit) {
        res = await foodApi.updateFoodItem(itemToEdit.id, payload);
      } else {
        res = await foodApi.createFoodItem(payload);
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to save menu item.');
      }
    } catch {
      setErrorMsg('Network error. Failed to save food item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-xl z-10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {itemToEdit ? 'Edit Menu Item' : 'Add New Item to Menu'}
              </h3>
              <p className="text-xs text-slate-500">Manage cafeteria catalog & pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala Roll"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as FoodCategory)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Snacks">Snacks</option>
                <option value="Meals">Meals</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                min="5"
                step="1"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prep Time (mins) *</label>
              <input
                type="number"
                min="1"
                required
                value={preparationTime}
                onChange={e => setPreparationTime(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="20"
                value={calories}
                onChange={e => setCalories(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL *</label>
              <input
                type="url"
                required
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief ingredients, taste, and serving size..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Checkbox toggles */}
            <div className="col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>In Stock & Available</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={e => setIsVegetarian(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>100% Vegetarian</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={e => setIsPopular(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Featured / Popular</span>
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving Item...' : itemToEdit ? 'Save Changes' : 'Add Item to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { FoodItem, FoodCategory } from '../../src/types/index';
import { emitFoodStockUpdated } from '../socket';

const foodItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(['Breakfast', 'Snacks', 'Meals', 'Beverages', 'Desserts']),
  price: z.number().positive('Price must be greater than 0'),
  image: z.string().url('A valid image URL is required'),
  available: z.boolean().default(true),
  preparationTime: z.number().int().positive('Preparation time must be at least 1 minute'),
  calories: z.number().optional(),
  isVegetarian: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

export async function getFoodItems(req: Request, res: Response) {
  try {
    const { category, search, availableOnly, sort } = req.query;
    let items = db.getFoodItems();

    if (category && category !== 'All') {
      items = items.filter(i => i.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (availableOnly === 'true') {
      items = items.filter(i => i.available);
    }

    if (sort === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'prep_time') {
      items.sort((a, b) => a.preparationTime - b.preparationTime);
    } else {
      // Default: Popular items first, then alphabetical
      items.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items.'
    });
  }
}

export async function getFoodItemById(req: Request, res: Response) {
  const { id } = req.params;
  const item = db.getFoodItemById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Food item not found.'
    });
  }

  return res.json({
    success: true,
    data: item
  });
}

export async function createFoodItem(req: Request, res: Response) {
  try {
    const validated = foodItemSchema.parse(req.body);

    const newItem: FoodItem = {
      id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: validated.name,
      description: validated.description,
      category: validated.category as FoodCategory,
      price: validated.price,
      image: validated.image,
      available: validated.available,
      preparationTime: validated.preparationTime,
      calories: validated.calories || 250,
      isVegetarian: validated.isVegetarian,
      isPopular: validated.isPopular,
      tags: validated.tags || ['Fresh'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addFoodItem(newItem);

    return res.status(201).json({
      success: true,
      message: 'Food item added to cafeteria menu successfully.',
      data: newItem
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Invalid item data',
        errors: error.issues
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create food item.'
    });
  }
}

export async function updateFoodItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = db.getFoodItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found.'
      });
    }

    const updated = db.updateFoodItem(id, req.body);
    if (updated) {
      emitFoodStockUpdated(updated);
    }

    return res.json({
      success: true,
      message: 'Food item updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update food item.'
    });
  }
}

export async function toggleAvailability(req: Request, res: Response) {
  const { id } = req.params;
  const item = db.getFoodItemById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Food item not found.'
    });
  }

  const updated = db.updateFoodItem(id, { available: !item.available });
  if (updated) {
    emitFoodStockUpdated(updated);
  }

  return res.json({
    success: true,
    message: `${item.name} is now ${updated?.available ? 'Available' : 'Out of Stock'}.`,
    data: updated
  });
}

export async function deleteFoodItem(req: Request, res: Response) {
  const { id } = req.params;
  const success = db.deleteFoodItem(id);

  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Food item not found or could not be deleted.'
    });
  }

  return res.json({
    success: true,
    message: 'Food item deleted successfully from menu.'
  });
}

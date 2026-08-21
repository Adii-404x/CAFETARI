import { Request, Response } from 'express';
import { db } from '../db.ts';

export async function getFoodRecommendations(req: Request, res: Response) {
  const { currentItemIds } = req.query;
  const foodItems = db.getFoodItems().filter(f => f.available);

  const parsedIds = currentItemIds ? (currentItemIds as string).split(',') : [];

  // Complementary pairings heuristic based on categories
  const recommendations = foodItems.filter(f => !parsedIds.includes(f.id));

  // If cart has spicy/meal items, prioritize beverages and desserts
  let prioritized = recommendations.filter(f => f.category === 'Beverages' || f.category === 'Desserts' || f.isPopular);
  if (prioritized.length < 3) {
    prioritized = recommendations;
  }

  return res.json({
    success: true,
    data: prioritized.slice(0, 4)
  });
}

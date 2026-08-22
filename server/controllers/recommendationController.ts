import { Request, Response } from 'express';
import { AssociationRecommender } from '../ml/associationRecommender';

export async function getFoodRecommendations(req: Request, res: Response) {
  try {
    const { currentItemIds, limit, hour, dietaryPreference } = req.query;

    const parsedIds = currentItemIds
      ? (typeof currentItemIds === 'string' ? currentItemIds.split(',') : (currentItemIds as string[]))
      : [];

    const numLimit = limit ? parseInt(limit as string, 10) : 4;
    const targetHour = hour ? parseInt(hour as string, 10) : undefined;
    const dietPref = dietaryPreference ? (dietaryPreference as string) : undefined;

    const result = AssociationRecommender.getRecommendations({
      currentItemIds: parsedIds,
      limit: numLimit,
      targetHour,
      dietaryPreference: dietPref
    });

    return res.json({
      success: true,
      data: result.recommendations,
      meta: result.meta
    });
  } catch (err: any) {
    console.error('Error generating ML food recommendations:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations.',
      error: err.message
    });
  }
}

import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { Feedback } from '../../src/types/index.ts';

const feedbackSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5 stars'),
  comment: z.string().min(3, 'Please leave at least a short comment').max(500)
});

export async function submitFeedback(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validated = feedbackSchema.parse(req.body);

    const order = db.getOrderById(validated.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Check if feedback already submitted for this order
    const existing = db.getFeedbacks().find(f => f.orderId === validated.orderId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this order.'
      });
    }

    const newFeedback: Feedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: validated.orderId,
      userId: req.user.id,
      studentName: req.user.name,
      rating: validated.rating,
      comment: validated.comment,
      createdAt: new Date().toISOString()
    };

    db.addFeedback(newFeedback);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your rating and feedback!',
      data: newFeedback
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Validation failed',
        errors: error.issues
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.'
    });
  }
}

export async function getFeedbacks(req: AuthRequest, res: Response) {
  const feedbacks = db.getFeedbacks().slice().reverse();
  const total = feedbacks.length;
  const avg = total > 0 ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / total : 4.8;

  return res.json({
    success: true,
    data: {
      averageRating: Number(avg.toFixed(1)),
      totalCount: total,
      feedbacks
    }
  });
}

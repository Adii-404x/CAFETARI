import { Router } from 'express';
import {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  toggleAvailability,
  deleteFoodItem
} from '../controllers/foodController';
import { getFoodRecommendations } from '../controllers/recommendationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getFoodItems);
router.get('/recommendations', getFoodRecommendations);
router.get('/:id', getFoodItemById);

// Protected Admin/Staff Routes
router.post('/', authenticate, authorize('admin'), createFoodItem);
router.patch('/:id', authenticate, authorize('admin'), updateFoodItem);
router.patch('/:id/toggle-stock', authenticate, authorize('staff', 'admin'), toggleAvailability);
router.delete('/:id', authenticate, authorize('admin'), deleteFoodItem);

export default router;

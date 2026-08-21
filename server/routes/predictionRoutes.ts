import { Router } from 'express';
import { getPredictions, generateNewPredictions } from '../controllers/predictionController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

// Admin-only AI predictions
router.get('/', authenticate, authorize('admin'), getPredictions);
router.post('/generate', authenticate, authorize('admin'), generateNewPredictions);

export default router;

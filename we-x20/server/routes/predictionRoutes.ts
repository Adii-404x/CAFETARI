import { Router } from 'express';
import { getPredictions, generateNewPredictions } from '../controllers/predictionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin-only AI predictions
router.get('/', authenticate, authorize('admin'), getPredictions);
router.post('/generate', authenticate, authorize('admin'), generateNewPredictions);

export default router;

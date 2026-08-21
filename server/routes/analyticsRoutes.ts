import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin', 'staff'), getDashboardAnalytics);

export default router;

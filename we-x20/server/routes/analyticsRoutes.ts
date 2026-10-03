import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin', 'staff'), getDashboardAnalytics);

export default router;

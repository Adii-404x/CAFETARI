import { Router } from 'express';
import { submitFeedback, getFeedbacks } from '../controllers/feedbackController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/', authenticate, submitFeedback);
router.get('/', getFeedbacks);

export default router;

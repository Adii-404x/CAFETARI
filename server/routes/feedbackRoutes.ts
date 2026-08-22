import { Router } from 'express';
import { submitFeedback, getFeedbacks } from '../controllers/feedbackController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, submitFeedback);
router.get('/', getFeedbacks);

export default router;

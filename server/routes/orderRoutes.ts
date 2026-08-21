import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getQueueStatus
} from '../controllers/orderController.ts';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.ts';

const router = Router();

// Student & Public Routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/queue-status', optionalAuthenticate, getQueueStatus);
router.get('/:id', authenticate, getOrderById);

// Staff & Admin Routes
router.get('/', authenticate, authorize('staff', 'admin'), getAllOrders);
router.patch('/:id/status', authenticate, authorize('staff', 'admin'), updateOrderStatus);

export default router;

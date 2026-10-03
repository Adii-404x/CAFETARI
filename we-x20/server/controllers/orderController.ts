import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { Order, OrderStatus, PaymentMethod, QueueStatus } from '../../src/types/index';
import { emitOrderCreated, emitOrderStatusUpdated, emitQueueUpdated } from '../socket';

function calculateCurrentQueueStatus(userId?: string): QueueStatus {
  const allOrders = db.getOrders();
  const activeOrders = allOrders.filter(o => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = allOrders.filter(o => o.status === 'READY');

  let servingToken = readyOrders.length > 0 ? readyOrders[0].tokenNumber : 101;
  if (readyOrders.length === 0 && activeOrders.length > 0) {
    servingToken = activeOrders[0].tokenNumber;
  }

  let ordersAheadOfUser: number | undefined = undefined;
  let userTokenNumber: number | undefined = undefined;

  if (userId) {
    const userActiveOrder = activeOrders.find(o => o.userId === userId);
    if (userActiveOrder) {
      userTokenNumber = userActiveOrder.tokenNumber;
      ordersAheadOfUser = activeOrders.filter(o => o.tokenNumber < userActiveOrder.tokenNumber).length;
    }
  }

  const estimatedWaitMinutes = Math.max(3, activeOrders.length * 3);
  let rushLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK' = 'LOW';
  if (activeOrders.length > 15) rushLevel = 'PEAK';
  else if (activeOrders.length > 8) rushLevel = 'HIGH';
  else if (activeOrders.length > 3) rushLevel = 'MODERATE';

  return {
    currentlyServingToken: servingToken,
    totalActiveOrders: activeOrders.length,
    ordersAheadOfUser,
    userTokenNumber,
    estimatedWaitMinutes,
    rushLevel
  };
}

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      foodItemId: z.string().min(1),
      quantity: z.number().int().positive('Quantity must be at least 1')
    })
  ).min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['PAY_AT_COUNTER', 'CAMPUS_CARD', 'UPI_QR']).default('PAY_AT_COUNTER'),
  notes: z.string().max(200).optional()
});

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validated = createOrderSchema.parse(req.body);
    const foodItems = db.getFoodItems();

    let totalAmount = 0;
    let maxPrepTime = 5;
    const orderItems: any[] = [];

    for (const itemReq of validated.items) {
      const food = foodItems.find(f => f.id === itemReq.foodItemId);
      if (!food) {
        return res.status(400).json({
          success: false,
          message: `Food item with ID ${itemReq.foodItemId} not found.`
        });
      }

      if (!food.available) {
        return res.status(400).json({
          success: false,
          message: `Sorry, "${food.name}" is currently out of stock.`
        });
      }

      orderItems.push({
        foodItemId: food.id,
        name: food.name,
        price: food.price,
        quantity: itemReq.quantity,
        image: food.image
      });

      totalAmount += food.price * itemReq.quantity;
      if (food.preparationTime > maxPrepTime) {
        maxPrepTime = food.preparationTime;
      }
    }

    // Dynamic queue estimation based on active pending orders
    const activeOrders = db.getOrders().filter(o => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status));
    const estimatedPrepTime = Math.max(8, maxPrepTime + Math.min(30, activeOrders.length * 2));

    const tokenNumber = db.getNextTokenNumber();
    const orderNumber = `ORD-${tokenNumber}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      tokenNumber,
      userId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      items: orderItems,
      totalAmount,
      status: 'PLACED',
      paymentMethod: validated.paymentMethod as PaymentMethod,
      paymentStatus: validated.paymentMethod === 'PAY_AT_COUNTER' ? 'PENDING' : 'PAID',
      estimatedPreparationTime: estimatedPrepTime,
      notes: validated.notes,
      placedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createOrder(newOrder);

    // Deduct student's wallet balance when paying via Campus Card
    if (validated.paymentMethod === 'CAMPUS_CARD') {
      const userRecord = db.getUserById(req.user.id);
      const currentBal = userRecord?.walletBalance ?? 500;
      const newBal = Math.max(0, currentBal - totalAmount);
      db.updateUser(req.user.id, { walletBalance: newBal });
    }

    const queueStatus = calculateCurrentQueueStatus(req.user.id);
    emitOrderCreated(newOrder, queueStatus);

    return res.status(201).json({
      success: true,
      message: `Order #${orderNumber} placed successfully! Token: #${tokenNumber}`,
      data: newOrder
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
      message: 'Failed to place order. Please try again.'
    });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const orders = db.getOrdersByUser(req.user.id);

  return res.json({
    success: true,
    count: orders.length,
    data: orders
  });
}

export async function getOrderById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const order = db.getOrderById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  // Authorization check: students can only access their own order
  if (req.user?.role === 'student' && order.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to view this order.'
    });
  }

  return res.json({
    success: true,
    data: order
  });
}

export async function getAllOrders(req: AuthRequest, res: Response) {
  const { status, search, limit } = req.query;
  let orders = db.getOrders().slice().sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  if (status && status !== 'ALL') {
    orders = orders.filter(o => o.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    orders = orders.filter(
      o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.tokenNumber.toString().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.studentEmail.toLowerCase().includes(q)
    );
  }

  if (limit) {
    orders = orders.slice(0, parseInt(limit as string, 10));
  }

  return res.json({
    success: true,
    count: orders.length,
    data: orders
  });
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const existingOrder = db.getOrderById(id);
  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  const previousStatus = existingOrder.status;
  const updated = db.updateOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  const queueStatus = calculateCurrentQueueStatus(updated.userId);
  emitOrderStatusUpdated(updated, previousStatus, queueStatus);

  return res.json({
    success: true,
    message: `Order #${updated.orderNumber} updated to ${status}.`,
    data: updated
  });
}

export async function getQueueStatus(req: AuthRequest, res: Response) {
  const allOrders = db.getOrders();
  const activeOrders = allOrders.filter(o => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = allOrders.filter(o => o.status === 'READY');

  // Find currently serving token: highest ready token or earliest preparing token
  let servingToken = readyOrders.length > 0 ? readyOrders[0].tokenNumber : 101;
  if (readyOrders.length === 0 && activeOrders.length > 0) {
    servingToken = activeOrders[0].tokenNumber;
  }

  let ordersAheadOfUser: number | undefined = undefined;
  let userTokenNumber: number | undefined = undefined;

  if (req.user) {
    const userActiveOrder = activeOrders.find(o => o.userId === req.user?.id);
    if (userActiveOrder) {
      userTokenNumber = userActiveOrder.tokenNumber;
      ordersAheadOfUser = activeOrders.filter(o => o.tokenNumber < userActiveOrder.tokenNumber).length;
    }
  }

  const estimatedWaitMinutes = Math.max(3, activeOrders.length * 3);
  let rushLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK' = 'LOW';
  if (activeOrders.length > 15) rushLevel = 'PEAK';
  else if (activeOrders.length > 8) rushLevel = 'HIGH';
  else if (activeOrders.length > 3) rushLevel = 'MODERATE';

  return res.json({
    success: true,
    data: {
      currentlyServingToken: servingToken,
      totalActiveOrders: activeOrders.length,
      ordersAheadOfUser,
      userTokenNumber,
      estimatedWaitMinutes,
      rushLevel
    }
  });
}

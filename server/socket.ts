import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Order, OrderStatus, FoodItem, QueueStatus } from '../src/types/index';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user:${userId}`);
      }
    });

    // Join role room (e.g. staff, admin)
    socket.on('join:role', (role: string) => {
      if (role) {
        socket.join(`role:${role}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined role:${role}`);
      }
    });

    // Join specific order room
    socket.on('join:order', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitOrderCreated(order: Order, queueStatus?: QueueStatus) {
  if (!io) return;
  const payload = { order, queueStatus, timestamp: new Date().toISOString() };
  io.emit('order:created', payload);
  if (order.userId) {
    io.to(`user:${order.userId}`).emit('order:created', payload);
  }
}

export function emitOrderStatusUpdated(order: Order, previousStatus?: OrderStatus, queueStatus?: QueueStatus) {
  if (!io) return;
  console.log(`📢 [Socket.IO] Broadcast: Order #${order.orderNumber} (Token #${order.tokenNumber}) status -> ${order.status}`);
  const payload = {
    order,
    previousStatus,
    queueStatus,
    timestamp: new Date().toISOString()
  };
  
  // Global broadcast to all connected clients (KDS, Admin, Ticker)
  io.emit('order:status_updated', payload);

  // Student specific room
  if (order.userId) {
    io.to(`user:${order.userId}`).emit('order:status_updated', payload);
  }

  // Order specific room
  io.to(`order:${order.id}`).emit('order:status_updated', payload);
}

export function emitQueueUpdated(queueStatus: QueueStatus) {
  if (!io) return;
  io.emit('queue:updated', { queueStatus, timestamp: new Date().toISOString() });
}

export function emitFoodStockUpdated(foodItem: FoodItem) {
  if (!io) return;
  io.emit('food:stock_updated', { foodItem, timestamp: new Date().toISOString() });
}

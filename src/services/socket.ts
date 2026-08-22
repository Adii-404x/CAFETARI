import { io, Socket } from 'socket.io-client';
import { Order, OrderStatus, FoodItem, QueueStatus } from '../types/index';

export type SocketConnectionState = 'connected' | 'connecting' | 'disconnected' | 'fallback_polling';

type OrderStatusCallback = (payload: { order: Order; previousStatus?: OrderStatus; queueStatus?: QueueStatus; timestamp: string }) => void;
type OrderCreatedCallback = (payload: { order: Order; queueStatus?: QueueStatus; timestamp: string }) => void;
type QueueUpdatedCallback = (payload: { queueStatus: QueueStatus; timestamp: string }) => void;
type FoodStockCallback = (payload: { foodItem: FoodItem; timestamp: string }) => void;
type ConnectionCallback = (status: SocketConnectionState) => void;

class SocketService {
  private socket: Socket | null = null;
  private connectionState: SocketConnectionState = 'disconnected';
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private statusUpdateListeners: Set<OrderStatusCallback> = new Set();
  private orderCreatedListeners: Set<OrderCreatedCallback> = new Set();
  private queueUpdatedListeners: Set<QueueUpdatedCallback> = new Set();
  private foodStockListeners: Set<FoodStockCallback> = new Set();
  private currentUserId: string | null = null;
  private currentRole: string | null = null;
  private activeOrderId: string | null = null;

  public init(userId?: string, role?: string) {
    this.currentUserId = userId || null;
    this.currentRole = role || null;

    // If socket is already established, simply update joined rooms
    if (this.socket) {
      if (this.socket.connected) {
        if (this.currentUserId) this.socket.emit('join:user', this.currentUserId);
        if (this.currentRole) this.socket.emit('join:role', this.currentRole);
      }
      return;
    }

    this.setConnectionState('connecting');

    try {
      // Connect starting with HTTP long-polling and seamlessly upgrade to websocket
      this.socket = io({
        path: '/socket.io',
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        this.setConnectionState('connected');

        if (this.currentUserId) {
          this.socket?.emit('join:user', this.currentUserId);
        }
        if (this.currentRole) {
          this.socket?.emit('join:role', this.currentRole);
        }
        if (this.activeOrderId) {
          this.socket?.emit('join:order', this.activeOrderId);
        }
      });

      this.socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          this.socket?.connect();
        }
        this.setConnectionState('fallback_polling');
      });

      this.socket.on('connect_error', () => {
        this.setConnectionState('fallback_polling');
      });

      this.socket.on('order:status_updated', (payload) => {
        this.statusUpdateListeners.forEach(cb => {
          try {
            cb(payload);
          } catch (e) {
            console.error('Error in statusUpdate listener:', e);
          }
        });
      });

      this.socket.on('order:created', (payload) => {
        this.orderCreatedListeners.forEach(cb => {
          try {
            cb(payload);
          } catch (e) {
            console.error('Error in orderCreated listener:', e);
          }
        });
      });

      this.socket.on('queue:updated', (payload) => {
        this.queueUpdatedListeners.forEach(cb => {
          try {
            cb(payload);
          } catch (e) {
            console.error('Error in queueUpdated listener:', e);
          }
        });
      });

      this.socket.on('food:stock_updated', (payload) => {
        this.foodStockListeners.forEach(cb => {
          try {
            cb(payload);
          } catch (e) {
            console.error('Error in foodStock listener:', e);
          }
        });
      });
    } catch (err) {
      console.warn('Socket initialization fallback to polling:', err);
      this.setConnectionState('fallback_polling');
    }
  }

  public trackOrder(orderId: string) {
    this.activeOrderId = orderId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:order', orderId);
    }
  }

  public getConnectionState(): SocketConnectionState {
    return this.connectionState;
  }

  private setConnectionState(state: SocketConnectionState) {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionListeners.forEach(cb => cb(state));
    }
  }

  public onConnectionStateChange(cb: ConnectionCallback): () => void {
    this.connectionListeners.add(cb);
    cb(this.connectionState);
    return () => this.connectionListeners.delete(cb);
  }

  public onOrderStatusUpdated(cb: OrderStatusCallback): () => void {
    this.statusUpdateListeners.add(cb);
    return () => this.statusUpdateListeners.delete(cb);
  }

  public onOrderCreated(cb: OrderCreatedCallback): () => void {
    this.orderCreatedListeners.add(cb);
    return () => this.orderCreatedListeners.delete(cb);
  }

  public onQueueUpdated(cb: QueueUpdatedCallback): () => void {
    this.queueUpdatedListeners.add(cb);
    return () => this.queueUpdatedListeners.delete(cb);
  }

  public onFoodStockUpdated(cb: FoodStockCallback): () => void {
    this.foodStockListeners.add(cb);
    return () => this.foodStockListeners.delete(cb);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionState('disconnected');
    }
  }
}

export const socketService = new SocketService();

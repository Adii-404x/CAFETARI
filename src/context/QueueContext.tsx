import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { QueueStatus, Order, OrderStatus } from '../types/index';
import { orderApi } from '../services/api';
import { useAuth } from './AuthContext';
import { socketService, SocketConnectionState } from '../services/socket';

interface LiveStatusNotification {
  id: string;
  orderNumber: string;
  tokenNumber: number;
  newStatus: OrderStatus;
  message: string;
  timestamp: string;
}

interface QueueContextType {
  queueStatus: QueueStatus | null;
  activeOrder: Order | null;
  refreshQueue: () => Promise<void>;
  isPolling: boolean;
  connectionState: SocketConnectionState;
  liveNotification: LiveStatusNotification | null;
  clearNotification: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Web Audio chime helper for order status transitions
function playNotificationChime(isReady = false) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isReady ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isReady ? 587.33 : 440, ctx.currentTime); // D5 or A4
    if (isReady) {
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5 chime
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio context may be restricted by autoplay policy until user interaction
  }
}

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>({
    currentlyServingToken: 118,
    totalActiveOrders: 4,
    estimatedWaitMinutes: 10,
    rushLevel: 'MODERATE'
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [connectionState, setConnectionState] = useState<SocketConnectionState>('connecting');
  const [liveNotification, setLiveNotification] = useState<LiveStatusNotification | null>(null);

  const fetchQueueAndOrders = useCallback(async () => {
    try {
      const qRes = await orderApi.getQueueStatus();
      if (qRes.success && qRes.data) {
        setQueueStatus(qRes.data);
      }

      if (user && user.role === 'student') {
        const oRes = await orderApi.getMyOrders();
        if (oRes.success && oRes.data) {
          const ongoing = oRes.data.find(o => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
          setActiveOrder(ongoing || null);
        }
      } else {
        setActiveOrder(null);
      }
    } catch (e) {
      console.warn('Queue data sync error:', e);
    }
  }, [user]);

  // Initialize Socket.IO connection
  useEffect(() => {
    socketService.init(user?.id, user?.role);

    const unsubscribeConn = socketService.onConnectionStateChange(state => {
      setConnectionState(state);
    });

    const unsubscribeStatus = socketService.onOrderStatusUpdated(({ order, previousStatus, queueStatus: newQ }) => {
      if (newQ) {
        setQueueStatus(newQ);
      }

      // Check if this status change pertains to this user or current active order
      const isMyOrder = user && (order.userId === user.id || (activeOrder && activeOrder.id === order.id));
      
      if (isMyOrder) {
        if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
          setActiveOrder(null);
        } else {
          setActiveOrder(order);
        }

        // Notification triggers
        let msg = `Order #${order.orderNumber} (Token #${order.tokenNumber}) is now ${order.status}`;
        if (order.status === 'READY') {
          msg = `🎉 Token #${order.tokenNumber} is READY for pickup at Floor 4th Counter!`;
          playNotificationChime(true);
        } else if (order.status === 'PREPARING') {
          msg = `🍳 Kitchen is now preparing Token #${order.tokenNumber}!`;
          playNotificationChime(false);
        } else if (order.status === 'COMPLETED') {
          msg = `✅ Order #${order.orderNumber} completed. Enjoy your meal!`;
        }

        setLiveNotification({
          id: `notif_${Date.now()}`,
          orderNumber: order.orderNumber,
          tokenNumber: order.tokenNumber,
          newStatus: order.status,
          message: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    const unsubscribeCreated = socketService.onOrderCreated(({ order, queueStatus: newQ }) => {
      if (newQ) {
        setQueueStatus(newQ);
      }
      if (user && order.userId === user.id) {
        setActiveOrder(order);
      }
    });

    const unsubscribeQueue = socketService.onQueueUpdated(({ queueStatus: newQ }) => {
      setQueueStatus(newQ);
    });

    return () => {
      unsubscribeConn();
      unsubscribeStatus();
      unsubscribeCreated();
      unsubscribeQueue();
    };
  }, [user, activeOrder]);

  // Initial fetch and Fallback Polling Loop
  useEffect(() => {
    fetchQueueAndOrders();

    // Fast polling (4s) if disconnected or in fallback; gentle heartbeat (15s) if connected via websocket
    const pollIntervalMs = connectionState === 'connected' ? 15000 : 4000;
    const interval = setInterval(fetchQueueAndOrders, pollIntervalMs);

    return () => clearInterval(interval);
  }, [fetchQueueAndOrders, connectionState]);

  return (
    <QueueContext.Provider
      value={{
        queueStatus,
        activeOrder,
        refreshQueue: fetchQueueAndOrders,
        isPolling: connectionState !== 'connected',
        connectionState,
        liveNotification,
        clearNotification: () => setLiveNotification(null)
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};


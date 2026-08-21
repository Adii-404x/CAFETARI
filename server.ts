import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './server/routes/authRoutes.ts';
import foodRoutes from './server/routes/foodRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import feedbackRoutes from './server/routes/feedbackRoutes.ts';
import analyticsRoutes from './server/routes/analyticsRoutes.ts';
import predictionRoutes from './server/routes/predictionRoutes.ts';
import { initSocketIO } from './server/socket.ts';
import { connectMongoDB, getMongoStatus } from './server/mongodb.ts';
import { db } from './server/db.ts';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 3000;

  // Initialize Socket.IO on HTTP Server
  initSocketIO(httpServer);

  // Connect to MongoDB Atlas (SRV link supported)
  connectMongoDB().then(connected => {
    if (connected) {
      db.syncWithMongo();
    }
  }).catch(err => {
    console.warn('MongoDB connection process encountered a non-fatal error:', err);
  });

  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger in dev
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // API Health Check & Database Status
  app.get('/api/health', (req, res) => {
    const mongoStatus = getMongoStatus();
    res.json({
      status: 'ok',
      service: 'CafeteriaAI Backend REST API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        provider: mongoStatus.isConnected ? 'MongoDB Atlas (SRV)' : 'Persistent Document Storage (Local fallback)',
        status: mongoStatus.state,
        connected: mongoStatus.isConnected,
        databaseName: mongoStatus.databaseName || 'cafeteria_ai',
        uriMasked: mongoStatus.maskedUri || null,
        usersCount: db.getUsers().length,
        foodItemsCount: db.getFoodItems().length,
        ordersCount: db.getOrders().length
      }
    });
  });

  // Database Connection Inspector endpoint
  app.get('/api/database-status', (req, res) => {
    const mongoStatus = getMongoStatus();
    const dbDiagnostics = db.getDatabaseStatus();
    res.json({
      success: true,
      ...dbDiagnostics,
      mongo: mongoStatus,
      collections: {
        users: db.getUsers().length,
        foodItems: db.getFoodItems().length,
        orders: db.getOrders().length,
        feedbacks: db.getFeedbacks().length
      },
      instructions: mongoStatus.isConnected
        ? 'MongoDB Atlas cluster connected and live-synced.'
        : 'Set MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority in environment secrets to connect to your live MongoDB Atlas cluster.'
    });
  });

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/food-items', foodRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/predictions', predictionRoutes);

  // 404 handler for unmatched API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found.`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CafeteriaAI Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 API endpoints mounted at http://0.0.0.0:${PORT}/api/`);
    console.log(`⚡ Real-Time Socket.IO server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

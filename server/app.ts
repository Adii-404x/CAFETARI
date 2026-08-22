import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import API Routes
import authRoutes from './routes/authRoutes';
import foodRoutes from './routes/foodRoutes';
import orderRoutes from './routes/orderRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import predictionRoutes from './routes/predictionRoutes';
import { getMongoStatus } from './mongodb';
import { db } from './db';

/**
 * Creates and configures the Express Application for API routing.
 * Completely decoupled from static client serving, HTTP listening, and WebSockets.
 * Compatible with serverless runtimes (e.g., Vercel / AWS Lambda) and standalone Express servers.
 */
export function createApiApp(): Express {
  const app = express();

  // CORS Middleware: Configured for credentialed cross-origin and same-origin requests
  app.use(cors({
    origin: (origin, callback) => {
      // Allow browser requests, same-origin, serverless proxies, and CLI calls
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/food-items') || req.path.startsWith('/auth')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Dedicated API Router
  const apiRouter = express.Router();

  // API Health Check & Database Status
  apiRouter.get('/health', (req, res) => {
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
  apiRouter.get('/database-status', (req, res) => {
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

  // Mount Feature Routers on apiRouter
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/food-items', foodRoutes);
  apiRouter.use('/orders', orderRoutes);
  apiRouter.use('/feedback', feedbackRoutes);
  apiRouter.use('/analytics', analyticsRoutes);
  apiRouter.use('/predictions', predictionRoutes);

  // Mount on both '/api' and '/' to ensure full serverless rewrite compatibility
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // 404 handler for unmatched API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found.`
    });
  });

  return app;
}

export const app = createApiApp();
export default app;

import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], required: true },
  studentId: { type: String },
  department: { type: String },
  phone: { type: String },
  avatar: { type: String },
  walletBalance: { type: Number, default: 500 },
  preferences: {
    dietaryPreference: { type: String, default: 'all' },
    notificationsEnabled: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
    soundAlerts: { type: Boolean, default: true },
    defaultPaymentMethod: { type: String, default: 'CAMPUS_CARD' },
    hostelOrBlock: { type: String, default: 'Block B - Room 304' }
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { collection: 'users' });

// FoodItem Schema
const FoodItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number, required: true },
  calories: { type: Number },
  isVegetarian: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { collection: 'food_items' });

// Order Schema
const OrderItemSchema = new mongoose.Schema({
  foodItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  orderNumber: { type: String, required: true, unique: true },
  tokenNumber: { type: Number, required: true, index: true },
  userId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'PLACED',
    index: true
  },
  paymentMethod: { type: String, default: 'CAMPUS_CARD' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PAID' },
  estimatedPreparationTime: { type: Number, required: true },
  notes: { type: String },
  placedAt: { type: String, required: true },
  acceptedAt: { type: String },
  readyAt: { type: String },
  completedAt: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { collection: 'orders' });

// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  studentName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { collection: 'feedbacks' });

// SystemConfig Schema
const SystemConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'main_config', unique: true },
  cafeteriaName: { type: String, default: 'INDIYA Cafeteria (Floor 4th)' },
  operatingHours: { type: String, default: '08:00 AM - 09:00 PM' },
  rushHourMultiplier: { type: Number, default: 1.2 },
  tokenCounter: { type: Number, default: 120 },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { collection: 'system_config' });

// Export Models
export const MongoUserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const MongoFoodItemModel = mongoose.models.FoodItem || mongoose.model('FoodItem', FoodItemSchema);
export const MongoOrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const MongoFeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export const MongoSystemConfigModel = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

export interface MongoConnectionStatus {
  isConnected: boolean;
  state: 'connected' | 'connecting' | 'disconnected' | 'local_fallback';
  uriConfigured: boolean;
  maskedUri?: string;
  databaseName?: string;
  error?: string;
}

let mongoStatus: MongoConnectionStatus = {
  isConnected: false,
  state: 'local_fallback',
  uriConfigured: false
};

export function getMongoStatus(): MongoConnectionStatus {
  const readyState = mongoose.connection.readyState;
  let stateStr: MongoConnectionStatus['state'] = 'disconnected';

  if (readyState === 1) stateStr = 'connected';
  else if (readyState === 2) stateStr = 'connecting';
  else if (!process.env.MONGODB_URI) stateStr = 'local_fallback';

  return {
    ...mongoStatus,
    isConnected: readyState === 1,
    state: stateStr
  };
}

function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1$3:****@');
  } catch {
    return 'mongodb+srv://****:****@cluster...';
  }
}

/**
 * Initializes MongoDB connection if MONGODB_URI is provided.
 * Handles SRV links, replicas, connection pooling, and auto-reconnect.
 */
export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.log('ℹ️  No MONGODB_URI specified. Operating with persistent local document storage.');
    mongoStatus = {
      isConnected: false,
      state: 'local_fallback',
      uriConfigured: false
    };
    return false;
  }

  mongoStatus = {
    isConnected: false,
    state: 'connecting',
    uriConfigured: true,
    maskedUri: maskMongoUri(uri)
  };

  try {
    console.log(`Connecting to MongoDB at: ${maskMongoUri(uri)} ...`);

    // Standard Mongoose connection for MongoDB Atlas & SRV links
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      autoIndex: true,
    });

    const dbName = mongoose.connection.db?.databaseName || 'cafeteria_ai';
    console.log(`MongoDB Connected successfully to database: [${dbName}]`);

    mongoStatus = {
      isConnected: true,
      state: 'connected',
      uriConfigured: true,
      maskedUri: maskMongoUri(uri),
      databaseName: dbName
    };

    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB Connection Error:', err);
      mongoStatus.error = err.message;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected. Reconnecting in background...');
      mongoStatus.isConnected = false;
      mongoStatus.state = 'disconnected';
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB Reconnected.');
      mongoStatus.isConnected = true;
      mongoStatus.state = 'connected';
    });

    return true;
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to MongoDB cluster (${err.message}). Seamlessly using embedded storage fallback.`);
    mongoStatus = {
      isConnected: false,
      state: 'local_fallback',
      uriConfigured: true,
      maskedUri: maskMongoUri(uri),
      error: err.message
    };
    return false;
  }
}

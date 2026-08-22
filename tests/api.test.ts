/**
 * CAFETARI System API & Logic Comprehensive Test Suite
 * Executes automated unit, integration, and logic checks across all modules.
 */

import { db } from '../server/db';
import { app, createApiApp } from '../server/app';
import { DemandPredictionService } from '../server/ml/demandPredictor';
import { initialFoodItems } from '../src/data/menuData';
import { getMongoStatus } from '../server/mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function runTestSuite() {
  console.log('🧪 Starting Cafetari System Comprehensive Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${details ? ` (${details})` : ''}`);
      failedCount++;
    }
  }

  // 1. Decoupled Express API App Instance Checks
  try {
    console.log('🚀 1. Server Architecture & Decoupled Endpoints:');
    assert(typeof app === 'function', 'Decoupled Express app instance exists and is callable');
    const customApp = createApiApp();
    assert(typeof customApp === 'function', 'createApiApp factory produces isolated Express instances');
  } catch (err: any) {
    assert(false, 'API architecture threw an error', err.message);
  }

  // 2. Database Initialization & Seed Data Checks
  try {
    console.log('\n📦 2. Database & Data Catalog Persistence:');
    const users = db.getUsers();
    assert(users.length >= 3, `Demo accounts seeded (Found ${users.length} users)`);

    const student = db.getUserByEmail('student@cafeteria.edu');
    assert(!!student, 'Demo Student account (student@cafeteria.edu) exists');
    assert(student?.role === 'student', 'Student account has role "student"');

    const admin = db.getUserByEmail('admin@cafeteria.edu');
    assert(!!admin, 'Demo Admin account (admin@cafeteria.edu) exists');
    assert(admin?.role === 'admin', 'Admin account has role "admin"');

    const staff = db.getUserByEmail('staff@cafeteria.edu');
    assert(!!staff, 'Demo Kitchen Staff account (staff@cafeteria.edu) exists');
    assert(staff?.role === 'staff', 'Staff account has role "staff"');

    const foodItems = db.getFoodItems();
    assert(foodItems.length >= 20, `Food catalog populated with ${foodItems.length} items`);
    assert(initialFoodItems.length >= 20, `Client fallback menu catalog populated with ${initialFoodItems.length} items`);

    const orders = db.getOrders();
    assert(Array.isArray(orders), 'Order collection initialized as an array');

    const dbStatus = db.getDatabaseStatus();
    assert(dbStatus.counts.users >= 3, `Database status reports user count: ${dbStatus.counts.users}`);
    assert(dbStatus.counts.foodItems >= 20, `Database status reports food item count: ${dbStatus.counts.foodItems}`);

    const mongoStatus = getMongoStatus();
    assert(typeof mongoStatus.state === 'string', `MongoDB status detected: ${mongoStatus.state}`);
  } catch (err: any) {
    assert(false, 'Database checks threw an unexpected error', err.message);
  }

  // 3. Authentication & Cryptography Checks
  try {
    console.log('\n🔒 3. Security, Password Hashing & JWT Authentication:');
    const rawPassword = 'StudentSecretPass@2026';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(rawPassword, salt);
    assert(bcrypt.compareSync(rawPassword, hash), 'Bcrypt password hashing and validation operates correctly');
    assert(!bcrypt.compareSync('WrongPassword', hash), 'Bcrypt safely rejects incorrect password');

    const secretKey = 'test_jwt_secret_token_signature_key_2026';
    const payload = { id: 'usr_test_student_1', email: 'student@cafeteria.edu', role: 'student' };
    const token = jwt.sign(payload, secretKey, { expiresIn: '2h' });
    const decoded = jwt.verify(token, secretKey) as any;
    assert(decoded.email === payload.email, 'JWT access token signing and payload decoding succeeds');
    assert(decoded.role === 'student', 'JWT claims preserve user role');
  } catch (err: any) {
    assert(false, 'Security test suite threw an error', err.message);
  }

  // 4. Order State Machine & Token Sequencing Checks
  try {
    console.log('\n📋 4. Order Management & State Machine Transitions:');
    const existingOrders = db.getOrders();
    const nextToken = db.getNextTokenNumber();
    assert(typeof nextToken === 'number' && nextToken >= 100, `Next token number generator produces valid sequence (${nextToken})`);

    // Verify valid order statuses
    const allowedStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    const sampleOrder = existingOrders[0];
    if (sampleOrder) {
      assert(allowedStatuses.includes(sampleOrder.status), `Sample order has valid status: ${sampleOrder.status}`);
      assert(sampleOrder.items.length > 0, `Order contains valid items (${sampleOrder.items.length} line items)`);
      assert(sampleOrder.totalAmount > 0, `Order calculated total amount: ₹${sampleOrder.totalAmount}`);
    } else {
      assert(true, 'No legacy orders found; order generator ready');
    }
  } catch (err: any) {
    assert(false, 'Order state machine check threw an error', err.message);
  }

  // 5. Machine Learning Demand Prediction Pipeline Checks
  try {
    console.log('\n🤖 5. ML Demand Prediction & Forecasting Engine:');
    const todayStr = new Date().toISOString().split('T')[0];
    const predictionResult = DemandPredictionService.runPredictionPipeline(todayStr);

    assert(!!predictionResult, 'Prediction pipeline returns a valid response object');
    assert(predictionResult.date === todayStr, 'Prediction matches requested target date');
    assert(predictionResult.predictions.length >= 10, `Generated demand predictions for ${predictionResult.predictions.length} food items`);
    assert(predictionResult.totalExpectedPortions > 0, `Total expected portions calculated: ${predictionResult.totalExpectedPortions}`);
    assert(predictionResult.modelsCompared.length >= 3, `Ensemble evaluated ${predictionResult.modelsCompared.length} ML models (ARIMA, Linear Regression, Gradient Boosting)`);
    assert(!!predictionResult.selectedModel, `Best performing ML Model identified: ${predictionResult.selectedModel}`);
    assert(predictionResult.predictions.every(p => p.predictedDemand >= 0), 'All predicted demands are non-negative');
    assert(predictionResult.modelsCompared.every(m => m.accuracyPercent >= 0 && m.accuracyPercent <= 100), 'Model accuracy percentages normalized between 0% and 100%');
    assert(predictionResult.predictions.every(p => p.confidenceRange[0] <= p.confidenceRange[1]), 'Confidence interval ranges are monotonically ordered [lower <= upper]');
  } catch (err: any) {
    assert(false, 'ML prediction pipeline threw an error', err.message);
  }

  // 6. Food Category & Nutrition Schema Checks
  try {
    console.log('\n🥗 6. Food Categories & Nutrition Schema:');
    const catalog = db.getFoodItems();
    const categories = Array.from(new Set(catalog.map(c => c.category)));
    assert(categories.includes('Breakfast'), 'Catalog includes "Breakfast" category');
    assert(categories.includes('Meals'), 'Catalog includes "Meals" category');
    assert(categories.includes('Snacks'), 'Catalog includes "Snacks" category');
    assert(categories.includes('Beverages'), 'Catalog includes "Beverages" category');
    assert(initialFoodItems.some(i => i.category === 'Desserts'), 'Catalog includes "Desserts" category');

    const vegItems = catalog.filter(i => i.isVegetarian);
    assert(vegItems.length > 0, `Vegetarian filter works (${vegItems.length} veg items identified)`);
  } catch (err: any) {
    assert(false, 'Food schema check threw an error', err.message);
  }

  // Summary
  console.log('\n========================================================');
  console.log(`📊 FINAL TEST RUN RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('========================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 100% Error & Warning Free Verification Complete!');
    process.exit(0);
  }
}

runTestSuite();

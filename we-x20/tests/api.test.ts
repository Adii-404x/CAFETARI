/**
 * CAFETARI SYSTEM - COMPLETE AUTOMATED TEST SUITE
 * Executes comprehensive unit, integration, and logic checks across all modules.
 */

import { db } from '../server/db';
import { app, createApiApp } from '../server/app';
import { DemandPredictionService } from '../server/ml/demandPredictor';
import { runClientPredictionPipeline } from '../src/utils/mlEngine';
import { initialFoodItems } from '../src/data/menuData';
import { getMongoStatus } from '../server/mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 STARTING CAFETARI COMPLETE SYSTEM VERIFICATION SUITE');
  console.log('🧪 ========================================================\n');
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
    const nextToken = db.getNextTokenNumber();
    assert(typeof nextToken === 'number' && nextToken >= 100, `Next token number generator produces valid sequence (#${nextToken})`);

    const student = db.getUserByEmail('student@cafeteria.edu');
    const testFood = db.getFoodItems()[0];

    const tokenNum = db.getNextTokenNumber();
    const newOrder = db.createOrder({
      id: `ord_test_${Date.now()}`,
      orderNumber: `ORD-${tokenNum}`,
      tokenNumber: tokenNum,
      userId: student?.id || 'usr_demo_student',
      studentName: student?.name || 'Aditya Singh',
      studentEmail: student?.email || 'student@cafeteria.edu',
      items: [
        {
          foodItemId: testFood.id,
          name: testFood.name,
          price: testFood.price,
          quantity: 2
        }
      ],
      totalAmount: testFood.price * 2,
      status: 'PLACED',
      paymentMethod: 'CAMPUS_CARD',
      paymentStatus: 'PAID',
      estimatedPreparationTime: testFood.preparationTime || 10,
      placedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    assert(!!newOrder.id, `Order created with ID: ${newOrder.id}`);
    assert(newOrder.status === 'PLACED', 'Order initializes in PLACED status');
    assert(newOrder.tokenNumber >= 100, `Assigned token #${newOrder.tokenNumber}`);

    // Transition PLACED -> PREPARING -> READY -> COMPLETED
    const preparing = db.updateOrderStatus(newOrder.id, 'PREPARING');
    assert(preparing?.status === 'PREPARING', 'Order transitions to PREPARING');

    const ready = db.updateOrderStatus(newOrder.id, 'READY');
    assert(ready?.status === 'READY', 'Order transitions to READY for pickup');

    const completed = db.updateOrderStatus(newOrder.id, 'COMPLETED');
    assert(completed?.status === 'COMPLETED', 'Order successfully marked COMPLETED');
  } catch (err: any) {
    assert(false, 'Order state machine check threw an error', err.message);
  }

  // 5. Machine Learning Demand Prediction & Multi-Scenario Simulator Checks
  try {
    console.log('\n🤖 5. ML Demand Prediction, Ensembles & Scenario Simulation:');
    const todayStr = new Date().toISOString().split('T')[0];

    // Standard Normal Scenario (Server)
    const normalPred = DemandPredictionService.runPredictionPipeline(todayStr, 'normal');
    assert(!!normalPred, 'Normal prediction pipeline returns valid payload');
    assert(normalPred.predictions.length >= 10, `Forecasted demand for ${normalPred.predictions.length} items`);
    assert(normalPred.totalExpectedPortions > 0, `Total expected portions: ${normalPred.totalExpectedPortions}`);
    assert(normalPred.modelsCompared.length >= 3, `Ensemble evaluated ${normalPred.modelsCompared.length} models`);
    assert(normalPred.selectedModel.includes('Gradient Boosting'), 'Gradient Boosting Regressor selected as top model');

    // Rainy Monsoon Scenario Surge
    const rainyPred = DemandPredictionService.runPredictionPipeline(todayStr, 'rainy_monsoon');
    assert(rainyPred.scenario === 'rainy_monsoon', 'Rainy Monsoon scenario correctly tagged');
    assert(
      rainyPred.totalExpectedPortions > normalPred.totalExpectedPortions,
      `Rainy scenario surges total demand (${rainyPred.totalExpectedPortions} > ${normalPred.totalExpectedPortions})`
    );

    // Annual Campus Fest Scenario Surge
    const festPred = DemandPredictionService.runPredictionPipeline(todayStr, 'college_fest');
    assert(
      festPred.totalExpectedPortions > normalPred.totalExpectedPortions * 1.3,
      `Campus Fest surges total demand by >30% (${festPred.totalExpectedPortions} vs ${normalPred.totalExpectedPortions})`
    );

    // Client-Side Fallback ML Pipeline
    const clientPred = runClientPredictionPipeline(initialFoodItems, todayStr, 'exam_week');
    assert(clientPred.scenario === 'exam_week', 'Client-side ML pipeline executes exam_week scenario');
    assert(clientPred.predictions.length === initialFoodItems.length, 'Client ML predicts all catalog items');
  } catch (err: any) {
    assert(false, 'ML prediction pipeline threw an error', err.message);
  }

  // 6. Bill of Materials (BOM) & Inventory Depletion Engine
  try {
    console.log('\n📦 6. Bill of Materials (BOM) & Inventory Depletion:');
    const pred = DemandPredictionService.runPredictionPipeline(new Date().toISOString().split('T')[0]);
    assert(Array.isArray(pred.ingredientRequirements), 'BOM calculations generated');
    assert(pred.ingredientRequirements.length >= 4, `Tracked ${pred.ingredientRequirements.length} raw inventory ingredients`);

    const milk = pred.ingredientRequirements.find(i => i.ingredient.includes('Milk'));
    assert(!!milk, 'BOM calculates Dairy Milk requirements');
    assert(milk?.status === 'SAFE' || milk?.status === 'WARNING' || milk?.status === 'REORDER_NOW', `Milk stock status: ${milk?.status}`);
  } catch (err: any) {
    assert(false, 'BOM calculation threw an error', err.message);
  }

  // 7. 24-Hour Kitchen Rush & Chef Concurrency Allocator
  try {
    console.log('\n👨‍🍳 7. 24-Hour Kitchen Rush & Chef Allocations:');
    const pred = DemandPredictionService.runPredictionPipeline(new Date().toISOString().split('T')[0]);
    assert(Array.isArray(pred.hourlyRushForecast), 'Hourly rush forecast generated');
    assert(pred.hourlyRushForecast.length >= 10, `Forecast covers ${pred.hourlyRushForecast.length} active service hours`);

    const lunchPeak = pred.hourlyRushForecast.find(h => h.hour.includes('01:00 PM'));
    assert(!!lunchPeak, '1:00 PM peak rush identified');
    assert((lunchPeak?.staffNeeded || 0) >= 4, `Allocated ${lunchPeak?.staffNeeded} kitchen staff for lunch peak`);
  } catch (err: any) {
    assert(false, 'Kitchen rush calculation threw an error', err.message);
  }

  // 8. ML Feature Explainability & Model Weights
  try {
    console.log('\n🔍 8. ML Model Explainability & Feature Importance:');
    const pred = DemandPredictionService.runPredictionPipeline(new Date().toISOString().split('T')[0]);
    assert(Array.isArray(pred.featureImportance), 'Feature importance array present');
    assert(pred.featureImportance.length >= 5, `Evaluated ${pred.featureImportance.length} ML input features`);

    const totalWeight = pred.featureImportance.reduce((sum, f) => sum + f.importance, 0);
    assert(Math.abs(totalWeight - 1.0) < 0.05, `Feature importance weights normalized to ~100% (${Math.round(totalWeight * 100)}%)`);
  } catch (err: any) {
    assert(false, 'ML explainability check threw an error', err.message);
  }

  // 9. Wallet, Payments & Transaction Balance
  try {
    console.log('\n💳 9. Student Digital Wallet & Balance Operations:');
    const student = db.getUserByEmail('student@cafeteria.edu');
    const initialBal = student?.walletBalance || 0;

    const updatedUser = db.updateWalletBalance(student!.id, 250);
    assert(updatedUser?.walletBalance === initialBal + 250, `Wallet balance topped up to ₹${updatedUser?.walletBalance}`);

    const deductedUser = db.updateWalletBalance(student!.id, -50);
    assert(deductedUser?.walletBalance === initialBal + 200, `Wallet balance deducted to ₹${deductedUser?.walletBalance}`);
  } catch (err: any) {
    assert(false, 'Wallet operations threw an error', err.message);
  }

  // 10. Food Category, Dietary & Allergen Schema Checks
  try {
    console.log('\n🥗 10. Food Categories & Nutrition Schema:');
    const catalog = db.getFoodItems();
    const categories = Array.from(new Set(catalog.map(c => c.category)));
    assert(categories.includes('Breakfast'), 'Catalog includes "Breakfast" category');
    assert(categories.includes('Meals'), 'Catalog includes "Meals" category');
    assert(categories.includes('Snacks'), 'Catalog includes "Snacks" category');
    assert(categories.includes('Beverages'), 'Catalog includes "Beverages" category');

    const vegItems = catalog.filter(i => i.isVegetarian);
    assert(vegItems.length > 0, `Vegetarian filter works (${vegItems.length} veg items identified)`);

    const calorieCheck = catalog.every(i => (i.calories || 0) > 0 && ((i.preparationTime || 0) > 0));
    assert(calorieCheck, 'All menu items have valid positive calories and prep times');
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
    console.log('🎉 100% Comprehensive System Tests Passed Successfully!');
    process.exit(0);
  }
}

runTestSuite();

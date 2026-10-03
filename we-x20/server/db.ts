import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, FoodItem, Order, Feedback } from '../src/types/index';
import {
  MongoUserModel,
  MongoFoodItemModel,
  MongoOrderModel,
  MongoFeedbackModel,
  MongoSystemConfigModel,
  getMongoStatus
} from './mongodb';

// Configure resilient storage location supporting serverless environments (e.g., Vercel /tmp)
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const DB_DIR = IS_SERVERLESS ? path.join('/tmp', 'cafeteria_data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'cafeteria_db.json');
const DB_TMP = path.join(DB_DIR, 'cafeteria_db.tmp.json');
const DB_BACKUP = path.join(DB_DIR, 'cafeteria_db.backup.json');

export type StoredUser = User & { passwordHash: string };

export interface DatabaseSchema {
  users: StoredUser[];
  foodItems: FoodItem[];
  orders: Order[];
  feedbacks: Feedback[];
  predictions: any[];
  systemConfig: {
    cafeteriaName: string;
    operatingHours: string;
    rushHourMultiplier: number;
    tokenCounter: number;
  };
}

// Initial Seed Data for INDIYA Cafeteria
const initialFoodItems: FoodItem[] = [
  // --- BURGERS ---
  {
    id: 'food_burger_1',
    name: 'Crispy Veg Aloo Tikki Burger',
    description: 'Crispy herb-spiced potato & green pea patty, crunchy iceberg lettuce, ripe tomatoes, and creamy tangy burger sauce in a toasted sesame bun.',
    category: 'Snacks',
    price: 60,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 8,
    calories: 380,
    isVegetarian: true,
    isPopular: true,
    tags: ['Burger', 'Crispy', 'Campus Favorite'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_burger_2',
    name: 'Cheese Burst Veggie Burger',
    description: 'Crispy veggie patty with molten cheese centre, sliced cheddar, caramelized onions, jalapeños and spicy herb mayo.',
    category: 'Snacks',
    price: 85,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 10,
    calories: 460,
    isVegetarian: true,
    isPopular: true,
    tags: ['Burger', 'Cheesy', 'Chef Special'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_burger_3',
    name: 'Spicy Paneer Tikka Burger',
    description: 'Char-grilled cottage cheese steak marinated in spicy tandoori masala, layered with mint mayo, red onions, and crunchy capsicum.',
    category: 'Snacks',
    price: 95,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 10,
    calories: 440,
    isVegetarian: true,
    isPopular: true,
    tags: ['Burger', 'Paneer', 'Protein Rich'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- SANDWICHES ---
  {
    id: 'food_sand_1',
    name: 'Bombay Masala Grilled Sandwich',
    description: 'Toasted jumbo sandwich layered with spiced potato masala, sliced cucumber, beetroot, onions, cheese, and spicy coriander mint chutney.',
    category: 'Breakfast',
    price: 65,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 7,
    calories: 340,
    isVegetarian: true,
    isPopular: true,
    tags: ['Sandwich', 'Grilled', 'Street Style'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_sand_2',
    name: 'Triple Layer Veg Club Sandwich',
    description: 'Triple-decker toasted bread filled with farm fresh lettuce, sliced tomatoes, cucumber, processed cheese, and thousand island dressing.',
    category: 'Breakfast',
    price: 75,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 8,
    calories: 390,
    isVegetarian: true,
    isPopular: true,
    tags: ['Sandwich', 'Club Sandwich', 'Filling'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_sand_3',
    name: 'Corn & Cheese Toast Sandwich',
    description: 'Golden grilled sandwich stuffed with juicy sweet American corn, creamy mozzarella cheese, green peppers, and Italian oregano seasoning.',
    category: 'Breakfast',
    price: 80,
    image: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 6,
    calories: 370,
    isVegetarian: true,
    isPopular: false,
    tags: ['Sandwich', 'Cheesy', 'Sweet Corn'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- THALIS ---
  {
    id: 'food_thali_1',
    name: 'INDIYA Special Deluxe Thali',
    description: 'Grand festive thali: 2 Butter Rotis, Steamed Basmati Rice, Shahi Paneer, Dal Makhani, Mixed Seasonal Sabzi, Boondi Raita, Roasted Papad, Salad, Pickle & Gulab Jamun.',
    category: 'Meals',
    price: 150,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 12,
    calories: 780,
    isVegetarian: true,
    isPopular: true,
    tags: ['Thali', 'Full Meal', 'Deluxe Feast', 'Chef Special'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_thali_2',
    name: 'Classic North Indian Veg Thali',
    description: 'Hearty everyday lunch: 2 Butter Phulkas, Steamed Rice, Paneer Butter Masala, Yellow Dal Tadka, Aloo Gobhi Dry, Fresh Curd & Mango Pickle.',
    category: 'Meals',
    price: 120,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 10,
    calories: 640,
    isVegetarian: true,
    isPopular: true,
    tags: ['Thali', 'North Indian', 'Lunch Favorite'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_thali_3',
    name: 'South Indian Meal Thali',
    description: 'Traditional southern platter: Steamed Sona Masoori Rice, Piping Hot Sambar, Pepper Rasam, Vegetable Poriyal, Curd Rice, Appalam & Lemon Pickle.',
    category: 'Meals',
    price: 110,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 8,
    calories: 590,
    isVegetarian: true,
    isPopular: true,
    tags: ['Thali', 'South Indian', 'Sambar Rice'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_thali_4',
    name: 'Student Budget Mini Thali',
    description: 'Quick balanced plate: 2 Fresh Rotis, Steamed Rice, Dhaba Dal Tadka, Daily Green Sabzi, and Spiced Onion Salad.',
    category: 'Meals',
    price: 85,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 6,
    calories: 510,
    isVegetarian: true,
    isPopular: true,
    tags: ['Thali', 'Budget Friendly', 'Quick Lunch'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- FRIES ---
  {
    id: 'food_fries_1',
    name: 'Peri-Peri Crispy French Fries',
    description: 'Golden crispy potato fingers tossed generously in zesty peri-peri seasoning spice mix, served with garlic mayo dip.',
    category: 'Snacks',
    price: 65,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 5,
    calories: 320,
    isVegetarian: true,
    isPopular: true,
    tags: ['Fries', 'Peri-Peri', 'Crispy Snack'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_fries_2',
    name: 'Classic Salted French Fries',
    description: 'Deep-fried golden crunchy potato fries sprinkled with fine sea salt, served with Heinz tomato ketchup.',
    category: 'Snacks',
    price: 50,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 5,
    calories: 290,
    isVegetarian: true,
    isPopular: false,
    tags: ['Fries', 'Classic', 'Finger Food'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_fries_3',
    name: 'Cheesy Jalapeño Loaded Fries',
    description: 'Hot crispy fries smothered in warm molten cheddar cheese sauce, topped with sliced pickled jalapeños and herb chili flakes.',
    category: 'Snacks',
    price: 85,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 7,
    calories: 420,
    isVegetarian: true,
    isPopular: true,
    tags: ['Fries', 'Loaded Cheese', 'Spicy'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- COLD COFFEE ---
  {
    id: 'food_coffee_1',
    name: 'Classic Iced Cold Coffee',
    description: 'Rich, chilled creamy blended espresso with fresh toned milk, sugar, and Hershey’s chocolate syrup drizzle in a chilled cup.',
    category: 'Beverages',
    price: 50,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 4,
    calories: 210,
    isVegetarian: true,
    isPopular: true,
    tags: ['Cold Coffee', 'Chilled', 'Bestseller'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_coffee_2',
    name: 'Thick Cold Coffee with Ice Cream',
    description: 'Thick velvety cold brew blend crowned with a generous scoop of vanilla ice cream, choco chips, and chocolate wafer stick.',
    category: 'Beverages',
    price: 65,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 5,
    calories: 290,
    isVegetarian: true,
    isPopular: true,
    tags: ['Cold Coffee', 'Ice Cream', 'Indulgent'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- TEA ---
  {
    id: 'food_tea_1',
    name: 'Special Kulhad Masala Chai',
    description: 'Strong authentic tea slow-brewed with freshly crushed adrak (ginger), elaichi (cardamom), cloves, and full-cream milk in a desi kulhad.',
    category: 'Beverages',
    price: 20,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 3,
    calories: 95,
    isVegetarian: true,
    isPopular: true,
    tags: ['Tea', 'Masala Chai', 'Kulhad', 'Hot'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_tea_2',
    name: 'Adrak Elaichi Special Tea',
    description: 'Piping hot rejuvenating ginger and cardamom tea brewed fresh on order for an instant campus energy boost.',
    category: 'Beverages',
    price: 25,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 3,
    calories: 85,
    isVegetarian: true,
    isPopular: false,
    tags: ['Tea', 'Ginger Tea', 'Hot'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_tea_3',
    name: 'Fresh Lemon Iced Tea',
    description: 'Chilled steeped black tea infused with fresh lemon juice, crushed mint sprigs, and organic sugar syrup over ice cubes.',
    category: 'Beverages',
    price: 45,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 3,
    calories: 110,
    isVegetarian: true,
    isPopular: true,
    tags: ['Tea', 'Iced Tea', 'Refreshing Cooler'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- COLD DRINKS & COOLERS ---
  {
    id: 'food_drink_1',
    name: 'Chilled Cold Drink (300ml)',
    description: 'Ice-cold carbonated beverage can / bottle (Choose from Thums Up, Coca Cola, Sprite, or Fanta).',
    category: 'Beverages',
    price: 35,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 1,
    calories: 140,
    isVegetarian: true,
    isPopular: true,
    tags: ['Cold Drink', 'Soda', 'Chilled'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_drink_2',
    name: 'Fresh Lime Soda (Sweet & Salted)',
    description: 'Sparkling chilled soda blended with freshly squeezed key limes, rock salt, mint, and balanced sugar syrup.',
    category: 'Beverages',
    price: 40,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 3,
    calories: 80,
    isVegetarian: true,
    isPopular: true,
    tags: ['Cold Drink', 'Lime Soda', 'Digestive'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_drink_3',
    name: 'Royal Mango Lassi',
    description: 'Thick, creamy chilled yogurt smoothie blended with sweet Alphonso mango pulp and cardamom aroma.',
    category: 'Beverages',
    price: 45,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 3,
    calories: 220,
    isVegetarian: true,
    isPopular: true,
    tags: ['Cold Drink', 'Lassi', 'Mango Cooler'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- DESSERTS ---
  {
    id: 'food_des_1',
    name: 'Hot Gulab Jamun (2 Pcs)',
    description: 'Soft melt-in-mouth khoya dumplings deep fried and soaked in warm rose & cardamom-infused sugar syrup.',
    category: 'Desserts',
    price: 40,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 2,
    calories: 280,
    isVegetarian: true,
    isPopular: true,
    tags: ['Sweet', 'Gulab Jamun', 'Warm'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'food_des_2',
    name: 'Chocolate Brownie with Vanilla Scoop',
    description: 'Warm fudge chocolate brownie topped with a scoop of premium vanilla ice cream and hot chocolate fudge sauce.',
    category: 'Desserts',
    price: 75,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    available: true,
    preparationTime: 3,
    calories: 410,
    isVegetarian: true,
    isPopular: true,
    tags: ['Dessert', 'Chocolate', 'Ice Cream'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to generate realistic historical orders
function generateSeedOrders(users: User[], items: FoodItem[]): Order[] {
  const orders: Order[] = [];
  let tokenCounter = 101;
  const now = Date.now();

  // Create 45 historical orders spread over the past 14 days
  for (let i = 45; i >= 1; i--) {
    const daysAgo = Math.floor(i / 3.5);
    const hour = 8 + (i % 12); // 8 AM to 8 PM
    const orderDate = new Date(now - daysAgo * 86400000);
    orderDate.setHours(hour, (i * 13) % 60, 0, 0);

    const user = users[i % users.length];
    const numItems = 1 + (i % 3);
    const orderItems = [];
    let total = 0;

    for (let k = 0; k < numItems; k++) {
      const item = items[(i + k * 3) % items.length];
      const qty = 1 + (k % 2);
      orderItems.push({
        foodItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
        image: item.image
      });
      total += item.price * qty;
    }

    // Determine status based on age
    let status: any = 'COMPLETED';
    if (i === 1) status = 'PREPARING';
    else if (i === 2) status = 'READY';
    else if (i === 3) status = 'ACCEPTED';
    else if (i === 4) status = 'PLACED';

    orders.push({
      id: `ord_${tokenCounter}`,
      orderNumber: `ORD-${tokenCounter}`,
      tokenNumber: tokenCounter,
      userId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      studentPhone: user.phone || '9876543210',
      items: orderItems,
      totalAmount: total,
      status: status,
      paymentMethod: i % 2 === 0 ? 'UPI_QR' : 'CAMPUS_CARD',
      paymentStatus: 'PAID',
      estimatedPreparationTime: 12,
      notes: i % 4 === 0 ? 'Extra chutney please' : undefined,
      placedAt: orderDate.toISOString(),
      acceptedAt: new Date(orderDate.getTime() + 2 * 60000).toISOString(),
      readyAt: new Date(orderDate.getTime() + 12 * 60000).toISOString(),
      completedAt: status === 'COMPLETED' ? new Date(orderDate.getTime() + 15 * 60000).toISOString() : undefined,
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString()
    });

    tokenCounter++;
  }

  return orders;
}

function generateSeedFeedbacks(users: User[], orders: Order[]): Feedback[] {
  const feedbacks: Feedback[] = [
    {
      id: 'fb_1',
      orderId: orders[orders.length - 5].id,
      userId: users[0].id,
      studentName: users[0].name,
      rating: 5,
      comment: 'The Masala Dosa was piping hot and crispy! Sambar was super authentic. Very fast service.',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'fb_2',
      orderId: orders[orders.length - 8].id,
      userId: users[1].id,
      studentName: users[1].name,
      rating: 4,
      comment: 'Cold coffee was very thick and delicious. Loved the ice cream scoop on top.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'fb_3',
      orderId: orders[orders.length - 12].id,
      userId: users[2].id,
      studentName: users[2].name,
      rating: 5,
      comment: 'Live token tracking made it so easy to grab lunch between classes without standing in line.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'fb_4',
      orderId: orders[orders.length - 18].id,
      userId: users[0].id,
      studentName: users[0].name,
      rating: 5,
      comment: 'Samosas are always top-tier here. Crisp outer crust and spicy potato filling.',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    }
  ];
  return feedbacks;
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private save(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const dataToSave = data || this.data;
      const jsonStr = JSON.stringify(dataToSave, null, 2);

      // Atomic write pattern: write to tmp file first, then atomically rename
      fs.writeFileSync(DB_TMP, jsonStr, 'utf-8');
      fs.renameSync(DB_TMP, DB_FILE);

      // Periodic backup snapshot
      try {
        fs.writeFileSync(DB_BACKUP, jsonStr, 'utf-8');
      } catch {
        // Non-blocking snapshot failure
      }
    } catch (err) {
      console.error('Error saving database atomically to disk:', err);
    }
  }

  private loadOrInitialize(): DatabaseSchema {
    // 1. Try loading primary file
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.foodItems && parsed.users) {
          // Ensure student identity and refill credits to 500
          for (const u of parsed.users) {
            if (u.email === 'student@cafeteria.edu' || u.name === 'Aarav Sharma' || u.id === 'usr_student_1') {
              u.name = 'Aditya Singh';
              u.studentId = 'CS2023089';
              u.department = 'Computer Science & Engineering';
              u.walletBalance = 500;
            }
          }
          for (const o of (parsed.orders || [])) {
            if (o.studentName === 'Aarav Sharma' || o.studentEmail === 'student@cafeteria.edu') {
              o.studentName = 'Aditya Singh';
            }
          }
          for (const f of (parsed.feedbacks || [])) {
            if (f.studentName === 'Aarav Sharma') {
              f.studentName = 'Aditya Singh';
            }
          }
          this.save(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('⚠️ Primary database file damaged or unreadable. Attempting backup snapshot restore...', err);
      // 2. Fallback to backup snapshot if primary is corrupt
      try {
        if (fs.existsSync(DB_BACKUP)) {
          const rawBackup = fs.readFileSync(DB_BACKUP, 'utf-8');
          const parsedBackup = JSON.parse(rawBackup);
          if (parsedBackup && parsedBackup.foodItems && parsedBackup.users) {
            console.log('✅ Successfully recovered database state from backup snapshot.');
            this.save(parsedBackup);
            return parsedBackup;
          }
        }
      } catch (backupErr) {
        console.warn('⚠️ Backup snapshot also unavailable. Initializing fresh seed database...', backupErr);
      }
    }

    // 3. Fresh Default Seed Initialization
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Admin@123', salt);
    const staffPasswordHash = bcrypt.hashSync('Staff@123', salt);
    const studentPasswordHash = bcrypt.hashSync('Student@123', salt);

    const users: any[] = [
      {
        id: 'usr_admin',
        name: 'Prof. Rajesh Sharma',
        email: 'admin@cafeteria.edu',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        department: 'INDIYA Cafeteria Operations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr_staff',
        name: 'Manoj Kumar (Kitchen Lead)',
        email: 'staff@cafeteria.edu',
        passwordHash: staffPasswordHash,
        role: 'staff',
        department: 'Floor 4th Main Kitchen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr_student_1',
        name: 'Aditya Singh',
        email: 'student@cafeteria.edu',
        passwordHash: studentPasswordHash,
        role: 'student',
        studentId: 'CS2023089',
        department: 'Computer Science & Engineering',
        phone: '9876543210',
        walletBalance: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr_student_2',
        name: 'Priya Sharma',
        email: 'priya@college.edu',
        passwordHash: studentPasswordHash,
        role: 'student',
        studentId: 'EC2023044',
        department: 'Electronics & Communication',
        phone: '9822334455',
        walletBalance: 350,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr_student_3',
        name: 'Rohit Verma',
        email: 'rohit@college.edu',
        passwordHash: studentPasswordHash,
        role: 'student',
        studentId: 'ME2023112',
        department: 'Mechanical Engineering',
        phone: '9811223344',
        walletBalance: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const orders = generateSeedOrders(users.filter(u => u.role === 'student'), initialFoodItems);
    const feedbacks = generateSeedFeedbacks(users.filter(u => u.role === 'student'), orders);

    const schema: DatabaseSchema = {
      users,
      foodItems: initialFoodItems,
      orders,
      feedbacks,
      predictions: [],
      systemConfig: {
        cafeteriaName: 'INDIYA Cafeteria (Floor 4th)',
        operatingHours: '08:00 AM - 09:00 PM',
        rushHourMultiplier: 1.2,
        tokenCounter: 101 + orders.length
      }
    };

    this.save(schema);
    return schema;
  }

  // MongoDB Two-Way Synchronizer (Non-blocking & Fault-Tolerant)
  async syncWithMongo() {
    try {
      const status = getMongoStatus();
      if (!status.isConnected) return;

      console.log('🔄 Synchronizing data with MongoDB cluster collections...');

      // 1. Food Items Sync
      const mongoFoodCount = await MongoFoodItemModel.countDocuments().catch(() => -1);
      if (mongoFoodCount === 0 && this.data.foodItems.length > 0) {
        console.log(`🌱 Seeding ${this.data.foodItems.length} menu items to MongoDB...`);
        await MongoFoodItemModel.insertMany(this.data.foodItems as any).catch(() => {});
      } else if (mongoFoodCount > 0) {
        const mongoItems = await MongoFoodItemModel.find().lean().catch(() => null);
        if (mongoItems && mongoItems.length > 0) {
          this.data.foodItems = mongoItems.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            category: m.category,
            price: m.price,
            image: m.image,
            available: m.available,
            preparationTime: m.preparationTime,
            calories: m.calories,
            isVegetarian: m.isVegetarian,
            isPopular: m.isPopular,
            tags: m.tags || [],
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: m.updatedAt || new Date().toISOString()
          }));
        }
      }

      // 2. Users Sync
      const mongoUserCount = await MongoUserModel.countDocuments().catch(() => -1);
      if (mongoUserCount === 0 && this.data.users.length > 0) {
        console.log(`🌱 Seeding ${this.data.users.length} initial accounts to MongoDB...`);
        await MongoUserModel.insertMany(this.data.users as any).catch(() => {});
      } else if (mongoUserCount > 0) {
        const mongoUsers = await MongoUserModel.find().lean().catch(() => null);
        if (mongoUsers && mongoUsers.length > 0) {
          this.data.users = mongoUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            passwordHash: u.passwordHash,
            role: u.role,
            studentId: u.studentId,
            department: u.department,
            phone: u.phone,
            walletBalance: u.walletBalance ?? 500,
            createdAt: u.createdAt || new Date().toISOString(),
            updatedAt: u.updatedAt || new Date().toISOString()
          }));
        }
      }

      // 3. Orders Sync
      const mongoOrderCount = await MongoOrderModel.countDocuments().catch(() => -1);
      if (mongoOrderCount === 0 && this.data.orders.length > 0) {
        await MongoOrderModel.insertMany(this.data.orders as any).catch(() => {});
      } else if (mongoOrderCount > 0) {
        const mongoOrders = await MongoOrderModel.find().lean().catch(() => null);
        if (mongoOrders && mongoOrders.length > 0) {
          this.data.orders = mongoOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            tokenNumber: o.tokenNumber,
            userId: o.userId,
            studentName: o.studentName,
            studentEmail: o.studentEmail,
            studentPhone: o.studentPhone,
            items: o.items || [],
            totalAmount: o.totalAmount,
            status: o.status,
            paymentMethod: o.paymentMethod || 'CAMPUS_CARD',
            paymentStatus: o.paymentStatus || 'PAID',
            estimatedPreparationTime: o.estimatedPreparationTime || 12,
            notes: o.notes,
            placedAt: o.placedAt,
            acceptedAt: o.acceptedAt,
            readyAt: o.readyAt,
            completedAt: o.completedAt,
            createdAt: o.createdAt || o.placedAt || new Date().toISOString(),
            updatedAt: o.updatedAt || new Date().toISOString()
          }));
        }
      }

      // 4. Feedbacks Sync
      const mongoFeedbackCount = await MongoFeedbackModel.countDocuments().catch(() => -1);
      if (mongoFeedbackCount === 0 && this.data.feedbacks.length > 0) {
        await MongoFeedbackModel.insertMany(this.data.feedbacks as any).catch(() => {});
      }

      // 5. SystemConfig Sync
      const configDoc = await MongoSystemConfigModel.findOne({ key: 'main_config' } as any).lean().catch(() => null);
      if (!configDoc) {
        await MongoSystemConfigModel.create({
          key: 'main_config',
          ...this.data.systemConfig
        }).catch(() => {});
      }

      this.save();
      console.log('✅ MongoDB data synchronization complete.');
    } catch (err) {
      console.warn('⚠️ MongoDB sync encountered a non-fatal issue:', err);
    }
  }

  // Users CRUD
  getUsers() {
    return this.data.users;
  }

  getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();

    // Async non-blocking MongoDB write
    MongoUserModel.create(user).catch(() => {});
    return user;
  }

  updateUser(id: string, updates: Partial<User & { passwordHash?: string }>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();

    MongoUserModel.updateOne({ id }, { $set: this.data.users[idx] }).catch(() => {});
    return this.data.users[idx];
  }

  updateWalletBalance(id: string, delta: number) {
    const user = this.getUserById(id);
    if (!user) return null;
    const newBal = (user.walletBalance || 0) + delta;
    return this.updateUser(id, { walletBalance: newBal });
  }

  // Food Items CRUD
  getFoodItems() {
    return this.data.foodItems;
  }

  getFoodItemById(id: string) {
    return this.data.foodItems.find(f => f.id === id);
  }

  addFoodItem(item: FoodItem) {
    this.data.foodItems.push(item);
    this.save();

    MongoFoodItemModel.create(item).catch(() => {});
    return item;
  }

  updateFoodItem(id: string, updates: Partial<FoodItem>) {
    const idx = this.data.foodItems.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.data.foodItems[idx] = {
      ...this.data.foodItems[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();

    MongoFoodItemModel.updateOne({ id }, { $set: this.data.foodItems[idx] }).catch(() => {});
    return this.data.foodItems[idx];
  }

  deleteFoodItem(id: string) {
    const idx = this.data.foodItems.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.data.foodItems.splice(idx, 1);
    this.save();

    MongoFoodItemModel.deleteOne({ id }).catch(() => {});
    return true;
  }

  // Orders CRUD
  getOrders() {
    return this.data.orders;
  }

  getOrderById(id: string) {
    return this.data.orders.find(o => o.id === id);
  }

  getOrdersByUser(userId: string) {
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }

  createOrder(order: Order) {
    this.data.orders.push(order);
    this.data.systemConfig.tokenCounter++;
    this.save();

    MongoOrderModel.create(order).catch(() => {});
    MongoSystemConfigModel.updateOne(
      { key: 'main_config' },
      { $set: { tokenCounter: this.data.systemConfig.tokenCounter } },
      { upsert: true }
    ).catch(() => {});

    return order;
  }

  updateOrderStatus(orderId: string, status: any) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'ACCEPTED' && !order.acceptedAt) order.acceptedAt = new Date().toISOString();
    if (status === 'READY' && !order.readyAt) order.readyAt = new Date().toISOString();
    if (status === 'COMPLETED' && !order.completedAt) order.completedAt = new Date().toISOString();
    this.save();

    MongoOrderModel.updateOne({ id: orderId }, { $set: order }).catch(() => {});
    return order;
  }

  getNextTokenNumber(): number {
    return this.data.systemConfig.tokenCounter;
  }

  // Feedbacks CRUD
  getFeedbacks() {
    return this.data.feedbacks;
  }

  addFeedback(feedback: Feedback) {
    this.data.feedbacks.push(feedback);
    this.save();

    MongoFeedbackModel.create(feedback).catch(() => {});
    return feedback;
  }

  // System Config
  getSystemConfig() {
    return this.data.systemConfig;
  }

  // Inbuilt Database Health & Diagnostics
  getDatabaseStatus() {
    const mongoStatus = getMongoStatus();
    const backupExists = fs.existsSync(DB_BACKUP);
    const primaryExists = fs.existsSync(DB_FILE);

    return {
      status: 'HEALTHY',
      engine: 'Inbuilt Dual-Layer Storage Engine (Memory + Atomic JSON Persistence)',
      architecture: 'Zero-Downtime High-Availability Failover',
      inbuiltStorage: {
        primaryFile: primaryExists ? 'AVAILABLE' : 'INITIALIZING',
        backupSnapshot: backupExists ? 'AVAILABLE' : 'INITIALIZING',
        storagePath: DB_FILE,
        isResilient: true
      },
      mongoSync: {
        status: mongoStatus.state,
        isConnected: mongoStatus.isConnected,
        uriConfigured: mongoStatus.uriConfigured,
        databaseName: mongoStatus.databaseName || null,
        error: mongoStatus.error || null
      },
      fallbackActive: !mongoStatus.isConnected,
      counts: {
        users: this.data.users.length,
        foodItems: this.data.foodItems.length,
        orders: this.data.orders.length,
        feedbacks: this.data.feedbacks.length
      },
      timestamp: new Date().toISOString()
    };
  }
}

export const db = new Database();

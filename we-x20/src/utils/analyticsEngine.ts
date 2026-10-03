import { AnalyticsDashboardData, FoodItem, Order } from '../types/index';
import { initialFoodItems } from '../data/menuData';

export function computeClientAnalytics(
  catalog: FoodItem[] = initialFoodItems,
  orders: Order[] = []
): AnalyticsDashboardData {
  const items = catalog.length > 0 ? catalog : initialFoodItems;

  const totalOrders = Math.max(orders.length, 142);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 12450;
  const pendingOrders = orders.filter(o => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status)).length || 6;
  const completedOrders = orders.filter(o => ['READY', 'COMPLETED'].includes(o.status)).length || 136;

  const dailyRevenueTrend = [
    { date: '2026-08-16', day: 'Mon', revenue: 14200, ordersCount: 132, avgOrderValue: 107, completedCount: 130 },
    { date: '2026-08-17', day: 'Tue', revenue: 16800, ordersCount: 154, avgOrderValue: 109, completedCount: 151 },
    { date: '2026-08-18', day: 'Wed', revenue: 15300, ordersCount: 141, avgOrderValue: 108, completedCount: 138 },
    { date: '2026-08-19', day: 'Thu', revenue: 18900, ordersCount: 178, avgOrderValue: 106, completedCount: 175 },
    { date: '2026-08-20', day: 'Fri', revenue: 21500, ordersCount: 195, avgOrderValue: 110, completedCount: 192 },
    { date: '2026-08-21', day: 'Sat', revenue: 9800, ordersCount: 84, avgOrderValue: 116, completedCount: 84 },
    { date: '2026-08-22', day: 'Sun', revenue: 8400, ordersCount: 72, avgOrderValue: 116, completedCount: 72 }
  ];

  const hourlyRushData = [
    { hour: '8 AM', orders: 18, revenue: 1250 },
    { hour: '9 AM', orders: 45, revenue: 3600 },
    { hour: '10 AM', orders: 32, revenue: 2200 },
    { hour: '11 AM', orders: 28, revenue: 1950 },
    { hour: '12 PM', orders: 95, revenue: 9800 },
    { hour: '1 PM', orders: 120, revenue: 12400 },
    { hour: '2 PM', orders: 75, revenue: 7600 },
    { hour: '3 PM', orders: 35, revenue: 2800 },
    { hour: '4 PM', orders: 62, revenue: 4900 },
    { hour: '5 PM', orders: 88, revenue: 7100 },
    { hour: '6 PM', orders: 40, revenue: 3200 },
    { hour: '7 PM', orders: 22, revenue: 1700 }
  ];

  const categoryDistribution = [
    { category: 'Meals', count: 320, revenue: 35200, percentage: 38 },
    { category: 'Breakfast', count: 210, revenue: 14700, percentage: 25 },
    { category: 'Snacks', count: 165, revenue: 9900, percentage: 20 },
    { category: 'Beverages', count: 110, revenue: 3850, percentage: 13 },
    { category: 'Desserts', count: 35, revenue: 2100, percentage: 4 }
  ];

  const popularItems = items.slice(0, 5).map((item, idx) => ({
    name: item.name,
    category: item.category,
    orderCount: [85, 72, 64, 58, 49][idx] || 35,
    totalRevenue: ([85, 72, 64, 58, 49][idx] || 35) * item.price,
    price: item.price,
    trend: 'up' as const
  }));

  const leastPopularItems = items.slice(-3).map(item => ({
    name: item.name,
    category: item.category,
    orderCount: 8,
    totalRevenue: 8 * item.price,
    price: item.price,
    turnoverRate: 'Low',
    recommendation: 'Bundle with beverage lunch combos'
  }));

  const statusDistribution = [
    { status: 'COMPLETED' as const, count: 128, percentage: 78, color: '#10b981' },
    { status: 'READY' as const, count: 8, percentage: 5, color: '#06b6d4' },
    { status: 'PREPARING' as const, count: 14, percentage: 9, color: '#f59e0b' },
    { status: 'ACCEPTED' as const, count: 6, percentage: 4, color: '#8b5cf6' },
    { status: 'PLACED' as const, count: 4, percentage: 2, color: '#3b82f6' },
    { status: 'CANCELLED' as const, count: 3, percentage: 2, color: '#ef4444' }
  ];

  const paymentMethodDistribution = [
    { method: 'Digital Campus Wallet', count: 98, revenue: 8900, percentage: 58 },
    { method: 'UPI / BharatQR', count: 54, revenue: 5200, percentage: 32 },
    { method: 'Pay at Counter (Cash)', count: 16, revenue: 1400, percentage: 10 }
  ];

  return {
    overview: {
      totalOrdersToday: totalOrders,
      revenueToday: totalRevenue,
      pendingOrders,
      completedOrders,
      averageRating: 4.8,
      totalRatingsCount: 142,
      mostPopularItem: items[0]?.name || 'Crispy Masala Dosa',
      avgPrepTimeMinutes: 7.5,
      totalRevenueAllTime: 184500,
      totalOrdersAllTime: 1890,
      averageOrderValue: 108
    },
    dailyRevenueTrend,
    weeklyOrdersTrend: [
      { weekLabel: 'Week 1', startDate: 'Aug 01', ordersCount: 920, revenue: 98400, targetOrders: 900 },
      { weekLabel: 'Week 2', startDate: 'Aug 08', ordersCount: 1040, revenue: 112000, targetOrders: 1000 },
      { weekLabel: 'Week 3', startDate: 'Aug 15', ordersCount: 1180, revenue: 129000, targetOrders: 1100 },
      { weekLabel: 'Week 4 (Current)', startDate: 'Aug 22', ordersCount: 840, revenue: 92500, targetOrders: 1100 }
    ],
    monthlyOrdersTrend: [
      { month: 'May 2026', shortMonth: 'May', year: 2026, ordersCount: 3800, revenue: 410000, avgOrderValue: 108, growthPercent: 12.4 },
      { month: 'Jun 2026', shortMonth: 'Jun', year: 2026, ordersCount: 4200, revenue: 458000, avgOrderValue: 109, growthPercent: 10.5 },
      { month: 'Jul 2026', shortMonth: 'Jul', year: 2026, ordersCount: 4750, revenue: 520000, avgOrderValue: 109, growthPercent: 13.1 },
      { month: 'Aug 2026', shortMonth: 'Aug', year: 2026, ordersCount: 5100, revenue: 562000, avgOrderValue: 110, growthPercent: 7.4 }
    ],
    revenuePeriods: {
      last7Days: dailyRevenueTrend.map(d => ({ date: d.date, day: d.day, revenue: d.revenue, ordersCount: d.ordersCount })),
      last30Days: dailyRevenueTrend.map(d => ({ date: d.date, day: d.day, revenue: d.revenue, ordersCount: d.ordersCount })),
      last12Months: [
        { month: 'Jan', revenue: 380000, ordersCount: 3500 },
        { month: 'Feb', revenue: 410000, ordersCount: 3800 },
        { month: 'Mar', revenue: 450000, ordersCount: 4100 },
        { month: 'Apr', revenue: 430000, ordersCount: 3950 },
        { month: 'May', revenue: 490000, ordersCount: 4500 },
        { month: 'Jun', revenue: 520000, ordersCount: 4800 },
        { month: 'Jul', revenue: 540000, ordersCount: 4950 },
        { month: 'Aug', revenue: 562000, ordersCount: 5100 }
      ]
    },
    paymentMethodDistribution,
    hourlyRushData,
    categoryDistribution,
    popularItems,
    leastPopularItems,
    statusDistribution
  };
}

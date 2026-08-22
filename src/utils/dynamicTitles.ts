export interface TimeGreeting {
  greeting: string;
  mealPeriod: string;
  periodEmoji: string;
  subtext: string;
}

export function getTimeGreeting(userName?: string): TimeGreeting {
  const hour = new Date().getHours();
  const name = userName ? userName.split(' ')[0] : '';

  if (hour >= 5 && hour < 12) {
    return {
      greeting: name ? `Good morning, ${name}` : 'Good morning',
      mealPeriod: 'Morning Breakfast & Chai Wave',
      periodEmoji: '☕',
      subtext: 'Fresh dosas, idlis, samosas & steaming masala chai ready at Floor 4th.'
    };
  } else if (hour >= 12 && hour < 16) {
    return {
      greeting: name ? `Good afternoon, ${name}` : 'Good afternoon',
      mealPeriod: 'Lunch Rush & Deluxe Thalis',
      periodEmoji: '🍱',
      subtext: 'Hot lunch thalis, rajma chawal, burgers & refreshing beverages.'
    };
  } else if (hour >= 16 && hour < 19) {
    return {
      greeting: name ? `Good evening, ${name}` : 'Good evening',
      mealPeriod: 'Evening Snack Break & Shakes',
      periodEmoji: '🍔',
      subtext: 'Crispy peri-peri fries, thick cold coffee, grilled sandwiches & snacks.'
    };
  } else {
    return {
      greeting: name ? `Good evening, ${name}` : 'Good evening',
      mealPeriod: 'Late Dining & Quick Bites',
      periodEmoji: '🌙',
      subtext: 'Check live counter queues and pick up quick dinner & desserts.'
    };
  }
}

export function getDynamicDocumentTitle(options: {
  view: string;
  activeOrderToken?: number;
  activeOrderStatus?: string;
  servingToken?: number;
  unseenCount?: number;
}): string {
  const { view, activeOrderToken, activeOrderStatus, servingToken } = options;

  if (activeOrderToken && activeOrderStatus) {
    if (activeOrderStatus === 'READY') {
      return `🎉 Token #${activeOrderToken} READY! • CAFETARI`;
    }
    return `⚡ Token #${activeOrderToken} (${activeOrderStatus}) • CAFETARI`;
  }

  const tokenPrefix = servingToken ? `[Serving #${servingToken}] ` : '';

  switch (view) {
    case 'landing':
      return `${tokenPrefix}CAFETARI • Smart Campus Cafeteria Floor 4th`;
    case 'menu':
      return `Fresh Kitchen Menu • CAFETARI`;
    case 'counter_queue':
    case 'counter':
      return `${tokenPrefix}Live Counter Queue & Wait Times • CAFETARI`;
    case 'student_dashboard':
      return `Student Express Tray • CAFETARI`;
    case 'order_tracking':
      return `Live Digital Token Tracker • CAFETARI`;
    case 'order_history':
      return `Order Receipts & History • CAFETARI`;
    case 'staff_kds':
      return `Kitchen Display System (KDS) • CAFETARI`;
    case 'admin_dashboard':
    case 'admin_analytics':
    case 'admin_predictions':
    case 'admin_menu':
      return `Admin Management Hub • CAFETARI`;
    case 'user_profile':
    case 'profile':
      return `Campus Account & Wallet • CAFETARI`;
    case 'login':
      return `Sign In • CAFETARI`;
    case 'register':
      return `Register Campus ID • CAFETARI`;
    default:
      return 'CAFETARI • Smart Campus Cafeteria';
  }
}

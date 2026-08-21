import {
  User,
  FoodItem,
  Order,
  Feedback,
  AnalyticsDashboardData,
  DemandPredictionResponse,
  QueueStatus
} from '../types/index.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cafeteria_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<{ success: boolean; data?: T; message?: string; errors?: any[] }> {
  try {
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        errors: data.errors
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error or invalid server response.'
    };
  }
}

// 1. Auth API
export const authApi = {
  async register(payload: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  async login(payload: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<User>(res);
  },

  async updateProfile(payload: {
    name?: string;
    phone?: string;
    department?: string;
    studentId?: string;
    avatar?: string;
    preferences?: any;
    walletRechargeAmount?: number;
  }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<User>(res);
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<{ message: string }>(res);
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return handleResponse<any[]>(res);
  }
};

// 2. Food API
export const foodApi = {
  async getFoodItems(params?: { category?: string; search?: string; availableOnly?: boolean; sort?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.availableOnly) query.set('availableOnly', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/food-items?${query.toString()}`);
    return handleResponse<FoodItem[]>(res);
  },

  async getFoodItemById(id: string) {
    const res = await fetch(`${API_BASE}/food-items/${id}`);
    return handleResponse<FoodItem>(res);
  },

  async getRecommendations(currentItemIds?: string[]) {
    const query = currentItemIds && currentItemIds.length > 0 ? `?currentItemIds=${currentItemIds.join(',')}` : '';
    const res = await fetch(`${API_BASE}/food-items/recommendations${query}`);
    return handleResponse<FoodItem[]>(res);
  },

  async createFoodItem(payload: Partial<FoodItem>) {
    const res = await fetch(`${API_BASE}/food-items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<FoodItem>(res);
  },

  async updateFoodItem(id: string, payload: Partial<FoodItem>) {
    const res = await fetch(`${API_BASE}/food-items/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<FoodItem>(res);
  },

  async toggleAvailability(id: string) {
    const res = await fetch(`${API_BASE}/food-items/${id}/toggle-stock`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse<FoodItem>(res);
  },

  async deleteFoodItem(id: string) {
    const res = await fetch(`${API_BASE}/food-items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  }
};

// 3. Order API
export const orderApi = {
  async createOrder(payload: { items: { foodItemId: string; quantity: number }[]; paymentMethod: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<Order>(res);
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Order[]>(res);
  },

  async getOrderById(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Order>(res);
  },

  async getAllOrders(params?: { status?: string; search?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Order[]>(res);
  },

  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<Order>(res);
  },

  async getQueueStatus() {
    const res = await fetch(`${API_BASE}/orders/queue-status`, {
      headers: getAuthHeaders()
    });
    return handleResponse<QueueStatus>(res);
  }
};

// 4. Feedback API
export const feedbackApi = {
  async submitFeedback(payload: { orderId: string; rating: number; comment: string }) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<Feedback>(res);
  },

  async getFeedbacks() {
    const res = await fetch(`${API_BASE}/feedback`);
    return handleResponse<{ averageRating: number; totalCount: number; feedbacks: Feedback[] }>(res);
  }
};

// 5. Analytics API
export const analyticsApi = {
  async getDashboardAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<AnalyticsDashboardData>(res);
  }
};

// 6. Prediction API
export const predictionApi = {
  async getPredictions(date?: string) {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/predictions${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<DemandPredictionResponse>(res);
  },

  async generateNewPredictions(targetDate?: string) {
    const res = await fetch(`${API_BASE}/predictions/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetDate })
    });
    return handleResponse<DemandPredictionResponse>(res);
  }
};

// 7. System & Database API
export const systemApi = {
  async getDatabaseStatus() {
    const res = await fetch(`${API_BASE}/database-status`);
    return handleResponse<{
      success: boolean;
      mongo: {
        isConnected: boolean;
        state: string;
        uriConfigured: boolean;
        maskedUri?: string;
        databaseName?: string;
        error?: string;
      };
      collections: {
        users: number;
        foodItems: number;
        orders: number;
        feedbacks: number;
      };
      instructions: string;
    }>(res);
  }
};

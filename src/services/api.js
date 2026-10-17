const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

// Helper for making HTTP requests with automatic token attachment
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('rrr_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    // Network or server offline
    console.warn(`[API] Backend unavailable at ${API_BASE_URL}${endpoint}:`, err.message);
    return { ok: false, status: 0, error: err, isOffline: true };
  }
}

export const authApi = {
  // Register user
  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Login user with email or phone
  login: async (identifier, password) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  },

  // Get current logged in user profile
  getMe: async () => {
    return await request('/auth/me', {
      method: 'GET'
    });
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Add delivery address
  addAddress: async (addressData) => {
    return await request('/auth/address', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }
};

export const ordersApi = {
  getAll: async () => {
    return await request('/orders', { method: 'GET' });
  },
  create: async (orderData) => {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  updateStatus: async (orderId, status) => {
    return await request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

export const menuApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await request(`/menu${query ? `?${query}` : ''}`, { method: 'GET' });
  }
};

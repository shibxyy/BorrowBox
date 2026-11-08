// Central API Client for BorrowBox
const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('borrowbox_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  demoLogin: async (role) => {
    const res = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  getUserProfile: async (userId) => {
    const res = await fetch(`${BASE_URL}/auth/user/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Items
  getItems: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.availableOnly) params.append('availableOnly', 'true');
    if (filters.sort) params.append('sort', filters.sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/items${query}`);
    return handleResponse(res);
  },

  getItemById: async (id) => {
    const res = await fetch(`${BASE_URL}/items/${id}`);
    return handleResponse(res);
  },

  createItem: async (itemData) => {
    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return handleResponse(res);
  },

  updateItem: async (id, itemData) => {
    const res = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return handleResponse(res);
  },

  deleteItem: async (id) => {
    const res = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getMyListings: async () => {
    const res = await fetch(`${BASE_URL}/items/my/listings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getCategories: async () => {
    const res = await fetch(`${BASE_URL}/items/categories`);
    return handleResponse(res);
  },

  // Requests
  createRequest: async (requestData) => {
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return handleResponse(res);
  },

  getBorrowerRequests: async () => {
    const res = await fetch(`${BASE_URL}/requests/borrower`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getOwnerRequests: async () => {
    const res = await fetch(`${BASE_URL}/requests/owner`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateRequestStatus: async (requestId, status, notes = '') => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(res);
  },

  // Reviews
  addReview: async (reviewData) => {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    return handleResponse(res);
  },

  getUserReviews: async (userId) => {
    const res = await fetch(`${BASE_URL}/reviews/user/${userId}`);
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Disputes & Admin
  reportIssue: async (reportData) => {
    const res = await fetch(`${BASE_URL}/admin/disputes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData)
    });
    return handleResponse(res);
  },

  getAdminStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAdminUsers: async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  toggleUserVerification: async (userId) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAdminListings: async () => {
    const res = await fetch(`${BASE_URL}/admin/listings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateItemStatusAdmin: async (itemId, status) => {
    const res = await fetch(`${BASE_URL}/admin/listings/${itemId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  addCategory: async (categoryData) => {
    const res = await fetch(`${BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });
    return handleResponse(res);
  },

  deleteCategory: async (categoryId) => {
    const res = await fetch(`${BASE_URL}/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getDisputes: async () => {
    const res = await fetch(`${BASE_URL}/admin/disputes`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateDisputeStatus: async (disputeId, status, admin_notes = '') => {
    const res = await fetch(`${BASE_URL}/admin/disputes/${disputeId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, admin_notes })
    });
    return handleResponse(res);
  }
};


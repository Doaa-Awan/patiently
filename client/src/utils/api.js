const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Make authenticated API request
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    removeToken();
    localStorage.removeItem('user_data');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
};

// API methods
export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data));
    }
    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data));
    }
    return data;
  },

  logout: () => {
    removeToken();
    localStorage.removeItem('user_data');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiRequest('/api/users/me');
    return response.json();
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await apiRequest(`/api/users/${id}`);
    return response.json();
  },

  // Get all users (for caregivers)
  getAllUsers: async (role = null) => {
    const url = role ? `/api/users?role=${role}` : '/api/users';
    const response = await apiRequest(url);
    return response.json();
  },

  // Symptoms
  createSymptom: async (symptomData) => {
    const response = await apiRequest('/api/symptoms/add', {
      method: 'POST',
      body: JSON.stringify(symptomData),
    });
    return response.json();
  },

  getPatientSymptoms: async (patientId = null) => {
    const url = patientId 
      ? `/api/symptoms/getsymptoms?patientId=${patientId}`
      : '/api/symptoms/getsymptoms';
    const response = await apiRequest(url);
    return response.json();
  },
};

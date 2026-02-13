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
  updateSymptom: async (symptomId, updates) => {
    const response = await apiRequest(`/api/symptoms/${symptomId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  deleteSymptom: async (symptomId) => {
    const response = await apiRequest(`/api/symptoms/${symptomId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Format voice transcript using AI
  formatTranscript: async (transcript) => {
    const response = await fetch(`${API_BASE}/api/openrouter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `You are a medical assistant. A patient has recorded symptoms using voice-to-text. Extract the key symptoms and important details and present them in clean, structured plain text.

Rules:
- Keep it factual and medical; remove filler words, repetition, and chit-chat.
- Focus on symptoms, timing, progression, triggers/relievers, and current status.
- If a detail is not stated, do not invent it.
- Use these exact labels in plain text:
Symptoms: <comma-separated symptom list>
Onset/Timing: <when symptoms started or time of day, if stated>
Progression: <better/worse/stable, if stated>
Modifiers: <what made it better or worse, if stated>
Current status: <how they feel now, if stated>
- Do not use markdown symbols such as #, *, or -.

Transcript:
"${transcript}"

Return ONLY the formatted text, nothing else.`
          }
        ]
      }),
    });
    return response.json();
  },

  // OpenRouter AI
  generateReport: async (entries, timeRange) => {
    const response = await fetch(`${API_BASE}/api/openrouter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `You are a medical assistant helping to create a concise patient symptom summary report for a healthcare provider.

Symptom Entries Data:
${JSON.stringify(entries, null, 2)}

Time Range Requested: Last ${timeRange} days

Output requirements:
1. Create one markdown table with exactly these columns in this order:
| Date | Symptom Occurred | Description | Pain Level |
2. Include all relevant symptom rows from the provided data.
3. Keep each row concise and factual.
4. After the table, add one concise paragraph summary (3-5 sentences).
5. Do not include headings, numbered lists, or bullets.
6. Do not use markdown symbols like #, *, or - outside the table syntax.

Return only the table followed by the summary paragraph.`
          }
        ]
      }),
    });
    return response.json();
  },
};

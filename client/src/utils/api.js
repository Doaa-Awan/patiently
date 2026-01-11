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
            content: `You are a medical assistant. A patient has recorded their symptoms using voice-to-text. Please format the following transcript into a concise, clear bulleted summary of their symptoms. 

Keep it factual and medical. Use bullet points. Remove filler words, repetitions, and non-medical information. Focus on the actual symptoms, their characteristics, and any relevant details.

Transcript:
"${transcript}"

Return ONLY the formatted bulleted summary, nothing else.`
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

Analyze the following symptom entries and generate a professional, well-structured report that includes:

1. **Onset Date**: When did the patient's issues start? (Identify the earliest symptom date)

2. **Daily Symptom Breakdown**: For each day within the time range, list:
   - Date
   - All symptoms reported that day
   - Severity levels for each symptom
   - Time of day when symptoms occurred (if available)

3. **Key Patterns & Trends**: 
   - Most common symptoms
   - Severity trends (improving, worsening, stable)
   - Symptom frequency patterns
   - Any notable correlations

4. **Summary**: A concise overall assessment suitable for a doctor's visit

Symptom Entries Data:
${JSON.stringify(entries, null, 2)}

Time Range Requested: Last ${timeRange} days

Format the report with clear sections using markdown headers (## for main sections, ### for subsections). Use bullet points (-) for lists. Use **bold** for emphasis on important information. Be professional, concise, and focus on facts. Make it easy for healthcare providers to quickly understand the patient's symptom timeline and patterns.

Return the report formatted in markdown with proper structure:
- Use ## for main section headers
- Use ### for subsection headers  
- Use bullet points (-) for lists
- Use **bold** for key information
- Separate sections with blank lines`
          }
        ]
      }),
    });
    return response.json();
  },
};

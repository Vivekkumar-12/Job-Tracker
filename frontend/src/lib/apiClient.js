// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const apiClient = {
  // Authentication
  auth: {
    register: (data) =>
      makeRequest(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data) =>
      makeRequest(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      makeRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      }),
    getCurrentUser: () =>
      makeRequest(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
      }),
    updateProfile: (data) =>
      makeRequest(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    changePassword: (data) =>
      makeRequest(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sendExportOtp: () =>
      makeRequest(`${API_BASE_URL}/auth/export-otp`, {
        method: 'POST',
      }),
    deleteAccount: (data) =>
      makeRequest(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE',
        body: JSON.stringify(data),
      }),
    enable2FA: () =>
      makeRequest(`${API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
      }),
    verify2FASetup: (code) =>
      makeRequest(`${API_BASE_URL}/auth/2fa/verify-setup`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    disable2FA: (password) =>
      makeRequest(`${API_BASE_URL}/auth/2fa/disable`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    send2FACode: (email) =>
      makeRequest(`${API_BASE_URL}/auth/2fa/send`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // Applications
  applications: {
    getAll: () => makeRequest(`${API_BASE_URL}/applications`),
    get: (id) => makeRequest(`${API_BASE_URL}/applications/${id}`),
    create: (data) =>
      makeRequest(`${API_BASE_URL}/applications`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      makeRequest(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      makeRequest(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE',
      }),
    getStats: () => makeRequest(`${API_BASE_URL}/applications/stats`),
    getDashboard: () => makeRequest(`${API_BASE_URL}/applications/dashboard`),
  },

  // Resumes
  resumes: {
    getAll: () => makeRequest(`${API_BASE_URL}/resumes`),
    get: (id) => makeRequest(`${API_BASE_URL}/resumes/${id}`),
    create: (data) =>
      makeRequest(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createWithFile: (formData) =>
      makeRequest(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        body: formData,
      }),
    update: (id, data) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateWithFile: (id, formData) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}`, {
        method: 'PUT',
        body: formData,
      }),
    delete: (id) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}`, {
        method: 'DELETE',
      }),
    // AI & ATS endpoints
    calculateATS: (id, jobDescription) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/calculate-ats`, {
        method: 'POST',
        body: JSON.stringify({ jobDescription }),
      }),
    generateSummary: (id, jobRole) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/generate-summary`, {
        method: 'POST',
        body: JSON.stringify({ jobRole }),
      }),
    optimizeBulletPoints: (id, payload) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/optimize-bullet-points`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    suggestSkills: (id, role) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/suggest-skills`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    improveClarity: (id, text, field) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/improve-clarity`, {
        method: 'POST',
        body: JSON.stringify({ text, field }),
      }),
    analyze: (id) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/analyze`, {
        method: 'POST',
      }),
    // Export endpoints (blob)
    exportPDF: async (id) => {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/resumes/${id}/export-pdf`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    },
    exportDOCX: async (id) => {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/resumes/${id}/export-docx`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    },
  },

  // Cover Letters
  coverLetters: {
    getAll: () => makeRequest(`${API_BASE_URL}/cover-letters`),
    get: (id) => makeRequest(`${API_BASE_URL}/cover-letters/${id}`),
    create: (data) =>
      makeRequest(`${API_BASE_URL}/cover-letters`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createWithFile: (formData) =>
      makeRequest(`${API_BASE_URL}/cover-letters`, {
        method: 'POST',
        body: formData,
      }),
    update: (id, data) =>
      makeRequest(`${API_BASE_URL}/cover-letters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateWithFile: (id, formData) =>
      makeRequest(`${API_BASE_URL}/cover-letters/${id}`, {
        method: 'PUT',
        body: formData,
      }),
    delete: (id) =>
      makeRequest(`${API_BASE_URL}/cover-letters/${id}`, {
        method: 'DELETE',
      }),
    extractContent: (id) =>
      makeRequest(`${API_BASE_URL}/cover-letters/${id}/extract-content`, {
        method: 'POST',
      }),
    extractTextFromFile: (formData) =>
      makeRequest(`${API_BASE_URL}/cover-letters/extract-text`, {
        method: 'POST',
        body: formData,
      }),
  },

  // Reminders
  reminders: {
    getAll: () => makeRequest(`${API_BASE_URL}/reminders`),
    get: (id) => makeRequest(`${API_BASE_URL}/reminders/${id}`),
    create: (data) =>
      makeRequest(`${API_BASE_URL}/reminders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      makeRequest(`${API_BASE_URL}/reminders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      makeRequest(`${API_BASE_URL}/reminders/${id}`, {
        method: 'DELETE',
      }),
    complete: (id) =>
      makeRequest(`${API_BASE_URL}/reminders/${id}/complete`, {
        method: 'PATCH',
      }),
  },

  // Job Listings
  jobListings: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params);
      return makeRequest(`${API_BASE_URL}/job-listings?${query}`);
    },
    get: (id) => makeRequest(`${API_BASE_URL}/job-listings/${id}`),
    create: (data) =>
      makeRequest(`${API_BASE_URL}/job-listings`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      makeRequest(`${API_BASE_URL}/job-listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      makeRequest(`${API_BASE_URL}/job-listings/${id}`, {
        method: 'DELETE',
      }),
    toggleBookmark: (id) =>
      makeRequest(`${API_BASE_URL}/job-listings/${id}/bookmark`, {
        method: 'PATCH',
      }),
    enrich: (jobUrl) =>
      makeRequest(`${API_BASE_URL}/job-listings/enrich`, {
        method: 'POST',
        body: JSON.stringify({ jobUrl }),
      }),
  },

  // Aggregated Search (Remotive + optional JSearch)
  search: {
    jobs: (params = {}) => {
      const query = new URLSearchParams(params);
      return makeRequest(`${API_BASE_URL}/search/jobs?${query}`);
    },
  },

  // Push Notifications
  notifications: {
    subscribe: (subscription) =>
      makeRequest(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ subscription }),
      }),
    unsubscribe: () =>
      makeRequest(`${API_BASE_URL}/notifications/unsubscribe`, {
        method: 'POST',
      }),
    getSubscription: () =>
      makeRequest(`${API_BASE_URL}/notifications/subscription`, {
        method: 'GET',
      }),
    getVapidKey: () =>
      makeRequest(`${API_BASE_URL}/notifications/vapid-public-key`, {
        method: 'GET',
      }),
  },
};

export default apiClient;

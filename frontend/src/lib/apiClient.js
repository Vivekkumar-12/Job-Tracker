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
    createMultipart: (formData) =>
      makeRequest(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        body: formData,
      }),
    update: (id, data) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}`, {
        method: 'DELETE',
      }),
    setDefault: (id) =>
      makeRequest(`${API_BASE_URL}/resumes/${id}/default`, {
        method: 'PATCH',
      }),
    clearDefault: () =>
      makeRequest(`${API_BASE_URL}/resumes/default/clear`, {
        method: 'PATCH',
      }),
    uploadFile: (id, file) => {
      const form = new FormData();
      form.append('file', file);
      return makeRequest(`${API_BASE_URL}/resumes/${id}/file`, {
        method: 'PATCH',
        body: form,
      });
    },
    downloadFile: (id) => {
      // Return the download URL directly for use with window.location or <a> tag
      return `${API_BASE_URL}/resumes/${id}/download`;
    },
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
};

export default apiClient;

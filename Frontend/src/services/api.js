const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://fs098-taxi-pooling.onrender.com/api';

const apiRequest = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  // Do not set Content-Type header if body is FormData (browser will set it with boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Global 401 Unauthorized Session Expiration handler
  if (response.status === 401) {
    sessionStorage.clear();
    // Redirect to login page
    window.location.href = '/login';
    throw new Error('Session expired. Redirecting to login...');
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const api = {
  get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options) => {
    const isFormData = body instanceof FormData;
    return apiRequest(url, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  },
  put: (url, body, options) => {
    const isFormData = body instanceof FormData;
    return apiRequest(url, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  },
  patch: (url, body, options) => {
    const isFormData = body instanceof FormData;
    return apiRequest(url, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  },
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }),
};

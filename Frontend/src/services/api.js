const BASE_URL = 'https://fs098-taxi-pooling.onrender.com/api';

const apiRequest = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
  post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (url, body, options) => apiRequest(url, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (url, body, options) => apiRequest(url, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }),
};

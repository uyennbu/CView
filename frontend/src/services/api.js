// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorDetail = (data && data.detail) || (data && data.message) || `Lỗi ${response.status}: Thao tác thất bại`;
    const message = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail);
    throw new Error(message);
  }

  return data;
}

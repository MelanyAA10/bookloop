const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}?subscription-key=${API_KEY}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  return response;
};
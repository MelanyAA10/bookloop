import { API_URL, API_KEY } from './config';

export const apiFetch = async (endpoint, options = {}) => {
  // Construir URL con query param subscription-key
  const url = `${API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}subscription-key=${API_KEY}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return response;
};
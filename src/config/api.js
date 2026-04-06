// src/config/api.js
const API_URL = 'https://bookloop-api.azure-api.net/v1';
const API_KEY = '6f463ca55cfe4e258de8819701678fda';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}?subscription-key=${API_KEY}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return response;
};
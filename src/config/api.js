// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const API_CONFIG = {
  baseUrl: API_URL,
  key: API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': API_KEY
  }
};

// Función helper para hacer fetch con la clave automática
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
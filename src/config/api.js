// src/config/api.js

const IS_DEV = import.meta.env.DEV;


const API_BASE = IS_DEV
  ? (import.meta.env.VITE_API_URL || '')
  : '/api';

const API_KEY = IS_DEV
  ? (import.meta.env.VITE_API_KEY || '')
  : ''

export const apiFetch = async (endpoint, options = {}) => {
  const keyParam = API_KEY ? `?subscription-key=${API_KEY}` : '';
  const url = `${API_BASE}${endpoint}${keyParam}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  return response;
};

export const getBookImageUrl = (book) => {
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  if (book?.cover_url) return book.cover_url;
  if (book?.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  return null;
};
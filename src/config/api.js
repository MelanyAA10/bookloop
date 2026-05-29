
const API_BASE = '/api'

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;   // sin key — la agrega la Function
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
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

export const getBookImageUrl = (book) => {
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  if (book?.cover_url) return book.cover_url;
  if (book?.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  return null;
};

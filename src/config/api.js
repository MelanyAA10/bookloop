// src/config/api.js
// El frontend ya no conoce la API key ni la URL de Azure.
// Todas las llamadas van a /api que Azure SWA enruta a la Function proxy.

const API_BASE = '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return response;
};

/**
 * Mapea un BookResponseDto del microservicio al formato interno del frontend.
 * MS: { id, title, author, description, image, pageCount, language, uploadedBy }
 * Frontend necesita: { id, title, author, synopsis, cover_url, pages, language, uploadedBy, color, genre, year, owner }
 */
export const mapBook = (book) => ({
  id:          book.id,
  title:       book.title,
  author:      book.author,
  synopsis:    book.description,
  description: book.description,
  image:       book.image,
  cover_url:   book.image,
  pageCount:   book.pageCount,
  pages:       book.pageCount,
  language:    book.language,
  uploadedBy:  book.uploadedBy,
  // Campos que el MS no provee — defaults visuales
  color:       book.color   || '#7A3728',
  genre:       book.genre   || 'Fiction',
  year:        book.year    || '',
  owner: {
    name:     book.uploadedBy || 'Unknown',
    initials: (book.uploadedBy || 'U').substring(0, 2).toUpperCase(),
    rating:   book.owner?.rating ?? 5.0,
    maxDays:  book.owner?.maxDays ?? 14,
  },
});

export const getBookImageUrl = (book) => {
  if (book?.image)            return book.image;
  if (book?.cover_url)        return book.cover_url;
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  return null;
};

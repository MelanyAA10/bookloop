// src/config/api.js
const API_BASE = '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return response;
};

export const getBookImageUrl = (book) => {
  if (book?.image && typeof book.image === 'string' && book.image.startsWith('http')) return book.image;
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  if (book?.cover_url) return book.cover_url;
  if (book?.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  return null;
};

/**
 * Obtiene el perfil de un usuario por su ID desde /api/users/{id}
 * Si falla o no existe, retorna null silenciosamente.
 */
export const fetchUserById = async (userId) => {
  if (!userId || userId === '' || userId === 'Invitado') return null;
  try {
    const res = await apiFetch(`/users/${userId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || data.data || data;
  } catch {
    return null;
  }
};

/**
 * Mapea un libro crudo del backend al formato que usan los componentes.
 * ownerProfile viene de fetchUserById(book.uploadedBy) — puede ser null.
 */
export const mapBook = (book, ownerProfile = null) => {
  const ownerName = ownerProfile?.name || ownerProfile?.username || book.owner?.name || 'Unknown';
  const ownerInitials = ownerProfile?.initials
    || (ownerName !== 'Unknown' ? ownerName.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) : '??');

  return {
    id:          book.id,
    title:       book.title       || 'Untitled',
    author:      book.author      || 'Unknown',
    year:        book.year        || book.publishYear || null,
    pages:       book.pages       || book.pageCount   || null,
    pageCount:   book.pageCount   || book.pages       || null,
    language:    book.language    || null,
    genre:       book.genre       || null,
    color:       book.color       || '#7A3728',
    isbn:        book.isbn        || null,
    image:       book.image       || null,
    images:      book.images      || [],
    cover_url:   book.cover_url   || null,
    synopsis:    book.synopsis    || book.description || null,
    description: book.description || book.synopsis   || null,
    uploadedBy:  book.uploadedBy  || null,
    owner: {
      name:     ownerName,
      initials: ownerInitials,
      rating:   ownerProfile?.rating  || book.owner?.rating  || 0,
      maxDays:  ownerProfile?.maxDays || book.owner?.maxDays || 14,
    },
  };
};
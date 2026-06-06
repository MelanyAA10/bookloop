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
 * Obtiene el perfil de un usuario por ID desde /api/users/{id}.
 * Retorna null si el endpoint falla (no bloquea el resto de la UI).
 */
export const fetchUserById = async (userId) => {
  if (!userId) return null;
  try {
    const res = await apiFetch(`/users/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * Mapea un BookResponseDto del microservicio al formato interno del frontend.
 * MS: { id, title, author, description, image, pageCount, language, uploadedBy }
 * uploadedBy es el ID del usuario — se enriquece por separado con fetchUserById().
 */
export const mapBook = (book, ownerProfile = null) => {
  // ownerProfile viene de GET /api/users/{uploadedBy}
  const ownerName     = ownerProfile?.name     || ownerProfile?.username || book.uploadedBy || 'Unknown';
  const ownerInitials = ownerProfile?.initials
    || (ownerName !== book.uploadedBy
        ? ownerName.substring(0, 2).toUpperCase()
        : (book.uploadedBy || 'U').substring(0, 2).toUpperCase());

  return {
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
    uploadedBy:  book.uploadedBy,   // ID original del MS
    // Campos que el MS no provee — defaults visuales
    color:   book.color  || '#7A3728',
    genre:   book.genre  || 'Fiction',
    year:    book.year   || '',
    owner: {
      id:       book.uploadedBy,
      name:     ownerName,
      initials: ownerInitials,
      rating:   ownerProfile?.rating  ?? 5.0,
      maxDays:  ownerProfile?.maxDays ?? 14,
    },
  };
};

export const getBookImageUrl = (book) => {
  if (book?.image)                             return book.image;
  if (book?.cover_url)                         return book.cover_url;
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  return null;
};

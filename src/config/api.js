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

// ── Cloudinary: subir una imagen y obtener su URL ──────────────────────────────
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'bookloop_preset');
  const response = await fetch('https://api.cloudinary.com/v1_1/dkjzvjeln/image/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Cloudinary upload failed');
  const data = await response.json();
  return data.secure_url;
};

// ── Préstamos (sobre el micro de libros) ───────────────────────────────────────
export const lendBook = (bookId, borrowerId) =>
  apiFetch(`/books/${bookId}/lend`, {
    method: 'POST',
    body: JSON.stringify({ borrowerId }),
  });

export const returnBook = (bookId) =>
  apiFetch(`/books/${bookId}/return`, { method: 'POST' });

export const addReview = (bookId, author, text, stars) =>
  apiFetch(`/books/${bookId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ author, text, stars }),
  });

export const getReviews = (bookId) =>
  apiFetch(`/books/${bookId}/reviews`);

// Persiste el status de una tarjeta [[LOAN]] actualizando su content en MongoDB
export const patchMessageContent = (chatId, messageId, content) =>
  apiFetch(`/chats/${chatId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });

// Libros disponibles del dueño / prestados a un usuario (para los dropdowns del chat)
export const getAvailableBooks = (ownerId) =>
  apiFetch(`/books/chat/available?ownerId=${ownerId}`);

export const getBorrowedBooks = (userId) =>
  apiFetch(`/books/chat/borrowed?userId=${userId}`);

export const mapBook = (book, ownerProfile = null) => {
  const ownerName =
    ownerProfile?.name ||
    ownerProfile?.username ||
    book.owner?.name ||
    'Unknown';

  const ownerInitials =
    ownerProfile?.initials ||
    (ownerName !== 'Unknown'
      ? ownerName.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)
      : '??');

  // loanDays viene del backend directamente
  const loanDays = book.loanDays > 0 ? book.loanDays : 14;

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
    loanDays:    loanDays,
    available:   book.available !== undefined ? book.available : true,
    borrowedBy:  book.borrowedBy  || null,
    owner: {
      name:     ownerName,
      initials: ownerInitials,
      rating:   ownerProfile?.rating  || book.owner?.rating  || 0,
      maxDays:  loanDays,
    },
  };
};
// src/pages/DiscoveryPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Tag, Badge, Avatar, Stars, BookCover, SectionLabel } from '../components/UI';

const GENRES = ['All', 'Fiction', 'Science', 'History', 'Philosophy', 'Technology', 'Art'];

// Configuración de la API
const API_URL = 'https://bookloop-api.azure-api.net/v1';
const API_KEY = '6f463ca55cfe4e258de8819701678fda';

export default function DiscoveryPage({ onNavigate = () => {} }) {
  const [activeGenre, setActiveGenre] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/books?subscription-key=${API_KEY}`);
      const data = await response.json();
      setBooks(data.data || []);
      setTotalPages(Math.ceil((data.data?.length || 0) / booksPerPage));
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesGenre = activeGenre === 'All' || book.genre === activeGenre;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const featuredBook = books.length > 0 ? books[0] : {
    id: 1,
    color: '#7A3728',
    title: 'La Casa de los Espíritus',
    author: 'Isabel Allende',
    year: 1982,
    pages: 450,
    language: 'Spanish',
    genre: 'Fiction',
    owner: { initials: 'AS', name: 'Aaron Salas', rating: 4.5 },
    synopsis: 'Una obra maestra del realismo mágico latinoamericano.'
  };

  const alsoAvailable = books.slice(1, 3);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar activePage="discovery" onNavigate={onNavigate} />

      <div style={s.body}>
        <div style={s.searchRow}>
          <input
            style={s.searchInput}
            placeholder="Search by title, author, or ISBN…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={s.genreTags}>
            {GENRES.map(g => (
              <Tag key={g} active={activeGenre === g} onClick={() => setActiveGenre(g)}>{g}</Tag>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <p>Cargando libros...</p>
          </div>
        )}

        {!loading && (
          <>
            <div style={s.featured}>
              <BookCover color={featuredBook.color} title={featuredBook.title} width={200} height={280} style={{ borderRadius: 10, boxShadow: '4px 6px 24px rgba(0,0,0,0.25)' }} />

              <div style={s.featuredInfo}>
                <Badge variant="default" style={{ marginBottom: 10 }}>Featured Today</Badge>
                <h2 style={s.featuredTitle}>{featuredBook.title}</h2>
                <p style={s.featuredMeta}>{featuredBook.author} · {featuredBook.year}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <Tag>{featuredBook.pages} pages</Tag>
                  <Tag>{featuredBook.language}</Tag>
                  <Tag>{featuredBook.genre}</Tag>
                </div>
                <div style={s.ownerRow}>
                  <Avatar initials={featuredBook.owner?.initials || '??'} size={28} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{featuredBook.owner?.name || 'Unknown'}</span>
                  <Stars value={featuredBook.owner?.rating || 0} size={12} />
                </div>
                <SectionLabel style={{ marginTop: 14 }}>The Story</SectionLabel>
                <p style={s.synopsis}>{featuredBook.synopsis || 'No synopsis available.'}</p>
                <div style={s.featuredActions}>
                  <button style={s.btnOutline} onClick={() => onNavigate('bookdetail', { id: featuredBook.id })}>Book Info</button>
                  <button style={s.btnPrimary} onClick={() => onNavigate('bookdetail', { id: featuredBook.id })}>Request Loan →</button>
                </div>
              </div>

              <div style={s.sidebar}>
                <SectionLabel>Also Available</SectionLabel>
                {alsoAvailable.map(book => (
                  <div key={book.id} onClick={() => onNavigate('bookdetail', { id: book.id })} style={{ cursor: 'pointer' }}>
                    <BookCover
                      color={book.color}
                      title={book.title}
                      width="100%"
                      height={148}
                      style={{ borderRadius: 8, marginBottom: 10, width: '100%' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 36 }}>
              <SectionLabel style={{ marginBottom: 16, fontSize: 12 }}>Recent Additions</SectionLabel>
              <div style={s.grid}>
                {paginatedBooks.map(book => (
                  <div key={book.id} style={s.gridItem} onClick={() => onNavigate('bookdetail', { id: book.id })}>
                    <BookCover color={book.color} title={book.title} width="100%" height={130} style={{ borderRadius: 8, cursor: 'pointer', width: '100%' }} />
                    <p style={s.gridTitle}>{book.title}</p>
                    <p style={s.gridAuthor}>{book.author}</p>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={s.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    ← Previous
                  </button>
                  <span style={s.pageInfo}>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ ...s.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  body: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto' },
  searchRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  searchInput: {
    padding: '10px 16px',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    minWidth: 260,
    outline: 'none',
  },
  genreTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  featured: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr 200px',
    gap: 28,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 14,
    padding: 28,
    boxShadow: 'var(--shadow)',
  },
  featuredInfo: { display: 'flex', flexDirection: 'column' },
  featuredTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
    lineHeight: 1.3,
  },
  featuredMeta: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 },
  ownerRow: { display: 'flex', alignItems: 'center', gap: 8 },
  synopsis: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 },
  featuredActions: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' },
  btnOutline: {
    background: 'transparent',
    border: '1.5px solid var(--crimson)',
    color: 'var(--crimson)',
    padding: '7px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnPrimary: {
    background: 'var(--crimson-light)',
    border: 'none',
    color: '#fff',
    padding: '8px 18px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(139,28,28,0.28)',
  },
  sidebar: { display: 'flex', flexDirection: 'column' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
  },
  gridItem: { cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 },
  gridTitle: { fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 },
  gridAuthor: { fontSize: 11, color: 'var(--text-muted)' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
    padding: '16px 0',
  },
  pageBtn: {
    background: 'var(--crimson)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
  },
  pageInfo: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontFamily: "'DM Sans', sans-serif",
  },
};
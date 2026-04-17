// src/pages/DiscoveryPage.jsx - Responsive version
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Tag, Badge, Avatar, Stars, BookCover, SectionLabel } from '../components/UI';
import { apiFetch, getBookImageUrl } from '../config/api';

const GENRES = ['All', 'Fiction', 'Science', 'History', 'Philosophy', 'Technology', 'Art'];

export default function DiscoveryPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [activeGenre, setActiveGenre] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const booksPerPage = isMobile ? 6 : 8;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeGenre]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/books');
      const result = await response.json();
      const booksList = Array.isArray(result) ? result : (result.data || []);
      setBooks(booksList);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
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

  const filteredTotalPages = Math.ceil(filteredBooks.length / booksPerPage) || 1;

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

  const alsoAvailable = books.slice(1, isMobile ? 2 : 3);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="discovery"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={s.body}>
        <div style={s.searchRow}>
          <input
            style={s.searchInput}
            placeholder="Search by title, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={s.genreTags}>
          {GENRES.map(g => (
            <Tag key={g} active={activeGenre === g} onClick={() => setActiveGenre(g)}>{g}</Tag>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <p>Cargando libros...</p>
          </div>
        )}

        {!loading && (
          <>
            <div style={isMobile ? s.featuredMobile : s.featured}>
              <BookCover
                color={featuredBook.color}
                title={featuredBook.title}
                imageUrl={getBookImageUrl(featuredBook)}
                width={isMobile ? 120 : 200}
                height={isMobile ? 168 : 280}
                style={{ borderRadius: 10, boxShadow: '4px 6px 24px rgba(0,0,0,0.25)' }}
              />

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
                {!isMobile && (
                  <>
                    <SectionLabel style={{ marginTop: 14 }}>The Story</SectionLabel>
                    <p style={s.synopsis}>{featuredBook.synopsis || 'No synopsis available.'}</p>
                  </>
                )}
                <div style={s.featuredActions}>
                  <button style={s.btnOutline} onClick={() => onNavigate('bookdetail', { id: featuredBook.id })}>Book Info</button>
                  <button style={s.btnPrimary} onClick={() => onNavigate('bookdetail', { id: featuredBook.id })}>Request Loan →</button>
                </div>
              </div>

              {!isMobile && (
                <div style={s.sidebar}>
                  <SectionLabel>Also Available</SectionLabel>
                  {alsoAvailable.map(book => (
                    <div key={book.id} onClick={() => onNavigate('bookdetail', { id: book.id })} style={{ cursor: 'pointer' }}>
                      <BookCover
                        color={book.color}
                        title={book.title}
                        imageUrl={getBookImageUrl(book)}
                        width="100%"
                        height={148}
                        style={{ borderRadius: 8, marginBottom: 10, width: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 36 }}>
              <SectionLabel style={{ marginBottom: 16, fontSize: 12 }}>Recent Additions</SectionLabel>
              <div style={isMobile ? s.gridMobile : s.grid}>
                {paginatedBooks.map(book => (
                  <div key={book.id} style={s.gridItem} onClick={() => onNavigate('bookdetail', { id: book.id })}>
                    <BookCover
                      color={book.color}
                      title={book.title}
                      imageUrl={getBookImageUrl(book)}
                      width="100%"
                      height={isMobile ? 100 : 130}
                      style={{ borderRadius: 8, cursor: 'pointer', width: '100%' }}
                    />
                    <p style={s.gridTitle}>{book.title}</p>
                    <p style={s.gridAuthor}>{book.author}</p>
                  </div>
                ))}
              </div>

              {filteredTotalPages > 1 && (
                <div style={s.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    ← Previous
                  </button>
                  <span style={s.pageInfo}>Page {currentPage} of {filteredTotalPages}</span>
                  <button
                    disabled={currentPage === filteredTotalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ ...s.pageBtn, opacity: currentPage === filteredTotalPages ? 0.5 : 1 }}
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
  body: { padding: '20px 16px', maxWidth: 1280, margin: '0 auto' },
  searchRow: { marginBottom: 16 },
  searchInput: {
    padding: '10px 16px',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
  },
  genreTags: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
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
  featuredMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 14,
    padding: 16,
    boxShadow: 'var(--shadow)',
  },
  featuredInfo: { display: 'flex', flexDirection: 'column' },
  featuredTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(18px, 5vw, 24px)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
    lineHeight: 1.3,
  },
  featuredMeta: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 },
  ownerRow: { display: 'flex', alignItems: 'center', gap: 8 },
  synopsis: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 },
  featuredActions: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 },
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
  gridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  gridItem: { cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 },
  gridTitle: { fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 },
  gridAuthor: { fontSize: 11, color: 'var(--text-muted)' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: '16px 0',
    flexWrap: 'wrap',
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
// src/pages/BookDetailPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Badge, Tag, Avatar, Stars, BookCover, SectionLabel, Divider, Button } from '../components/UI';
import { apiFetch } from '../config/api';

export default function BookDetailPage({ onNavigate = () => {}, bookId = 1, theme, onToggleTheme }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([
    { initials: 'AS', name: 'Aaron S.', stars: 5, text: 'Juliet is incredibly punctual and the books are always in pristine condition.' },
    { initials: 'MR', name: 'Marcus R.', stars: 4, text: 'Great conversation about art history during the handoff.' },
  ]);

  useEffect(() => {
    const id = typeof bookId === 'object' ? bookId?.id || 1 : bookId || 1;
    fetchBook(id);
  }, [bookId]);

  const fetchBook = async (id) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/books/${id}`);
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <p>Cargando libro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Libro no encontrado</p>
          <button onClick={() => onNavigate('discovery')} style={{ color: 'var(--crimson)' }}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="discovery"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={s.body}>
        <button style={s.back} onClick={() => onNavigate('discovery')}>← Back to Discovery</button>

        <div style={s.layout}>
          <div style={s.left}>
            <BookCover
              color={book.color || '#7A3728'}
              title={book.title}
              width={240}
              height={320}
              style={{ borderRadius: 10, boxShadow: '6px 8px 28px rgba(0,0,0,0.22)', width: 240, height: 320 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              <Badge variant="default">Available for Loan</Badge>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Owner: {book.owner?.name || 'Unknown'} · {book.owner?.maxDays || 14} days max
              </p>
            </div>
          </div>

          <div style={s.right}>
            <h1 style={s.title}>{book.title}</h1>
            <p style={s.meta}>{book.author} · {book.year}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              <Tag>{book.pages} pages</Tag>
              <Tag>{book.language}</Tag>
              <Tag>{book.genre}</Tag>
            </div>

            <div style={s.ownerBox}>
              <Avatar initials={book.owner?.initials || '??'} size={36} />
              <div>
                <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{book.owner?.name || 'Unknown'}</p>
                <Stars value={book.owner?.rating || 0} size={13} />
              </div>
              <Button variant="primary" style={{ marginLeft: 'auto', fontSize: 12, padding: '6px 14px' }} onClick={() => onNavigate('messages')}>
                Message
              </Button>
            </div>

            <SectionLabel>The Story</SectionLabel>
            <p style={s.synopsis}>{book.synopsis || 'No synopsis available for this book.'}</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              <Button variant="outline" style={{ fontSize: 12, padding: '7px 16px' }}>Book Condition</Button>
              <Button variant="primary" onClick={() => onNavigate('loanconfirm', { bookId: book.id })}>Request Loan →</Button>
            </div>
          </div>
        </div>

        <Divider style={{ marginTop: 36 }} />

        <SectionLabel>Recent Reviews</SectionLabel>
        <div style={s.reviews}>
          {reviews.map(r => (
            <div key={r.name} style={s.review}>
              <Avatar initials={r.initials} size={36} />
              <div>
                <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2, color: 'var(--text-primary)' }}>{r.name}</p>
                <Stars value={r.stars} size={12} />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 6 }}>"{r.text}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { padding: '28px 32px', maxWidth: 960, margin: '0 auto' },
  back: {
    background: 'none',
    border: 'none',
    fontSize: 13,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 24,
    padding: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 36,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 14,
    padding: 28,
  },
  left: { display: 'flex', flexDirection: 'column' },
  right: { display: 'flex', flexDirection: 'column' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  meta: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 },
  ownerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--bg-surface)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 20,
  },
  synopsis: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 },
  reviews: { display: 'flex', flexDirection: 'column', gap: 0 },
  review: {
    display: 'flex',
    gap: 12,
    padding: '16px 0',
    borderBottom: '1px solid var(--border-light)',
  },
};
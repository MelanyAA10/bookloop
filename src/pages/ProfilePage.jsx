// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Badge, Stars, BookCover, Card, SectionLabel, Button } from '../components/UI';
import { apiFetch } from '../config/api';

const USER = {
  name: 'Elena Rodriguez',
  handle: '@elena_reads',
  university: 'TEC San Carlos',
  initials: 'ER',
  rating: 4.8,
  books: 12,
  loans: 5,
};

export default function ProfilePage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews] = useState([
    { initials: 'KR', name: 'Kevin Reyes', stars: 5, text: 'Elena is an incredible lender. The book was in perfect condition and she even included helpful bookmarks. Highly recommended!' },
    { initials: 'W', name: 'Wilmar', stars: 5, text: 'Great communication throughout the whole loan period. Very flexible with the return date during finals week — a lifesaver!' },
  ]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/books');
      const data = await response.json();
      const userFiltered = (data.data || []).filter(book =>
        book.owner?.initials === 'ER' || book.owner?.name === 'Elena Rodriguez'
      );
      setUserBooks(userFiltered);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableBooks = userBooks.length > 0 ? userBooks : [
    { color: '#4A1B28', title: 'The Secret', author: 'Donna Tartt', id: 1 },
    { color: '#1A1040', title: "The Handmaid's Tale", author: 'Margaret Atwood', id: 2 },
    { color: '#3A2010', title: 'Beloved', author: 'Toni Morrison', id: 3 },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="profile"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={s.body}>
        <div style={s.banner} />

        <div style={s.layout}>
          <div style={s.left}>
            <Card style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={s.avatar}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#fff' }}>{USER.initials}</span>
              </div>
              <h2 style={s.userName}>{USER.name}</h2>
              <p style={s.userMeta}>{USER.handle} · {USER.university}</p>

              <div style={s.statsRow}>
                <div style={s.stat}>
                  <span style={{ ...s.statNum, color: 'var(--crimson)' }}>{USER.rating}</span>
                  <span style={s.statLabel}>Rating</span>
                </div>
                <div style={s.stat}>
                  <span style={s.statNum}>{USER.books}</span>
                  <span style={s.statLabel}>Books</span>
                </div>
                <div style={s.stat}>
                  <span style={s.statNum}>{USER.loans}</span>
                  <span style={s.statLabel}>Loans</span>
                </div>
              </div>

              <Button variant="full" style={{ marginTop: 4 }} onClick={() => onNavigate('messages')}>
                Message
              </Button>
            </Card>

            <SectionLabel>Available for Loan</SectionLabel>
            {loading ? (
              <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>Cargando libros...</p>
            ) : (
              availableBooks.map(book => (
                <div key={book.title} style={s.bookRow} onClick={() => onNavigate('bookdetail', { id: book.id })}>
                  <BookCover color={book.color} title={book.title} width={44} height={62} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{book.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{book.author}</p>
                    <Badge variant="default" style={{ fontSize: 10 }}>Available</Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={s.right}>
            <h3 style={s.sectionTitle}>Community Feedback</h3>
            {reviews.map(r => (
              <Card key={r.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={s.reviewAvatar}>{r.initials}</div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>{r.name}</p>
                    <Stars value={r.stars} size={12} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>"{r.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { maxWidth: 960, margin: '0 auto', padding: '0 32px 40px' },
  banner: {
    height: 140,
    background: 'linear-gradient(135deg, var(--crimson-dark) 0%, var(--crimson) 50%, var(--crimson-light) 100%)',
    margin: '0 -32px 0',
    borderRadius: '0 0 0 0',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: 28,
    marginTop: -40,
  },
  left: {},
  right: { paddingTop: 50 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--crimson-light), var(--crimson))',
    margin: '0 auto 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  userName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 19,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 2,
  },
  userMeta: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 },
  stat: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' },
  statLabel: { display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 },
  bookRow: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer' },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 16,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--crimson-light), var(--crimson))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
  },
};
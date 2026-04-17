// src/pages/ProfilePage.jsx - Responsive version with dark mode fix
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [reviews] = useState([
    { initials: 'KR', name: 'Kevin Reyes', stars: 5, text: 'Elena is an incredible lender. The book was in perfect condition and she even included helpful bookmarks. Highly recommended!' },
    { initials: 'W', name: 'Wilmar', stars: 5, text: 'Great communication throughout the whole loan period. Very flexible with the return date during finals week — a lifesaver!' },
  ]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { color: '#7A3728', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', id: 1 },
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

        <div style={isMobile ? s.layoutMobile : s.layout}>
          <div style={s.left}>
            <Card style={{ textAlign: 'center', marginBottom: 16, background: '#fff' }}>
              <div style={s.avatar}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#fff' }}>{USER.initials}</span>
              </div>
              <h2 style={s.userName}>{USER.name}</h2>
              <p style={s.userMeta}>{USER.handle} · {USER.university}</p>

              <div style={s.statsRow}>
                <div style={s.stat}>
                  <span style={{ ...s.statNum, color: '#C94040' }}>{USER.rating}</span>
                  <span style={s.statLabel}>Rating</span>
                </div>
                <div style={s.stat}>
                  <span style={{ ...s.statNum, color: '#1A1009' }}>{USER.books}</span>
                  <span style={s.statLabel}>Books</span>
                </div>
                <div style={s.stat}>
                  <span style={{ ...s.statNum, color: '#1A1009' }}>{USER.loans}</span>
                  <span style={s.statLabel}>Loans</span>
                </div>
              </div>

              <Button variant="full" style={{ marginTop: 4 }} onClick={() => onNavigate('messages')}>
                Message
              </Button>
            </Card>

            <div style={{ background: '#fff', borderRadius: 10, padding: '16px', marginTop: 8 }}>
              <SectionLabel>Available for Loan</SectionLabel>
              {loading ? (
                <p style={{ textAlign: 'center', padding: 20, color: '#666' }}>Cargando libros...</p>
              ) : (
                availableBooks.map(book => (
                  <Card 
                    key={book.title} 
                    style={{ 
                      marginBottom: 12, 
                      background: '#fff',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      padding: '12px',
                    }}
                    onClick={() => onNavigate('bookdetail', { id: book.id })}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <BookCover color={book.color} title={book.title} width={56} height={78} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1009', marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>
                          {book.title}
                        </p>
                        <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{book.author}</p>
                        <Badge variant="success" style={{ fontSize: 10, background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }}>
                          Available
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div style={s.right}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px' }}>
              <SectionLabel>Community Feedback</SectionLabel>
              {reviews.map(r => (
                <div key={r.name} style={{ marginBottom: 16, padding: '12px 0', borderBottom: '1px solid #EBE4D7' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={s.reviewAvatar}>{r.initials}</div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 13, color: '#1A1009' }}>{r.name}</p>
                      <Stars value={r.stars} size={12} />
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#444', lineHeight: 1.65, margin: 0 }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { maxWidth: 960, margin: '0 auto', padding: '0 16px 40px' },
  banner: {
    height: 'clamp(100px, 20vw, 140px)',
    background: 'linear-gradient(135deg, #5A0E0E 0%, #8B1C1C 50%, #C94040 100%)',
    margin: '0 -16px 0',
    borderRadius: '0 0 0 0',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: 28,
    marginTop: -40,
  },
  layoutMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    marginTop: -40,
  },
  left: {},
  right: { paddingTop: 50 },
  avatar: {
    width: 'clamp(70px, 15vw, 90px)',
    height: 'clamp(70px, 15vw, 90px)',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C94040, #8B1C1C)',
    margin: '0 auto 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  userName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(17px, 5vw, 19px)',
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 2,
  },
  userMeta: { fontSize: 11, color: '#666', marginBottom: 16 },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 },
  stat: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 600 },
  statLabel: { display: 'block', fontSize: 10, color: '#999', marginTop: 2 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C94040, #8B1C1C)',
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
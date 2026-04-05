// src/pages/ProfilePage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import { Badge, Stars, BookCover, Card, SectionLabel, Button, Divider } from '../components/UI';

const USER = {
  name: 'Elena Rodriguez',
  handle: '@elena_reads',
  university: 'TEC San Carlos',
  initials: 'E',
  rating: 4.8,
  books: 12,
  loans: 5,
};

const AVAILABLE = [
  { color: '#4A1B28', title: 'The Secret',        author: 'Donna Tartt' },
  { color: '#1A1040', title: "The Handmaid's Tale", author: 'Margaret Atwood' },
  { color: '#3A2010', title: 'Beloved',            author: 'Toni Morrison' },
];

const REVIEWS = [
  {
    initials: 'KR', name: 'Kevin Reyes', stars: 5,
    text: 'Elena is an incredible lender. The book was in perfect condition and she even included helpful bookmarks. Highly recommended!',
  },
  {
    initials: 'W', name: 'Wilmar', stars: 5,
    text: 'Great communication throughout the whole loan period. Very flexible with the return date during finals week — a lifesaver!',
  },
];

/**
 * Public profile page
 * Props:
 *   onNavigate – fn(page)
 */
export default function ProfilePage({ onNavigate = () => {} }) {
  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <Navbar activePage="profile" onNavigate={onNavigate} />

      <div style={s.body}>
        {/* Profile header banner */}
        <div style={s.banner} />

        <div style={s.layout}>
          {/* Left column */}
          <div style={s.left}>
            <Card style={{ textAlign: 'center', marginBottom: 16 }}>
              {/* Avatar */}
              <div style={s.avatar}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#fff' }}>{USER.initials}</span>
              </div>
              <h2 style={s.userName}>{USER.name}</h2>
              <p style={s.userMeta}>{USER.handle} · {USER.university}</p>

              {/* Stats */}
              <div style={s.statsRow}>
                {[
                  { val: USER.rating, label: 'Rating', isRating: true },
                  { val: USER.books,  label: 'Books' },
                  { val: USER.loans,  label: 'Loans' },
                ].map(st => (
                  <div key={st.label} style={s.stat}>
                    <span style={{ ...s.statNum, color: st.isRating ? '#8B1C1C' : '#1A1009' }}>{st.val}</span>
                    <span style={s.statLabel}>{st.label}</span>
                  </div>
                ))}
              </div>

              <Button variant="full" style={{ marginTop: 4 }} onClick={() => onNavigate('messages')}>
                Message
              </Button>
            </Card>

            {/* Available books */}
            <SectionLabel>Available for Loan</SectionLabel>
            {AVAILABLE.map(book => (
              <div key={book.title} style={s.bookRow}>
                <BookCover color={book.color} title={book.title} width={44} height={62} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1009', marginBottom: 2 }}>{book.title}</p>
                  <p style={{ fontSize: 11, color: '#9E8B75', marginBottom: 4 }}>{book.author}</p>
                  <Badge variant="default" style={{ fontSize: 10 }}>Available</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Right column — reviews */}
          <div style={s.right}>
            <h3 style={s.sectionTitle}>Community Feedback</h3>
            {REVIEWS.map(r => (
              <Card key={r.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={s.reviewAvatar}>{r.initials}</div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</p>
                    <Stars value={r.stars} size={12} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#5C4A35', lineHeight: 1.65 }}>"{r.text}"</p>
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
    background: 'linear-gradient(135deg, #5A0E0E 0%, #8B1C1C 50%, #C94040 100%)',
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
    fontSize: 19,
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 2,
  },
  userMeta: { fontSize: 11, color: '#9E8B75', marginBottom: 16 },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 },
  stat: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600 },
  statLabel: { display: 'block', fontSize: 10, color: '#9E8B75', marginTop: 2 },
  bookRow: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 16,
  },
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

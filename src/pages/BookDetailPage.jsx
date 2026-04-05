// src/pages/BookDetailPage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import { Badge, Tag, Avatar, Stars, BookCover, SectionLabel, Divider, Button } from '../components/UI';

const BOOK = {
  color: '#7A3728',
  title: 'La Casa de los Espíritus',
  author: 'Isabel Allende',
  year: 1982,
  pages: 450,
  language: 'Spanish',
  genre: 'Fiction',
  synopsis: '"La casa de los espíritus" de Isabel Allende narra la saga de la familia Trueba-Del Valle en Chile durante el siglo XX. The atmosphere is just unmatched. A sweeping, multi-generational epic blending history, love and magical realism.',
  owner: { initials: 'AS', name: 'Aaron Salas', rating: 4.5, maxDays: 18 },
};

const REVIEWS = [
  { initials: 'AS', name: 'Aaron S.', stars: 5, text: 'Juliet is incredibly punctual and the books are always in pristine condition. A pillar of the community!' },
  { initials: 'MR', name: 'Marcus R.', stars: 4, text: 'Great conversation about art history during the handoff. Highly recommended for borrowing from his collection.' },
];

/**
 * Book detail page
 * Props:
 *   onNavigate – fn(page)
 */
export default function BookDetailPage({ onNavigate = () => {} }) {
  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <Navbar activePage="discovery" onNavigate={onNavigate} />

      <div style={s.body}>
        <button style={s.back} onClick={() => onNavigate('discovery')}>← Back to Discovery</button>

        <div style={s.layout}>
          {/* Left: cover + availability */}
          <div style={s.left}>
            <BookCover
              color={BOOK.color}
              title={BOOK.title}
              width={240}
              height={320}
              style={{ borderRadius: 10, boxShadow: '6px 8px 28px rgba(0,0,0,0.22)', width: 240, height: 320 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              <Badge variant="default">Available for Loan</Badge>
              <p style={{ fontSize: 12, color: '#9E8B75' }}>
                Owner: {BOOK.owner.name} · {BOOK.owner.maxDays} days max
              </p>
            </div>
          </div>

          {/* Right: details */}
          <div style={s.right}>
            <h1 style={s.title}>{BOOK.title}</h1>
            <p style={s.meta}>{BOOK.author} · {BOOK.year}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              <Tag>{BOOK.pages} pages</Tag>
              <Tag>{BOOK.language}</Tag>
              <Tag>{BOOK.genre}</Tag>
            </div>

            {/* Owner row */}
            <div style={s.ownerBox}>
              <Avatar initials={BOOK.owner.initials} size={36} />
              <div>
                <p style={{ fontWeight: 500, fontSize: 14 }}>{BOOK.owner.name}</p>
                <Stars value={BOOK.owner.rating} size={13} />
              </div>
              <Button variant="primary" style={{ marginLeft: 'auto', fontSize: 12, padding: '6px 14px' }} onClick={() => onNavigate('messages')}>
                Message
              </Button>
            </div>

            <SectionLabel>The Story</SectionLabel>
            <p style={s.synopsis}>{BOOK.synopsis}</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              <Button variant="outline" style={{ fontSize: 12, padding: '7px 16px' }}>Book Condition</Button>
              <Button variant="primary" onClick={() => onNavigate('loanconfirm')}>Request Loan →</Button>
            </div>
          </div>
        </div>

        <Divider style={{ marginTop: 36 }} />

        {/* Reviews */}
        <SectionLabel>Recent Reviews</SectionLabel>
        <div style={s.reviews}>
          {REVIEWS.map(r => (
            <div key={r.name} style={s.review}>
              <Avatar initials={r.initials} size={36} />
              <div>
                <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{r.name}</p>
                <Stars value={r.stars} size={12} />
                <p style={{ fontSize: 12, color: '#5C4A35', lineHeight: 1.6, marginTop: 6 }}>"{r.text}"</p>
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
    color: '#9E8B75',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 24,
    padding: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 36,
    background: '#fff',
    border: '1px solid #EBE4D7',
    borderRadius: 14,
    padding: 28,
  },
  left: { display: 'flex', flexDirection: 'column' },
  right: { display: 'flex', flexDirection: 'column' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  meta: { fontSize: 14, color: '#9E8B75', marginBottom: 14 },
  ownerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#F3EDE3',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 20,
  },
  synopsis: { fontSize: 13, color: '#5C4A35', lineHeight: 1.7 },
  reviews: { display: 'flex', flexDirection: 'column', gap: 0 },
  review: {
    display: 'flex',
    gap: 12,
    padding: '16px 0',
    borderBottom: '1px solid #EBE4D7',
  },
};

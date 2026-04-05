// src/pages/DiscoveryPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Tag, Badge, Avatar, Stars, BookCover, SectionLabel } from '../components/UI';

const GENRES = ['All', 'Fiction', 'Science', 'History', 'Philosophy', 'Technology', 'Art'];

const FEATURED = {
  color: '#7A3728',
  title: 'La Casa de los Espíritus',
  author: 'Isabel Allende',
  year: 1982,
  pages: 450,
  language: 'Spanish',
  owner: { initials: 'AS', name: 'Aaron Salas', rating: 4.5 },
  synopsis: '"La casa de los espíritus" narra la saga de la familia Trueba-Del Valle en Chile durante el siglo XX. Una obra maestra del realismo mágico latinoamericano.',
};

const ALSO_AVAILABLE = [
  { color: '#4A3060', title: 'Song of Achilles' },
  { color: '#1A3C5A', title: 'The Secret' },
];

const RECENT = [
  { color: '#6B3428', title: 'Cien Años de Soledad', author: 'García Márquez' },
  { color: '#2D4A2D', title: 'El Alquimista',        author: 'Paulo Coelho' },
  { color: '#3A2855', title: 'Dune',                  author: 'Frank Herbert' },
  { color: '#1A3850', title: '1984',                  author: 'George Orwell' },
  { color: '#5C3A1A', title: 'Don Quijote',           author: 'M. de Cervantes' },
  { color: '#2A4A3A', title: 'El Principito',         author: 'Antoine de S.-E.' },
  { color: '#4A2030', title: 'Rayuela',               author: 'Julio Cortázar' },
  { color: '#303050', title: 'Ficciones',             author: 'Jorge L. Borges' },
];

/**
 * Discovery page — main browse view
 * Props:
 *   onNavigate   – fn(page, data?)
 */
export default function DiscoveryPage({ onNavigate = () => {} }) {
  const [activeGenre, setActiveGenre] = useState('All');

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <Navbar activePage="discovery" onNavigate={onNavigate} />

      <div style={s.body}>
        {/* Search + filter row */}
        <div style={s.searchRow}>
          <input
            style={s.searchInput}
            placeholder="Search by title, author, or ISBN…"
          />
          <div style={s.genreTags}>
            {GENRES.map(g => (
              <Tag key={g} active={activeGenre === g} onClick={() => setActiveGenre(g)}>{g}</Tag>
            ))}
            <Tag>+ Filters</Tag>
          </div>
        </div>

        {/* Featured highlight */}
        <div style={s.featured}>
          {/* Large cover */}
          <BookCover color={FEATURED.color} title={FEATURED.title} width={200} height={280} style={{ borderRadius: 10, boxShadow: '4px 6px 24px rgba(0,0,0,0.25)' }} />

          {/* Detail */}
          <div style={s.featuredInfo}>
            <Badge variant="default" style={{ marginBottom: 10 }}>Featured Today</Badge>
            <h2 style={s.featuredTitle}>{FEATURED.title}</h2>
            <p style={s.featuredMeta}>{FEATURED.author} · {FEATURED.year}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <Tag>{FEATURED.pages} pages</Tag>
              <Tag>{FEATURED.language}</Tag>
              <Tag>Fiction</Tag>
            </div>
            <div style={s.ownerRow}>
              <Avatar initials={FEATURED.owner.initials} size={28} />
              <span style={{ fontSize: 13, color: '#5C4A35' }}>{FEATURED.owner.name}</span>
              <Stars value={FEATURED.owner.rating} size={12} />
            </div>
            <SectionLabel style={{ marginTop: 14 }}>The Story</SectionLabel>
            <p style={s.synopsis}>{FEATURED.synopsis}</p>
            <div style={s.featuredActions}>
              <button style={s.btnOutline}>Book Info</button>
              <button style={s.btnOutline}>Condition</button>
              <button style={s.btnPrimary} onClick={() => onNavigate('bookdetail')}>Request Loan →</button>
            </div>
          </div>

          {/* Also available sidebar */}
          <div style={s.sidebar}>
            <SectionLabel>Also Available</SectionLabel>
            {ALSO_AVAILABLE.map(b => (
              <BookCover
                key={b.title}
                color={b.color}
                title={b.title}
                width="100%"
                height={148}
                style={{ borderRadius: 8, cursor: 'pointer', marginBottom: 10, width: '100%' }}
              />
            ))}
          </div>
        </div>

        {/* Recent additions grid */}
        <div style={{ marginTop: 36 }}>
          <SectionLabel style={{ marginBottom: 16, fontSize: 12 }}>Recent Additions</SectionLabel>
          <div style={s.grid}>
            {RECENT.map(book => (
              <div key={book.title} style={s.gridItem} onClick={() => onNavigate('bookdetail')}>
                <BookCover color={book.color} title={book.title} width="100%" height={130} style={{ borderRadius: 8, cursor: 'pointer', width: '100%' }} />
                <p style={s.gridTitle}>{book.title}</p>
                <p style={s.gridAuthor}>{book.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto' },
  searchRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  searchInput: {
    padding: '10px 16px',
    border: '1.5px solid #D9CFC0',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    background: '#fff',
    color: '#1A1009',
    minWidth: 260,
    outline: 'none',
  },
  genreTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  featured: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr 200px',
    gap: 28,
    background: '#fff',
    border: '1px solid #EBE4D7',
    borderRadius: 14,
    padding: 28,
    boxShadow: '0 4px 20px rgba(26,16,9,0.07)',
  },
  featuredInfo: { display: 'flex', flexDirection: 'column' },
  featuredTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 4,
    lineHeight: 1.3,
  },
  featuredMeta: { fontSize: 13, color: '#9E8B75', marginBottom: 12 },
  ownerRow: { display: 'flex', alignItems: 'center', gap: 8 },
  synopsis: { fontSize: 13, color: '#5C4A35', lineHeight: 1.7, marginBottom: 20 },
  featuredActions: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' },
  btnOutline: {
    background: 'transparent',
    border: '1.5px solid #8B1C1C',
    color: '#8B1C1C',
    padding: '7px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnPrimary: {
    background: '#C94040',
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
  gridTitle: { fontSize: 12, fontWeight: 500, color: '#1A1009', lineHeight: 1.3 },
  gridAuthor: { fontSize: 11, color: '#9E8B75' },
};

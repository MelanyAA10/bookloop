// src/pages/CommunityPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Avatar, Tag, Stars, BookCover, Card, SectionLabel, Button } from '../components/UI';

const FILTERS = ['All', 'Reviews', 'Recommendations', 'Authors'];

const POSTS = [
  {
    initials: 'ER', name: 'Elena Rodriguez', time: '2h ago',
    title: '"Cien Años de Soledad" changed my perspective on storytelling',
    body: 'After finishing García Márquez\'s masterpiece, I can\'t stop thinking about the way he blends history with magical elements. Has anyone read "Love in the Time of Cholera"? Is it as profound?',
    likes: 24, comments: 8, tag: 'Reviews',
  },
  {
    initials: 'MT', name: 'Marcus Thorne', time: '5h ago',
    title: 'Looking for recommendations in Philosophy — especially Stoicism',
    body: 'I\'ve finished Meditations by Marcus Aurelius and absolutely loved it. What should I pick up next? Preferably something available in the BookLoop network here at TEC.',
    likes: 16, comments: 12, tag: 'Recommendations',
  },
  {
    initials: 'LT', name: 'Liam Tuan', time: '1d ago',
    title: 'Hosting a reading group: "Dune" by Frank Herbert',
    body: 'Starting a weekly reading group for Dune. We\'ll meet on Thursdays at the library. DM me if you want to join! I have two copies available for loan.',
    likes: 31, comments: 5, tag: 'Community',
  },
  {
    initials: 'SF', name: 'Sofia Mendez', time: '2d ago',
    title: 'Fantastic borrowing experience with Aaron Salas',
    body: 'Just returned "La Casa de los Espíritus" and I have to say — this is what BookLoop is all about. Impeccable condition, great conversation. Left a 5-star review!',
    likes: 19, comments: 3, tag: 'Reviews',
  },
];

const TRENDING = [
  { color: '#6B3428', title: 'Cien Años', author: 'García Márquez' },
  { color: '#3A2855', title: 'Dune', author: 'Frank Herbert' },
  { color: '#1A3850', title: '1984', author: 'George Orwell' },
];

/**
 * Community / Forum page
 * Props:
 *   onNavigate – fn(page)
 */
export default function CommunityPage({ onNavigate = () => {} }) {
  const [filter, setFilter] = useState('All');

  const visible = POSTS.filter(p => filter === 'All' || p.tag === filter);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <Navbar activePage="community" onNavigate={onNavigate} />

      <div style={s.body}>
        <div style={s.layout}>
          {/* Feed */}
          <div style={s.feed}>
            <div style={s.feedTop}>
              <h2 style={s.feedTitle}>Community</h2>
              <Button variant="primary" style={{ fontSize: 12, padding: '7px 14px' }}>+ New Post</Button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <Tag key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Tag>
              ))}
            </div>

            {visible.map(post => (
              <div key={post.title} style={s.postCard}>
                <div style={s.postHeader}>
                  <Avatar initials={post.initials} size={36} />
                  <div>
                    <p style={s.postAuthor}>{post.name}</p>
                    <p style={s.postTime}>{post.time}</p>
                  </div>
                  <Tag style={{ marginLeft: 'auto', fontSize: 10 }}>{post.tag}</Tag>
                </div>
                <h3 style={s.postTitle}>{post.title}</h3>
                <p style={s.postBody}>{post.body}</p>
                <div style={s.postActions}>
                  <button style={s.actionBtn}> ♥ {post.likes}</button>
                  <button style={s.actionBtn}>💬 {post.comments}</button>
                  <button style={s.actionBtn}>↗ Share</button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={s.sidebar}>
            <Card style={{ marginBottom: 16 }}>
              <SectionLabel>Community Stats</SectionLabel>
              <div style={s.statsGrid}>
                {[['2 400+', 'Books'], ['180+', 'Readers'], ['98%', 'Returns'], ['4.7★', 'Avg rating']].map(([n, l]) => (
                  <div key={l} style={s.statItem}>
                    <span style={s.statNum}>{n}</span>
                    <span style={s.statLabel}>{l}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionLabel>Trending Books</SectionLabel>
              {TRENDING.map(book => (
                <div key={book.title} style={s.trendItem}>
                  <BookCover color={book.color} title={book.title} width={40} height={56} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#1A1009' }}>{book.title}</p>
                    <p style={{ fontSize: 11, color: '#9E8B75' }}>{book.author}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { padding: '28px 32px', maxWidth: 1100, margin: '0 auto' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 270px', gap: 24 },
  feed: {},
  feedTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  feedTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#1A1009',
  },
  postCard: {
    background: '#fff',
    border: '1px solid #EBE4D7',
    borderRadius: 10,
    padding: '16px 18px',
    marginBottom: 12,
    boxShadow: '0 1px 6px rgba(26,16,9,0.05)',
  },
  postHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 },
  postAuthor: { fontWeight: 500, fontSize: 13, color: '#1A1009' },
  postTime: { fontSize: 11, color: '#9E8B75' },
  postTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 15,
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  postBody: { fontSize: 13, color: '#5C4A35', lineHeight: 1.65, marginBottom: 14 },
  postActions: { display: 'flex', gap: 8 },
  actionBtn: {
    background: '#F3EDE3',
    border: 'none',
    borderRadius: 16,
    padding: '5px 12px',
    fontSize: 12,
    color: '#5C4A35',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: 'background 0.18s',
  },
  sidebar: {},
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statItem: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#8B1C1C' },
  statLabel: { display: 'block', fontSize: 10, color: '#9E8B75', marginTop: 2 },
  trendItem: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 },
};

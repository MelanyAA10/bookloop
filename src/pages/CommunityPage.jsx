// src/pages/CommunityPage.jsx - Responsive version with dark mode fix
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar, Tag, BookCover, Card, SectionLabel, Button } from '../components/UI';
import { apiFetch } from '../config/api';

export default function CommunityPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', tag: 'Reviews' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/community/posts');
      const data = await response.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }
    const postData = {
      id: posts.length + 1, initials: 'JR', name: 'Juliet Ramos', time: 'Justo ahora',
      title: newPost.title, body: newPost.body, likes: 0, comments: 0, tag: newPost.tag
    };
    setPosts([postData, ...posts]);
    setNewPost({ title: '', body: '', tag: 'Reviews' });
    setShowNewPost(false);
  };

  const stats = [
    { number: '2 400+', label: 'Books' }, { number: '180+', label: 'Readers' },
    { number: '98%', label: 'Returns' }, { number: '4.7★', label: 'Avg rating' }
  ];

  const trending = [
    { color: '#6B3428', title: 'Cien Años', author: 'García Márquez' },
    { color: '#3A2855', title: 'Dune', author: 'Frank Herbert' },
    { color: '#1A3850', title: '1984', author: 'George Orwell' },
  ];

  // Sample posts for when API returns empty
  const samplePosts = [
    { initials: 'ER', name: 'Elena Rodriguez', time: '2h ago', title: 'Cien Años de Soledad changed my perspective', body: 'After finishing García Márquez\'s masterpiece, I can\'t stop thinking about the way he blends history with magical elements.', likes: 24, comments: 8, tag: 'Reviews' },
    { initials: 'MT', name: 'Marcus Thorne', time: '5h ago', title: 'Looking for recommendations in Philosophy', body: 'I\'ve finished Meditations by Marcus Aurelius and absolutely loved it. Any similar works?', likes: 16, comments: 12, tag: 'Recommendations' },
    { initials: 'LT', name: 'Liam Tuan', time: '1d ago', title: 'Hosting a reading group: Dune', body: 'Starting a weekly reading group for Dune. We\'ll meet on Thursdays at the library. All are welcome!', likes: 31, comments: 5, tag: 'Community' },
    { initials: 'AS', name: 'Aaron Salas', time: '3h ago', title: 'Recommendations', body: 'Looking for classic sci-fi recommendations similar to Asimov.', likes: 12, comments: 4, tag: 'Recommendations' },
  ];

  const displayPosts = posts.length > 0 ? posts : samplePosts;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="community"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={s.body}>
        <div style={isMobile ? s.layoutMobile : s.layout}>
          <div style={s.feed}>
            <div style={s.feedTop}>
              <h2 style={s.feedTitle}>Community</h2>
              <Button variant="primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setShowNewPost(true)}>
                + New Post
              </Button>
            </div>

            {showNewPost && (
              <div style={s.modalOverlay}>
                <div style={s.modal}>
                  <h3 style={s.modalTitle}>Create New Post</h3>
                  <input style={s.modalInput} placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                  <textarea style={s.modalTextarea} placeholder="What's on your mind?" value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })} />
                  <select style={s.modalSelect} value={newPost.tag} onChange={(e) => setNewPost({ ...newPost, tag: e.target.value })}>
                    <option value="Reviews">Reviews</option>
                    <option value="Recommendations">Recommendations</option>
                    <option value="Community">Community</option>
                    <option value="Authors">Authors</option>
                  </select>
                  <div style={s.modalActions}>
                    <button style={s.modalCancel} onClick={() => setShowNewPost(false)}>Cancel</button>
                    <button style={s.modalSubmit} onClick={handleNewPost}>Post</button>
                  </div>
                </div>
              </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Cargando posts...</div>}

            {!loading && displayPosts.map((post, idx) => (
              <div key={post.title + idx} style={s.postCard}>
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

          {!isMobile && (
            <div style={s.sidebar}>
              <Card style={{ marginBottom: 16 }}>
                <SectionLabel>Community Stats</SectionLabel>
                <div style={s.statsGrid}>
                  {stats.map(stat => (
                    <div key={stat.label} style={s.statItem}>
                      <span style={s.statNum}>{stat.number}</span>
                      <span style={s.statLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionLabel>Trending Books</SectionLabel>
                {trending.map(book => (
                  <div key={book.title} style={s.trendItem}>
                    <BookCover color={book.color} title={book.title} width={40} height={56} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#1A1009' }}>{book.title}</p>
                      <p style={{ fontSize: 11, color: '#666' }}>{book.author}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { padding: '20px 16px', maxWidth: 1100, margin: '0 auto' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 270px', gap: 24 },
  layoutMobile: { display: 'flex', flexDirection: 'column' },
  feed: {},
  feedTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  feedTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 22px)', fontWeight: 600, color: '#1A1009' },
  postCard: {
    background: '#fff',
    border: '1px solid #EBE4D7',
    borderRadius: 10,
    padding: '14px',
    marginBottom: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  postHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  postAuthor: { fontWeight: 500, fontSize: 13, color: '#1A1009' },
  postTime: { fontSize: 11, color: '#999' },
  postTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1A1009', marginBottom: 8, lineHeight: 1.3 },
  postBody: { fontSize: 13, color: '#444', lineHeight: 1.65, marginBottom: 14 },
  postActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    background: '#F5F0E8',
    border: 'none',
    borderRadius: 16,
    padding: '5px 12px',
    fontSize: 12,
    color: '#555',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  sidebar: {},
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statItem: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#C94040' },
  statLabel: { display: 'block', fontSize: 10, color: '#999', marginTop: 2 },
  trendItem: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
  },
  modal: { background: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 500 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1A1009' },
  modalInput: { width: '100%', padding: '10px 12px', border: '1.5px solid #D9CFC0', borderRadius: 6, fontSize: 13, marginBottom: 12, background: '#fff', color: '#1A1009' },
  modalTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid #D9CFC0', borderRadius: 6, fontSize: 13, minHeight: 100, marginBottom: 12, background: '#fff', color: '#1A1009' },
  modalSelect: { width: '100%', padding: '10px 12px', border: '1.5px solid #D9CFC0', borderRadius: 6, fontSize: 13, marginBottom: 16, background: '#fff', color: '#1A1009' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' },
  modalCancel: { padding: '8px 16px', background: '#F3EDE3', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#555' },
  modalSubmit: { padding: '8px 16px', background: '#C94040', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
};
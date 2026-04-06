// src/pages/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar, Tag, BookCover, Card, SectionLabel, Button } from '../components/UI';

const API_URL = 'https://bookloop-api.azure-api.net/v1';
const API_KEY = '6f463ca55cfe4e258de8819701678fda';

const FILTERS = ['All', 'Reviews', 'Recommendations', 'Authors', 'Community'];

export default function CommunityPage({ onNavigate = () => {} }) {
  const [filter, setFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', tag: 'Reviews' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/community/posts?subscription-key=${API_KEY}`);
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

  const visible = posts.filter(p => filter === 'All' || p.tag === filter);

  const stats = [
    { number: '2 400+', label: 'Books' }, { number: '180+', label: 'Readers' },
    { number: '98%', label: 'Returns' }, { number: '4.7★', label: 'Avg rating' }
  ];

  const trending = [
    { color: '#6B3428', title: 'Cien Años', author: 'García Márquez' },
    { color: '#3A2855', title: 'Dune', author: 'Frank Herbert' },
    { color: '#1A3850', title: '1984', author: 'George Orwell' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar activePage="community" onNavigate={onNavigate} />

      <div style={s.body}>
        <div style={s.layout}>
          <div style={s.feed}>
            <div style={s.feedTop}>
              <h2 style={s.feedTitle}>Community</h2>
              <Button variant="primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setShowNewPost(true)}>
                + New Post
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <Tag key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Tag>
              ))}
            </div>

            {showNewPost && (
              <div style={s.modalOverlay}>
                <div style={s.modal}>
                  <h3 style={s.modalTitle}>Create New Post</h3>
                  <input style={s.modalInput} placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                  <textarea style={s.modalTextarea} placeholder="What's on your mind?" value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })} />
                  <select style={s.modalSelect} value={newPost.tag} onChange={(e) => setNewPost({ ...newPost, tag: e.target.value })}>
                    <option value="Reviews">Reviews</option><option value="Recommendations">Recommendations</option>
                    <option value="Community">Community</option><option value="Authors">Authors</option>
                  </select>
                  <div style={s.modalActions}>
                    <button style={s.modalCancel} onClick={() => setShowNewPost(false)}>Cancel</button>
                    <button style={s.modalSubmit} onClick={handleNewPost}>Post</button>
                  </div>
                </div>
              </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Cargando posts...</div>}

            {!loading && visible.map(post => (
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
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{book.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author}</p>
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
  feedTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' },
  postCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 10,
    padding: '16px 18px',
    marginBottom: 12,
    boxShadow: 'var(--shadow)',
  },
  postHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 },
  postAuthor: { fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' },
  postTime: { fontSize: 11, color: 'var(--text-muted)' },
  postTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 },
  postBody: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 },
  postActions: { display: 'flex', gap: 8 },
  actionBtn: {
    background: 'var(--bg-surface)',
    border: 'none',
    borderRadius: 16,
    padding: '5px 12px',
    fontSize: 12,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  sidebar: {},
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statItem: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--crimson)' },
  statLabel: { display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 },
  trendItem: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: { background: 'var(--bg-secondary)', borderRadius: 12, padding: 24, width: '90%', maxWidth: 500 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' },
  modalInput: { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, marginBottom: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  modalTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, minHeight: 100, marginBottom: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  modalSelect: { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, marginBottom: 16, background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  modalCancel: { padding: '8px 16px', background: 'var(--bg-surface)', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--text-secondary)' },
  modalSubmit: { padding: '8px 16px', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
};
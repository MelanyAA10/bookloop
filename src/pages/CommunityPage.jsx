// src/pages/CommunityPage.jsx - Con soporte completo para modo oscuro
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar, Tag, BookCover, Card, SectionLabel, Button } from '../components/UI';
import { apiFetch, getBookImageUrl } from '../config/api';

export default function CommunityPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', tag: 'Reviews' });
  const [submitting, setSubmitting] = useState(false);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTrending();
    fetchStats();
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

  const fetchTrending = async () => {
    try {
      const response = await apiFetch('/books');
      const result = await response.json();
      const booksList = Array.isArray(result) ? result : (result.data || []);
      setTrendingBooks(booksList.slice(0, 3));
    } catch (error) {
      console.error('Error fetching trending books:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiFetch('/community/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Datos de ejemplo si la API falla
      setStats({
        'Books': '2,400+',
        'Readers': '180+',
        'Returns': '98%',
        'Rating': '4.7★'
      });
    }
  };

  const handleNewPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch('/community/posts', {
        method: 'POST',
        body: JSON.stringify({ title: newPost.title, body: newPost.body, tag: newPost.tag }),
      });
      const created = await response.json();
      setPosts(prev => [created, ...prev]);
      setNewPost({ title: '', body: '', tag: 'Reviews' });
      setShowNewPost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
              <h2 style={{ ...s.feedTitle, color: 'var(--text-primary)' }}>Community</h2>
              <Button variant="primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setShowNewPost(true)}>
                + New Post
              </Button>
            </div>

            {showNewPost && (
              <div style={s.modalOverlay}>
                <div style={{ ...s.modal, background: 'var(--bg-secondary)' }}>
                  <h3 style={{ ...s.modalTitle, color: 'var(--text-primary)' }}>Create New Post</h3>
                  <input 
                    style={{ ...s.modalInput, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} 
                    placeholder="Title" 
                    value={newPost.title} 
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} 
                  />
                  <textarea 
                    style={{ ...s.modalTextarea, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} 
                    placeholder="What's on your mind?" 
                    value={newPost.body} 
                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })} 
                  />
                  <select 
                    style={{ ...s.modalSelect, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} 
                    value={newPost.tag} 
                    onChange={(e) => setNewPost({ ...newPost, tag: e.target.value })}
                  >
                    <option value="Reviews">Reviews</option>
                    <option value="Recommendations">Recommendations</option>
                    <option value="Community">Community</option>
                    <option value="Authors">Authors</option>
                  </select>
                  <div style={s.modalActions}>
                    <button style={{ ...s.modalCancel, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }} onClick={() => setShowNewPost(false)}>Cancel</button>
                    <button style={s.modalSubmit} onClick={handleNewPost} disabled={submitting}>
                      {submitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                Cargando posts...
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div style={s.emptyState}>
                <p style={{ ...s.emptyTitle, color: 'var(--text-primary)' }}>No posts yet</p>
                <p style={{ ...s.emptySubtitle, color: 'var(--text-muted)' }}>Be the first to start a conversation.</p>
                <Button variant="primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setShowNewPost(true)}>
                  + New Post
                </Button>
              </div>
            )}

            {!loading && posts.map((post, idx) => (
              <div key={post.id || post.title + idx} style={{ ...s.postCard, background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div style={s.postHeader}>
                  <Avatar initials={post.initials} size={36} />
                  <div>
                    <p style={{ ...s.postAuthor, color: 'var(--text-primary)' }}>{post.name}</p>
                    <p style={{ ...s.postTime, color: 'var(--text-muted)' }}>{post.time}</p>
                  </div>
                  <Tag style={{ marginLeft: 'auto', fontSize: 10 }}>{post.tag}</Tag>
                </div>
                <h3 style={{ ...s.postTitle, color: 'var(--text-primary)' }}>{post.title}</h3>
                <p style={{ ...s.postBody, color: 'var(--text-secondary)' }}>{post.body}</p>
                <div style={s.postActions}>
                  <button style={{ ...s.actionBtn, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>♥ {post.likes}</button>
                  <button style={{ ...s.actionBtn, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>💬 {post.comments}</button>
                  <button style={{ ...s.actionBtn, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>↗ Share</button>
                </div>
              </div>
            ))}
          </div>

          {!isMobile && (
            <div style={s.sidebar}>
              {stats && (
                <Card style={{ 
                  marginBottom: 16, 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-light)' 
                }}>
                  <SectionLabel>Community Stats</SectionLabel>
                  <div style={s.statsGrid}>
                    {Object.entries(stats).map(([label, number]) => (
                      <div key={label} style={s.statItem}>
                        <span style={{ ...s.statNum, color: 'var(--crimson-light)' }}>{number}</span>
                        <span style={{ ...s.statLabel, color: 'var(--text-muted)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {trendingBooks.length > 0 && (
                <Card style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-light)' 
                }}>
                  <SectionLabel>Trending Books</SectionLabel>
                  {trendingBooks.map(book => (
                    <div
                      key={book.id}
                      style={s.trendItem}
                      onClick={() => onNavigate('bookdetail', { id: book.id })}
                    >
                      <BookCover
                        color={book.color}
                        title={book.title}
                        imageUrl={getBookImageUrl(book)}
                        width={40}
                        height={56}
                        style={{ borderRadius: 4, flexShrink: 0 }}
                      />
                      <div style={s.trendInfo}>
                        <p style={{ ...s.trendTitle, color: 'var(--text-primary)' }}>{book.title}</p>
                        <p style={{ ...s.trendAuthor, color: 'var(--text-muted)' }}>{book.author}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Versión móvil de Trending Books */}
      {isMobile && trendingBooks.length > 0 && (
        <div style={{ ...s.mobileTrending, background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', marginTop: 20 }}>
          <SectionLabel>Trending Books</SectionLabel>
          {trendingBooks.map(book => (
            <div
              key={book.id}
              style={s.trendItem}
              onClick={() => onNavigate('bookdetail', { id: book.id })}
            >
              <BookCover
                color={book.color}
                title={book.title}
                imageUrl={getBookImageUrl(book)}
                width={40}
                height={56}
                style={{ borderRadius: 4, flexShrink: 0 }}
              />
              <div style={s.trendInfo}>
                <p style={{ ...s.trendTitle, color: 'var(--text-primary)' }}>{book.title}</p>
                <p style={{ ...s.trendAuthor, color: 'var(--text-muted)' }}>{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  body: { padding: '20px 16px', maxWidth: 1100, margin: '0 auto' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 },
  layoutMobile: { display: 'flex', flexDirection: 'column' },
  feed: {},
  feedTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  feedTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 22px)', fontWeight: 600 },
  postCard: {
    border: '1px solid',
    borderRadius: 10,
    padding: '14px',
    marginBottom: 12,
    boxShadow: 'var(--shadow)',
  },
  postHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  postAuthor: { fontWeight: 500, fontSize: 13 },
  postTime: { fontSize: 11 },
  postTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 },
  postBody: { fontSize: 13, lineHeight: 1.65, marginBottom: 14 },
  postActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    border: 'none',
    borderRadius: 16,
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 10, textAlign: 'center' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, margin: 0 },
  emptySubtitle: { fontSize: 13, margin: 0 },
  sidebar: {},
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statItem: { textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 },
  statLabel: { display: 'block', fontSize: 10, marginTop: 2 },
  trendItem: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, cursor: 'pointer' },
  trendInfo: { flex: 1, minWidth: 0 },
  trendTitle: { fontSize: 12, fontWeight: 500, marginBottom: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  trendAuthor: { fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  mobileTrending: { margin: '20px 16px 0', padding: 16, border: '1px solid', borderRadius: 10 },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
  },
  modal: { borderRadius: 12, padding: 20, width: '90%', maxWidth: 500 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, marginBottom: 16 },
  modalInput: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 6, fontSize: 13, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  modalTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 6, fontSize: 13, minHeight: 100, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  modalSelect: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 6, fontSize: 13, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' },
  modalCancel: { padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  modalSubmit: { padding: '8px 16px', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};
// src/pages/CommunityPage.jsx - Con soporte completo para modo oscuro
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar, Tag, BookCover, Card, SectionLabel, Button } from '../components/UI';
import { apiFetch, getBookImageUrl } from '../config/api';

const PAGE_SIZE = 10;

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};

const timeAgo = (iso) => {
  if (!iso) return '';
  let str = iso;
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(str)) str += 'Z';
  const then = new Date(str);
  if (isNaN(then.getTime())) return '';
  let secs = Math.floor((Date.now() - then.getTime()) / 1000);
  if (secs < 0) secs = 0;
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const mapPost = (p) => ({
  id: p.id,
  name: p.author,
  initials: getInitials(p.author),
  time: timeAgo(p.created_at),
  title: p.title,
  body: p.content,
  tag: p.category,
  likes: p.likes ?? 0,
  comments: p.comments_count ?? 0,
});

export default function CommunityPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ author: '', title: '', body: '', tag: 'Reviews' });
  const [submitting, setSubmitting] = useState(false);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Estado de comentarios ---
  const [openComments, setOpenComments] = useState(null);   // id del post abierto (o null)
  const [commentsByPost, setCommentsByPost] = useState({}); // { [postId]: [comentarios] }
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
    fetchTrending();
  }, [currentPage]);

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/posts/${page}/${PAGE_SIZE}`);
      const data = await response.json();
      const normalized = (data.content || []).map(mapPost);
      setPosts(normalized);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
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

  const handleNewPost = async () => {
    if (!newPost.author.trim() || !newPost.title.trim() || !newPost.body.trim()) {
      alert('Por favor completa autor, título y contenido');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          author: newPost.author,
          category: newPost.tag,
          title: newPost.title,
          content: newPost.body,
        }),
      });
      if (!response.ok) throw new Error('status ' + response.status);
      setNewPost({ author: '', title: '', body: '', tag: 'Reviews' });
      setShowNewPost(false);
      if (currentPage === 1) fetchPosts(1);
      else setCurrentPage(1);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('No se pudo crear el post. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await apiFetch(`/posts/${postId}/like`, { method: 'POST' });
      if (!response.ok) return;
      const updated = await response.json();
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, likes: updated.likes } : p)));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // --- Comentarios ---
  const toggleComments = async (postId) => {
    if (openComments === postId) {
      setOpenComments(null); // ya abierto -> cerrar
      return;
    }
    setOpenComments(postId);
    setNewComment({ author: '', content: '' });
    // cargar comentarios si aún no se han cargado
    if (!commentsByPost[postId]) {
      setCommentsLoading(true);
      try {
        const response = await apiFetch(`/posts/${postId}/comments`);
        const data = await response.json();
        setCommentsByPost(prev => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
      } catch (error) {
        console.error('Error fetching comments:', error);
        setCommentsByPost(prev => ({ ...prev, [postId]: [] }));
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleNewComment = async (postId) => {
    if (!newComment.author.trim() || !newComment.content.trim()) {
      alert('Escribe tu nombre y un comentario');
      return;
    }
    setCommentSubmitting(true);
    try {
      const response = await apiFetch(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ author: newComment.author, content: newComment.content }),
      });
      if (!response.ok) throw new Error('status ' + response.status);
      const created = await response.json();
      // agregar a la lista
      setCommentsByPost(prev => ({ ...prev, [postId]: [...(prev[postId] || []), created] }));
      // subir el contador del post
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
      setNewComment({ author: '', content: '' });
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('No se pudo enviar el comentario. Intenta de nuevo.');
    } finally {
      setCommentSubmitting(false);
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
                    placeholder="Your name"
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                  />
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
                  <button
                    style={{ ...s.actionBtn, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                    onClick={() => handleLike(post.id)}
                  >
                    ♥ {post.likes}
                  </button>
                  <button
                    style={{ ...s.actionBtn, background: openComments === post.id ? 'var(--crimson)' : 'var(--bg-surface)', color: openComments === post.id ? '#fff' : 'var(--text-secondary)' }}
                    onClick={() => toggleComments(post.id)}
                  >
                    💬 {post.comments}
                  </button>
                </div>

                {/* --- Acordeón de comentarios --- */}
                {openComments === post.id && (
                  <div style={{ ...s.commentsSection, borderColor: 'var(--border-light)' }}>
                    {commentsLoading && !commentsByPost[post.id] && (
                      <p style={{ ...s.commentMuted, color: 'var(--text-muted)' }}>Cargando comentarios...</p>
                    )}

                    {commentsByPost[post.id] && commentsByPost[post.id].length === 0 && (
                      <p style={{ ...s.commentMuted, color: 'var(--text-muted)' }}>Sé el primero en comentar.</p>
                    )}

                    {(commentsByPost[post.id] || []).map((c) => (
                      <div key={c.id} style={s.commentItem}>
                        <Avatar initials={getInitials(c.author)} size={28} />
                        <div style={s.commentContent}>
                          <p style={{ ...s.commentAuthor, color: 'var(--text-primary)' }}>
                            {c.author} <span style={{ ...s.commentTime, color: 'var(--text-muted)' }}>· {timeAgo(c.created_at)}</span>
                          </p>
                          <p style={{ ...s.commentText, color: 'var(--text-secondary)' }}>{c.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Formulario nuevo comentario */}
                    <div style={s.commentForm}>
                      <input
                        style={{ ...s.commentInput, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                        placeholder="Tu nombre"
                        value={newComment.author}
                        onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                      />
                      <textarea
                        style={{ ...s.commentTextarea, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                        placeholder="Escribe un comentario..."
                        value={newComment.content}
                        onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      />
                      <button
                        style={{ ...s.commentSubmit, opacity: commentSubmitting ? 0.6 : 1 }}
                        onClick={() => handleNewComment(post.id)}
                        disabled={commentSubmitting}
                      >
                        {commentSubmitting ? 'Enviando...' : 'Comentar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!loading && totalPages > 1 && (
              <div style={s.pagination}>
                <button
                  style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  style={{ ...s.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {!isMobile && (
            <div style={s.sidebar}>
              {trendingBooks.length > 0 && (
                <Card style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <SectionLabel>Trending Books</SectionLabel>
                  {trendingBooks.map(book => (
                    <div key={book.id} style={s.trendItem} onClick={() => onNavigate('bookdetail', { id: book.id })}>
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

      {isMobile && trendingBooks.length > 0 && (
        <div style={{ ...s.mobileTrending, background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', marginTop: 20 }}>
          <SectionLabel>Trending Books</SectionLabel>
          {trendingBooks.map(book => (
            <div key={book.id} style={s.trendItem} onClick={() => onNavigate('bookdetail', { id: book.id })}>
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
  postCard: { border: '1px solid', borderRadius: 10, padding: '14px', marginBottom: 12, boxShadow: 'var(--shadow)' },
  postHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  postAuthor: { fontWeight: 500, fontSize: 13 },
  postTime: { fontSize: 11 },
  postTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 },
  postBody: { fontSize: 13, lineHeight: 1.65, marginBottom: 14 },
  postActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  actionBtn: { border: 'none', borderRadius: 16, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
  commentsSection: { marginTop: 14, paddingTop: 14, borderTop: '1px solid' },
  commentMuted: { fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
  commentItem: { display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-start' },
  commentContent: { flex: 1, minWidth: 0 },
  commentAuthor: { fontSize: 12, fontWeight: 600, marginBottom: 2 },
  commentTime: { fontSize: 11, fontWeight: 400 },
  commentText: { fontSize: 13, lineHeight: 1.5 },
  commentForm: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  commentInput: { width: '100%', padding: '8px 10px', border: '1.5px solid', borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
  commentTextarea: { width: '100%', padding: '8px 10px', border: '1.5px solid', borderRadius: 6, fontSize: 12, minHeight: 60, fontFamily: "'DM Sans', sans-serif" },
  commentSubmit: { alignSelf: 'flex-end', padding: '7px 16px', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 10, textAlign: 'center' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, margin: 0 },
  emptySubtitle: { fontSize: 13, margin: 0 },
  sidebar: {},
  trendItem: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, cursor: 'pointer' },
  trendInfo: { flex: 1, minWidth: 0 },
  trendTitle: { fontSize: 12, fontWeight: 500, marginBottom: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  trendAuthor: { fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  mobileTrending: { margin: '20px 16px 0', padding: 16, border: '1px solid', borderRadius: 10 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20, marginBottom: 8 },
  pageBtn: { border: 'none', borderRadius: 16, padding: '7px 16px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: 'var(--bg-surface)', color: 'var(--text-secondary)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal: { borderRadius: 12, padding: 20, width: '90%', maxWidth: 500 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, marginBottom: 16 },
  modalInput: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 6, fontSize: 13, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  modalTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 6, fontSize: 13, minHeight: 100, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  modalSelect: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 6, fontSize: 13, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' },
  modalCancel: { padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  modalSubmit: { padding: '8px 16px', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};
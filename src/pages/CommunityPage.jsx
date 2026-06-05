// src/pages/CommunityPage.jsx - Con usuario autenticado

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar, Tag, BookCover, Card, SectionLabel, Button } from '../components/UI';
import { apiFetch, getBookImageUrl } from '../config/api';

const PAGE_SIZE = 5;
const COMMENTS_PAGE_SIZE = 5;

// ========== FUNCIÓN PARA OBTENER USUARIO AUTENTICADO ==========
const getAuthenticatedUser = () => {
  // Intenta obtener del localStorage (como guardas después del login)
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return { name: user.name || user.username || user.handle?.replace('@', '') || 'Usuario' };
    } catch {
      return null;
    }
  }
  
  // También podría estar en sessionStorage
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    try {
      const user = JSON.parse(sessionUser);
      return { name: user.name || user.username || 'Usuario' };
    } catch {
      return null;
    }
  }
  
  return null;
};

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
  name: p.name,
  initials: p.initials || getInitials(p.name),
  time: p.time || timeAgo(p.created_at),
  title: p.title,
  body: p.body,
  tag: p.tag,
  likes: p.likes ?? 0,
  comments: p.comments ?? 0,
});

const HeartIcon = ({ filled = false, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function CommunityPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  // ========== OBTENER USUARIO AUTENTICADO ==========
  const [currentUser, setCurrentUser] = useState(null);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', tag: 'Reviews' });
  const [submitting, setSubmitting] = useState(false);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('likedPosts') || '{}');
    } catch {
      return {};
    }
  });

  const [openComments, setOpenComments] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState({ content: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsPage, setCommentsPage] = useState({});

  // ========== CARGAR USUARIO AL INICIO ==========
  useEffect(() => {
    const user = getAuthenticatedUser();
    setCurrentUser(user);
  }, []);

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
      const normalized = (data.data || []).map(mapPost);
      setPosts(normalized);
      setTotalPages(data.total_pages || 1);
      setTotalPosts(data.total || data.data?.length || 0);
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
    // Verificar que hay usuario autenticado
    if (!currentUser?.name) {
      alert('Debes iniciar sesión para publicar');
      onNavigate('profile');
      return;
    }
    
    if (!newPost.title.trim() || !newPost.body.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          author: currentUser.name,  // <--- NOMBRE DEL USUARIO AUTENTICADO
          category: newPost.tag,
          title: newPost.title,
          content: newPost.body,
        }),
      });
      if (!response.ok) throw new Error('status ' + response.status);
      setNewPost({ title: '', body: '', tag: 'Reviews' });
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
    const alreadyLiked = likedPosts[postId] || false;
    const action = alreadyLiked ? 'unlike' : 'like';

    const updatedLiked = { ...likedPosts, [postId]: !alreadyLiked };
    setLikedPosts(updatedLiked);
    localStorage.setItem('likedPosts', JSON.stringify(updatedLiked));
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: alreadyLiked ? Math.max(p.likes - 1, 0) : p.likes + 1 }
        : p
    ));

    try {
      const response = await apiFetch(`/posts/${postId}/like?action=${action}`, { method: 'POST' });
      if (!response.ok) {
        setLikedPosts(likedPosts);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, likes: alreadyLiked ? p.likes + 1 : Math.max(p.likes - 1, 0) }
            : p
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setLikedPosts(likedPosts);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: alreadyLiked ? p.likes + 1 : Math.max(p.likes - 1, 0) }
          : p
      ));
    }
  };

  const toggleComments = async (postId) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    setNewComment({ content: '' });
    setCommentsPage(prev => ({ ...prev, [postId]: 1 }));

    if (!commentsByPost[postId]) {
      setCommentsLoading(true);
      try {
        const response = await apiFetch(`/posts/${postId}/comments`);
        const data = await response.json();
        setCommentsByPost(prev => ({ ...prev, [postId]: Array.isArray(data) ? data : (data.data || []) }));
      } catch (error) {
        console.error('Error fetching comments:', error);
        setCommentsByPost(prev => ({ ...prev, [postId]: [] }));
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleNewComment = async (postId) => {
    // Verificar que hay usuario autenticado
    if (!currentUser?.name) {
      alert('Debes iniciar sesión para comentar');
      onNavigate('profile');
      return;
    }
    
    if (!newComment.content.trim()) {
      alert('Escribe un comentario');
      return;
    }
    
    setCommentSubmitting(true);
    try {
      const response = await apiFetch(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ 
          author: currentUser.name,  // <--- NOMBRE DEL USUARIO AUTENTICADO
          content: newComment.content 
        }),
      });
      if (!response.ok) throw new Error('status ' + response.status);
      const created = await response.json();

      const updatedComments = [...(commentsByPost[postId] || []), created];
      setCommentsByPost(prev => ({ ...prev, [postId]: updatedComments }));
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
      setNewComment({ content: '' });

      const lastPage = Math.ceil(updatedComments.length / COMMENTS_PAGE_SIZE);
      setCommentsPage(prev => ({ ...prev, [postId]: lastPage }));
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('No se pudo enviar el comentario. Intenta de nuevo.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const getPagedComments = (postId) => {
    const all = commentsByPost[postId] || [];
    const page = commentsPage[postId] || 1;
    const total = all.length;
    const totalCommentPages = total > 0 ? Math.ceil(total / COMMENTS_PAGE_SIZE) : 1;
    const start = (page - 1) * COMMENTS_PAGE_SIZE;
    return {
      comments: all.slice(start, start + COMMENTS_PAGE_SIZE),
      totalCommentPages,
      currentCommentPage: page,
      totalCount: total,
      rangeStart: total > 0 ? start + 1 : 0,
      rangeEnd: Math.min(page * COMMENTS_PAGE_SIZE, total),
    };
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startPost = (currentPage - 1) * PAGE_SIZE + 1;
  const endPost = Math.min(currentPage * PAGE_SIZE, totalPosts);

  const postCard = (post, idx) => {
    const liked = likedPosts[post.id] || false;
    const isOpen = openComments === post.id;
    const { comments, totalCommentPages, currentCommentPage, totalCount, rangeStart, rangeEnd } = getPagedComments(post.id);

    return (
      <div key={post.id || idx} style={{ ...s.postCard, background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
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
            style={{
              ...s.actionBtn,
              background: liked ? 'rgba(220,38,38,0.08)' : 'var(--bg-surface)',
              color: liked ? '#dc2626' : 'var(--text-secondary)',
              border: liked ? '1px solid rgba(220,38,38,0.2)' : '1px solid var(--border-light)',
            }}
            onClick={() => handleLike(post.id)}
          >
            <HeartIcon filled={liked} size={14} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{post.likes}</span>
          </button>
          <button
            style={{
              ...s.actionBtn,
              background: isOpen ? 'rgba(79,70,229,0.08)' : 'var(--bg-surface)',
              color: isOpen ? '#4f46e5' : 'var(--text-secondary)',
              border: isOpen ? '1px solid rgba(79,70,229,0.2)' : '1px solid var(--border-light)',
            }}
            onClick={() => toggleComments(post.id)}
          >
            <CommentIcon size={14} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{post.comments}</span>
          </button>
        </div>

        {isOpen && (
          <div style={{ ...s.commentsSection, borderColor: 'var(--border-light)' }}>
            {commentsByPost[post.id] && totalCount > 0 && (
              <div style={s.commentsHeader}>
                <span style={{ ...s.commentsHeaderTitle, color: 'var(--text-primary)' }}>
                  {totalCount} {totalCount === 1 ? 'comentario' : 'comentarios'}
                </span>
                {totalCommentPages > 1 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Mostrando {rangeStart}–{rangeEnd} de {totalCount}
                  </span>
                )}
              </div>
            )}

            {commentsLoading && !commentsByPost[post.id] && (
              <p style={{ ...s.commentMuted, color: 'var(--text-muted)' }}>Cargando comentarios...</p>
            )}

            {commentsByPost[post.id] && totalCount === 0 && (
              <p style={{ ...s.commentMuted, color: 'var(--text-muted)' }}>Sé el primero en comentar.</p>
            )}

            {comments.map((c) => (
              <div key={c.id} style={{ ...s.commentItem, background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
                <Avatar initials={getInitials(c.author)} size={30} />
                <div style={s.commentContent}>
                  <div style={s.commentMeta}>
                    <span style={{ ...s.commentAuthor, color: 'var(--text-primary)' }}>{c.author}</span>
                    <span style={{ ...s.commentTime, color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</span>
                  </div>
                  <p style={{ ...s.commentText, color: 'var(--text-secondary)' }}>{c.content}</p>
                </div>
              </div>
            ))}

            {totalCommentPages > 1 && (
              <div style={s.commentsPagination}>
                <button
                  style={{
                    ...s.commentPageBtn,
                    opacity: currentCommentPage === 1 ? 0.35 : 1,
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-light)',
                  }}
                  onClick={() => setCommentsPage(prev => ({ ...prev, [post.id]: Math.max((prev[post.id] || 1) - 1, 1) }))}
                  disabled={currentCommentPage === 1}
                >
                  ←
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80, textAlign: 'center' }}>
                  Página {currentCommentPage} de {totalCommentPages}
                </span>
                <button
                  style={{
                    ...s.commentPageBtn,
                    opacity: currentCommentPage === totalCommentPages ? 0.35 : 1,
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-light)',
                  }}
                  onClick={() => setCommentsPage(prev => ({ ...prev, [post.id]: Math.min((prev[post.id] || 1) + 1, totalCommentPages) }))}
                  disabled={currentCommentPage === totalCommentPages}
                >
                  →
                </button>
              </div>
            )}

            {/* Formulario de comentario - sin campo de nombre */}
            <div style={{ ...s.commentForm, borderColor: 'var(--border-light)' }}>
              <textarea
                style={{ ...s.commentTextarea, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                placeholder={currentUser?.name ? `Comentar como ${currentUser.name}...` : "Inicia sesión para comentar..."}
                value={newComment.content}
                onChange={(e) => setNewComment({ content: e.target.value })}
                disabled={!currentUser?.name}
              />
              <button
                style={{ ...s.commentSubmit, opacity: (!currentUser?.name || commentSubmitting) ? 0.6 : 1 }}
                onClick={() => handleNewComment(post.id)}
                disabled={!currentUser?.name || commentSubmitting}
              >
                {commentSubmitting ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
              <div>
                <h2 style={{ ...s.feedTitle, color: 'var(--text-primary)' }}>Community</h2>
                {totalPosts > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Mostrando {startPost}-{endPost} de {totalPosts} posts
                  </p>
                )}
              </div>
              <Button variant="primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setShowNewPost(true)}>
                + New Post
              </Button>
            </div>

            {/* Modal de nuevo post - sin campo de nombre */}
            {showNewPost && (
              <div style={s.modalOverlay}>
                <div style={{ ...s.modal, background: 'var(--bg-secondary)' }}>
                  <h3 style={{ ...s.modalTitle, color: 'var(--text-primary)' }}>Create New Post</h3>
                  {!currentUser?.name && (
                    <p style={{ color: 'var(--crimson)', fontSize: 12, marginBottom: 12 }}>
                      ⚠️ Debes iniciar sesión para publicar
                    </p>
                  )}
                  <input
                    style={{ ...s.modalInput, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    placeholder="Title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    disabled={!currentUser?.name}
                  />
                  <textarea
                    style={{ ...s.modalTextarea, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    placeholder="What's on your mind?"
                    value={newPost.body}
                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                    disabled={!currentUser?.name}
                  />
                  <select
                    style={{ ...s.modalSelect, background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    value={newPost.tag}
                    onChange={(e) => setNewPost({ ...newPost, tag: e.target.value })}
                    disabled={!currentUser?.name}
                  >
                    <option value="Reviews">Reviews</option>
                    <option value="Recommendations">Recommendations</option>
                    <option value="Community">Community</option>
                    <option value="Authors">Authors</option>
                  </select>
                  <div style={s.modalActions}>
                    <button style={{ ...s.modalCancel, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }} onClick={() => setShowNewPost(false)}>Cancel</button>
                    <button style={s.modalSubmit} onClick={handleNewPost} disabled={submitting || !currentUser?.name}>
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

            {!loading && posts.map((post, idx) => postCard(post, idx))}

            {/* Paginación de posts */}
            {!loading && totalPages > 1 && (
              <>
                <div style={s.postsPagination}>
                  <button
                    style={{
                      ...s.pageBtn,
                      visibility: currentPage === 1 ? 'hidden' : 'visible',
                    }}
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>
                  
                  <div style={s.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          style={{
                            ...s.pageNumberBtn,
                            background: currentPage === pageNum ? 'var(--crimson)' : 'var(--bg-surface)',
                            color: currentPage === pageNum ? '#fff' : 'var(--text-secondary)',
                          }}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    style={{
                      ...s.pageBtn,
                      visibility: currentPage === totalPages ? 'hidden' : 'visible',
                    }}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente →
                  </button>
                </div>
                <div style={s.paginationInfo}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              </>
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
  feedTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  feedTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 22px)', fontWeight: 600 },

  postCard: { border: '1px solid', borderRadius: 12, padding: '16px', marginBottom: 12, boxShadow: 'var(--shadow)' },
  postHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  postAuthor: { fontWeight: 500, fontSize: 13 },
  postTime: { fontSize: 11 },
  postTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 },
  postBody: { fontSize: 13, lineHeight: 1.65, marginBottom: 14 },
  postActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  actionBtn: {
    borderRadius: 20,
    padding: '6px 14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    transition: 'all 0.15s ease',
  },

  commentsSection: { marginTop: 16, paddingTop: 16, borderTop: '1px solid' },
  commentsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  commentsHeaderTitle: { fontSize: 12, fontWeight: 600 },
  commentMuted: { fontSize: 12, fontStyle: 'italic', marginBottom: 12 },

  commentItem: {
    display: 'flex',
    gap: 10,
    marginBottom: 8,
    alignItems: 'flex-start',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid',
  },
  commentContent: { flex: 1, minWidth: 0 },
  commentMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 },
  commentAuthor: { fontSize: 12, fontWeight: 600 },
  commentTime: { fontSize: 11 },
  commentText: { fontSize: 13, lineHeight: 1.5, margin: 0 },

  commentsPagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
  commentPageBtn: {
    border: '1px solid',
    borderRadius: 20,
    padding: '4px 14px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },

  commentForm: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  commentInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1.5px solid',
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  },
  commentTextarea: {
    width: '100%',
    padding: '8px 10px',
    border: '1.5px solid',
    borderRadius: 8,
    fontSize: 12,
    minHeight: 72,
    fontFamily: "'DM Sans', sans-serif",
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  commentSubmit: {
    alignSelf: 'flex-end',
    padding: '7px 18px',
    background: 'var(--crimson)',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },

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
  pageBtn: { border: 'none', borderRadius: 20, padding: '7px 18px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: 'var(--bg-surface)', color: 'var(--text-secondary)' },

  postsPagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  pageNumbers: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  pageNumberBtn: {
    border: '1px solid var(--border-light)',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: 'all 0.15s ease',
    minWidth: 36,
  },
  paginationInfo: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal: { borderRadius: 14, padding: 24, width: '90%', maxWidth: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, marginBottom: 16 },
  modalInput: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 8, fontSize: 13, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' },
  modalTextarea: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 8, fontSize: 13, minHeight: 100, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
  modalSelect: { width: '100%', padding: '10px 12px', border: '1.5px solid', borderRadius: 8, fontSize: 13, marginBottom: 16, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' },
  modalCancel: { padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  modalSubmit: { padding: '8px 18px', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};
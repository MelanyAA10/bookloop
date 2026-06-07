// src/pages/BookDetailPage.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Badge, Tag, Avatar, Stars, BookCover, SectionLabel, Divider, Button } from '../components/UI';
import { apiFetch, getBookImageUrl, mapBook, fetchUserById } from '../config/api';
import { useUser } from '../context/UserContext';

function SkeletonBox({ width = '100%', height = 16, radius = 6, style }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'var(--bg-surface)',
      animation: 'pulse 1.4s ease-in-out infinite',
      flexShrink: 0, ...style,
    }} />
  );
}

const PULSE_STYLE = `@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.45; }
}`;

const TrashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const StarPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 22, color: s <= value ? '#C94040' : 'var(--border)',
          padding: 0, lineHeight: 1,
        }}
      >★</button>
    ))}
  </div>
);

// Modal de confirmación de borrado
function DeleteConfirmModal({ bookTitle, onConfirm, onCancel, deleting }) {
  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        <div style={{ color: '#C94040' }}><TrashIcon size={32} /></div>
        <h3 style={m.heading}>¿Eliminar publicación?</h3>
        <p style={m.text}>
          Estás a punto de eliminar <strong>"{bookTitle}"</strong>. Esta acción no se puede deshacer.
        </p>
        <div style={m.actions}>
          <button style={m.cancelBtn} onClick={onCancel} disabled={deleting}>
            Cancelar
          </button>
          <button style={m.deleteBtn} onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const m = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(3px)',
  },
  modal: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '32px 28px', maxWidth: 360, width: '90%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0, textAlign: 'center' },
  text:    { fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, margin: 0 },
  actions: { display: 'flex', gap: 10, marginTop: 8, width: '100%' },
  cancelBtn: {
    flex: 1, padding: '9px 0', borderRadius: 8, border: '1.5px solid var(--border)',
    background: 'transparent', color: 'var(--text-primary)', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 500,
  },
  deleteBtn: {
    flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
    background: '#C94040', color: '#fff', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 600,
  },
};

export default function BookDetailPage({ onNavigate = () => {}, bookId = 1, theme, onToggleTheme }) {
  const { user } = useUser();

  const [book,    setBook]    = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loadingBook,    setLoadingBook]    = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorBook,      setErrorBook]      = useState(null);
  const [isMobile,       setIsMobile]       = useState(window.innerWidth <= 768);

  const [reviewText,       setReviewText]       = useState('');
  const [reviewStars,      setReviewStars]      = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError,      setReviewError]      = useState('');
  const [reviewSuccess,    setReviewSuccess]    = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [deleteError,     setDeleteError]     = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const id = typeof bookId === 'object' ? bookId?.id ?? 1 : bookId ?? 1;
    fetchBook(id);
    fetchReviews(id);
  }, [bookId]);

  const fetchBook = async (id) => {
    setLoadingBook(true);
    setErrorBook(null);
    try {
      const res = await apiFetch(`/books/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ownerProfile = await fetchUserById(data.uploadedBy);
      setBook(mapBook(data, ownerProfile));
    } catch (err) {
      console.error('Error fetching book:', err);
      setErrorBook('Could not load book details. Please try again.');
    } finally {
      setLoadingBook(false);
    }
  };

  const fetchReviews = async (id) => {
    setLoadingReviews(true);
    try {
      const res = await apiFetch(`/books/${id}/reviews`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) { setReviewError('Escribe tu reseña antes de enviar'); return; }
    if (reviewStars < 1)    { setReviewError('Selecciona al menos 1 estrella'); return; }

    const bookIdStr = typeof bookId === 'object' ? bookId?.id : bookId;
    const authorName = user?.name || user?.username || 'Anónimo';

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const res = await apiFetch(`/books/${bookIdStr}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          author: authorName,
          text:   reviewText.trim(),
          stars:  reviewStars,
        }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const created = await res.json();
      setReviews(prev => [...prev, created]);
      setReviewText('');
      setReviewStars(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError('No se pudo enviar la reseña. Intenta de nuevo.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const bookIdStr = typeof bookId === 'object' ? bookId?.id : bookId;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await apiFetch(`/books/${bookIdStr}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setShowDeleteModal(false);
      onNavigate('discovery');
    } catch (err) {
      setDeleteError('No se pudo eliminar el libro. Intenta de nuevo.');
      setDeleting(false);
    }
  };

  const handleRetry = () => {
    const id = typeof bookId === 'object' ? bookId?.id ?? 1 : bookId ?? 1;
    fetchBook(id);
  };

  const isOwner = user?.id && book?.uploadedBy && book.uploadedBy === user.id;

  if (loadingBook) {
    return (
      <>
        <style>{PULSE_STYLE}</style>
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
          <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
          <div style={s.body}>
            <SkeletonBox width={160} height={14} style={{ marginBottom: 20 }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
              gap: 28,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 14,
              padding: isMobile ? 16 : 20,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <SkeletonBox width={isMobile ? 140 : 240} height={isMobile ? 186 : 320} radius={10} />
                <SkeletonBox width={120} height={22} radius={4} />
                <SkeletonBox width={160} height={12} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                <SkeletonBox width="70%" height={28} />
                <SkeletonBox width="40%" height={14} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {[80, 70, 80].map((w, i) => <SkeletonBox key={i} width={w} height={24} radius={20} />)}
                </div>
                <SkeletonBox height={52} radius={8} />
                <SkeletonBox height={13} />
                <SkeletonBox width="85%" height={13} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (errorBook) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ ...s.body, textAlign: 'center', paddingTop: 60 }}>
          <p style={{ color: 'var(--crimson-light)', marginBottom: 12, fontSize: 14 }}>{errorBook}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="outline" style={{ fontSize: 12 }} onClick={handleRetry}>Try Again</Button>
            <Button variant="ghost" style={{ fontSize: 12 }} onClick={() => onNavigate('discovery')}>← Back to Discovery</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Book not found.</p>
          <button onClick={() => onNavigate('discovery')} style={{ color: 'var(--crimson)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            ← Back to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PULSE_STYLE}</style>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />

        {showDeleteModal && (
          <DeleteConfirmModal
            bookTitle={book.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => { setShowDeleteModal(false); setDeleteError(''); }}
            deleting={deleting}
          />
        )}

        <div style={s.body}>
          {/* Fila superior: back + botón eliminar si es el dueño */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button style={s.back} onClick={() => onNavigate('discovery')}>← Back to Discovery</button>
            {isOwner && (
              <button style={s.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                <TrashIcon size={13} /> Eliminar publicación
              </button>
            )}
          </div>

          {deleteError && (
            <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 12 }}>{deleteError}</p>
          )}

          <div style={isMobile ? s.layoutMobile : s.layout}>
            <div style={s.left}>
              <BookCover
                color={book.color || '#7A3728'}
                title={book.title}
                imageUrl={getBookImageUrl(book)}
                width={isMobile ? 140 : 240}
                height={isMobile ? 186 : 320}
                style={{
                  borderRadius: 10,
                  boxShadow: '6px 8px 28px rgba(0,0,0,0.22)',
                  width:  isMobile ? 140 : 240,
                  height: isMobile ? 186 : 320,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                {book.available ? (
                  <Badge variant="default">Available for Loan</Badge>
                ) : (
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600, background: 'rgba(201,64,64,0.12)',
                    color: '#C94040', border: '1px solid rgba(201,64,64,0.3)', width: 'fit-content',
                  }}>
                    Currently Borrowed
                  </span>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Owner: {book.owner?.name} · {book.loanDays || book.owner?.maxDays || 14} days max
                </p>
              </div>
            </div>

            <div style={s.right}>
              <h1 style={s.title}>{book.title}</h1>
              <p style={s.meta}>{book.author}{book.year ? ` · ${book.year}` : ''}</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {(book.pages || book.pageCount) && <Tag>{book.pages || book.pageCount} pages</Tag>}
                {book.language && <Tag>{book.language}</Tag>}
                {book.genre    && <Tag>{book.genre}</Tag>}
              </div>

              <div style={s.ownerBox}>
                <Avatar initials={book.owner?.initials || '??'} size={36} />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{book.owner?.name}</p>
                  <Stars value={book.owner?.rating || 0} size={13} />
                </div>
                {!isOwner && (
                  <Button
                    variant="primary"
                    style={{ marginLeft: 'auto', fontSize: 12, padding: '6px 14px' }}
                    onClick={() => {
                      if (!book.uploadedBy) {
                        alert('Este libro no tiene un dueño asociado para chatear.');
                        return;
                      }
                      onNavigate('messages', {
                        chatTarget: {
                          userId: book.uploadedBy,
                          name: book.owner?.name || 'Usuario',
                          initials: book.owner?.initials || '??',
                        },
                      });
                    }}
                  >
                    Message
                  </Button>
                )}
              </div>

              <SectionLabel>The Story</SectionLabel>
              <p style={s.synopsis}>{book.synopsis || book.description || 'No synopsis available for this book.'}</p>
            </div>
          </div>

          <Divider style={{ marginTop: 36 }} />

          <SectionLabel>Recent Reviews</SectionLabel>

          {loadingReviews && (
            <div style={s.reviews}>
              {[0, 1].map(i => (
                <div key={i} style={{ ...s.review, flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <SkeletonBox width={36} height={36} radius={18} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <SkeletonBox width={100} height={13} />
                      <SkeletonBox width={70}  height={11} />
                    </div>
                  </div>
                  <SkeletonBox height={13} />
                  <SkeletonBox width="65%" height={13} />
                </div>
              ))}
            </div>
          )}

          {!loadingReviews && reviews.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
              No reviews yet. Be the first to leave one!
            </p>
          )}

          {!loadingReviews && reviews.length > 0 && (
            <div style={s.reviews}>
              {reviews.map((r, i) => (
                <div key={r.id || i} style={s.review}>
                  <Avatar initials={(r.author || r.name || '?').trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)} size={36} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2, color: 'var(--text-primary)' }}>
                      {r.author || r.name}
                    </p>
                    <Stars value={r.stars} size={12} />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 6 }}>
                      "{r.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Divider style={{ marginTop: 24 }} />
          <SectionLabel>Write a Review</SectionLabel>

          <div style={s.reviewForm}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Reviewing as <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Anónimo'}</strong>
            </p>

            <StarPicker value={reviewStars} onChange={setReviewStars} />

            <textarea
              style={s.reviewTextarea}
              placeholder={`Share your thoughts about ${book.title}...`}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
            />

            {reviewError && (
              <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{reviewError}</p>
            )}
            {reviewSuccess && (
              <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>✓ Review enviada correctamente</p>
            )}

            <Button
              variant="primary"
              style={{ alignSelf: 'flex-end', fontSize: 12, padding: '8px 20px', marginTop: 8 }}
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? 'Enviando...' : 'Submit Review →'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  body:  { padding: '20px 16px', maxWidth: 960, margin: '0 auto' },
  back: {
    background: 'none', border: 'none', fontSize: 13,
    color: 'var(--text-muted)', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", padding: 0,
  },
  deleteBtn: {
    background: 'none', border: '1.5px solid #C94040', borderRadius: 7,
    color: '#C94040', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500, cursor: 'pointer', padding: '6px 14px',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  layout: {
    display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
    borderRadius: 14, padding: 20,
  },
  layoutMobile: {
    display: 'flex', flexDirection: 'column', gap: 20,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
    borderRadius: 14, padding: 16,
  },
  left:  { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  right: { display: 'flex', flexDirection: 'column' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 600,
    color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.2,
  },
  meta: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 },
  ownerBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-surface)', borderRadius: 8,
    padding: '10px 14px', marginBottom: 20, flexWrap: 'wrap',
  },
  synopsis: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 },
  reviews: { display: 'flex', flexDirection: 'column', gap: 0 },
  review: {
    display: 'flex', gap: 12, padding: '16px 0',
    borderBottom: '1px solid var(--border-light)',
  },
  reviewForm: {
    display: 'flex', flexDirection: 'column', gap: 12,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
    borderRadius: 12, padding: 20, marginTop: 8,
  },
  reviewTextarea: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid var(--border)', borderRadius: 8,
    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
    minHeight: 90,
  },
};
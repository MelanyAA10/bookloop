// src/pages/BookDetailPage.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Badge, Tag, Avatar, Stars, BookCover, SectionLabel, Divider, Button } from '../components/UI';
import { apiFetch, getBookImageUrl, mapBook, fetchUserById } from '../config/api';

function SkeletonBox({ width = '100%', height = 16, radius = 6, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--bg-surface)',
        animation: 'pulse 1.4s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

const PULSE_STYLE = `@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.45; }
}`;

export default function BookDetailPage({ onNavigate = () => {}, bookId = 1, theme, onToggleTheme }) {
  const [book,    setBook]    = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loadingBook,    setLoadingBook]    = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [errorBook, setErrorBook] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

      // Enriquecer con el perfil real del owner via GET /api/users/{uploadedBy}
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
    } catch (err) {
      // Reviews es opcional; si el endpoint no existe no bloqueamos
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleRetry = () => {
    const id = typeof bookId === 'object' ? bookId?.id ?? 1 : bookId ?? 1;
    fetchBook(id);
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loadingBook) {
    return (
      <>
        <style>{PULSE_STYLE}</style>
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
          <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
          <div style={s.body}>
            <SkeletonBox width={160} height={14} style={{ marginBottom: 20 }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
                gap: 28,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 14,
                padding: isMobile ? 16 : 20,
              }}
            >
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
                <SkeletonBox width="30%" height={11} />
                <SkeletonBox height={13} />
                <SkeletonBox width="85%" height={13} />
                <SkeletonBox width="60%" height={13} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (errorBook) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ ...s.body, textAlign: 'center', paddingTop: 60 }}>
          <p style={{ color: 'var(--crimson-light)', marginBottom: 12, fontSize: 14 }}>{errorBook}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="outline" style={{ fontSize: 12 }} onClick={handleRetry}>Try Again</Button>
            <Button variant="ghost"   style={{ fontSize: 12 }} onClick={() => onNavigate('discovery')}>
              ← Back to Discovery
            </Button>
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

  // ── Full page ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{PULSE_STYLE}</style>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar
          activePage="discovery"
          onNavigate={onNavigate}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <div style={s.body}>
          <button style={s.back} onClick={() => onNavigate('discovery')}>← Back to Discovery</button>

          <div style={isMobile ? s.layoutMobile : s.layout}>
            {/* Cover + availability */}
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
                <Badge variant="default">Available for Loan</Badge>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Owner: {book.owner?.name} · {book.loanDays || book.owner?.maxDays || 14} days max
                </p>
              </div>
            </div>

            {/* Metadata + actions */}
            <div style={s.right}>
              <h1 style={s.title}>{book.title}</h1>
              <p style={s.meta}>{book.author}{book.year ? ` · ${book.year}` : ''}</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {(book.pages || book.pageCount) && <Tag>{book.pages || book.pageCount} pages</Tag>}
                {book.language && <Tag>{book.language}</Tag>}
                {book.genre    && <Tag>{book.genre}</Tag>}
              </div>

              {/* Owner box — muestra nombre real desde /api/users/{id} */}
              <div style={s.ownerBox}>
                <Avatar initials={book.owner?.initials || '??'} size={36} />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
                    {book.owner?.name}
                  </p>
                  <Stars value={book.owner?.rating || 0} size={13} />
                </div>
                <Button
                  variant="primary"
                  style={{ marginLeft: 'auto', fontSize: 12, padding: '6px 14px' }}
                  onClick={() => onNavigate('messages')}
                >
                  Message
                </Button>
              </div>

              <SectionLabel>The Story</SectionLabel>
              <p style={s.synopsis}>{book.synopsis || book.description || 'No synopsis available for this book.'}</p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                <Button variant="outline" style={{ fontSize: 12, padding: '7px 16px' }}>
                  Book Condition
                </Button>
                <Button variant="primary" onClick={() => onNavigate('loanconfirm', { bookId: book.id })}>
                  Request Loan →
                </Button>
              </div>
            </div>
          </div>

          <Divider style={{ marginTop: 36 }} />

          {/* ── Reviews ── */}
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
              No reviews yet for this book.
            </p>
          )}

          {!loadingReviews && reviews.length > 0 && (
            <div style={s.reviews}>
              {reviews.map(r => (
                <div key={r.id} style={s.review}>
                  <Avatar initials={r.initials} size={36} />
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2, color: 'var(--text-primary)' }}>
                      {r.name}
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
        </div>
      </div>
    </>
  );
}

const s = {
  body:  { padding: '20px 16px', maxWidth: 960, margin: '0 auto' },
  back: {
    background: 'none',
    border: 'none',
    fontSize: 13,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 20,
    padding: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 28,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 14,
    padding: 20,
  },
  layoutMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 14,
    padding: 16,
  },
  left:  { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  right: { display: 'flex', flexDirection: 'column' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(20px, 6vw, 28px)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  meta: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 },
  ownerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--bg-surface)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  synopsis: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 },
  reviews: { display: 'flex', flexDirection: 'column', gap: 0 },
  review: {
    display: 'flex',
    gap: 12,
    padding: '16px 0',
    borderBottom: '1px solid var(--border-light)',
  },
};

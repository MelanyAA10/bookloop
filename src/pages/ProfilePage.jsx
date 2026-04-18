// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Badge, Stars, BookCover, Card, SectionLabel, Button } from '../components/UI';
import { apiFetch, getBookImageUrl } from '../config/api';

// ─── Skeleton helpers ────────────────────────────────────────────────────────
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

// ─── Inline keyframe for pulse (injected once) ───────────────────────────────
const PULSE_STYLE = `@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.45; }
}`;

export default function ProfilePage({ onNavigate = () => {}, theme, onToggleTheme }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [profile,      setProfile]      = useState(null);
  const [reviews,      setReviews]      = useState([]);
  const [userBooks,    setUserBooks]    = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingBooks,   setLoadingBooks]   = useState(true);

  const [errorProfile, setErrorProfile] = useState(null);
  const [errorReviews, setErrorReviews] = useState(null);
  const [errorBooks,   setErrorBooks]   = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { fetchReviews(); }, []);
  useEffect(() => { fetchBooks();   }, []);

  // ── Fetch: profile ─────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setErrorProfile(null);
    try {
      const res = await apiFetch('/profile');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorProfile('Could not load profile information.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ── Fetch: profile reviews ─────────────────────────────────────────────────
  const fetchReviews = async () => {
    setLoadingReviews(true);
    setErrorReviews(null);
    try {
      const res = await apiFetch('/profile/reviews');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error('Error fetching profile reviews:', err);
      setErrorReviews('Could not load community feedback.');
    } finally {
      setLoadingReviews(false);
    }
  };

  // ── Fetch: user books (filtered by profile once profile loads) ─────────────
  const fetchBooks = async () => {
    setLoadingBooks(true);
    setErrorBooks(null);
    try {
      const res = await apiFetch('/books');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : data?.data ?? [];
      // Filter to books owned by the current user once profile arrives.
      // We keep full list in state and filter at render time so that if
      // profile loads after books there is no stale mismatch.
      setUserBooks(all);
    } catch (err) {
      console.error('Error fetching books:', err);
      setErrorBooks('Could not load book listing.');
    } finally {
      setLoadingBooks(false);
    }
  };

  // ── Derived: books belonging to this user ──────────────────────────────────
  const ownedBooks = profile
    ? userBooks.filter(
        b => b.owner?.initials === profile.initials ||
             b.owner?.name     === profile.name
      )
    : [];

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderProfileCard = () => {
    if (loadingProfile) {
      return (
        <Card style={{ textAlign: 'center', marginBottom: 16, background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* Avatar skeleton */}
            <SkeletonBox width={90} height={90} radius={45} />
            <SkeletonBox width={140} height={18} />
            <SkeletonBox width={100} height={12} />
            <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <SkeletonBox width={36} height={22} />
                  <SkeletonBox width={36} height={10} />
                </div>
              ))}
            </div>
            <SkeletonBox height={36} radius={6} style={{ marginTop: 4 }} />
          </div>
        </Card>
      );
    }

    if (errorProfile) {
      return (
        <Card style={{ marginBottom: 16, background: 'var(--bg-secondary)' }}>
          <p style={s.errorText}>{errorProfile}</p>
          <button style={s.retryBtn} onClick={fetchProfile}>Retry</button>
        </Card>
      );
    }

    if (!profile) return null;

    return (
      <Card style={{ textAlign: 'center', marginBottom: 16, background: 'var(--bg-secondary)' }}>
        <div style={s.avatar}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#fff' }}>
            {profile.initials}
          </span>
        </div>
        <h2 style={s.userName}>{profile.name}</h2>
        <p style={s.userMeta}>{profile.handle} · {profile.university}</p>

        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={{ ...s.statNum, color: 'var(--crimson-light)' }}>{profile.rating}</span>
            <span style={s.statLabel}>Rating</span>
          </div>
          <div style={s.stat}>
            <span style={{ ...s.statNum, color: 'var(--text-primary)' }}>{profile.totalBooks}</span>
            <span style={s.statLabel}>Books</span>
          </div>
          <div style={s.stat}>
            <span style={{ ...s.statNum, color: 'var(--text-primary)' }}>{profile.activeLoans}</span>
            <span style={s.statLabel}>Loans</span>
          </div>
        </div>

        <Button variant="full" style={{ marginTop: 4 }} onClick={() => onNavigate('messages')}>
          Message
        </Button>
      </Card>
    );
  };

  const renderBooksPanel = () => {
    if (loadingBooks || loadingProfile) {
      return (
        <div style={s.panelBox}>
          <SectionLabel>Available for Loan</SectionLabel>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <SkeletonBox width={56} height={78} radius={5} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                <SkeletonBox width="80%" height={14} />
                <SkeletonBox width="50%" height={11} />
                <SkeletonBox width={64} height={18} radius={4} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (errorBooks) {
      return (
        <div style={s.panelBox}>
          <SectionLabel>Available for Loan</SectionLabel>
          <p style={s.errorText}>{errorBooks}</p>
          <button style={s.retryBtn} onClick={fetchBooks}>Retry</button>
        </div>
      );
    }

    return (
      <div style={s.panelBox}>
        <SectionLabel>Available for Loan</SectionLabel>

        {ownedBooks.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyTitle}>No books listed yet</p>
            <p style={s.emptySubtitle}>Add a book to start lending to the community.</p>
            <Button
              variant="primary"
              style={{ fontSize: 12, padding: '7px 14px', marginTop: 4 }}
              onClick={() => onNavigate('addbook')}
            >
              + Add Book
            </Button>
          </div>
        ) : (
          ownedBooks.map(book => (
            <Card
              key={book.id}
              style={{
                marginBottom: 12,
                background: 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                padding: '12px',
              }}
              onClick={() => onNavigate('bookdetail', { id: book.id })}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <BookCover
                  color={book.color}
                  title={book.title}
                  imageUrl={getBookImageUrl(book)}
                  width={56}
                  height={78}
                />
                <div style={{ flex: 1 }}>
                  <p style={s.bookTitle}>{book.title}</p>
                  <p style={s.bookAuthor}>{book.author}</p>
                  <Badge
                    variant="success"
                    style={{ fontSize: 10, background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }}
                  >
                    Available
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderReviews = () => {
    if (loadingReviews) {
      return (
        <div style={s.panelBox}>
          <SectionLabel>Community Feedback</SectionLabel>
          {[0, 1].map(i => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <SkeletonBox width={36} height={36} radius={18} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SkeletonBox width={100} height={13} />
                  <SkeletonBox width={70}  height={11} />
                </div>
              </div>
              <SkeletonBox height={13} style={{ marginBottom: 4 }} />
              <SkeletonBox width="75%" height={13} />
            </div>
          ))}
        </div>
      );
    }

    if (errorReviews) {
      return (
        <div style={s.panelBox}>
          <SectionLabel>Community Feedback</SectionLabel>
          <p style={s.errorText}>{errorReviews}</p>
          <button style={s.retryBtn} onClick={fetchReviews}>Retry</button>
        </div>
      );
    }

    return (
      <div style={s.panelBox}>
        <SectionLabel>Community Feedback</SectionLabel>

        {reviews.length === 0 ? (
          <p style={s.emptySubtitle}>No reviews yet.</p>
        ) : (
          reviews.map(r => (
            <div
              key={r.id}
              style={{ marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={s.reviewAvatar}>{r.initials}</div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>{r.name}</p>
                  <Stars value={r.stars} size={12} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                "{r.text}"
              </p>
            </div>
          ))
        )}
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inject pulse animation */}
      <style>{PULSE_STYLE}</style>

      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar
          activePage="profile"
          onNavigate={onNavigate}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <div style={s.body}>
          <div style={s.banner} />

          <div style={isMobile ? s.layoutMobile : s.layout}>
            {/* Left column */}
            <div style={s.left}>
              {renderProfileCard()}
              {renderBooksPanel()}
            </div>

            {/* Right column */}
            <div style={s.right}>
              {renderReviews()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  body: { maxWidth: 960, margin: '0 auto', padding: '0 16px 40px' },
  banner: {
    height: 'clamp(100px, 20vw, 140px)',
    background: 'linear-gradient(135deg, #5A0E0E 0%, #8B1C1C 50%, #C94040 100%)',
    margin: '0 -16px 0',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: 28,
    marginTop: -40,
  },
  layoutMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    marginTop: -40,
  },
  left: {},
  right: { paddingTop: 50 },

  // Profile card
  avatar: {
    width: 'clamp(70px, 15vw, 90px)',
    height: 'clamp(70px, 15vw, 90px)',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C94040, #8B1C1C)',
    margin: '0 auto 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid var(--bg-secondary)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  userName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(17px, 5vw, 19px)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 2,
  },
  userMeta: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 },
  stat: { textAlign: 'center' },
  statNum: {
    display: 'block',
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(18px, 4vw, 22px)',
    fontWeight: 600,
  },
  statLabel: { display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 },

  // Book list
  panelBox: {
    background: 'var(--bg-secondary)',
    borderRadius: 10,
    padding: '16px 20px',
    marginTop: 8,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
    fontFamily: "'Playfair Display', serif",
  },
  bookAuthor: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 },

  // Reviews
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C94040, #8B1C1C)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
  },

  // Empty / error states
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 0',
    gap: 6,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  emptySubtitle: { fontSize: 12, color: 'var(--text-muted)', margin: 0 },
  errorText: { fontSize: 13, color: 'var(--crimson-light)', marginBottom: 8 },
  retryBtn: {
    background: 'none',
    border: '1.5px solid var(--crimson)',
    color: 'var(--crimson)',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
};

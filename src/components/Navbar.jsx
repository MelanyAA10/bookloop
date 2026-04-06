// src/components/Navbar.jsx
import React from 'react';
import Logo from './Logo';

export default function Navbar({
  activePage = 'discovery',
  onNavigate = () => {},
  user = { initials: 'JR', name: 'Juliet Ramos' },
  theme = 'light',
  onToggleTheme = () => {},
}) {
  const isDark = theme === 'dark';

  const links = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'community', label: 'Community' },
    { id: 'messages',  label: 'Messages' },
  ];

  return (
    <nav style={styles.nav}>
      <button style={styles.logoBtn} onClick={() => onNavigate('discovery')}>
        <Logo size={28} variant="light" />
      </button>

      <div style={styles.links}>
        {links.map(l => (
          <button
            key={l.id}
            style={{ ...styles.link, ...(activePage === l.id ? styles.linkActive : {}) }}
            onClick={() => onNavigate(l.id)}
          >
            {l.label}
            {activePage === l.id && <span style={styles.linkUnderline} />}
          </button>
        ))}
      </div>

      <div style={styles.right}>

        {/* Toggle switch luna/sol */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Toggle theme"
          style={{
            ...styles.toggle,
            background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.25)',
          }}
        >
          {/* Luna - lado izquierdo */}
          <span style={{ ...styles.trackIcon, opacity: isDark ? 0.5 : 0.35 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>

          {/* Thumb deslizante */}
          <span style={{
            ...styles.thumb,
            transform: isDark ? 'translateX(0px)' : 'translateX(24px)',
            background: '#fff',
          }}>
            {isDark ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#1A1009" stroke="#1A1009" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5A0E0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/>
                <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/>
                <line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/>
              </svg>
            )}
          </span>

          {/* Sol - lado derecho */}
          <span style={{ ...styles.trackIcon, justifyContent: 'flex-end', opacity: isDark ? 0.35 : 0.5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/>
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="5" y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/>
              <line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/>
            </svg>
          </span>
        </button>

        <button style={styles.addBtn} onClick={() => onNavigate('addbook')}>
          + Add Book
        </button>
        <button
          style={styles.avatar}
          onClick={() => onNavigate('profile')}
          title={user.name}
        >
          {user.initials}
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#5A0E0E',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    padding: '0 28px',
    gap: 16,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
  },
  logoBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  links: {
    display: 'flex',
    gap: 4,
    marginLeft: 28,
    flex: 1,
  },
  link: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 400,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 6,
    position: 'relative',
    transition: 'color 0.18s',
  },
  linkActive: {
    color: '#FFFFFF',
    fontWeight: 500,
  },
  linkUnderline: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    height: 2,
    background: '#FFFFFF',
    borderRadius: 2,
    display: 'block',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  toggle: {
    position: 'relative',
    width: 52,
    height: 26,
    borderRadius: 99,
    border: '1.5px solid rgba(255,255,255,0.25)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 6px',
    transition: 'background 0.3s ease',
    flexShrink: 0,
  },
  trackIcon: {
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 0,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.28s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    pointerEvents: 'none',
    left: 3,
    zIndex: 1,
  },
  addBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.18s',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
};
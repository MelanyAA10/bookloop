// src/components/Navbar.jsx - Versión responsive
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navbar({
  activePage = 'discovery',
  onNavigate = () => {},
  user = { initials: 'JR', name: 'Juliet Ramos' },
  theme = 'light',
  onToggleTheme = () => {},
}) {
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const links = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'community', label: 'Community' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <nav style={styles.nav}>
      <button style={styles.logoBtn} onClick={() => onNavigate('discovery')}>
        <Logo size={isMobile ? 24 : 28} variant="light" />
      </button>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          style={styles.menuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          <span style={{ ...styles.menuIcon, transform: isMobileMenuOpen ? 'rotate(45deg)' : 'none' }} />
          <span style={{ ...styles.menuIcon, opacity: isMobileMenuOpen ? 0 : 1, width: 18 }} />
          <span style={{ ...styles.menuIcon, transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'none', width: 12 }} />
        </button>
      )}

      {/* Desktop Links */}
      {!isMobile && (
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
      )}

      {/* Mobile Menu Dropdown */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {links.map(l => (
            <button
              key={l.id}
              style={{ ...styles.mobileLink, ...(activePage === l.id ? styles.mobileLinkActive : {}) }}
              onClick={() => {
                onNavigate(l.id);
                setIsMobileMenuOpen(false);
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <div style={styles.right}>
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Toggle theme"
          style={{
            ...styles.toggle,
            background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.25)',
          }}
        >
          {/* Sol (lado izquierdo) */}
          <span style={{ ...styles.trackIcon, opacity: isDark ? 0.5 : 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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

          {/* Thumb (bolita que se mueve) */}
          <span style={{
            ...styles.thumb,
            transform: isDark ? 'translateX(24px)' : 'translateX(0px)',
            background: '#fff',
          }}>
            {isDark ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#1A1009" stroke="#1A1009" strokeWidth="1">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#5A0E0E" stroke="#5A0E0E" strokeWidth="1">
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

          {/* Luna (lado derecho) */}
          <span style={{ ...styles.trackIcon, justifyContent: 'flex-end', opacity: isDark ? 1 : 0.5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
        </button>

        {!isMobile && (
          <button style={styles.addBtn} onClick={() => onNavigate('addbook')}>
            + Add Book
          </button>
        )}

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
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 12,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    flexWrap: 'wrap',
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
  menuBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: 8,
    padding: '10px 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-end',
  },
  menuIcon: {
    width: 20,
    height: 2,
    background: '#fff',
    borderRadius: 2,
    transition: 'all 0.2s ease',
  },
  mobileMenu: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    background: '#5A0E0E',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    zIndex: 99,
  },
  mobileLink: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    padding: '10px 12px',
    borderRadius: 6,
    textAlign: 'left',
    width: '100%',
  },
  mobileLinkActive: {
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.1)',
  },
  links: {
    display: 'flex',
    gap: 4,
    marginLeft: 20,
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
    gap: 8,
    marginLeft: 'auto',
  },
  toggle: {
    position: 'relative',
    width: 56,
    height: 28,
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
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 0,
    width: 18,
    height: 18,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.28s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    pointerEvents: 'none',
    left: 2,
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
    flexShrink: 0,
  },
};
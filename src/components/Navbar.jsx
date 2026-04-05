// src/components/Navbar.jsx
import React, { useState } from 'react';
import Logo from './Logo';

/**
 * Top navigation bar used across all authenticated screens.
 * Props:
 *   activePage  – 'discovery' | 'community' | 'messages' | 'profile'
 *   onNavigate  – fn(page) called when a nav link is clicked
 *   user        – { initials, name }
 */
export default function Navbar({ activePage = 'discovery', onNavigate = () => {}, user = { initials: 'JR', name: 'Juliet Ramos' } }) {
  const [menuOpen, setMenuOpen] = useState(false);

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

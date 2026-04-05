// src/components/UI.jsx
// Shared primitive components used across all pages
import React from 'react';

/* ── Button ─────────────────────────────────────── */
export function Button({ variant = 'primary', children, style, ...props }) {
  const base = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    padding: '9px 20px',
    cursor: 'pointer',
    transition: 'all 0.18s',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: {
      background: '#C94040',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(139,28,28,0.28)',
    },
    secondary: {
      background: '#8B1C1C',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(90,14,14,0.28)',
    },
    outline: {
      background: 'transparent',
      border: '1.5px solid #8B1C1C',
      color: '#8B1C1C',
    },
    ghost: {
      background: 'rgba(139,28,28,0.07)',
      color: '#8B1C1C',
    },
    dark: {
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.25)',
      color: '#fff',
    },
    full: {
      background: '#8B1C1C',
      color: '#fff',
      width: '100%',
      justifyContent: 'center',
      padding: '11px 20px',
    },
    danger: {
      background: 'transparent',
      border: '1.5px solid #D9534F',
      color: '#D9534F',
    },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

/* ── Input ──────────────────────────────────────── */
export function Input({ label, style, inputStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && (
        <label style={{ fontSize: 12, color: '#5C4A35', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1.5px solid #D9CFC0',
          borderRadius: 6,
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          background: '#fff',
          color: '#1A1009',
          transition: 'border-color 0.18s',
          ...inputStyle,
        }}
        {...props}
      />
    </div>
  );
}

/* ── Textarea ───────────────────────────────────── */
export function Textarea({ label, style, textareaStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && (
        <label style={{ fontSize: 12, color: '#5C4A35', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1.5px solid #D9CFC0',
          borderRadius: 6,
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          background: '#fff',
          color: '#1A1009',
          resize: 'vertical',
          minHeight: 80,
          ...textareaStyle,
        }}
        {...props}
      />
    </div>
  );
}

/* ── Badge ──────────────────────────────────────── */
export function Badge({ children, variant = 'default', style }) {
  const variants = {
    default:   { background: '#FFF4F4', border: '1px solid #F4B0B0', color: '#8B1C1C' },
    success:   { background: '#F0FFF4', border: '1px solid #9AE6B4', color: '#276749' },
    warning:   { background: '#FFFBF0', border: '1px solid #F6D860', color: '#744210' },
    muted:     { background: '#F3EDE3', border: '1px solid #D9CFC0', color: '#9E8B75' },
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Tag ────────────────────────────────────────── */
export function Tag({ children, active, onClick, style }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        background: active ? '#8B1C1C' : '#F3EDE3',
        color: active ? '#fff' : '#5C4A35',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Avatar ─────────────────────────────────────── */
export function Avatar({ initials, size = 34, style }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #C94040, #8B1C1C)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}

/* ── Card ───────────────────────────────────────── */
export function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #EBE4D7',
        borderRadius: 10,
        padding: 16,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── SectionLabel ───────────────────────────────── */
export function SectionLabel({ children, style }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#9E8B75',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: 10,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/* ── Divider ────────────────────────────────────── */
export function Divider({ style }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #EBE4D7',
        margin: '16px 0',
        ...style,
      }}
    />
  );
}

/* ── Stars ──────────────────────────────────────── */
export function Stars({ value = 5, max = 5, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#C94040', fontSize: size }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}>{i < Math.round(value) ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

/* ── BookCover ──────────────────────────────────── */
export function BookCover({ color = '#7A3728', title, width = 80, height = 110, style }) {
  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(145deg, ${color}cc, ${color})`,
        borderRadius: 5,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 8,
        boxShadow: '2px 3px 10px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* spine shadow */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'rgba(0,0,0,0.2)', borderRadius: '5px 0 0 5px' }} />
      {title && (
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: Math.max(9, width / 9), fontFamily: "'Playfair Display', serif", lineHeight: 1.2, fontWeight: 600 }}>
          {title}
        </span>
      )}
    </div>
  );
}

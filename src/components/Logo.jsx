// src/components/Logo.jsx
import React from 'react';

/**
 * BookLoop logo — SVG mark + wordmark
 * Props:
 *   size     – pixel height (default 32)
 *   variant  – 'light' (white text) | 'dark' (dark text) | 'color' (crimson)
 *   showMark – show the icon mark beside the wordmark (default true)
 */
export default function Logo({ size = 32, variant = 'light', showMark = true }) {
  const colors = {
    light:  { text: '#FFFFFF', accent: '#C94040', mark: '#C94040', loop: 'rgba(255,255,255,0.35)' },
    dark:   { text: '#1A1009', accent: '#8B1C1C', mark: '#8B1C1C', loop: 'rgba(139,28,28,0.25)' },
    color:  { text: '#8B1C1C', accent: '#C94040', mark: '#C94040', loop: 'rgba(201,64,64,0.25)' },
  };
  const c = colors[variant] || colors.light;
  const iconSize = size * 0.9;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 }}>
      {showMark && (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Book spine */}
          <rect x="7" y="5" width="5" height="26" rx="1.5" fill={c.mark} />
          {/* Book pages */}
          <rect x="12" y="7" width="13" height="22" rx="1" fill={c.text} fillOpacity="0.15" />
          <rect x="12" y="7" width="13" height="22" rx="1" stroke={c.mark} strokeWidth="1.4" />
          {/* Loop arrow – circular arrow suggesting return/cycle */}
          <path
            d="M21 13 C25.5 13 28 16 28 19.5 C28 23.5 25 26 21 26"
            stroke={c.accent}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M19 24 L21.5 26.5 L19 29"
            stroke={c.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Page lines */}
          <line x1="15" y1="11" x2="22" y2="11" stroke={c.mark} strokeWidth="1" strokeOpacity="0.5" />
          <line x1="15" y1="14" x2="22" y2="14" stroke={c.mark} strokeWidth="1" strokeOpacity="0.5" />
          <line x1="15" y1="17" x2="20" y2="17" stroke={c.mark} strokeWidth="1" strokeOpacity="0.5" />
        </svg>
      )}
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: size * 0.72,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: c.text,
          lineHeight: 1,
        }}
      >
        Book<span style={{ color: c.accent }}>Loop</span>
      </span>
    </span>
  );
}

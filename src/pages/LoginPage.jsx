// src/pages/LoginPage.jsx - Responsive version (partial - fix positions)
// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { Button, Input } from '../components/UI';
import illustration from '../assets/bookloop-illustration.png';
import principito from '../assets/principito.png';
import planeta from '../assets/planeta.png';
import zorrito from '../assets/zorrito.png';
import pajaros from '../assets/pajaros.png';
import avion from '../assets/Avión.png';
import arbol from '../assets/arbol.png';

export default function LoginPage({ onLogin = () => {}, onSignup = () => {} }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={s.root}>
      {/* Fondo */}
      <div style={{ ...s.bgIllustration, backgroundImage: `url(${illustration})` }} />

      {/* Panel login */}
      <div style={isMobile ? s.panelMobile : s.panel}>
        <div style={s.brand}>
          <Logo size={isMobile ? 32 : 38} variant="light" />

          <div style={s.tagline}>
            <p style={s.taglineText}>
              Share stories.<br />
              Build community.<br />
              <em style={s.taglineEm}>Loop books forever.</em>
            </p>
          </div>

          {!isMobile && (
            <div style={s.quoteBox}>
              <span style={s.quoteMark}>"</span>
              <p style={s.quoteText}>
                All grown-ups were once children… but only few of them remember it
              </p>
              <p style={s.quoteAuthor}>— Antoine de Saint-Exupéry</p>
            </div>
          )}
        </div>

        <div style={s.formSide}>
          <h1 style={s.heading}>Welcome back</h1>
          <p style={s.subheading}>Sign in to continue lending &amp; borrowing</p>

          <form onSubmit={e => { e.preventDefault(); onLogin(); }} style={s.form}>
            <Input
              label="University Email"
              type="email"
              placeholder="domain@tec.cr"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <div style={{ position: 'relative' }}>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={s.eyeBtn}
              >
                {showPw ? '○' : '●'}
              </button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="button" style={s.forgotLink}>Forgot password?</button>
            </div>

            <Button variant="full" type="submit">
              Sign In →
            </Button>
          </form>

          <p style={s.signupPrompt}>
            Not in the community?{' '}
            <button type="button" style={s.signupLink} onClick={onSignup}>
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* Floating elements - hide on mobile */}
      {!isMobile && (
        <>
          <img src={avion} alt="avion" style={s.avion} />
          <img src={pajaros} alt="pajaros" style={s.pajaros} />
          <img src={planeta} alt="planeta" style={s.planeta} />
          <img src={arbol} alt="arbol" style={s.arbol} />
          <img src={principito} alt="principito" style={s.principito} />
          <img src={zorrito} alt="zorrito" style={s.zorrito} />
        </>
      )}
    </div>
  );
}

const s = {
  root: {
    minHeight: '100vh',
    background: '#E6E1D3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    position: 'relative',
    overflow: 'hidden',
  },

  bgIllustration: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 0,
    pointerEvents: 'none',
  },

  panel: {
    display: 'flex',
    background: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 32px 100px rgba(26,16,9,0.22)',
    width: '100%',
    maxWidth: 820,
    position: 'relative',
    zIndex: 1,
  },

  panelMobile: {
    display: 'flex',
    flexDirection: 'column',
    background: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 32px 100px rgba(26,16,9,0.22)',
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    zIndex: 1,
  },

  brand: {
    background: 'linear-gradient(155deg, #3A0808, #8B1C1C)',
    padding: '32px 28px',
    flex: '0 0 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },

  tagline: { flex: 1 },

  taglineText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(20px, 5vw, 24px)',
    color: 'rgba(255,255,255,0.9)',
  },

  taglineEm: {
    color: '#F0A0A0',
    fontStyle: 'italic',
  },

  quoteBox: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 14,
  },

  quoteMark: { fontSize: 30, color: '#C94040' },

  quoteText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },

  quoteAuthor: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },

  formSide: {
    padding: '32px 28px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    color: '#1A1009',
    background: '#FFFFFF',
  },

  heading: { fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: 700, color: '#1A1009' },

  subheading: {
    fontSize: 14,
    color: '#9E8B75',
    marginBottom: 20,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },

  eyeBtn: {
    position: 'absolute',
    right: 12,
    bottom: 11,
    background: 'transparent',
  },

  forgotLink: {
    color: '#8B1C1C',
    fontSize: 12,
    background: 'transparent',
  },

  signupPrompt: {
    textAlign: 'center',
    marginTop: 'auto',
    color: '#1A1009',
  },

  signupLink: {
    color: '#8B1C1C',
    textDecoration: 'underline',
    background: 'transparent',
  },

  // Hide decorative elements on mobile
  avion: {
    position: 'absolute',
    top: '65%',
    left: '-1%',
    width: 400,
    zIndex: 1,
    opacity: 0.8,
    transform: 'rotate(-10deg)',
    pointerEvents: 'none',
  },

  pajaros: {
    position: 'absolute',
    top: '-14%',
    right: '41%',
    width: 495,
    zIndex: 1,
    opacity: 0.7,
    pointerEvents: 'none',
  },

  planeta: {
    position: 'absolute',
    top: '55%',
    left: '20%',
    width: 220,
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },

  principito: {
    position: 'absolute',
    top: '78.3%',
    left: '44%',
    transform: 'translate(-50%, -50%)',
    width: 447,
    zIndex: 2,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.35))',
  },

  zorrito: {
    position: 'absolute',
    top: '50%',
    right: '22.5%',
    transform: 'translate(50%, -50%)',
    width: 220,
    zIndex: 2,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.25))',
  },

  arbol: {
    position: 'absolute',
    top: '80%',
    left: '82%',
    width: 600,
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
  },
};
// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import Logo from '../components/Logo';
import { Button, Input } from '../components/UI';

/**
 * Sign up page
 * Props:
 *   onSignup – fn() called on submit
 *   onLogin  – fn() to navigate back to login
 */
export default function SignupPage({ onSignup = () => {}, onLogin = () => {} }) {
  const [form, setForm] = useState({ name: '', email: '', university: '', password: '', confirm: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => { e.preventDefault(); onSignup(); };

  return (
    <div style={s.root}>
      <div style={s.bg} />

      <div style={s.card}>
        <div style={s.header}>
          <Logo size={28} variant="light" />
          <p style={s.headerSub}>Join the academic book-sharing community</p>
        </div>

        <div style={s.body}>
          <h2 style={s.title}>Create your account</h2>
          <p style={s.subtitle}>Start sharing books with fellow students</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
              <Input label="Full Name" placeholder="Juliet Ramos" value={form.name} onChange={set('name')} style={{ flex: 1 }} />
              <Input label="University" placeholder="TEC San Carlos" value={form.university} onChange={set('university')} style={{ flex: 1 }} />
            </div>
            <Input label="University Email" type="email" placeholder="you@tec.ac.cr" value={form.email} onChange={set('email')} />
            <div style={s.row}>
              <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} style={{ flex: 1 }} />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} style={{ flex: 1 }} />
            </div>

            <label style={s.terms}>
              <input type="checkbox" style={{ accentColor: '#8B1C1C' }} />
              <span>I agree to the <span style={s.link}>Terms of Service</span> and <span style={s.link}>Community Guidelines</span></span>
            </label>

            <Button variant="full" type="submit" style={s.submitBtn}>
              Create Account →
            </Button>
          </form>

          <p style={s.loginPrompt}>
            Already a member?{' '}
            <button type="button" style={s.loginLink} onClick={onLogin}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: '100vh',
    background: '#FAF7F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,28,28,0.06) 0%, transparent 80%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(26,16,9,0.14)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    background: 'linear-gradient(135deg, #5A0E0E, #8B1C1C)',
    padding: '28px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: "'DM Sans', sans-serif",
  },
  body: { padding: '32px 36px' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: '#9E8B75', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', gap: 12 },
  terms: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
    color: '#5C4A35',
    cursor: 'pointer',
    lineHeight: 1.5,
  },
  link: { color: '#8B1C1C', cursor: 'pointer', textDecoration: 'underline' },
  submitBtn: {
    fontSize: 14,
    padding: '12px 20px',
    background: '#8B1C1C',
    boxShadow: '0 4px 16px rgba(139,28,28,0.3)',
  },
  loginPrompt: { textAlign: 'center', fontSize: 12, color: '#9E8B75', marginTop: 20 },
  loginLink: {
    background: 'none',
    border: 'none',
    color: '#8B1C1C',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    textDecoration: 'underline',
  },
};

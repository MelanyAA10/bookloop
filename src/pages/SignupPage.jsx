// src/pages/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { Button, Input } from '../components/UI';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignupPage({ onSignup = () => {}, onLogin = () => {} }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    password: '',
    confirm: '',
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const set = k => e => {
    setError('');
    setForm(f => ({ ...f, [k]: e.target.value }));
  };

const getFirebaseError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado. Intente iniciar sesión.';
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'El registro con correo y contraseña no está habilitado en Firebase.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Revise su internet o intente nuevamente.';
    case 'auth/api-key-not-valid':
      return 'La API Key de Firebase no es válida. Revise el archivo firebase.js.';
    case 'auth/invalid-api-key':
      return 'La API Key de Firebase es inválida.';
    case 'auth/app-not-authorized':
      return 'Esta app no está autorizada para usar Firebase Authentication.';
    default:
      return `No se pudo crear la cuenta. Error: ${code}`;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const name = form.name.trim();
  const email = form.email.trim();
  const university = form.university.trim();

  if (!name || !email || !university || !form.password || !form.confirm) {
    setError('Complete todos los campos.');
    return;
  }

  if (form.password.length < 6) {
    setError('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  if (form.password !== form.confirm) {
    setError('Las contraseñas no coinciden.');
    return;
  }

  try {
    setLoading(true);

    console.log('Intentando crear usuario en Firebase Auth...');

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      form.password
    );

    const user = userCredential.user;

    console.log('Usuario creado en Auth:', user.uid);

    try {
      console.log('Actualizando perfil del usuario...');

      await updateProfile(user, {
        displayName: name,
      });

      console.log('Perfil actualizado correctamente.');
    } catch (profileError) {
      console.error('Error al actualizar perfil:', profileError.code, profileError.message);
    }

    try {
      console.log('Guardando usuario en Firestore...');

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        university,
        createdAt: serverTimestamp(),
      });

      console.log('Usuario guardado en Firestore correctamente.');
    } catch (firestoreError) {
      console.error(
        'Error al guardar en Firestore:',
        firestoreError.code,
        firestoreError.message
      );

      setError(
        `La cuenta se creó, pero falló al guardar en Firestore: ${firestoreError.code}`
      );

      return;
    }

    onSignup(user);

  } catch (authError) {
    console.error(
      'Error al crear usuario en Auth:',
      authError.code,
      authError.message
    );

    setError(getFirebaseError(authError.code));
  } finally {
    setLoading(false);
  }
};

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
            <div style={isMobile ? s.rowMobile : s.row}>
              <Input
                label="Full Name"
                placeholder="Juliet Ramos"
                value={form.name}
                onChange={set('name')}
                style={{ flex: 1 }}
              />

              <Input
                label="University"
                placeholder="TEC San Carlos"
                value={form.university}
                onChange={set('university')}
                style={{ flex: 1 }}
              />
            </div>

            <Input
              label="University Email"
              type="email"
              placeholder="you@tec.ac.cr"
              value={form.email}
              onChange={set('email')}
            />

            <div style={isMobile ? s.rowMobile : s.row}>
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                style={{ flex: 1 }}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set('confirm')}
                style={{ flex: 1 }}
              />
            </div>

            <label style={s.terms}>
              <input type="checkbox" required style={{ accentColor: '#8B1C1C' }} />
              <span>
                I agree to the <span style={s.link}>Terms of Service</span> and{' '}
                <span style={s.link}>Community Guidelines</span>
              </span>
            </label>

            {error && <p style={s.error}>{error}</p>}

            <Button
              variant="full"
              type="submit"
              style={s.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </Button>
          </form>

          <p style={s.loginPrompt}>
            Already a member?{' '}
            <button type="button" style={s.loginLink} onClick={onLogin}>
              Sign in
            </button>
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
    padding: '20px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,28,28,0.06) 0%, transparent 80%)',
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
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: "'DM Sans', sans-serif",
  },
  body: { padding: '24px 20px' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(20px, 5vw, 22px)',
    fontWeight: 600,
    color: '#1A1009',
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: '#9E8B75', marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', gap: 12 },
  rowMobile: { display: 'flex', flexDirection: 'column', gap: 12 },
  terms: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
    color: '#5C4A35',
    cursor: 'pointer',
    lineHeight: 1.5,
  },
  link: {
    color: '#8B1C1C',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  submitBtn: {
    fontSize: 14,
    padding: '12px 20px',
    background: '#8B1C1C',
    boxShadow: '0 4px 16px rgba(139,28,28,0.3)',
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9E8B75',
    marginTop: 20,
  },
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
  error: {
    background: '#FDECEC',
    color: '#8B1C1C',
    border: '1px solid rgba(139,28,28,0.2)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12,
    margin: 0,
  },
};
// src/App.jsx
import React, { useState, useEffect } from 'react';
import './styles/globals.css';

import LoginPage       from './pages/LoginPage';
import SignupPage      from './pages/SignupPage';
import DiscoveryPage   from './pages/DiscoveryPage';
import BookDetailPage  from './pages/BookDetailPage';
import LoanConfirmPage from './pages/LoanConfirmPage';
import LoanReturnPage  from './pages/LoanReturnPage';
import AddBookPage     from './pages/AddBookPage';
import CommunityPage   from './pages/CommunityPage';
import MessagesPage    from './pages/MessagesPage';
import ProfilePage     from './pages/ProfilePage';

const PAGES = {
  login:       LoginPage,
  signup:      SignupPage,
  discovery:   DiscoveryPage,
  bookdetail:  BookDetailPage,
  loanconfirm: LoanConfirmPage,
  loanreturn:  LoanReturnPage,
  addbook:     AddBookPage,
  community:   CommunityPage,
  messages:    MessagesPage,
  profile:     ProfilePage,
};

// ─── Clave única en localStorage ─────────────────────────────────────────────
const THEME_KEY = 'bookloop-theme';

/**
 * Lee el tema persistido en localStorage.
 * - Si existe 'dark' o 'light' guardado, lo respeta siempre.
 * - Solo cae al default 'light' cuando no hay ningún valor guardado aún.
 */
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage puede estar bloqueado en modo privado.
  }
  return 'light';
};


export default function App() {
  const [page, setPage] = useState('login');
  const [selectedBookId, setSelectedBookId] = useState(null);

  // El estado del tema se inicializa UNA sola vez leyendo localStorage.
  const [theme, setTheme] = useState(getInitialTheme);

  /**
   * Efecto de sincronización: cada vez que cambia `theme` o `page`,
   * aplica la clase correcta al <body> y persiste en localStorage.
   *
   * Regla visual para auth: login y signup se renderizan siempre en 'light'
   * porque su diseño no soporta dark mode. El estado `theme` conserva el
   * valor real para restaurarlo al navegar a otras páginas.
   */
  useEffect(() => {
    const isAuthPage = page === 'login' || page === 'signup';
    const bodyTheme  = isAuthPage ? 'light' : theme;

    document.body.classList.remove('light', 'dark');
    document.body.classList.add(bodyTheme);

    // Solo persistimos el tema cuando el usuario ya pasó el login,
    // para no pisar su preferencia con 'light' al recargar.
    if (!isAuthPage) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // Silenciar errores de escritura en contextos restringidos.
      }
    }
  }, [theme, page]);

  /** Alterna entre 'dark' y 'light', persiste y actualiza el estado. */
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        // Persistir aquí garantiza que localStorage tenga el valor correcto
        // incluso si el efecto se ejecuta de forma asíncrona.
        localStorage.setItem(THEME_KEY, next);
      } catch { /* silenciar */ }
      return next;
    });
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const navigate = (to, data = null) => {
    if (data?.id) setSelectedBookId(data.id);
    if (to === 'discovery') setSelectedBookId(null);
    if (PAGES[to]) setPage(to);
  };

  // ── Render por página ─────────────────────────────────────────────────────
  // Las páginas de autenticación no reciben onToggleTheme intencionalmente.
  if (page === 'login') {
    return (
      <LoginPage
        onLogin={() => navigate('discovery')}
        onSignup={() => navigate('signup')}
      />
    );
  }

  if (page === 'signup') {
    return (
      <SignupPage
        onSignup={() => navigate('discovery')}
        onLogin={() => navigate('login')}
      />
    );
  }

  if (page === 'bookdetail') {
    return (
      <BookDetailPage
        onNavigate={navigate}
        bookId={selectedBookId || 1}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (page === 'loanconfirm') {
    return (
      <LoanConfirmPage
        onNavigate={navigate}
        bookId={selectedBookId}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Todas las demás páginas autenticadas reciben las props de tema.
  const Page = PAGES[page] || DiscoveryPage;
  return (
    <Page
      onNavigate={navigate}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

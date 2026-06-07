// src/App.jsx
import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import { useUser } from './context/UserContext';

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

const THEME_KEY = 'bookloop-theme';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {    
  }
  return 'light';
};


export default function App() {
  const { user } = useUser();

  const [page, setPage] = useState(() => (user ? 'discovery' : 'login'));
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [chatTarget, setChatTarget] = useState(null); // destinatario al abrir un chat desde un libro

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (!user && page !== 'login' && page !== 'signup') {
      setPage('login');
    }
  }, [user]);

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
      }
    }
  }, [theme, page]);
  
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {        
        localStorage.setItem(THEME_KEY, next);
      } catch { }
      return next;
    });
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const navigate = (to, data = null) => {
    if (data?.id) setSelectedBookId(data.id);
    if (to === 'discovery') setSelectedBookId(null);
    if (to === 'messages') setChatTarget(data?.chatTarget || null);
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
      <>
        <BookDetailPage
          onNavigate={navigate}
          bookId={selectedBookId || 1}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </>
    );
  }

  if (page === 'loanconfirm') {
    return (
      <>
        <LoanConfirmPage
          onNavigate={navigate}
          bookId={selectedBookId}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </>
    );
  }

  // Todas las demás páginas autenticadas reciben las props de tema.
  const Page = PAGES[page] || DiscoveryPage;
  return (
    <>
      <Page
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        {...(page === 'messages' ? { chatTarget } : {})}
      />
    </>
  );
}
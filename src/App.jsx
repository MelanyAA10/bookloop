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

export default function App() {
  const [page, setPage] = useState('login');
  const [selectedBookId, setSelectedBookId] = useState(null);

  // ── TEMA ────────────────────────────────────────────────────────────────
  // Lee el tema guardado; si no hay, usa la preferencia del sistema operativo
  const getInitialTheme = () => {
    const saved = localStorage.getItem('bookloop-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Aplica la clase al <body> cada vez que cambie el tema
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('bookloop-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  // ────────────────────────────────────────────────────────────────────────

  const navigate = (to, data = null) => {
    if (data && data.id) setSelectedBookId(data.id);
    if (to === 'discovery') setSelectedBookId(null);
    if (PAGES[to]) setPage(to);
  };

  // Auth pages
  if (page === 'login') {
    return (
      <LoginPage
        onLogin={() => navigate('discovery')}
        onSignup={() => navigate('signup')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }
  if (page === 'signup') {
    return (
      <SignupPage
        onSignup={() => navigate('discovery')}
        onLogin={() => navigate('login')}
        theme={theme}
        onToggleTheme={toggleTheme}
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

  const Page = PAGES[page] || DiscoveryPage;
  return <Page onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
}
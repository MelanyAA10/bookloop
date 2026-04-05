// src/App.jsx
// Root component — simple client-side "router" using state.
// Replace with React Router v6 when integrating into a real project.

import React, { useState } from 'react';
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

  const navigate = (to) => {
    if (PAGES[to]) setPage(to);
  };

  const Page = PAGES[page] || DiscoveryPage;

  // Auth pages don't receive onNavigate the same way
  if (page === 'login') {
    return <LoginPage onLogin={() => navigate('discovery')} onSignup={() => navigate('signup')} />;
  }
  if (page === 'signup') {
    return <SignupPage onSignup={() => navigate('discovery')} onLogin={() => navigate('login')} />;
  }

  return <Page onNavigate={navigate} />;
}

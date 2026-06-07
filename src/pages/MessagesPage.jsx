// src/pages/MessagesPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar } from '../components/UI';
import {
  apiFetch, uploadToCloudinary, lendBook, returnBook,
  addReview, getAvailableBooks, getBorrowedBooks,
} from '../config/api';
import { useUser } from '../context/UserContext';

// ── Tarjetas de préstamo codificadas en el texto del mensaje ───────────────────
const LOAN_PREFIX = '[[LOAN]]';
const encodeLoan = (obj) => LOAN_PREFIX + JSON.stringify(obj);
const parseLoan = (text) => {
  if (typeof text !== 'string' || !text.startsWith(LOAN_PREFIX)) return null;
  try { return JSON.parse(text.slice(LOAN_PREFIX.length)); } catch { return null; }
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const SendIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const ArrowLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const SearchIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BookIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const ReturnIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
);

const CHATS_PAGE_SIZE = 15;
const MESSAGES_PAGE_SIZE = 20;
const PHOTO_SLOTS = ['Front Cover', 'Back Cover', 'Spine', 'Interior'];

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '??';
};
const formatTime = (iso) => {
  if (!iso) return '';
  let s = iso;
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) s += 'Z';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function MessagesPage({ onNavigate = () => {}, theme, onToggleTheme, chatTarget = null }) {
  const { user } = useUser();
  const myId = user?.id;

  const [conversations, setConversations] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatsPage, setChatsPage] = useState(0);
  const [chatsTotalPages, setChatsTotalPages] = useState(1);

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgPage, setMsgPage] = useState(0);
  const [msgTotalPages, setMsgTotalPages] = useState(1);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Estado local de tarjetas resueltas (id de mensaje -> nuevo status)
  const [loanOverrides, setLoanOverrides] = useState({});

  // Modales
  const [lendOpen, setLendOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [modalBooks, setModalBooks] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalBusy, setModalBusy] = useState(false);

  const activeConv = conversations.find(c => c.id === activeId);

  useEffect(() => {
    const handleResize = () => {
      const m = window.innerWidth <= 768;
      setIsMobile(m);
      if (!m) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { if (myId) fetchChats(0); }, [myId]);

  const consumedChatTarget = useRef(null);
  useEffect(() => {
    if (chatTarget && myId && chatTarget !== consumedChatTarget.current) {
      consumedChatTarget.current = chatTarget;
      openOrCreateChat(chatTarget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTarget, myId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeId]);

  const mapChat = (c) => {
    const other = (c.participants || []).find(p => p.userId !== myId) || {};
    return {
      id: c.id,
      otherUserId: other.userId,
      name: other.name || 'Usuario',
      initials: other.initials || getInitials(other.name),
      preview: c.lastMessage?.content || 'Sin mensajes aún',
      time: c.lastMessage ? formatTime(c.lastMessage.sentAt) : '',
      unread: c.unreadCount || 0,
    };
  };

  const fetchChats = async (page = 0) => {
    if (!myId) return;
    setLoadingChats(true);
    try {
      const res = await apiFetch(`/chats/user/${myId}?page=${page}&size=${CHATS_PAGE_SIZE}&sort=createdAt,desc`);
      const data = await res.json();
      const list = (data.content || []).map(mapChat);
      setConversations(list);
      setChatsPage(data.page ?? page);
      setChatsTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setConversations([]);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId, page = 0) => {
    setLoadingMessages(true);
    try {
      const res = await apiFetch(`/chats/${chatId}/messages?page=${page}&size=${MESSAGES_PAGE_SIZE}&sort=sentAt,asc`);
      const data = await res.json();
      const list = (data.content || []).map(m => ({
        id: m.id,
        senderId: m.senderId,
        sender: m.senderId === myId ? 'me' : 'them',
        text: m.content,
        time: formatTime(m.sentAt),
      }));
      setMessages(prev => page > 0 ? [...list, ...prev] : list);
      setMsgPage(data.page ?? page);
      setMsgTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (page === 0) setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markChatAsRead = async (chatId) => {
    if (!myId || !chatId) return;
    setConversations(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
    try {
      await apiFetch(`/chats/${chatId}/messages/read?readerId=${myId}`, { method: 'POST' });
    } catch (err) {
      console.error('Error marcando como leídos:', err);
    }
  };

  const handleSelectConv = (id) => {
    setActiveId(id);
    setMsgPage(0);
    fetchMessages(id, 0);
    markChatAsRead(id);
    if (isMobile) setShowSidebar(false);
  };

  const openOrCreateChat = async (target) => {
    if (!myId || !target?.userId) return;
    try {
      const res = await apiFetch(`/chats/user/${myId}`, {
        method: 'POST',
        body: JSON.stringify({
          name1: user?.name || 'Usuario',
          initials1: user?.initials || getInitials(user?.name),
          userId2: target.userId,
          name2: target.name || 'Usuario',
          initials2: target.initials || getInitials(target.name),
        }),
      });
      if (!res.ok) throw new Error('status ' + res.status);
      const chat = await res.json();
      await fetchChats(0);
      setActiveId(chat.id);
      setMsgPage(0);
      fetchMessages(chat.id, 0);
      markChatAsRead(chat.id);
      if (isMobile) setShowSidebar(false);
    } catch (err) {
      console.error('Error abriendo/creando chat:', err);
      alert('No se pudo abrir el chat. Intenta de nuevo.');
    }
  };

  // Enviar un mensaje (texto normal o tarjeta codificada)
  const postMessage = async (content) => {
    if (!activeId) return null;
    const res = await apiFetch(`/chats/${activeId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId: myId, content }),
    });
    if (!res.ok) throw new Error('status ' + res.status);
    return res.json();
  };

  const sendText = async () => {
    if (!input.trim() || !activeId || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { id: tempId, senderId: myId, sender: 'me', text: content, time: formatTime(new Date().toISOString()) }]);
    try {
      const saved = await postMessage(content);
      setMessages(prev => prev.map(m => m.id === tempId
        ? { id: saved.id, senderId: myId, sender: 'me', text: saved.content, time: formatTime(saved.sentAt) }
        : m));
      setConversations(prev => prev.map(c => c.id === activeId
        ? { ...c, preview: content, time: formatTime(new Date().toISOString()) } : c));
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  // ── PRESTAR: abrir modal con libros disponibles del dueño ─────────────────────
  const openLendModal = async () => {
    setLendOpen(true);
    setModalLoading(true);
    setModalBooks([]);
    try {
      const res = await getAvailableBooks(myId);
      const data = await res.json();
      setModalBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando libros disponibles:', err);
      setModalBooks([]);
    } finally {
      setModalLoading(false);
    }
  };

  // ── DEVOLVER: abrir modal con libros que tengo prestados ──────────────────────
  const openReturnModal = async () => {
    setReturnOpen(true);
    setModalLoading(true);
    setModalBooks([]);
    try {
      const res = await getBorrowedBooks(myId);
      const data = await res.json();
      setModalBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando libros prestados:', err);
      setModalBooks([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Enviar tarjeta de SOLICITUD de préstamo (la manda el dueño)
  const sendLoanRequest = async (book, condition, photos) => {
    const card = {
      kind: 'request',
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      condition,
      photos,                       // { 'Front Cover': url, ... }
      days: book.loanDays || 14,
      lenderId: myId,
      lenderName: user?.name || 'Usuario',
      status: 'pending',
      ts: Date.now(),
    };
    const tempId = 'temp-' + Date.now();
    const encoded = encodeLoan(card);
    setMessages(prev => [...prev, { id: tempId, senderId: myId, sender: 'me', text: encoded, time: formatTime(new Date().toISOString()) }]);
    try {
      const saved = await postMessage(encoded);
      setMessages(prev => prev.map(m => m.id === tempId
        ? { id: saved.id, senderId: myId, sender: 'me', text: saved.content, time: formatTime(saved.sentAt) } : m));
    } catch (err) {
      console.error('Error enviando solicitud de préstamo:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      throw err; // re-lanzar para que el modal lo atrape
    }
  };

  // Enviar tarjeta de DEVOLUCIÓN (la manda quien tiene el libro)
  const sendReturnRequest = async (book, condition, photos, comment, rating) => {
    const card = {
      kind: 'return',
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      condition,
      photos,
      comment,
      rating,
      borrowerId: myId,
      borrowerName: user?.name || 'Usuario',
      status: 'pending',
      ts: Date.now(),
    };
    const tempId = 'temp-' + Date.now();
    const encoded = encodeLoan(card);
    setMessages(prev => [...prev, { id: tempId, senderId: myId, sender: 'me', text: encoded, time: formatTime(new Date().toISOString()) }]);
    try {
      const saved = await postMessage(encoded);
      setMessages(prev => prev.map(m => m.id === tempId
        ? { id: saved.id, senderId: myId, sender: 'me', text: saved.content, time: formatTime(saved.sentAt) } : m));
    } catch (err) {
      console.error('Error enviando solicitud de devolución:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      throw err;
    }
  };

  // Aceptar préstamo (lo hace el receptor) -> /lend
  const acceptLoan = async (msg, card) => {
    try {
      const res = await lendBook(card.bookId, myId);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.message || 'No se pudo aceptar (¿ya está prestado?)');
      }
      setLoanOverrides(prev => ({ ...prev, [msg.id]: 'accepted' }));
      await postMessage(`✓ Préstamo aceptado: "${card.bookTitle}"`);
      setMessages(prev => [...prev, { id: 'sys-' + Date.now(), senderId: myId, sender: 'me', text: `✓ Préstamo aceptado: "${card.bookTitle}"`, time: formatTime(new Date().toISOString()) }]);
    } catch (err) {
      alert(err.message || 'Error al aceptar el préstamo.');
    }
  };

  const declineLoan = async (msg, card) => {
    setLoanOverrides(prev => ({ ...prev, [msg.id]: 'declined' }));
    try {
      await postMessage(`✕ Préstamo rechazado: "${card.bookTitle}"`);
      setMessages(prev => [...prev, { id: 'sys-' + Date.now(), senderId: myId, sender: 'me', text: `✕ Préstamo rechazado: "${card.bookTitle}"`, time: formatTime(new Date().toISOString()) }]);
    } catch { /* ignore */ }
  };

  // Confirmar devolución (lo hace el dueño) -> /return + review
  const confirmReturn = async (msg, card, good) => {
    try {
      if (good) {
        const res = await returnBook(card.bookId);
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.message || 'No se pudo confirmar la devolución.');
        }
        // Guardar review con el rating + comentario del receptor
        const photoLinks = PHOTO_SLOTS.filter(l => card.photos?.[l]).map(l => `${l}: ${card.photos[l]}`).join(' | ');
        const text = [card.comment, photoLinks ? `[Condición devolución] ${photoLinks}` : ''].filter(Boolean).join(' — ') || 'Devuelto';
        await addReview(card.bookId, card.borrowerName || 'Usuario', text, card.rating || 5).catch(() => {});
      }
      setLoanOverrides(prev => ({ ...prev, [msg.id]: good ? 'returned' : 'return_rejected' }));
      const txt = good ? `✓ Devolución confirmada: "${card.bookTitle}" en buen estado` : `✕ Devolución no confirmada: "${card.bookTitle}"`;
      await postMessage(txt);
      setMessages(prev => [...prev, { id: 'sys-' + Date.now(), senderId: myId, sender: 'me', text: txt, time: formatTime(new Date().toISOString()) }]);
    } catch (err) {
      alert(err.message || 'Error al confirmar la devolución.');
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!myId) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="messages" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          Debes iniciar sesión para ver tus mensajes.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar activePage="messages" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* Sidebar */}
        {(!isMobile || showSidebar) && (
          <div style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Messages</h2>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <SearchIcon size={13} color="var(--text-muted)" />
                </div>
                <input
                  style={{ width: '100%', padding: '8px 12px 8px 30px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Search conversations…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingChats && <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>Cargando chats…</div>}
              {!loadingChats && filteredConversations.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  No tienes conversaciones aún. Abre un libro y toca "Message" para empezar.
                </div>
              )}

              {filteredConversations.map(c => (
                <div key={c.id} onClick={() => handleSelectConv(c.id)}
                  style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: activeId === c.id ? 'var(--bg-surface)' : 'transparent', borderLeft: activeId === c.id ? '3px solid var(--crimson)' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}><Avatar initials={c.initials} size={40} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: c.unread > 0 ? 700 : 600, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 11, color: c.unread > 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: c.unread > 0 ? 600 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.preview.startsWith(LOAN_PREFIX) ? '📚 Solicitud de préstamo' : c.preview}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <div style={{ background: 'var(--crimson)', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.unread > 9 ? '9+' : c.unread}
                    </div>
                  )}
                </div>
              ))}

              {!loadingChats && chatsTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12 }}>
                  <button onClick={() => fetchChats(chatsPage - 1)} disabled={chatsPage === 0} style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: chatsPage === 0 ? 'default' : 'pointer', opacity: chatsPage === 0 ? 0.4 : 1, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>←</button>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{chatsPage + 1} / {chatsTotalPages}</span>
                  <button onClick={() => fetchChats(chatsPage + 1)} disabled={chatsPage + 1 >= chatsTotalPages} style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: chatsPage + 1 >= chatsTotalPages ? 'default' : 'pointer', opacity: chatsPage + 1 >= chatsTotalPages ? 0.4 : 1, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>→</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat */}
        {(!isMobile || !showSidebar) && activeConv && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {isMobile && (
                <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <ArrowLeftIcon size={18} color="var(--text-muted)" />
                </button>
              )}
              <Avatar initials={activeConv.initials} size={36} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{activeConv.name}</p>
              </div>
              {/* Botones de préstamo */}
              <button onClick={openLendModal} title="Prestar un libro" style={hdrBtn}>
                <BookIcon size={16} color="var(--crimson)" />
              </button>
              <button onClick={openReturnModal} title="Devolver un libro" style={hdrBtn}>
                <ReturnIcon size={16} color="var(--crimson)" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
              {msgPage + 1 < msgTotalPages && (
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <button onClick={() => fetchMessages(activeId, msgPage + 1)} disabled={loadingMessages} style={{ border: '1px solid var(--border-light)', borderRadius: 16, padding: '5px 14px', fontSize: 11, cursor: 'pointer', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                    {loadingMessages ? 'Cargando…' : 'Ver mensajes anteriores'}
                  </button>
                </div>
              )}

              {loadingMessages && messages.length === 0 && <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: 'var(--text-muted)' }}>Cargando mensajes…</div>}
              {!loadingMessages && messages.length === 0 && <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: 'var(--text-muted)' }}>No hay mensajes aún. ¡Escribe el primero!</div>}

              {messages.map(msg => {
                const card = parseLoan(msg.text);
                if (card) {
                  return (
                    <LoanCard
                      key={msg.id}
                      msg={msg}
                      card={card}
                      myId={myId}
                      override={loanOverrides[msg.id]}
                      onAccept={() => acceptLoan(msg, card)}
                      onDecline={() => declineLoan(msg, card)}
                      onConfirmReturn={(good) => confirmReturn(msg, card, good)}
                    />
                  );
                }
                const isMe = msg.sender === 'me';
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
                    <div style={{ maxWidth: '68%', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--crimson)' : 'var(--bg-secondary)', border: isMe ? 'none' : '1px solid var(--border-light)', fontSize: 13, color: isMe ? '#fff' : 'var(--text-primary)', lineHeight: 1.55, boxShadow: isMe ? '0 2px 8px rgba(139,28,28,0.22)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 2, paddingRight: 2 }}>{msg.time}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ flex: 1, padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none' }}
                placeholder="Write a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendText()}
              />
              <button onClick={sendText} disabled={!input.trim() || sending} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--crimson)' : 'var(--bg-surface)', color: input.trim() ? '#fff' : 'var(--text-muted)', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                <SendIcon size={14} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
              </button>
            </div>
          </div>
        )}

        {!isMobile && !activeConv && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Selecciona una conversación para empezar
          </div>
        )}
      </div>

      {/* Modal PRESTAR */}
      {lendOpen && (
        <LendModal
          books={modalBooks}
          loading={modalLoading}
          busy={modalBusy}
          onClose={() => setLendOpen(false)}
          onSend={async (book, condition, photos) => {
            setModalBusy(true);
            try { await sendLoanRequest(book, condition, photos); setLendOpen(false); }
            catch { alert('No se pudo enviar la solicitud.'); }
            finally { setModalBusy(false); }
          }}
        />
      )}

      {/* Modal DEVOLVER */}
      {returnOpen && (
        <ReturnModal
          books={modalBooks}
          loading={modalLoading}
          busy={modalBusy}
          onClose={() => setReturnOpen(false)}
          onSend={async (book, condition, photos, comment, rating) => {
            setModalBusy(true);
            try { await sendReturnRequest(book, condition, photos, comment, rating); setReturnOpen(false); }
            catch { alert('No se pudo enviar la devolución.'); }
            finally { setModalBusy(false); }
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════ TARJETA DE PRÉSTAMO ════════════════════════
function LoanCard({ msg, card, myId, override, onAccept, onDecline, onConfirmReturn }) {
  const isMe = msg.sender === 'me';
  const status = override || card.status;
  const photos = PHOTO_SLOTS.filter(l => card.photos?.[l]);

  const isRequest = card.kind === 'request';
  // En request: el receptor (no el que la mandó) puede aceptar/declinar
  // En return: el dueño (no el que la mandó) puede confirmar
  const canAct = !isMe && status === 'pending';

  const statusLabel = {
    pending: isRequest ? 'Solicitud de préstamo' : 'Solicitud de devolución',
    accepted: '✓ Préstamo aceptado',
    declined: '✕ Préstamo rechazado',
    returned: '✓ Devolución confirmada',
    return_rejected: '✕ Devolución no confirmada',
  }[status] || 'Préstamo';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      <div style={{ maxWidth: '88%', width: 320, border: '1.5px solid var(--crimson)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-secondary)', boxShadow: '0 2px 12px rgba(139,28,28,0.12)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--crimson-dark, #5A0E0E), var(--crimson))', padding: '10px 14px' }}>
          <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
            {isRequest ? '📚 ' : '↩ '}{statusLabel}
          </p>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{card.bookTitle}</p>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-muted)' }}>{card.bookAuthor}</p>

          {card.condition && <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--text-secondary)' }}>Condición: <strong>{card.condition}</strong></p>}
          {isRequest && card.days && <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--text-secondary)' }}>Plazo: {card.days} días</p>}
          {!isRequest && card.rating != null && <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--text-secondary)' }}>Calificación: {'★'.repeat(card.rating)}{'☆'.repeat(5 - card.rating)}</p>}
          {!isRequest && card.comment && <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{card.comment}"</p>}

          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
              {photos.map(l => (
                <img key={l} src={card.photos[l]} alt={l} title={l} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-light)' }} />
              ))}
            </div>
          )}

          {canAct && isRequest && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={onAccept} style={btnPrimary}>Aceptar</button>
              <button onClick={onDecline} style={btnGhost}>Declinar</button>
            </div>
          )}
          {canAct && !isRequest && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => onConfirmReturn(true)} style={btnPrimary}>Sí, en buen estado</button>
              <button onClick={() => onConfirmReturn(false)} style={btnGhost}>No</button>
            </div>
          )}
          {!canAct && status === 'pending' && (
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {isMe ? 'Esperando respuesta…' : ''}
            </p>
          )}
        </div>
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{msg.time}</span>
    </div>
  );
}

// ════════════════════════ MODAL PRESTAR ════════════════════════
function LendModal({ books, loading, busy, onClose, onSend }) {
  const [selected, setSelected] = useState(null);
  const [condition, setCondition] = useState('Good');
  const [photos, setPhotos] = useState({});
  const [uploading, setUploading] = useState('');

  const handlePhoto = async (label, file) => {
    if (!file) return;
    setUploading(label);
    try { const url = await uploadToCloudinary(file); setPhotos(p => ({ ...p, [label]: url })); }
    catch { alert('Error subiendo la foto.'); }
    finally { setUploading(''); }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={modalHeader}>
          <span style={{ color: '#fff', fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Prestar un libro</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          {loading && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>Cargando tus libros disponibles…</p>}
          {!loading && books.length === 0 && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No tienes libros disponibles para prestar.</p>}

          {!loading && books.length > 0 && (
            <>
              <p style={sectLbl}>Elige un libro</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {books.map(b => (
                  <button key={b.id} onClick={() => setSelected(b)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: selected?.id === b.id ? '1.5px solid var(--crimson)' : '1.5px solid var(--border)', background: selected?.id === b.id ? 'rgba(139,28,28,0.06)' : 'var(--bg-surface)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{b.author}</span>
                  </button>
                ))}
              </div>

              {selected && (
                <>
                  <p style={sectLbl}>Condición</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    {['Excellent', 'Good', 'Fair'].map(c => (
                      <button key={c} onClick={() => setCondition(c)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: condition === c ? '1.5px solid var(--crimson)' : '1.5px solid var(--border)', background: condition === c ? 'rgba(139,28,28,0.06)' : 'var(--bg-surface)', color: condition === c ? 'var(--crimson)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontWeight: condition === c ? 600 : 400 }}>{c}</button>
                    ))}
                  </div>

                  <p style={sectLbl}>Fotos de condición</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {PHOTO_SLOTS.map(label => (
                      <label key={label} style={{ height: 70, borderRadius: 8, border: photos[label] ? '1.5px solid var(--crimson)' : '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                        {photos[label] ? <img src={photos[label]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : uploading === label ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Subiendo…</span>
                          : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+ {label}</span>}
                        <input type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handlePhoto(label, e.target.files?.[0])} />
                      </label>
                    ))}
                  </div>

                  <button disabled={busy} onClick={() => onSend(selected, condition, photos)} style={{ ...btnPrimary, width: '100%', padding: '11px 0', opacity: busy ? 0.6 : 1 }}>
                    {busy ? 'Enviando…' : 'Enviar solicitud de préstamo'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════ MODAL DEVOLVER ════════════════════════
function ReturnModal({ books, loading, busy, onClose, onSend }) {
  const [selected, setSelected] = useState(null);
  const [condition, setCondition] = useState('Good');
  const [photos, setPhotos] = useState({});
  const [uploading, setUploading] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const handlePhoto = async (label, file) => {
    if (!file) return;
    setUploading(label);
    try { const url = await uploadToCloudinary(file); setPhotos(p => ({ ...p, [label]: url })); }
    catch { alert('Error subiendo la foto.'); }
    finally { setUploading(''); }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={modalHeader}>
          <span style={{ color: '#fff', fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Devolver un libro</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          {loading && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>Cargando libros que tienes prestados…</p>}
          {!loading && books.length === 0 && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No tienes libros prestados para devolver.</p>}

          {!loading && books.length > 0 && (
            <>
              <p style={sectLbl}>Elige el libro a devolver</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {books.map(b => (
                  <button key={b.id} onClick={() => setSelected(b)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: selected?.id === b.id ? '1.5px solid var(--crimson)' : '1.5px solid var(--border)', background: selected?.id === b.id ? 'rgba(139,28,28,0.06)' : 'var(--bg-surface)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{b.author}</span>
                  </button>
                ))}
              </div>

              {selected && (
                <>
                  <p style={sectLbl}>Condición de devolución</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    {['Excellent', 'Good', 'Fair'].map(c => (
                      <button key={c} onClick={() => setCondition(c)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: condition === c ? '1.5px solid var(--crimson)' : '1.5px solid var(--border)', background: condition === c ? 'rgba(139,28,28,0.06)' : 'var(--bg-surface)', color: condition === c ? 'var(--crimson)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontWeight: condition === c ? 600 : 400 }}>{c}</button>
                    ))}
                  </div>

                  <p style={sectLbl}>Fotos</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {PHOTO_SLOTS.map(label => (
                      <label key={label} style={{ height: 70, borderRadius: 8, border: photos[label] ? '1.5px solid var(--crimson)' : '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                        {photos[label] ? <img src={photos[label]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : uploading === label ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Subiendo…</span>
                          : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+ {label}</span>}
                        <input type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handlePhoto(label, e.target.files?.[0])} />
                      </label>
                    ))}
                  </div>

                  <p style={sectLbl}>Califica al prestador</p>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} onClick={() => setRating(i)} style={{ fontSize: 26, cursor: 'pointer', color: i <= rating ? 'var(--crimson-light, #c0392b)' : 'var(--border)' }}>★</span>
                    ))}
                  </div>

                  <p style={sectLbl}>Comentario sobre el usuario</p>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Escribe un comentario…" style={{ width: '100%', minHeight: 60, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: 14 }} />

                  <button disabled={busy} onClick={() => onSend(selected, condition, photos, comment, rating)} style={{ ...btnPrimary, width: '100%', padding: '11px 0', opacity: busy ? 0.6 : 1 }}>
                    {busy ? 'Enviando…' : 'Enviar devolución'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── estilos compartidos ─────────────────────────────────────────────────────────
const hdrBtn = { width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const btnPrimary = { background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flex: 1 };
const btnGhost = { background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flex: 1 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 };
const modalBox = { background: 'var(--bg-secondary)', borderRadius: 14, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' };
const modalHeader = { background: 'linear-gradient(135deg, var(--crimson-dark, #5A0E0E), var(--crimson))', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', fontSize: 13, cursor: 'pointer' };
const sectLbl = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' };
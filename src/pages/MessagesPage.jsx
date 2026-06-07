// src/pages/MessagesPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar } from '../components/UI';
import { apiFetch } from '../config/api';
import { useUser } from '../context/UserContext';

// ── Icons ────────────────────────────────────────────────────────────────────
const BookIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SendIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
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

const CHATS_PAGE_SIZE = 15;
const MESSAGES_PAGE_SIZE = 20;

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

  useEffect(() => {
    const handleResize = () => {
      const m = window.innerWidth <= 768;
      setIsMobile(m);
      if (!m) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar lista de chats al entrar
  useEffect(() => {
    if (myId) fetchChats(0);
  }, [myId]);

  // Si venimos desde "Message" en un libro, abrir/crear ese chat
  useEffect(() => {
    if (chatTarget && myId) openOrCreateChat(chatTarget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTarget, myId]);

  // Scroll al final cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeId]);

  // Mapea un chat del backend a lo que la UI necesita
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
        sender: m.senderId === myId ? 'me' : 'them',
        text: m.content,
        time: formatTime(m.sentAt),
      }));
      // si es una página posterior, anteponer; si es la primera, reemplazar
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

  const handleSelectConv = (id) => {
    setActiveId(id);
    setMsgPage(0);
    fetchMessages(id, 0);
    if (isMobile) setShowSidebar(false);
  };

  // Abre el chat con el destinatario (si existe en la lista) o lo crea
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
      await fetchChats(0);          // refrescar la lista (puede ser nuevo)
      setActiveId(chat.id);
      setMsgPage(0);
      fetchMessages(chat.id, 0);
      if (isMobile) setShowSidebar(false);
    } catch (err) {
      console.error('Error abriendo/creando chat:', err);
      alert('No se pudo abrir el chat. Intenta de nuevo.');
    }
  };

  const sendText = async () => {
    if (!input.trim() || !activeId || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    // optimista
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { id: tempId, sender: 'me', text: content, time: formatTime(new Date().toISOString()) }]);
    try {
      const res = await apiFetch(`/chats/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ senderId: myId, content }),
      });
      if (!res.ok) throw new Error('status ' + res.status);
      const saved = await res.json();
      // reemplazar el temporal por el real
      setMessages(prev => prev.map(m => m.id === tempId
        ? { id: saved.id, sender: 'me', text: saved.content, time: formatTime(saved.sentAt) }
        : m));
      // actualizar preview en la lista
      setConversations(prev => prev.map(c => c.id === activeId
        ? { ...c, preview: content, time: formatTime(new Date().toISOString()) }
        : c));
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeId);

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

        {/* ── Sidebar ── */}
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
              {loadingChats && (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>Cargando chats…</div>
              )}

              {!loadingChats && filteredConversations.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  No tienes conversaciones aún. Abre un libro y toca "Message" para empezar.
                </div>
              )}

              {filteredConversations.map(c => (
                <div key={c.id} onClick={() => handleSelectConv(c.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: activeId === c.id ? 'var(--bg-surface)' : 'transparent', borderLeft: activeId === c.id ? '3px solid var(--crimson)' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar initials={c.initials} size={40} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</p>
                  </div>
                  {c.unread > 0 && <div style={{ background: 'var(--crimson)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</div>}
                </div>
              ))}

              {/* Paginación de chats */}
              {!loadingChats && chatsTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12 }}>
                  <button
                    onClick={() => fetchChats(chatsPage - 1)}
                    disabled={chatsPage === 0}
                    style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: chatsPage === 0 ? 'default' : 'pointer', opacity: chatsPage === 0 ? 0.4 : 1, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >←</button>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{chatsPage + 1} / {chatsTotalPages}</span>
                  <button
                    onClick={() => fetchChats(chatsPage + 1)}
                    disabled={chatsPage + 1 >= chatsTotalPages}
                    style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: chatsPage + 1 >= chatsTotalPages ? 'default' : 'pointer', opacity: chatsPage + 1 >= chatsTotalPages ? 0.4 : 1, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >→</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Chat ── */}
        {(!isMobile || !showSidebar) && activeConv && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>

            {/* Header */}
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
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
              {/* Cargar mensajes anteriores */}
              {msgPage + 1 < msgTotalPages && (
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <button
                    onClick={() => fetchMessages(activeId, msgPage + 1)}
                    disabled={loadingMessages}
                    style={{ border: '1px solid var(--border-light)', borderRadius: 16, padding: '5px 14px', fontSize: 11, cursor: 'pointer', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >
                    {loadingMessages ? 'Cargando…' : 'Ver mensajes anteriores'}
                  </button>
                </div>
              )}

              {loadingMessages && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: 'var(--text-muted)' }}>Cargando mensajes…</div>
              )}

              {!loadingMessages && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: 'var(--text-muted)' }}>No hay mensajes aún. ¡Escribe el primero!</div>
              )}

              {messages.map(msg => {
                const isMe = msg.sender === 'me';
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
                    <div style={{
                      maxWidth: '68%', padding: '10px 14px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? 'var(--crimson)' : 'var(--bg-secondary)',
                      border: isMe ? 'none' : '1px solid var(--border-light)',
                      fontSize: 13, color: isMe ? '#fff' : 'var(--text-primary)',
                      lineHeight: 1.55,
                      boxShadow: isMe ? '0 2px 8px rgba(139,28,28,0.22)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 2, paddingRight: 2 }}>{msg.time}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ flex: 1, padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none' }}
                placeholder="Write a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendText()}
              />
              <button
                onClick={sendText}
                disabled={!input.trim() || sending}
                style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--crimson)' : 'var(--bg-surface)', color: input.trim() ? '#fff' : 'var(--text-muted)', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
              >
                <SendIcon size={14} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
              </button>
            </div>
          </div>
        )}

        {/* Estado vacío cuando no hay chat activo (desktop) */}
        {!isMobile && !activeConv && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Selecciona una conversación para empezar
          </div>
        )}
      </div>
    </div>
  );
}
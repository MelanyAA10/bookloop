import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar } from '../components/UI';
import { apiFetch } from '../config/api';

export default function MessagesPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [errorConv, setErrorConv] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sending, setSending] = useState(false);

  // Cargar conversaciones al montar
  useEffect(() => {
    fetchConversations();
  }, []);

  // Cuando cambia la conversación activa, cargar sus mensajes
  useEffect(() => {
    if (activeId !== null) {
      fetchMessages(activeId);
    }
  }, [activeId]);

  const fetchConversations = async () => {
    setLoadingConv(true);
    setErrorConv(null);
    try {
      const response = await apiFetch('/conversations');
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      const convList = Array.isArray(data) ? data : data?.data;
      
      if (convList && convList.length > 0) {
        setConversations(convList);
        setActiveId(convList[0].id);
      } else {
        setConversations([]);
        setActiveId(null);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setErrorConv('No se pudieron cargar las conversaciones. Intenta de nuevo más tarde.');
      setConversations([]);
      setActiveId(null);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMsgs(true);
    setErrorMsg(null);
    try {
      const response = await apiFetch(`/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      const msgList = Array.isArray(data) ? data : data?.data;
      
      if (msgList && msgList.length > 0) {
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setErrorMsg('No se pudieron cargar los mensajes.');
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      const response = await apiFetch(`/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      const newMsg = data?.data || data; // dependiendo de la estructura de tu API
      if (newMsg && newMsg.text) {
        setMessages(prev => [...prev, newMsg]);
      } else {
        // Si la API no devuelve el mensaje creado, recargamos la lista
        await fetchMessages(activeId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('No se pudo enviar el mensaje. Intenta de nuevo.');
      // No agregamos nada al estado local para no romper la coherencia con el backend
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId);

  // Estado de carga inicial
  if (loadingConv) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="messages" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Cargando conversaciones...</div>
      </div>
    );
  }

  // Error al cargar conversaciones
  if (errorConv) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="messages" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--crimson)' }}>{errorConv}</div>
      </div>
    );
  }

  // No hay conversaciones
  if (conversations.length === 0) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar activePage="messages" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No hay conversaciones disponibles.</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="messages"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={s.layout}>
        <div style={s.sidebar}>
          <div style={s.sidebarTop}>
            <input style={s.searchInput} placeholder="Search conversations…" />
          </div>
          <div style={s.convList}>
            {conversations.map(c => (
              <div
                key={c.id}
                style={{ ...s.convItem, ...(activeId === c.id ? s.convItemActive : {}) }}
                onClick={() => setActiveId(c.id)}
              >
                <Avatar initials={c.initials} size={36} />
                <div style={s.convInfo}>
                  <div style={s.convTop}>
                    <span style={s.convName}>{c.name}</span>
                    <span style={s.convTime}>{c.time}</span>
                  </div>
                  <p style={s.convPreview}>{c.preview}</p>
                </div>
                {c.unread && <div style={s.unreadDot} />}
              </div>
            ))}
          </div>
        </div>

        <div style={s.chat}>
          {activeConversation && (
            <>
              <div style={s.chatHeader}>
                <Avatar initials={activeConversation.initials} size={36} />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{activeConversation.name}</p>
                  <p style={{ fontSize: 11, color: '#4CAF50' }}>● Online</p>
                </div>
              </div>

              <div style={s.messages}>
                {loadingMsgs && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando mensajes...</div>}
                {!loadingMsgs && errorMsg && <div style={{ textAlign: 'center', color: 'var(--crimson)' }}>{errorMsg}</div>}
                {!loadingMsgs && !errorMsg && messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay mensajes aún. ¡Envía uno!</div>
                )}
                {!loadingMsgs && !errorMsg && messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...s.bubble, ...(m.sender === 'me' ? s.bubbleMe : s.bubbleThem) }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.inputRow}>
                <input
                  style={s.msgInput}
                  placeholder="Message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !sending && sendMessage()}
                  disabled={sending}
                />
                <button style={s.sendBtn} onClick={sendMessage} disabled={sending}>
                  {sending ? 'Sending...' : 'Send →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Los estilos (s) se mantienen exactamente igual que en el código original
const s = {
  layout: { display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 56px)' },
  sidebar: { background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' },
  sidebarTop: { padding: 12, borderBottom: '1px solid var(--border-light)' },
  searchInput: { width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none' },
  convList: { flex: 1, overflowY: 'auto' },
  convItem: { display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.15s', position: 'relative' },
  convItemActive: { background: 'var(--bg-surface)' },
  convInfo: { flex: 1, minWidth: 0 },
  convTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  convName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' },
  convTime: { fontSize: 10, color: 'var(--text-muted)' },
  convPreview: { fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--crimson-light)', flexShrink: 0 },
  chat: { display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' },
  chatHeader: { background: 'var(--bg-secondary)', padding: '12px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 },
  messages: { flex: 1, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minHeight: 0, maxHeight: 'calc(100vh - 56px - 60px - 60px)' },
  bubble: { padding: '10px 14px', borderRadius: 12, fontSize: 13, maxWidth: 300, lineHeight: 1.55 },
  bubbleMe: { background: 'var(--crimson)', color: '#fff', borderRadius: '12px 12px 2px 12px' },
  bubbleThem: { background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '12px 12px 12px 2px' },
  inputRow: { padding: '12px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8, alignItems: 'center' },
  msgInput: { flex: 1, padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-primary)' },
  sendBtn: { background: 'var(--crimson)', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s' },
};
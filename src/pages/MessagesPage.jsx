// src/pages/MessagesPage.jsx - Versión responsive completa
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar } from '../components/UI';

const CONVERSATIONS = [
  { id: 1, initials: 'ER', name: 'Elena Rodriguez', preview: 'The book is in great condition...', time: '37min', unread: true },
  { id: 2, initials: 'JR', name: 'Julian Reed', preview: "I'm outside the Central Library...", time: '2h', unread: false },
  { id: 3, initials: 'MT', name: 'Marcus Thorne', preview: 'Can we meet at the solar pla...', time: '5h', unread: false },
  { id: 4, initials: 'LT', name: 'Liam Tuan', preview: 'I\'ll share "The Smart Retidy" tomor...', time: '1d', unread: false },
  { id: 5, initials: 'SM', name: 'Sofia Mendez', preview: 'Thanks for the chemistry notes!', time: '2d', unread: false },
];

const INITIAL_MESSAGES = [
  { sender: 'me', text: "Hey! I'm outside the Central Library right now. Are you still coming to pick up \"The Sociology of Knowledge\"?" },
  { sender: 'them', text: "Yes! I'll be there in 5 minutes. I'm wearing a green jacket so you can spot me." },
  { sender: 'me', text: 'Perfect. I\'m sitting on the stone benches near the fountain. Take your time!' },
  { sender: 'them', text: 'Just arrived at the fountain. Is that you by the sculpture?' },
];

export default function MessagesPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [active, setActive] = useState(1);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const conv = CONVERSATIONS.find(c => c.id === active);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(true);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { sender: 'me', text: input }]);
    setInput('');
  };

  const selectConversation = (id) => {
    setActive(id);
    if (isMobile) setShowSidebar(false);
  };

  const backToSidebar = () => {
    setShowSidebar(true);
  };

  // Vista móvil - Chat abierto (sin sidebar)
  if (isMobile && !showSidebar) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar
          activePage="messages"
          onNavigate={onNavigate}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
        <div style={styles.chatMobile}>
          <button style={styles.backBtn} onClick={backToSidebar}>
            ← Back
          </button>
          <div style={styles.chatHeader}>
            <Avatar initials={conv.initials} size={36} />
            <div>
              <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{conv.name}</p>
              <p style={{ fontSize: 11, color: '#4CAF50' }}>● Online</p>
            </div>
          </div>

          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.bubble, ...(m.sender === 'me' ? styles.bubbleMe : styles.bubbleThem) }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input 
              style={styles.msgInput} 
              placeholder="Message…" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && send()} 
            />
            <button style={styles.sendBtn} onClick={send}>Send →</button>
          </div>
        </div>
      </div>
    );
  }

  // Vista desktop o móvil con sidebar visible
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="messages"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={isMobile ? styles.layoutMobile : styles.layout}>
        {/* Sidebar de conversaciones */}
        <div style={{ ...styles.sidebar, ...(isMobile && !showSidebar ? { display: 'none' } : {}) }}>
          <div style={styles.sidebarTop}>
            <input style={styles.searchInput} placeholder="Search conversations…" />
          </div>
          <div style={styles.convList}>
            {CONVERSATIONS.map(c => (
              <div 
                key={c.id} 
                style={{ ...styles.convItem, ...(active === c.id ? styles.convItemActive : {}) }} 
                onClick={() => selectConversation(c.id)}
              >
                <Avatar initials={c.initials} size={36} />
                <div style={styles.convInfo}>
                  <div style={styles.convTop}>
                    <span style={styles.convName}>{c.name}</span>
                    <span style={styles.convTime}>{c.time}</span>
                  </div>
                  <p style={styles.convPreview}>{c.preview}</p>
                </div>
                {c.unread && <div style={styles.unreadDot} />}
              </div>
            ))}
          </div>
        </div>

        {/* Panel de chat */}
        <div style={styles.chat}>
          <div style={styles.chatHeader}>
            <Avatar initials={conv.initials} size={36} />
            <div>
              <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{conv.name}</p>
              <p style={{ fontSize: 11, color: '#4CAF50' }}>● Online</p>
            </div>
          </div>

          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.bubble, ...(m.sender === 'me' ? styles.bubbleMe : styles.bubbleThem) }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input 
              style={styles.msgInput} 
              placeholder="Message…" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && send()} 
            />
            <button style={styles.sendBtn} onClick={send}>Send →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  // Desktop layout - grid de 2 columnas
  layout: { 
    display: 'grid', 
    gridTemplateColumns: '300px 1fr', 
    minHeight: 'calc(100vh - 56px)' 
  },
  
  // Mobile layout - flex columna
  layoutMobile: { 
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: 'calc(100vh - 56px)' 
  },
  
  // Sidebar de conversaciones
  sidebar: { 
    background: 'var(--bg-secondary)', 
    borderRight: '1px solid var(--border-light)', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  
  sidebarTop: { 
    padding: 12, 
    borderBottom: '1px solid var(--border-light)' 
  },
  
  searchInput: { 
    width: '100%', 
    padding: '8px 12px', 
    border: '1.5px solid var(--border)', 
    borderRadius: 6, 
    fontSize: 12, 
    fontFamily: "'DM Sans', sans-serif", 
    color: 'var(--text-primary)', 
    background: 'var(--bg-primary)', 
    outline: 'none' 
  },
  
  convList: { 
    flex: 1, 
    overflowY: 'auto' 
  },
  
  convItem: { 
    display: 'flex', 
    gap: 10, 
    alignItems: 'center', 
    padding: '12px 14px', 
    borderBottom: '1px solid var(--border-light)', 
    cursor: 'pointer', 
    transition: 'background 0.15s', 
    position: 'relative' 
  },
  
  convItemActive: { 
    background: 'var(--bg-surface)' 
  },
  
  convInfo: { 
    flex: 1, 
    minWidth: 0 
  },
  
  convTop: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 2 
  },
  
  convName: { 
    fontSize: 13, 
    fontWeight: 500, 
    color: 'var(--text-primary)' 
  },
  
  convTime: { 
    fontSize: 10, 
    color: 'var(--text-muted)' 
  },
  
  convPreview: { 
    fontSize: 11, 
    color: 'var(--text-muted)', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis', 
    whiteSpace: 'nowrap' 
  },
  
  unreadDot: { 
    width: 8, 
    height: 8, 
    borderRadius: '50%', 
    background: 'var(--crimson-light)', 
    flexShrink: 0 
  },
  
  // Panel de chat
  chat: { 
    display: 'flex', 
    flexDirection: 'column', 
    background: 'var(--bg-primary)' 
  },
  
  chatMobile: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: 'calc(100vh - 56px)', 
    background: 'var(--bg-primary)' 
  },
  
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: 14,
    color: 'var(--crimson)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    padding: '12px 16px',
    textAlign: 'left',
  },
  
  chatHeader: { 
    background: 'var(--bg-secondary)', 
    padding: '12px 16px', 
    borderBottom: '1px solid var(--border-light)', 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10 
  },
  
  messages: { 
    flex: 1, 
    padding: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 10, 
    overflowY: 'auto', 
    minHeight: 0 
  },
  
  bubble: { 
    padding: '10px 14px', 
    borderRadius: 12, 
    fontSize: 13, 
    maxWidth: '85%', 
    lineHeight: 1.55, 
    wordBreak: 'break-word' 
  },
  
  bubbleMe: { 
    background: 'var(--crimson)', 
    color: '#fff', 
    borderRadius: '12px 12px 2px 12px' 
  },
  
  bubbleThem: { 
    background: 'var(--bg-secondary)', 
    border: '1px solid var(--border-light)', 
    color: 'var(--text-primary)', 
    borderRadius: '12px 12px 12px 2px' 
  },
  
  inputRow: { 
    padding: '12px 16px', 
    background: 'var(--bg-secondary)', 
    borderTop: '1px solid var(--border-light)', 
    display: 'flex', 
    gap: 8, 
    alignItems: 'center' 
  },
  
  msgInput: { 
    flex: 1, 
    padding: '9px 12px', 
    border: '1.5px solid var(--border)', 
    borderRadius: 6, 
    fontSize: 13, 
    fontFamily: "'DM Sans', sans-serif", 
    color: 'var(--text-primary)', 
    outline: 'none', 
    background: 'var(--bg-primary)' 
  },
  
  sendBtn: { 
    background: 'var(--crimson)', 
    border: 'none', 
    color: '#fff', 
    padding: '9px 16px', 
    borderRadius: 6, 
    fontSize: 13, 
    fontFamily: "'DM Sans', sans-serif", 
    fontWeight: 500, 
    cursor: 'pointer' 
  },
};
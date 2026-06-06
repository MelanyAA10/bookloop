// src/pages/MessagesPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar } from '../components/UI';

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: 'Brandon Vallejos',
    initials: 'BV',
    book: 'El Principito',
    bookId: 'ac3aec551-1018-4b80-bdb2-d8a20e397810',
    time: '10:32 AM',
    preview: '¿Sigue disponible el libro?',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Sofía Méndez',
    initials: 'SM',
    book: 'Cádaver Exquisito',
    bookId: null,
    time: 'Yesterday',
    preview: 'Perfecto, mañana te lo entrego',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Luis Herrera',
    initials: 'LH',
    book: 'Cien Años de Soledad',
    bookId: null,
    time: 'Mon',
    preview: 'Gracias por el libro!',
    unread: 0,
    online: true,
  },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'them', text: 'Hola! Vi tu libro "El Principito" en la plataforma.', time: '10:20 AM', type: 'text' },
    { id: 2, sender: 'them', text: '¿Sigue disponible?', time: '10:20 AM', type: 'text' },
    { id: 3, sender: 'me', text: 'Sí, claro! Está en muy buenas condiciones.', time: '10:25 AM', type: 'text' },
    { id: 4, sender: 'them', text: '¿Me puedes mostrar las fotos del estado del libro?', time: '10:28 AM', type: 'text' },
    {
      id: 5, sender: 'me', time: '10:30 AM', type: 'book_condition',
      book: { title: 'El Principito', author: 'Antoine de Saint-Exupéry', pages: 97, condition: 'Good' },
      photos: ['Front', 'Back', 'Spine', 'Interior'],
    },
    { id: 6, sender: 'them', text: '¡Se ve perfecto! Me interesa pedirlo prestado.', time: '10:32 AM', type: 'text' },
    {
      id: 7, sender: 'them', time: '10:32 AM', type: 'loan_request',
      book: { title: 'El Principito', days: 14 },
    },
  ],
  2: [
    { id: 1, sender: 'me', text: '¿Puedo devolver el libro el jueves?', time: 'Yesterday 4:10 PM', type: 'text' },
    { id: 2, sender: 'them', text: 'Sí, sin problema!', time: 'Yesterday 4:15 PM', type: 'text' },
    { id: 3, sender: 'them', text: 'Perfecto, mañana te lo entrego', time: 'Yesterday 4:16 PM', type: 'text' },
  ],
  3: [
    { id: 1, sender: 'them', text: '¡Qué libro tan increíble! Gracias por prestármelo.', time: 'Mon 2:00 PM', type: 'text' },
    { id: 2, sender: 'me', text: 'Me alegra que te haya gustado 😊', time: 'Mon 2:05 PM', type: 'text' },
    { id: 3, sender: 'them', text: 'Gracias por el libro!', time: 'Mon 2:06 PM', type: 'text' },
  ],
};

// ── Sub-components ────────────────────────────────────────────────────────────

function BookConditionCard({ book, photos, isMe }) {
  return (
    <div style={{
      background: isMe ? 'rgba(255,255,255,0.12)' : 'var(--bg-primary)',
      border: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'var(--border-light)'}`,
      borderRadius: 12,
      padding: '12px 14px',
      maxWidth: 280,
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--crimson)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14 }}>📖</span>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)', margin: 0 }}>
            Book Condition
          </p>
          <p style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', margin: 0 }}>
            {book.title}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
        {photos.map((label) => (
          <div key={label} style={{
            background: isMe ? 'rgba(255,255,255,0.1)' : 'var(--bg-surface)',
            border: `1px dashed ${isMe ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
            borderRadius: 6, height: 56,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 16 }}>🖼️</span>
            <span style={{ fontSize: 9, color: isMe ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 8, borderTop: `1px solid ${isMe ? 'rgba(255,255,255,0.15)' : 'var(--border-light)'}`,
      }}>
        <span style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
          Condition: <strong style={{ color: isMe ? '#fff' : 'var(--text-primary)' }}>{book.condition}</strong>
        </span>
        <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
          {book.pages} pages
        </span>
      </div>
    </div>
  );
}

function LoanRequestCard({ book, isMe, onAccept, onDecline, accepted, declined }) {
  return (
    <div style={{
      background: isMe ? 'rgba(255,255,255,0.12)' : 'var(--bg-primary)',
      border: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'var(--border-light)'}`,
      borderRadius: 12,
      padding: '12px 14px',
      maxWidth: 280,
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: isMe ? 'rgba(255,255,255,0.2)' : '#16a34a22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14 }}>📬</span>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)', margin: 0 }}>
            Loan Request
          </p>
          <p style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', margin: 0 }}>
            {book.title}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 12, color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', marginBottom: 10 }}>
        Requesting to borrow for <strong style={{ color: isMe ? '#fff' : 'var(--text-primary)' }}>{book.days} days</strong>
      </p>

      {!isMe && (
        accepted ? (
          <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            ✓ Loan Accepted
          </div>
        ) : declined ? (
          <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
            ✕ Loan Declined
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onDecline}
              style={{
                flex: 1, padding: '7px 0', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 12, cursor: 'pointer',
                background: 'transparent', color: 'var(--text-secondary)',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              style={{
                flex: 1, padding: '7px 0', border: 'none',
                borderRadius: 8, fontSize: 12, cursor: 'pointer',
                background: 'var(--crimson)', color: '#fff',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
            >
              Accept
            </button>
          </div>
        )
      )}

      {isMe && (
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.6)',
          textAlign: 'center', paddingTop: 4,
        }}>
          Waiting for response…
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MessagesPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [activeId, setActiveId] = useState(1);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [loanStatus, setLoanStatus] = useState({}); // { msgId: 'accepted' | 'declined' }
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, allMessages]);

  const activeConv = conversations.find(c => c.id === activeId);
  const messages = allMessages[activeId] || [];

  const sendText = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), sender: 'me', text: input.trim(), time: 'Just now', type: 'text' };
    setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, preview: input.trim(), time: 'Just now', unread: 0 } : c));
    setInput('');
  };

  const sendBookCondition = () => {
    const newMsg = {
      id: Date.now(), sender: 'me', time: 'Just now', type: 'book_condition',
      book: { title: activeConv?.book || 'Book', author: '', pages: 0, condition: 'Good' },
      photos: ['Front', 'Back', 'Spine', 'Interior'],
    };
    setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setShowActions(false);
  };

  const sendLoanRequest = () => {
    const newMsg = {
      id: Date.now(), sender: 'me', time: 'Just now', type: 'loan_request',
      book: { title: activeConv?.book || 'Book', days: 14 },
    };
    setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setShowActions(false);
  };

  const handleSelectConv = (id) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    if (isMobile) setShowSidebar(false);
  };

  const renderMessage = (msg) => {
    const isMe = msg.sender === 'me';

    return (
      <div key={msg.id} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}>
        {msg.type === 'text' && (
          <div style={{
            maxWidth: '70%',
            padding: '10px 14px',
            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isMe ? 'var(--crimson)' : 'var(--bg-secondary)',
            border: isMe ? 'none' : '1px solid var(--border-light)',
            fontSize: 13,
            color: isMe ? '#fff' : 'var(--text-primary)',
            lineHeight: 1.55,
            boxShadow: isMe ? '0 2px 8px rgba(139,28,28,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {msg.text}
          </div>
        )}

        {msg.type === 'book_condition' && (
          <BookConditionCard book={msg.book} photos={msg.photos} isMe={isMe} />
        )}

        {msg.type === 'loan_request' && (
          <LoanRequestCard
            book={msg.book}
            isMe={isMe}
            accepted={loanStatus[msg.id] === 'accepted'}
            declined={loanStatus[msg.id] === 'declined'}
            onAccept={() => setLoanStatus(prev => ({ ...prev, [msg.id]: 'accepted' }))}
            onDecline={() => setLoanStatus(prev => ({ ...prev, [msg.id]: 'declined' }))}
          />
        )}

        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 2, paddingRight: 2 }}>
          {msg.time}
        </span>
      </div>
    );
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar activePage="messages" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
      }}>

        {/* ── Sidebar ── */}
        {(!isMobile || showSidebar) && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: 10,
              }}>Messages</h2>
              <input
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1.5px solid var(--border)', borderRadius: 8,
                  fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  color: 'var(--text-primary)', background: 'var(--bg-primary)',
                  outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="Search conversations…"
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConv(c.id)}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    background: activeId === c.id ? 'var(--bg-surface)' : 'transparent',
                    borderLeft: activeId === c.id ? '3px solid var(--crimson)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar initials={c.initials} size={40} />
                    {c.online && (
                      <div style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 9, height: 9, borderRadius: '50%',
                        background: '#22c55e', border: '2px solid var(--bg-secondary)',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📖 {c.book}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.preview}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <div style={{
                      background: 'var(--crimson)', color: '#fff',
                      borderRadius: '50%', width: 18, height: 18,
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {c.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Chat ── */}
        {(!isMobile || !showSidebar) && activeConv && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>

            {/* Chat header */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-light)',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, padding: 0, marginRight: 4 }}
                >←</button>
              )}
              <div style={{ position: 'relative' }}>
                <Avatar initials={activeConv.initials} size={36} />
                {activeConv.online && (
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#22c55e', border: '2px solid var(--bg-secondary)',
                  }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{activeConv.name}</p>
                <p style={{ fontSize: 11, color: activeConv.online ? '#22c55e' : 'var(--text-muted)', margin: 0 }}>
                  {activeConv.online ? '● Online' : '○ Offline'} · 📖 {activeConv.book}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>

            {/* Action menu */}
            {showActions && (
              <div style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-light)',
                padding: '10px 14px',
                display: 'flex', gap: 8, flexWrap: 'wrap',
              }}>
                <button
                  onClick={sendBookCondition}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 20,
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)', fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  📖 Share Book Condition
                </button>
                <button
                  onClick={sendLoanRequest}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 20,
                    border: 'none',
                    background: 'var(--crimson)',
                    color: '#fff', fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  📬 Send Loan Request
                </button>
              </div>
            )}

            {/* Input */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-light)',
              padding: '10px 14px',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <button
                onClick={() => setShowActions(p => !p)}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: showActions ? 'var(--crimson)' : 'var(--bg-primary)',
                  color: showActions ? '#fff' : 'var(--text-muted)',
                  fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                title="Attach"
              >+</button>
              <input
                style={{
                  flex: 1, padding: '9px 14px',
                  border: '1.5px solid var(--border)', borderRadius: 20,
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  color: 'var(--text-primary)', background: 'var(--bg-primary)',
                  outline: 'none',
                }}
                placeholder="Write a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendText()}
              />
              <button
                onClick={sendText}
                disabled={!input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: 'none',
                  background: input.trim() ? 'var(--crimson)' : 'var(--bg-surface)',
                  color: input.trim() ? '#fff' : 'var(--text-muted)',
                  fontSize: 16, cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
              >→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
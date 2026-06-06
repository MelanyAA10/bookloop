// src/pages/MessagesPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Avatar } from '../components/UI';

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

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const ImageIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const MailIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
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

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Brandon Vallejos', initials: 'BV', book: 'El Principito', time: '10:32 AM', preview: '¿Sigue disponible el libro?', unread: 2, online: true },
  { id: 2, name: 'Sofía Méndez', initials: 'SM', book: 'Cádaver Exquisito', time: 'Yesterday', preview: 'Perfecto, mañana te lo entrego', unread: 0, online: false },
  { id: 3, name: 'Luis Herrera', initials: 'LH', book: 'Cien Años de Soledad', time: 'Mon', preview: 'Gracias por el libro!', unread: 0, online: true },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'them', text: 'Hola! Vi tu libro "El Principito" en la plataforma.', time: '10:20 AM', type: 'text' },
    { id: 2, sender: 'them', text: '¿Sigue disponible para préstamo?', time: '10:20 AM', type: 'text' },
    { id: 3, sender: 'me', text: 'Sí, claro! Está en muy buenas condiciones.', time: '10:25 AM', type: 'text' },
    { id: 4, sender: 'them', text: '¿Me puedes mostrar el estado del libro?', time: '10:28 AM', type: 'text' },
    {
      id: 5, sender: 'me', time: '10:30 AM', type: 'book_condition',
      book: { title: 'El Principito', author: 'Antoine de Saint-Exupéry', pages: 97, condition: 'Good', language: 'Español' },
      photos: ['Front', 'Back', 'Spine', 'Interior'],
      notes: 'Algunas páginas tienen marcas de lectura ligeras, por lo demás perfecto.',
    },
    { id: 6, sender: 'them', text: '¡Se ve perfecto! Me interesa pedirlo prestado.', time: '10:32 AM', type: 'text' },
    { id: 7, sender: 'them', time: '10:32 AM', type: 'loan_request', book: { title: 'El Principito', days: 14, message: 'Lo necesito para un proyecto de lectura.' } },
  ],
  2: [
    { id: 1, sender: 'me', text: '¿Puedo devolver el libro el jueves?', time: 'Yesterday 4:10 PM', type: 'text' },
    { id: 2, sender: 'them', text: 'Sí, sin problema!', time: 'Yesterday 4:15 PM', type: 'text' },
    { id: 3, sender: 'them', text: 'Perfecto, mañana te lo entrego.', time: 'Yesterday 4:16 PM', type: 'text' },
  ],
  3: [
    { id: 1, sender: 'them', text: '¡Qué libro tan increíble! Gracias por prestármelo.', time: 'Mon 2:00 PM', type: 'text' },
    { id: 2, sender: 'me', text: 'Me alegra que te haya gustado', time: 'Mon 2:05 PM', type: 'text' },
    { id: 3, sender: 'them', text: 'Gracias por el libro!', time: 'Mon 2:06 PM', type: 'text' },
  ],
};

// ── Book Condition Card ───────────────────────────────────────────────────────
function BookConditionCard({ msg, isMe }) {
  const { book, photos, notes } = msg;
  const bg = isMe ? 'rgba(255,255,255,0.1)' : 'var(--bg-primary)';
  const border = isMe ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border-light)';
  const textPrimary = isMe ? '#fff' : 'var(--text-primary)';
  const textMuted = isMe ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)';
  const slotBg = isMe ? 'rgba(255,255,255,0.08)' : 'var(--bg-surface)';
  const slotBorder = isMe ? '1px dashed rgba(255,255,255,0.2)' : '1px dashed var(--border)';

  return (
    <div style={{ background: bg, border, borderRadius: 12, padding: '12px 14px', maxWidth: 272, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: isMe ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-light)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: isMe ? 'rgba(255,255,255,0.18)' : 'var(--crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BookIcon size={14} color="#fff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '0.3px' }}>Book Condition</p>
          <p style={{ fontSize: 10, color: textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title} · {book.author}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
        {photos.map(label => (
          <div key={label} style={{ background: slotBg, border: slotBorder, borderRadius: 6, height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <ImageIcon size={13} color={isMe ? 'rgba(255,255,255,0.35)' : 'var(--text-muted)'} />
            <span style={{ fontSize: 9, color: textMuted, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {notes && (
        <p style={{ fontSize: 11, color: textMuted, margin: '0 0 8px', fontStyle: 'italic', lineHeight: 1.4 }}>"{notes}"</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: textMuted }}>Condition</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{book.condition} · {book.pages}p · {book.language}</span>
      </div>
    </div>
  );
}

// ── Loan Request Card ─────────────────────────────────────────────────────────
function LoanRequestCard({ msg, isMe, loanStatus, onAccept, onDecline }) {
  const { book } = msg;
  const status = loanStatus[msg.id];
  const bg = isMe ? 'rgba(255,255,255,0.1)' : 'var(--bg-primary)';
  const border = isMe ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border-light)';
  const textPrimary = isMe ? '#fff' : 'var(--text-primary)';
  const textMuted = isMe ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)';

  return (
    <div style={{ background: bg, border, borderRadius: 12, padding: '12px 14px', maxWidth: 272, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: isMe ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-light)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: isMe ? 'rgba(255,255,255,0.18)' : 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MailIcon size={14} color={isMe ? '#fff' : '#16a34a'} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '0.3px' }}>Loan Request</p>
          <p style={{ fontSize: 10, color: textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: book.message ? 8 : 10 }}>
        <ClockIcon size={12} color={textMuted} />
        <span style={{ fontSize: 12, color: textMuted }}>
          Requesting <strong style={{ color: textPrimary }}>{book.days} days</strong>
        </span>
      </div>

      {book.message && (
        <p style={{ fontSize: 11, color: textMuted, margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.4 }}>"{book.message}"</p>
      )}

      {!isMe && !status && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '7px 0', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <XIcon size={11} /> Decline
          </button>
          <button onClick={onAccept} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer', background: 'var(--crimson)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <CheckIcon size={11} color="#fff" /> Accept
          </button>
        </div>
      )}

      {!isMe && status === 'accepted' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
          <CheckIcon size={12} color="#16a34a" /> Loan Accepted
        </div>
      )}

      {!isMe && status === 'declined' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
          <XIcon size={12} color="#dc2626" /> Loan Declined
        </div>
      )}

      {isMe && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: textMuted }}>
          <ClockIcon size={11} color={isMe ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)'} /> Waiting for response…
        </div>
      )}
    </div>
  );
}

// ── Book Condition Modal ──────────────────────────────────────────────────────
function BookConditionModal({ onClose, onSend, bookTitle }) {
  const [form, setForm] = useState({ condition: 'Good', pages: '', language: 'Español', notes: '' });

  const handleSend = () => {
    onSend({
      book: { title: bookTitle, author: '', pages: parseInt(form.pages) || 0, condition: form.condition, language: form.language },
      photos: ['Front', 'Back', 'Spine', 'Interior'],
      notes: form.notes,
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookIcon size={16} color="#fff" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#fff' }}>Share Book Condition</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon size={12} color="#fff" />
          </button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Book</label>
            <div style={{ padding: '9px 12px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              {bookTitle}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} style={inputStyle}>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Language</label>
              <input value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={inputStyle} placeholder="Español" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Pages</label>
            <input type="number" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: e.target.value }))} style={inputStyle} placeholder="ej. 200" />
          </div>

          <div>
            <label style={labelStyle}>Condition Photos</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {['Front', 'Back', 'Spine', 'Interior'].map(label => (
                <div key={label} style={{ height: 64, background: 'var(--bg-surface)', border: '1.5px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
                  <ImageIcon size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} placeholder="Describe el estado del libro..." />
          </div>

          <button onClick={handleSend} style={{ padding: '10px 0', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <SendIcon size={13} color="#fff" /> Send Condition Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Loan Request Modal ────────────────────────────────────────────────────────
function LoanRequestModal({ onClose, onSend, bookTitle }) {
  const [form, setForm] = useState({ days: '14', message: '' });

  const handleSend = () => {
    onSend({ book: { title: bookTitle, days: parseInt(form.days) || 14, message: form.message } });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, width: '100%', maxWidth: 380, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MailIcon size={16} color="#fff" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#fff' }}>Request Loan</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon size={12} color="#fff" />
          </button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Book</label>
            <div style={{ padding: '9px 12px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              {bookTitle}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Loan Duration (days)</label>
            <input type="number" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} style={inputStyle} placeholder="14" min="1" max="30" />
          </div>

          <div>
            <label style={labelStyle}>Message (optional)</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} placeholder="¿Por qué quieres leer este libro?" />
          </div>

          <button onClick={handleSend} style={{ padding: '10px 0', background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <SendIcon size={13} color="#fff" /> Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' };

// ── Main Component ────────────────────────────────────────────────────────────
export default function MessagesPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [activeId, setActiveId]         = useState(1);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [allMessages, setAllMessages]   = useState(MOCK_MESSAGES);
  const [input, setInput]               = useState('');
  const [showActions, setShowActions]   = useState(false);
  const [loanStatus, setLoanStatus]     = useState({});
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [modal, setModal]               = useState(null); // null | 'condition' | 'loan'
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, allMessages]);

  const activeConv = conversations.find(c => c.id === activeId);
  const messages   = allMessages[activeId] || [];

  const addMessage = (msg) => {
    const newMsg = { id: Date.now(), sender: 'me', time: 'Just now', ...msg };
    setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, preview: msg.text || '📎 Attachment', time: 'Just now' } : c));
  };

  const sendText = () => {
    if (!input.trim()) return;
    addMessage({ type: 'text', text: input.trim() });
    setInput('');
  };

  const handleSelectConv = (id) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setShowActions(false);
    if (isMobile) setShowSidebar(false);
  };

  const renderMessage = (msg) => {
    const isMe = msg.sender === 'me';
    return (
      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
        {msg.type === 'text' && (
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
        )}
        {msg.type === 'book_condition' && <BookConditionCard msg={msg} isMe={isMe} />}
        {msg.type === 'loan_request' && (
          <LoanRequestCard
            msg={msg} isMe={isMe} loanStatus={loanStatus}
            onAccept={() => setLoanStatus(p => ({ ...p, [msg.id]: 'accepted' }))}
            onDecline={() => setLoanStatus(p => ({ ...p, [msg.id]: 'declined' }))}
          />
        )}
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 2, paddingRight: 2 }}>{msg.time}</span>
      </div>
    );
  };

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
                <input style={{ width: '100%', padding: '8px 12px 8px 30px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }} placeholder="Search conversations…" />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map(c => (
                <div key={c.id} onClick={() => handleSelectConv(c.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: activeId === c.id ? 'var(--bg-surface)' : 'transparent', borderLeft: activeId === c.id ? '3px solid var(--crimson)' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar initials={c.initials} size={40} />
                    {c.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-secondary)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
                      <BookIcon size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: 10, color: 'var(--crimson)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.book}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</p>
                  </div>
                  {c.unread > 0 && <div style={{ background: 'var(--crimson)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</div>}
                </div>
              ))}
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
              <div style={{ position: 'relative' }}>
                <Avatar initials={activeConv.initials} size={36} />
                {activeConv.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-secondary)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{activeConv.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: activeConv.online ? '#22c55e' : 'var(--text-muted)' }}>{activeConv.online ? '● Online' : '○ Offline'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                  <BookIcon size={10} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{activeConv.book}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>

            {/* Action tray */}
            {showActions && (
              <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', padding: '10px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setModal('condition'); setShowActions(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 500 }}
                >
                  <BookIcon size={13} color="var(--text-primary)" /> Share Book Condition
                </button>
                <button
                  onClick={() => { setModal('loan'); setShowActions(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: 'none', background: 'var(--crimson)', color: '#fff', fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 500 }}
                >
                  <MailIcon size={13} color="#fff" /> Send Loan Request
                </button>
              </div>
            )}

            {/* Input */}
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setShowActions(p => !p)}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--border)', background: showActions ? 'var(--crimson)' : 'var(--bg-primary)', color: showActions ? '#fff' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
              >
                <PlusIcon size={16} color={showActions ? '#fff' : 'var(--text-muted)'} />
              </button>
              <input
                style={{ flex: 1, padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-primary)', outline: 'none' }}
                placeholder="Write a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendText()}
              />
              <button
                onClick={sendText}
                disabled={!input.trim()}
                style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--crimson)' : 'var(--bg-surface)', color: input.trim() ? '#fff' : 'var(--text-muted)', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
              >
                <SendIcon size={14} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'condition' && (
        <BookConditionModal
          bookTitle={activeConv?.book || 'Book'}
          onClose={() => setModal(null)}
          onSend={(data) => addMessage({ type: 'book_condition', ...data })}
        />
      )}
      {modal === 'loan' && (
        <LoanRequestModal
          bookTitle={activeConv?.book || 'Book'}
          onClose={() => setModal(null)}
          onSend={(data) => addMessage({ type: 'loan_request', ...data })}
        />
      )}
    </div>
  );
}
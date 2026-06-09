// src/components/Notificaciones.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../context/UserContext';

const NOTIF_URL = import.meta.env.VITE_NOTIF_URL;

const BellIcon = ({ size = 18, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessageIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const XIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const timeAgo = (iso) => {
  if (!iso) return '';
  let s = iso;
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) s += 'Z';
  const then = new Date(s);
  if (isNaN(then.getTime())) return '';
  let secs = Math.floor((Date.now() - then.getTime()) / 1000);
  if (secs < 0) secs = 0;
  if (secs < 60) return 'justo ahora';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
};

// Convierte el body crudo en texto legible (las tarjetas de préstamo van codificadas)
const friendlyBody = (body) => {
  if (!body) return '';
  if (body.startsWith('[[LOAN]]')) {
    if (body.includes('"kind":"return"')) return 'Te envió una solicitud de devolución 📕';
    return 'Te envió una solicitud de préstamo 📚';
  }
  return body;
};

// ── Toast individual ─────────────────────────────────────────────────────────
function NotificationToast({ notif, onDismiss, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const DURATION = 10000;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100));
    }, 50);

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleDismiss = () => {
    clearInterval(intervalRef.current);
    setVisible(false);
    setTimeout(() => onDismiss(notif._id || notif.id), 350);
  };

  const handleClick = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    if (notif.data?.chatId) {
      onNavigate('messages', { chatId: notif.data.chatId, senderName: notif.data?.senderName });
    } else {
      onNavigate('messages');
    }
    handleDismiss();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        width: 320,
        userSelect: 'none',
      }}
    >
      {/* Barra de progreso */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: 3,
        width: `${progress}%`,
        background: 'var(--crimson)',
        transition: 'width 0.05s linear',
        borderRadius: '14px 0 0 0',
      }} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 14px 12px' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'var(--crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(139,28,28,0.3)',
        }}>
          <MessageIcon size={16} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
            {notif.title}
          </p>
          {notif.body && (
            <p style={{
              fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {friendlyBody(notif.body)}
            </p>
          )}
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
            {timeAgo(notif.createdAt)} · Toca para abrir
          </span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
            borderRadius: '50%', width: 22, height: 22, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            flexShrink: 0, color: 'var(--text-muted)',
          }}
        >
          <XIcon size={10} />
        </button>
      </div>
    </div>
  );
}

// ── Contenedor de toasts ─────────────────────────────────────────────────────
export function NotificationToastContainer({ toasts, onDismiss, onNavigate }) {
  return (
    <div style={{
      position: 'fixed', top: 68, right: 16,
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t._id || t.id} style={{ pointerEvents: 'all' }}>
          <NotificationToast notif={t} onDismiss={onDismiss} onNavigate={onNavigate} />
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Notificaciones({ onNavigate }) {
  const { user } = useUser();
  const myId = user?.id;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const panelRef = useRef(null);
  const socketRef = useRef(null);

  const unreadCount = items.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const res = await fetch(`${NOTIF_URL}/notifications/${myId}?page=1&size=20`);
      const data = await res.json();
      setItems(data.content || []);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!myId) return;
    fetchNotifications();

    const socket = io(NOTIF_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', myId);
    });

    socket.on('notification', (notif) => {
      setItems(prev => [notif, ...prev]);
      setToasts(prev => [...prev, notif]);
    });

    return () => { socket.disconnect(); };
  }, [myId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAsRead = async (id) => {
    setItems(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${NOTIF_URL}/notifications/${id}/read`, { method: 'POST' });
    } catch (err) {
      console.error('Error marcando como leida:', err);
    }
  };

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => (t._id || t.id) !== id));
  }, []);

  const handleNotifClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    setOpen(false);
    if (notif.data?.chatId && onNavigate) {
      onNavigate('messages', { chatId: notif.data.chatId, senderName: notif.data?.senderName });
    } else if (onNavigate) {
      onNavigate('messages');
    }
  };

  if (!myId) return null;

  return (
    <>
      <NotificationToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onNavigate={onNavigate || (() => {})}
      />

      <div style={{ position: 'relative' }} ref={panelRef}>
        <button
          onClick={() => setOpen(o => !o)}
          title="Notificaciones"
          style={{
            position: 'relative', width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BellIcon size={17} color="#fff" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff', borderRadius: '50%',
              minWidth: 18, height: 18, fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px', border: '2px solid #5A0E0E',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 44, right: 0,
            width: 320, maxHeight: 420, overflowY: 'auto',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
            borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.25)', zIndex: 1000,
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                Notificaciones
              </span>
              <button
                onClick={fetchNotifications}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--crimson)', fontWeight: 600 }}
              >
                Actualizar
              </button>
            </div>

            {loading && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>Cargando…</div>
            )}
            {!loading && items.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                No tienes notificaciones.
              </div>
            )}

            {items.map((n) => (
              <div
                key={n._id || n.id}
                onClick={() => handleNotifClick(n)}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(139,28,28,0.06)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}
              >
                {!n.read && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--crimson)', flexShrink: 0, marginTop: 5 }} />
                )}
                <div style={{ flex: 1, minWidth: 0, marginLeft: n.read ? 18 : 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{n.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{friendlyBody(n.body)}</p>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
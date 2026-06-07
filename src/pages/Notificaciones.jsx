// src/components/Notificaciones.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../context/UserContext';

// URL pública del microservicio de notificaciones (Azure)
const NOTIF_URL = 'https://ms-notifi-e8gpahhfhwb0h4gf.canadacentral-01.azurewebsites.net';

const BellIcon = ({ size = 18, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

export default function Notificaciones() {
  const { user } = useUser();
  const myId = user?.id;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const socketRef = useRef(null);

  const unreadCount = items.filter(n => !n.read).length;

  // Cargar historial de notificaciones
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

  // Conexión Socket.IO para tiempo real
  useEffect(() => {
    if (!myId) return;

    fetchNotifications();

    const socket = io(NOTIF_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', myId); // unirse a la sala de este usuario
    });

    // Cuando llega una notificación nueva en tiempo real
    socket.on('notification', (notif) => {
      setItems(prev => [notif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  // Cerrar el panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
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

  if (!myId) return null;

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notificaciones"
        style={{
          position: 'relative',
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <BellIcon size={17} color="#fff" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', minWidth: 18, height: 18,
            fontSize: 10, fontWeight: 700,
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
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          zIndex: 1000,
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
              onClick={() => !n.read && markAsRead(n._id)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-light)',
                cursor: n.read ? 'default' : 'pointer',
                background: n.read ? 'transparent' : 'rgba(139,28,28,0.06)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
            >
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--crimson)', flexShrink: 0, marginTop: 5 }} />}
              <div style={{ flex: 1, minWidth: 0, marginLeft: n.read ? 18 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
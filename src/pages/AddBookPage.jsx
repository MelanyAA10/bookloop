// src/pages/AddBookPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Button, Input, Textarea, Divider } from '../components/UI';
import { apiFetch } from '../config/api';

const CONDITIONS = ['Excellent', 'Good', 'Fair'];

export default function AddBookPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [form, setForm] = useState({
    title: '', author: '', genre: '', language: '', description: '', loanDays: '14',
    year: new Date().getFullYear(), pages: '', color: '#7A3728', condition: 'Good'
  });
  const [condition, setCondition] = useState('Good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.title.trim()) {
      setError('El título es requerido');
      setLoading(false);
      return;
    }
    if (!form.author.trim()) {
      setError('El autor es requerido');
      setLoading(false);
      return;
    }

    const bookData = {
      title: form.title, author: form.author, year: parseInt(form.year) || new Date().getFullYear(),
      pages: parseInt(form.pages) || 200, language: form.language || 'Spanish', genre: form.genre || 'Fiction',
      color: form.color || '#7A3728', condition: condition, loanDays: parseInt(form.loanDays) || 14,
      synopsis: form.description, owner: { initials: 'JR', name: 'Juliet Ramos', rating: 4.8 }
    };

    try {
      const response = await apiFetch('/books', {
        method: 'POST',
        body: JSON.stringify(bookData),
      });
      if (response.ok) onNavigate('discovery');
      else setError('Error al crear el libro');
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar
        activePage="discovery"
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={s.overlay}>
        <div style={s.modal}>
          <div style={s.header}>
            <div>
              <h2 style={s.title}>Add a Book</h2>
              <p style={s.sub}>List your book for the community to borrow</p>
            </div>
            <button style={s.closeBtn} onClick={() => onNavigate('discovery')}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={s.body}>
            {error && <div style={s.errorMsg}>{error}</div>}

            <div style={s.layout}>
              <div style={s.coverZone}>
                <div style={s.coverUpload}>
                  <span style={{ fontSize: 28, color: 'var(--text-muted)' }}>📚</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Upload Cover</span>
                </div>
              </div>

              <div style={s.fields}>
                <Input label="Book Title" placeholder="e.g. Cien Años de Soledad" value={form.title} onChange={set('title')} required />
                <Input label="Author" placeholder="e.g. Gabriel García Márquez" value={form.author} onChange={set('author')} required />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Input label="Genre" placeholder="Fiction" value={form.genre} onChange={set('genre')} style={{ flex: 1 }} />
                  <Input label="Language" placeholder="Spanish" value={form.language} onChange={set('language')} style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Input label="Year" placeholder="2024" type="number" value={form.year} onChange={set('year')} style={{ flex: 1 }} />
                  <Input label="Pages" placeholder="200" type="number" value={form.pages} onChange={set('pages')} style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <Textarea label="Description" placeholder="Tell borrowers about this book…" value={form.description} onChange={set('description')} style={{ marginBottom: 4 }} />

            <Divider />

            <p style={s.sectionLabel}>Book Condition</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {CONDITIONS.map(c => (
                <button key={c} type="button" style={{ ...s.condBtn, ...(condition === c ? s.condBtnActive : {}) }} onClick={() => setCondition(c)}>
                  {c}
                </button>
              ))}
            </div>

            <p style={s.sectionLabel}>Condition Photos</p>
            <div style={s.photoGrid}>
              {['Front', 'Back', 'Spine', 'Interior'].map(label => (
                <div key={label} style={s.photoSlot}>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>+</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>

            <Divider />

            <Input label="Loan Period (days)" type="number" placeholder="14" value={form.loanDays} onChange={set('loanDays')} style={{ maxWidth: 200, marginBottom: 20 }} />

            <Button variant="full" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'List My Book →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    background: 'rgba(26,16,9,0.45)',
    padding: '40px 24px',
    minHeight: 'calc(100vh - 56px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  modal: {
    background: 'var(--bg-secondary)',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  header: {
    background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  closeBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
    width: 28, height: 28, borderRadius: '50%', fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
  },
  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 14 },
  layout: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 20, marginBottom: 4 },
  coverZone: { display: 'flex', flexDirection: 'column' },
  coverUpload: {
    height: 185,
    background: 'var(--bg-surface)',
    border: '1.5px dashed var(--border)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  fields: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
  },
  condBtn: {
    flex: 1,
    padding: '9px 0',
    background: 'var(--bg-surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.18s',
  },
  condBtnActive: {
    background: 'var(--crimson)',
    border: '1.5px solid var(--crimson)',
    color: '#fff',
  },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  photoSlot: {
    height: 72,
    background: 'var(--bg-surface)',
    border: '1.5px dashed var(--border)',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    cursor: 'pointer',
  },
  errorMsg: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 10,
  },
};
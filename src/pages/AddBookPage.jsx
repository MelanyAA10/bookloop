// src/pages/AddBookPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Button, Input, Textarea, Divider } from '../components/UI';

const CONDITIONS = ['Excellent', 'Good', 'Fair'];

/**
 * Add Book page
 * Props:
 *   onNavigate – fn(page)
 */
export default function AddBookPage({ onNavigate = () => {} }) {
  const [form, setForm] = useState({
    title: '', author: '', genre: '', language: '', description: '', loanDays: '14',
  });
  const [condition, setCondition] = useState('Good');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => { e.preventDefault(); onNavigate('discovery'); };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <Navbar activePage="discovery" onNavigate={onNavigate} />

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
            <div style={s.layout}>
              {/* Cover upload */}
              <div style={s.coverZone}>
                <div style={s.coverUpload}>
                  <span style={{ fontSize: 28, color: '#D9CFC0' }}>📚</span>
                  <span style={{ fontSize: 11, color: '#9E8B75', marginTop: 6 }}>Upload Cover</span>
                </div>
              </div>

              {/* Fields */}
              <div style={s.fields}>
                <Input label="Book Title" placeholder="e.g. Cien Años de Soledad" value={form.title} onChange={set('title')} />
                <Input label="Author" placeholder="e.g. Gabriel García Márquez" value={form.author} onChange={set('author')} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Input label="Genre" placeholder="Fiction" value={form.genre} onChange={set('genre')} style={{ flex: 1 }} />
                  <Input label="Language" placeholder="Spanish" value={form.language} onChange={set('language')} style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <Textarea
              label="Description"
              placeholder="Tell borrowers about this book…"
              value={form.description}
              onChange={set('description')}
              style={{ marginBottom: 4 }}
            />

            <Divider />

            {/* Condition */}
            <p style={s.sectionLabel}>Book Condition</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {CONDITIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  style={{ ...s.condBtn, ...(condition === c ? s.condBtnActive : {}) }}
                  onClick={() => setCondition(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Condition photos */}
            <p style={s.sectionLabel}>Condition Photos</p>
            <div style={s.photoGrid}>
              {['Front', 'Back', 'Spine', 'Interior'].map(label => (
                <div key={label} style={s.photoSlot}>
                  <span style={{ fontSize: 18, color: '#9E8B75' }}>+</span>
                  <span style={{ fontSize: 9, color: '#9E8B75' }}>{label}</span>
                </div>
              ))}
            </div>

            <Divider />

            <Input
              label="Loan Period (days)"
              type="number"
              placeholder="14"
              value={form.loanDays}
              onChange={set('loanDays')}
              style={{ maxWidth: 200, marginBottom: 20 }}
            />

            <Button variant="full" type="submit">List My Book →</Button>
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
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  header: {
    background: 'linear-gradient(135deg, #5A0E0E, #8B1C1C)',
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
    background: '#F3EDE3',
    border: '1.5px dashed #D9CFC0',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  fields: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, color: '#9E8B75',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
  },
  condBtn: {
    flex: 1,
    padding: '9px 0',
    background: '#F3EDE3',
    border: '1.5px solid #EBE4D7',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    color: '#5C4A35',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.18s',
  },
  condBtnActive: {
    background: '#8B1C1C',
    border: '1.5px solid #8B1C1C',
    color: '#fff',
  },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  photoSlot: {
    height: 72,
    background: '#F3EDE3',
    border: '1.5px dashed #D9CFC0',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    cursor: 'pointer',
  },
};

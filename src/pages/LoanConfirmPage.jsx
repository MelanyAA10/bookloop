// src/pages/LoanConfirmPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Button, BookCover, Divider } from '../components/UI';

export default function LoanConfirmPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const [checks, setChecks] = useState({ damage: false, edition: false, agree: false });
  const toggle = k => setChecks(c => ({ ...c, [k]: !c[k] }));
  const allChecked = Object.values(checks).every(Boolean);

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
          <div style={s.modalHeader}>
            <div>
              <h2 style={s.modalTitle}>Confirm Condition & Receive Book</h2>
              <p style={s.modalSub}>You are receiving <strong>"La Casa de los Espíritus"</strong></p>
            </div>
            <button style={s.closeBtn} onClick={() => onNavigate('bookdetail')}>✕</button>
          </div>

          <div style={s.modalBody}>
            <div style={s.bookRow}>
              <BookCover color="#7A3728" title="La Casa de los Espíritus" width={70} height={96} />
              <div>
                <p style={s.bookTitle}>La Casa de los Espíritus</p>
                <p style={s.bookMeta}>Isabel Allende · 450 pages</p>
                <p style={s.bookMeta}>Lent by <strong>Aaron Salas</strong> · 4.5 ★</p>
              </div>
            </div>

            <Divider />

            <p style={s.sectionLabel}>Condition Documentation</p>
            <div style={s.photoGrid}>
              {['Front Cover', 'Back Cover', 'Spine', 'Interior'].map(label => (
                <div key={label} style={s.photoSlot}>
                  <span style={s.photoPlus}>+</span>
                  <span style={s.photoLabel}>{label}</span>
                </div>
              ))}
            </div>

            <Divider />

            <p style={s.sectionLabel}>Final Attestation</p>
            {[
              { key: 'damage', label: 'I have checked the book for visible damage' },
              { key: 'edition', label: 'I verified this is the correct edition' },
              { key: 'agree', label: 'I agree to return the book in the same condition' },
            ].map(item => (
              <label key={item.key} style={s.checkRow} onClick={() => toggle(item.key)}>
                <div style={{ ...s.checkbox, ...(checks[item.key] ? s.checkboxDone : {}) }}>
                  {checks[item.key] && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
              </label>
            ))}

            <Divider />

            <div style={s.loanMeta}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loan period: 14 days</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>18 days remaining</span>
            </div>

            <Button variant="full" style={{ opacity: allChecked ? 1 : 0.5, pointerEvents: allChecked ? 'auto' : 'none', marginTop: 4 }} onClick={() => onNavigate('discovery')}>
              Confirm Handoff
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { background: 'rgba(26,16,9,0.5)', padding: '48px 24px', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' },
  modal: { background: 'var(--bg-secondary)', borderRadius: 14, overflow: 'hidden', width: '100%', maxWidth: 580, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' },
  modalHeader: { background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', marginBottom: 4, fontWeight: 600 },
  modalSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  closeBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  modalBody: { padding: '24px' },
  bookRow: { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 4 },
  bookTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  bookMeta: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 },
  photoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 },
  photoSlot: { height: 90, background: 'var(--bg-surface)', border: '1.5px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' },
  photoPlus: { fontSize: 20, color: 'var(--text-muted)' },
  photoLabel: { fontSize: 10, color: 'var(--text-muted)' },
  checkRow: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer' },
  checkbox: { width: 18, height: 18, border: '1.5px solid var(--border)', borderRadius: 4, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' },
  checkboxDone: { background: 'var(--crimson)', borderColor: 'var(--crimson)' },
  loanMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
};
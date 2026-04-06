// src/pages/LoanReturnPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Button, Divider } from '../components/UI';

export default function LoanReturnPage({ onNavigate = () => {} }) {
  const [checks, setChecks] = useState({ damage: false, edition: false, agree: false });
  const [rating, setRating] = useState(0);
  const toggle = k => setChecks(c => ({ ...c, [k]: !c[k] }));
  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar activePage="discovery" onNavigate={onNavigate} />

      <div style={s.overlay}>
        <div style={s.modal}>
          <div style={s.header}>
            <div>
              <h2 style={s.title}>Return Book</h2>
              <p style={s.sub}>Loan #1042 · "La Casa de los Espíritus"</p>
            </div>
            <div style={s.daysLeft}>
              <span style={s.daysNum}>2</span>
              <span style={s.daysLabel}>Days Remaining</span>
            </div>
          </div>

          <div style={s.body}>
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
              { key: 'agree', label: 'I confirm I am returning the book on time' },
            ].map(item => (
              <label key={item.key} style={s.checkRow} onClick={() => toggle(item.key)}>
                <div style={{ ...s.checkbox, ...(checks[item.key] ? s.checkboxDone : {}) }}>
                  {checks[item.key] && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
              </label>
            ))}

            <Divider />

            <p style={s.sectionLabel}>Rate the Lender</p>
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ fontSize: 26, cursor: 'pointer', color: i <= rating ? 'var(--crimson-light)' : 'var(--border)', transition: 'color 0.15s' }} onClick={() => setRating(i)}>★</span>
              ))}
            </div>

            <Button variant="full" style={{ opacity: allChecked ? 1 : 0.5, pointerEvents: allChecked ? 'auto' : 'none' }} onClick={() => onNavigate('discovery')}>
              Confirm Return
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { background: 'rgba(26,16,9,0.5)', padding: '48px 24px', minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' },
  modal: { background: 'var(--bg-secondary)', borderRadius: 14, overflow: 'hidden', width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' },
  header: { background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  daysLeft: { background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' },
  daysNum: { display: 'block', fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#fff', fontWeight: 600 },
  daysLabel: { display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  body: { padding: 24 },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 },
  photoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 },
  photoSlot: { height: 90, background: 'var(--bg-surface)', border: '1.5px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' },
  photoPlus: { fontSize: 20, color: 'var(--text-muted)' },
  photoLabel: { fontSize: 10, color: 'var(--text-muted)' },
  checkRow: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer' },
  checkbox: { width: 18, height: 18, border: '1.5px solid var(--border)', borderRadius: 4, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' },
  checkboxDone: { background: 'var(--crimson)', borderColor: 'var(--crimson)' },
};
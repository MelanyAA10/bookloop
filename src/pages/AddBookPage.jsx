// src/pages/AddBookPage.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button, Input, Textarea, Divider } from '../components/UI';
import { apiFetch } from '../config/api';
import { useUser } from '../context/UserContext';

const CONDITIONS = ['Excellent', 'Good', 'Fair'];
const CURRENT_YEAR = new Date().getFullYear();

function validateYear(val) {
  const n = parseInt(val, 10);
  if (!val && val !== 0) return 'Year is required';
  if (isNaN(n)) return 'Year must be a number';
  if (n < 1500) return 'Year cannot be before 1500';
  if (n > CURRENT_YEAR) return 'Year cannot be in the future';
  return '';
}

function validatePages(val) {
  const n = parseInt(val, 10);
  if (!String(val).trim()) return 'Pages is required';
  if (isNaN(n) || n <= 0) return 'Pages must be a positive number';
  return '';
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'bookloop_preset');
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dkjzvjeln/image/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Cloudinary upload failed');
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const BookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export default function AddBookPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const { user } = useUser();

  const [form, setForm] = useState({
    title: '', author: '', genre: '', language: '', description: '', loanDays: '14',
    year: new Date().getFullYear(), pages: '', color: '#7A3728', condition: 'Good'
  });
  const [condition, setCondition] = useState('Good');
  const [coverImage, setCoverImage] = useState('');
  const [coverImgError, setCoverImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [fieldErrors, setFieldErrors] = useState({ year: '', pages: '' });
  const [fieldTouched, setFieldTouched] = useState({ year: false, pages: false });
  const [imageError, setImageError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const set = k => e => {
    const val = e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    if (k === 'year' && fieldTouched.year) setFieldErrors(prev => ({ ...prev, year: validateYear(val) }));
    if (k === 'pages' && fieldTouched.pages) setFieldErrors(prev => ({ ...prev, pages: validatePages(val) }));
  };

  const handleFieldBlur = (field) => {
    setFieldTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({
      ...prev,
      [field]: field === 'year' ? validateYear(form[field]) : validatePages(form[field]),
    }));
  };

  const handleCoverSelect = async (file) => {
    if (!file) return;
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      setImageError('Solo se permiten imágenes .jpg, .jpeg o .png');
      return;
    }
    setImageError('');
    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file);
      setCoverImage(url);
      setCoverImgError(false);
    } catch {
      setImageError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const yearErr = validateYear(form.year);
    const pagesErr = validatePages(form.pages);
    setFieldErrors({ year: yearErr, pages: pagesErr });
    setFieldTouched({ year: true, pages: true });
    if (!form.title.trim()) { setError('El título es requerido'); return; }
    if (!form.author.trim()) { setError('El autor es requerido'); return; }
    if (yearErr || pagesErr) return;

    setLoading(true);
    setError('');

    const userId = user?.id ?? user?.sub ?? user?.userId ?? user?.email ?? '';
    const ownerName = user?.name || user?.username || 'Unknown';
    const ownerInitials = user?.initials ||
      (ownerName !== 'Unknown'
        ? ownerName.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)
        : '??');

    const bookData = {
      title: form.title, author: form.author,
      year: parseInt(form.year) || new Date().getFullYear(),
      pageCount: parseInt(form.pages) || 200,
      language: form.language || 'Spanish',
      genre: form.genre || 'Fiction',
      color: form.color || '#7A3728',
      condition, loanDays: parseInt(form.loanDays) || 14,
      synopsis: form.description, description: form.description,
      image: coverImage || '', images: coverImage ? [coverImage] : [],
      cover_url: coverImage || '', uploadedBy: userId,
      owner: {
        initials: ownerInitials, name: ownerName,
        rating: user?.rating || 5.0, maxDays: parseInt(form.loanDays) || 14,
      },
    };

    try {
      const response = await apiFetch('/books', { method: 'POST', body: JSON.stringify(bookData) });
      if (response.ok) onNavigate('discovery');
      else {
        const errData = await response.json().catch(() => ({}));
        setError(errData?.message || JSON.stringify(errData) || 'Error al crear el libro');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const showCover = coverImage && !coverImgError;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar activePage="discovery" onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />

      <div style={s.overlay}>
        <div style={s.modal}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerInner}>
              <span style={s.headerEyebrow}>New Listing</span>
              <h2 style={s.title}>Add a Book</h2>
              <p style={s.sub}>Share your book with the community to borrow</p>
            </div>
            <button style={s.closeBtn} onClick={() => onNavigate('discovery')} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={s.body}>
            {error && (
              <div style={s.errorMsg}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Cover + Fields */}
            <div style={isMobile ? s.layoutMobile : s.layout}>

              {/* Cover Upload */}
              <div style={s.coverZone}>
                <p style={s.coverLabel}>Book Cover</p>
                <label style={{ cursor: 'pointer', display: 'block', flex: 1 }}>
                  <div
                    style={{
                      ...s.coverUpload,
                      ...(dragOver ? s.coverDragOver : {}),
                      ...(showCover ? { padding: 0, border: 'none' } : {}),
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {uploadingCover ? (
                      <div style={s.uploadingState}>
                        <div style={s.spinner} />
                        <span style={s.uploadingText}>Uploading…</span>
                      </div>
                    ) : showCover ? (
                      <div style={s.coverImageWrapper}>
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          onError={() => setCoverImgError(true)}
                          style={s.coverImg}
                        />
                        <div style={s.coverOverlay}>
                          <UploadIcon />
                          <span style={{ fontSize: 11, marginTop: 6, fontWeight: 600 }}>Change cover</span>
                        </div>
                      </div>
                    ) : (
                      <div style={s.uploadPlaceholder}>
                        <div style={s.uploadIconWrap}>
                          <BookIcon />
                        </div>
                        <span style={s.uploadTitle}>Agrega la portada</span>
                        <span style={s.uploadHint}>de tu libro aquí</span>
                        <span style={s.uploadFormats}>JPG · PNG</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file" accept=".jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleCoverSelect(e.target.files?.[0])}
                  />
                </label>
                {imageError && <p style={s.imageErrorMsg}>{imageError}</p>}
              </div>

              {/* Fields */}
              <div style={s.fields}>
                <Input label="Book Title" placeholder="e.g. Cien Años de Soledad" value={form.title} onChange={set('title')} required />
                <Input label="Author" placeholder="e.g. Gabriel García Márquez" value={form.author} onChange={set('author')} required />
                <div style={isMobile ? s.rowMobile : s.row}>
                  <Input label="Genre" placeholder="Fiction" value={form.genre} onChange={set('genre')} style={{ flex: 1 }} />
                  <Input label="Language" placeholder="Spanish" value={form.language} onChange={set('language')} style={{ flex: 1 }} />
                </div>
                <div style={isMobile ? s.rowMobile : s.row}>
                  <Input
                    label="Year" placeholder="2024" type="number"
                    value={form.year} onChange={set('year')}
                    onBlur={() => handleFieldBlur('year')}
                    error={fieldErrors.year} style={{ flex: 1 }}
                  />
                  <Input
                    label="Pages" placeholder="200" type="number"
                    value={form.pages} onChange={set('pages')}
                    onBlur={() => handleFieldBlur('pages')}
                    error={fieldErrors.pages} style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Tell borrowers about this book…"
              value={form.description}
              onChange={set('description')}
              style={{ marginBottom: 4 }}
            />

            <Divider />

            {/* Condition */}
            <div style={s.conditionSection}>
              <p style={s.sectionLabel}>Book Condition</p>
              <div style={s.condButtons}>
                {CONDITIONS.map(c => (
                  <button
                    key={c} type="button"
                    style={{ ...s.condBtn, ...(condition === c ? s.condBtnActive : {}) }}
                    onClick={() => setCondition(c)}
                  >
                    <span style={s.condDot(c, condition === c)} />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Divider />

            {/* Loan Period */}
            <div style={s.loanRow}>
              <div style={s.loanInfo}>
                <p style={s.sectionLabel}>Loan Period</p>
                <p style={s.loanHint}>How many days can borrowers keep this book?</p>
              </div>
              <Input
                type="number" placeholder="14" value={form.loanDays}
                onChange={set('loanDays')}
                style={{ width: 90, textAlign: 'center' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!(fieldErrors.year || fieldErrors.pages)}
              style={{
                ...s.submitBtn,
                ...(loading || fieldErrors.year || fieldErrors.pages ? s.submitBtnDisabled : {}),
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ ...s.spinner, borderTopColor: '#fff', width: 14, height: 14 }} />
                  Creating listing…
                </span>
              ) : (
                <>List My Book <span style={{ marginLeft: 6, opacity: 0.85 }}>→</span></>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const conditionColors = { Excellent: '#16a34a', Good: '#ca8a04', Fair: '#dc2626' };

const s = {
  overlay: {
    background: 'rgba(20,10,5,0.5)',
    padding: '24px 16px 40px',
    minHeight: 'calc(100vh - 56px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  modal: {
    background: 'var(--bg-secondary)',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 620,
    boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
  },
  header: {
    background: 'linear-gradient(135deg, #4a0b0b 0%, #7A1010 60%, #9B1515 100%)',
    padding: '22px 24px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  headerInner: { display: 'flex', flexDirection: 'column', gap: 3 },
  headerEyebrow: {
    fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    letterSpacing: '2px', textTransform: 'uppercase',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22, color: '#fff', fontWeight: 700, margin: 0, lineHeight: 1.2,
  },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', width: 30, height: 30, borderRadius: '50%',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.15s',
  },
  body: { padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  layout: { display: 'grid', gridTemplateColumns: '155px 1fr', gap: 20, alignItems: 'start' },
  layoutMobile: { display: 'flex', flexDirection: 'column', gap: 16 },
  coverZone: { display: 'flex', flexDirection: 'column', gap: 8 },
  coverLabel: {
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
  },
  coverUpload: {
    height: 210,
    background: 'var(--bg-surface)',
    border: '2px dashed var(--border)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
    position: 'relative',
  },
  coverDragOver: {
    borderColor: 'var(--crimson)',
    background: 'rgba(139,28,28,0.06)',
  },
  coverImageWrapper: {
    width: '100%', height: '100%', position: 'relative',
  },
  coverImg: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
  },
  coverOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    color: '#fff', opacity: 0, transition: 'opacity 0.2s',
    ':hover': { opacity: 1 },
  },
  uploadPlaceholder: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: 16, textAlign: 'center',
  },
  uploadIconWrap: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(139,28,28,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--crimson)', marginBottom: 8,
    border: '1.5px solid rgba(139,28,28,0.15)',
  },
  uploadTitle: {
    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3,
  },
  uploadHint: { fontSize: 12, color: 'var(--text-muted)' },
  uploadFormats: {
    fontSize: 10, color: 'var(--text-muted)', marginTop: 6,
    background: 'var(--bg-primary)', borderRadius: 20,
    padding: '3px 10px', border: '1px solid var(--border)',
    letterSpacing: '0.5px', fontWeight: 500,
  },
  uploadingState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
  },
  uploadingText: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  imageErrorMsg: { fontSize: 11, color: '#dc2626', margin: 0 },
  fields: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { display: 'flex', gap: 10 },
  rowMobile: { display: 'flex', flexDirection: 'column', gap: 10 },
  conditionSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '1px', margin: 0,
  },
  condButtons: { display: 'flex', gap: 8 },
  condBtn: {
    flex: 1, padding: '10px 0',
    background: 'var(--bg-surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 8, fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    color: 'var(--text-secondary)',
    cursor: 'pointer', fontWeight: 500,
    transition: 'all 0.18s',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  condBtnActive: {
    background: 'rgba(139,28,28,0.07)',
    border: '1.5px solid var(--crimson)',
    color: 'var(--crimson)', fontWeight: 600,
  },
  condDot: (c, active) => ({
    width: 7, height: 7, borderRadius: '50%',
    background: active ? conditionColors[c] : 'var(--border)',
    flexShrink: 0, transition: 'background 0.18s',
  }),
  loanRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 16,
  },
  loanInfo: { display: 'flex', flexDirection: 'column', gap: 3 },
  loanHint: { fontSize: 12, color: 'var(--text-muted)', margin: 0 },
  submitBtn: {
    width: '100%', padding: '13px 0',
    background: 'linear-gradient(135deg, #7A0E0E, #A01515)',
    border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'opacity 0.2s, transform 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: '0.2px', marginTop: 4,
    boxShadow: '0 4px 16px rgba(122,14,14,0.35)',
  },
  submitBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  errorMsg: {
    background: '#FEF2F2', color: '#DC2626',
    padding: '10px 14px', borderRadius: 8,
    fontSize: 12, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1px solid #FECACA',
  },
  spinner: {
    width: 18, height: 18, borderRadius: '50%',
    border: '2px solid rgba(139,28,28,0.2)',
    borderTopColor: 'var(--crimson)',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
};
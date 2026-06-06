// src/pages/AddBookPage.jsx - Responsive version
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button, Input, Textarea, Divider } from '../components/UI';
import { apiFetch } from '../config/api';
import { useUser } from '../context/UserContext';

const CONDITIONS = ['Excellent', 'Good', 'Fair'];
const PHOTO_LABELS = ['Front', 'Back', 'Spine', 'Interior'];
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

  const response = await fetch('https://api.cloudinary.com/v1_1/dkjzvjeln/image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Cloudinary upload failed');
  const data = await response.json();
  return data.secure_url;
}

export default function AddBookPage({ onNavigate = () => {}, theme, onToggleTheme }) {
  const user = useUser();
  const [form, setForm] = useState({
    title: '', author: '', genre: '', language: '', description: '', loanDays: '14',
    year: new Date().getFullYear(), pages: '', color: '#7A3728', condition: 'Good'
  });
  const [condition, setCondition] = useState('Good');
  const [images, setImages] = useState(['', '', '', '']);
  const [coverImgError, setCoverImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [fieldErrors, setFieldErrors] = useState({ year: '', pages: '' });
  const [fieldTouched, setFieldTouched] = useState({ year: false, pages: false });
  const [imageError, setImageError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(null);

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

  const handleImageSelect = async (index, file) => {
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      setImageError('Formato no válido. Por favor, sube solo imágenes en formato .jpg, .jpeg o .png');
      return;
    }

    setImageError('');
    setUploadingImage(index);

    try {
      const url = await uploadToCloudinary(file);
      setImages(prev => prev.map((v, i) => i === index ? url : v));
      if (index === 0) setCoverImgError(false);
    } catch {
      setImageError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const yearErr = validateYear(form.year);
    const pagesErr = validatePages(form.pages);
    setFieldErrors({ year: yearErr, pages: pagesErr });
    setFieldTouched({ year: true, pages: true });

    if (!form.title.trim()) { setError('El título es requerido'); return; }
    if (!form.author.trim()) { setError('El autor es requerido'); return; }
    if (!form.description.trim()) { setError('La descripción es requerida'); return; }
    if (!form.language.trim()) { setError('El idioma es requerido'); return; }
    if (yearErr || pagesErr) return;

    setLoading(true);
    setError('');

    // Mapeado exacto al DTO del backend:
    // title, author, description, image (string), pageCount (int), language, uploadedBy
    const bookData = {
      title:       form.title.trim(),
      author:      form.author.trim(),
      description: form.description.trim(),
      image:       images[0] || '',          // cover URL (string, no array)
      pageCount:   parseInt(form.pages, 10), // backend espera "pageCount", no "pages"
      language:    form.language.trim(),
      uploadedBy:  user?.name || 'Invitado', // backend espera "uploadedBy", no "owner"
    };

    try {
      const response = await apiFetch('/v1/books', {
        method: 'POST',
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        onNavigate('discovery');
      } else {
        // El backend devuelve { campo: "mensaje" } en 400
        const errBody = await response.json().catch(() => null);
        if (errBody && typeof errBody === 'object') {
          const msgs = Object.values(errBody).join(', ');
          setError(`Error de validación: ${msgs}`);
        } else {
          setError(`Error al crear el libro (${response.status})`);
        }
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const coverUrl = images[0];
  const showCoverImage = coverUrl && !coverImgError;

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

            <div style={isMobile ? s.layoutMobile : s.layout}>
              <div style={s.coverZone}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ ...s.coverUpload, padding: showCoverImage ? 0 : undefined, overflow: 'hidden' }}>
                    {uploadingImage === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span>
                    ) : showCoverImage ? (
                      <img
                        src={coverUrl}
                        alt="Cover preview"
                        onError={() => setCoverImgError(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7 }}
                      />
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Cover Preview</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageSelect(0, e.target.files?.[0])}
                  />
                </label>
              </div>

              <div style={s.fields}>
                <Input label="Book Title" placeholder="e.g. Cien Años de Soledad" value={form.title} onChange={set('title')} required />
                <Input label="Author" placeholder="e.g. Gabriel García Márquez" value={form.author} onChange={set('author')} required />
                <div style={isMobile ? s.rowMobile : s.row}>
                  <Input label="Language" placeholder="Spanish" value={form.language} onChange={set('language')} style={{ flex: 1 }} required />
                  <Input
                    label="Pages"
                    placeholder="200"
                    type="number"
                    value={form.pages}
                    onChange={set('pages')}
                    onBlur={() => handleFieldBlur('pages')}
                    error={fieldErrors.pages}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <Textarea label="Description" placeholder="Tell borrowers about this book…" value={form.description} onChange={set('description')} style={{ marginBottom: 4 }} required />

            <Divider />

            <p style={s.sectionLabel}>Book Condition</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {CONDITIONS.map(c => (
                <button key={c} type="button" style={{ ...s.condBtn, ...(condition === c ? s.condBtnActive : {}) }} onClick={() => setCondition(c)}>
                  {c}
                </button>
              ))}
            </div>

            <p style={s.sectionLabel}>Condition Photos</p>
            <div style={isMobile ? s.photoGridMobile : s.photoGrid}>
              {PHOTO_LABELS.map((label, i) => (
                <label key={label} style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{
                    ...s.photoBox,
                    background: images[i] ? `url(${images[i]}) center/cover` : 'var(--bg-surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 6,
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {uploadingImage === i ? (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Uploading...</span>
                    ) : !images[i] ? (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                    ) : null}
                  </div>
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageSelect(i, e.target.files?.[0])}
                  />
                </label>
              ))}
            </div>
            {imageError && <div style={s.errorImageMsg}>{imageError}</div>}

            <Divider />

            <Button
              variant="full"
              type="submit"
              disabled={loading || !!(fieldErrors.year || fieldErrors.pages)}
            >
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
    padding: '20px 16px',
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
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(16px, 5vw, 18px)', color: '#fff', fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  closeBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
    width: 28, height: 28, borderRadius: '50%', fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
  },
  body: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 },
  layout: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 20, marginBottom: 4 },
  layoutMobile: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 4 },
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
  row: { display: 'flex', gap: 10 },
  rowMobile: { display: 'flex', flexDirection: 'column', gap: 10 },
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
  photoGridMobile: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  photoBox: {},
  errorMsg: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  errorImageMsg: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 8,
    fontWeight: 500,
  },
};
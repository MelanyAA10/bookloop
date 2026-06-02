import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { Button, Input } from '../components/UI';
import { apiFetch } from '../config/api';
import { useUser } from '../context/UserContext';

function validateName(val) {
  if (!val.trim()) return 'Full name is required';
  if (val.trim().length < 3) return 'Name must be at least 3 characters';
  return '';
}

function validateEmail(val) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val.trim()) return 'Email is required';
  if (!EMAIL_RE.test(val)) return 'Enter a valid email address';
  return '';
}

function validatePassword(val) {
  if (!val) return 'Password is required';
  if (val.length < 8) return 'Password must be at least 8 characters';
  return '';
}

function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return '';
}

export default function SignupPage({ onSignup = () => {}, onLogin = () => {} }) {
  const { login } = useUser();
  
  const [form, setForm] = useState({ name: '', email: '', university: '', password: '', confirm: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const set = k => e => {
    const value = e.target.value;
    setForm(f => ({ ...f, [k]: value }));
    setServerError('');
    
    if (touched[k]) {
      validateField(k, value);
    }
  };

  const validateField = (field, value) => {
    let error = '';
    
    if (field === 'name') error = validateName(value);
    else if (field === 'email') error = validateEmail(value);
    else if (field === 'password') error = validatePassword(value);
    else if (field === 'confirm') error = validateConfirmPassword(form.password, value);
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateConfirmPassword(form.password, form.confirm)
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (Object.values(newErrors).some(err => err)) return;
    if (!termsAccepted) {
      setServerError('You must accept the Terms of Service and Community Guidelines');
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await apiFetch('/users/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          university: form.university || 'Not specified',
          password: form.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setServerError(errorData.message || 'Sign up failed. Please try again.');
        return;
      }

      const data = await response.json();
      
      login(data.user);
      
      onSignup();
    } catch (error) {
      console.error('Signup error:', error);
      setServerError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(err => err);

  return (
    <div style={s.root}>
      <div style={s.bg} />

      <div style={s.card}>
        <div style={s.header}>
          <Logo size={28} variant="light" />
          <p style={s.headerSub}>Join the academic book-sharing community</p>
        </div>

        <div style={s.body}>
          <h2 style={s.title}>Create your account</h2>
          <p style={s.subtitle}>Start sharing books with fellow students</p>

          {serverError && <div style={s.errorMsg}>{serverError}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={isMobile ? s.rowMobile : s.row}>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Full Name" 
                  placeholder="Ada Lovelace" 
                  value={form.name} 
                  onChange={set('name')}
                  onBlur={() => handleBlur('name')}
                  error={errors.name}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input 
                  label="University" 
                  placeholder="TEC San Carlos" 
                  value={form.university} 
                  onChange={set('university')}
                />
              </div>
            </div>

            <Input 
              label="Email" 
              type="email" 
              placeholder="yourEmail@domain.com" 
              value={form.email} 
              onChange={set('email')}
              onBlur={() => handleBlur('email')}
              error={errors.email}
            />

            <div style={isMobile ? s.rowMobile : s.row}>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="Min. 8 characters" 
                  value={form.password} 
                  onChange={set('password')}
                  onBlur={() => handleBlur('password')}
                  error={errors.password}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Confirm Password" 
                  type="password" 
                  placeholder="Repeat password" 
                  value={form.confirm} 
                  onChange={set('confirm')}
                  onBlur={() => handleBlur('confirm')}
                  error={errors.confirm}
                />
              </div>
            </div>

            <label style={s.terms}>
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ accentColor: '#8B1C1C' }} 
              />
              <span>I agree to the <span style={s.link}>Terms of Service</span> and <span style={s.link}>Community Guidelines</span></span>
            </label>

            <Button 
              variant="full" 
              type="submit" 
              disabled={loading || (Object.keys(touched).length > 0 && (hasErrors || !termsAccepted))}
              style={s.submitBtn}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </Button>
          </form>

          <p style={s.loginPrompt}>
            Already a member?{' '}
            <button type="button" style={s.loginLink} onClick={onLogin}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    padding: '20px'
  },
  bg: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))',
    opacity: 0.1,
    zIndex: -1,
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--bg-secondary)',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 500,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  header: {
    background: 'linear-gradient(135deg, var(--crimson-dark), var(--crimson))',
    padding: '32px 20px',
    textAlign: 'center',
    color: '#fff'
  },
  headerSub: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9
  },
  body: {
    padding: '32px 24px'
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 24
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  row: {
    display: 'flex',
    gap: 12
  },
  rowMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  terms: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.4
  },
  link: {
    color: 'var(--crimson)',
    fontWeight: 600,
    cursor: 'pointer'
  },
  submitBtn: {
    marginTop: 8
  },
  loginPrompt: {
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center'
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: 'var(--crimson)',
    cursor: 'pointer',
    fontWeight: 600
  },
  errorMsg: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    fontWeight: 500
  }
};
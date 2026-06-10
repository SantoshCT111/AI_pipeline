import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await authApi.register(email, password, name, 'teacher');
      } else {
        await authApi.login(email, password);
      }
      // Only teachers can access the web app
      const user = authApi.getUser();
      if (user && user.role !== 'teacher') {
        authApi.logout();
        setError('Nur Lehrer können sich hier anmelden. Bitte die EduGo App verwenden.');
        return;
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || (isSignup ? 'Registrierung fehlgeschlagen.' : 'Anmeldung fehlgeschlagen.'));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup(!isSignup);
    setError('');
  }

  return (
    <div style={styles.container}>
      {/* Decorative background */}
      <div style={styles.bgGradientTop} />
      <div style={styles.bgGradientBottom} />

      <div style={styles.card}>
        {/* Logo / Branding */}
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>
            <span style={styles.logoEmoji}>🎓</span>
          </div>
          <h1 style={styles.title}>Teacher Hub</h1>
          <p style={styles.subtitle}>
            {isSignup ? 'Konto erstellen' : 'Willkommen zurück'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="8" cy="8" r="7" stroke="#b85c4a" strokeWidth="1.5" />
              <path d="M8 5v3.5M8 10.5v.5" stroke="#b85c4a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name field — signup only */}
          {isSignup && (
            <div style={styles.fieldGroup}>
              <label htmlFor="signup-name" style={styles.label}>Name</label>
              <div style={styles.inputWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.8" style={styles.inputIcon}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a6 6 0 0112 0v1" />
                </svg>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Max Mustermann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label htmlFor="login-email" style={styles.label}>E-Mail</label>
            <div style={styles.inputWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.8" style={styles.inputIcon}>
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 7l10 6 10-6" />
              </svg>
              <input
                id="login-email"
                type="email"
                placeholder="teacher@edugo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="login-password" style={styles.label}>Passwort</label>
            <div style={styles.inputWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.8" style={styles.inputIcon}>
                <rect x="3" y="11" width="18" height="11" rx="3" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              isSignup ? 'Registrieren' : 'Anmelden'
            )}
          </button>
        </form>

        {/* Toggle login/signup */}
        <div style={styles.toggleSection}>
          <span style={styles.toggleText}>
            {isSignup ? 'Bereits ein Konto?' : 'Noch kein Konto?'}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            style={styles.toggleBtn}
          >
            {isSignup ? 'Anmelden' : 'Registrieren'}
          </button>
        </div>

        <p style={styles.footerText}>
          EduGo Learning Platform — v1.0
        </p>
      </div>

      <style>{`
        @keyframes login-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #b0b0b0;
        }
        input:focus {
          outline: none;
          border-color: #2e4a62 !important;
          box-shadow: 0 0 0 3px rgba(46, 74, 98, 0.12) !important;
        }
        button[type="submit"]:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(46, 74, 98, 0.35);
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafaf8',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Geist', system-ui, sans-serif",
  },
  bgGradientTop: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(46, 74, 98, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGradientBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(46, 74, 98, 0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: '48px 40px 36px',
    background: '#ffffff',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e8e6e1',
    animation: 'login-fade-in 0.5s ease-out',
    position: 'relative',
    zIndex: 1,
  },
  logoSection: {
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2e4a62 0%, #3d6480 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 12px rgba(46, 74, 98, 0.25)',
  },
  logoEmoji: {
    fontSize: 32,
    filter: 'brightness(1.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: '#1a1a1a',
    margin: '0 0 4px',
    fontFamily: "'Newsreader', Georgia, serif",
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b6b6b',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 14px',
    background: '#fef2f0',
    border: '1px solid #f0d0c9',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    color: '#b85c4a',
    lineHeight: 1.4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1a1a1a',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: 14,
    pointerEvents: 'none' as const,
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    fontSize: 15,
    border: '1.5px solid #e8e6e1',
    borderRadius: 12,
    background: '#fafaf8',
    color: '#1a1a1a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'Geist', system-ui, sans-serif",
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: 10,
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 6,
    lineHeight: 1,
  },
  roleSelector: {
    display: 'flex',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    padding: '10px 12px',
    fontSize: 14,
    fontWeight: 500,
    border: '1.5px solid #e8e6e1',
    borderRadius: 12,
    background: '#fafaf8',
    color: '#6b6b6b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Geist', system-ui, sans-serif",
  },
  roleBtnActive: {
    borderColor: '#2e4a62',
    background: '#f0f4f8',
    color: '#2e4a62',
    boxShadow: '0 0 0 2px rgba(46, 74, 98, 0.1)',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fafaf8',
    background: 'linear-gradient(135deg, #2e4a62 0%, #3d6480 100%)',
    border: 'none',
    borderRadius: 12,
    transition: 'all 0.2s',
    fontFamily: "'Geist', system-ui, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    boxShadow: '0 2px 8px rgba(46, 74, 98, 0.2)',
  },
  spinner: {
    width: 20,
    height: 20,
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  toggleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  toggleText: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  toggleBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: '#2e4a62',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    fontFamily: "'Geist', system-ui, sans-serif",
  },
  footerText: {
    textAlign: 'center' as const,
    marginTop: 16,
    fontSize: 12,
    color: '#b0b0b0',
    margin: '16px 0 0',
  },
};

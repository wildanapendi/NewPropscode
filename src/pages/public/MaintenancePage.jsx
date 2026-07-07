import { useState } from 'react';
import { FiSettings, FiLock, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BYPASS_TOKEN_KEY = 'propscode_maintenance_bypass';

const MaintenancePage = () => {
  const [showBypassInput, setShowBypassInput] = useState(false);
  const [token, setToken] = useState('');

  const hasBypassToken = !!localStorage.getItem(BYPASS_TOKEN_KEY);

  const handleBypassSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) return;

    localStorage.setItem(BYPASS_TOKEN_KEY, token);
    toast.success('Bypass token disimpan. Memuat ulang...');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const handleResetBypass = () => {
    localStorage.removeItem(BYPASS_TOKEN_KEY);
    toast.success('Bypass token dihapus.');
    window.location.reload();
  };

  return (
    <main className="maintenance-container" style={containerStyle}>
      <div className="glass-card" style={cardStyle}>
        {/* Klik dua kali ikon gear untuk memunculkan form bypass admin */}
        <div
          style={iconContainerStyle}
          onDoubleClick={() => setShowBypassInput(true)}
          role="presentation"
          aria-hidden="true"
        >
          <FiSettings style={iconStyle} className="gear-pulse" />
        </div>

        <h1 style={titleStyle}>Pemeliharaan Sistem</h1>
        <p style={messageStyle}>
          Kami sedang melakukan pemeliharaan rutin dan pembaruan sistem untuk meningkatkan
          stabilitas serta performa layanan Propscode.
        </p>
        <p style={subMessageStyle}>
          Kami akan segera kembali dalam beberapa saat. Terima kasih atas kesabaran Anda.
        </p>

        {showBypassInput && (
          <form onSubmit={handleBypassSubmit} style={formStyle} aria-label="Form bypass admin">
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="bypass-token" style={labelStyle}>
                Admin Bypass Token
              </label>
              <div style={inputWrapperStyle}>
                <FiLock style={inputIconStyle} aria-hidden="true" />
                <input
                  id="bypass-token"
                  type="password"
                  className="form-control"
                  placeholder="Masukkan token akses..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            <div style={buttonGroupStyle}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Bypass Mode
              </button>
              <button
                type="button"
                className="btn"
                style={btnSecondaryStyle}
                onClick={() => setShowBypassInput(false)}
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {hasBypassToken && !showBypassInput && (
          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={handleResetBypass}
              className="btn btn-danger"
              style={{ fontSize: '0.85rem' }}
            >
              <FiAlertTriangle style={{ marginRight: '6px' }} aria-hidden="true" />
              Matikan Bypass Mode
            </button>
          </div>
        )}
      </div>

      {/* Animasi gear — didefinisikan sebagai style tag karena bersifat keyframe */}
      <style>{`
        @keyframes gear-pulse {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.08); text-shadow: 0 0 20px rgba(99,102,241,0.5); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .gear-pulse {
          animation: gear-pulse 8s infinite linear;
          color: var(--accent-primary);
        }
      `}</style>
    </main>
  );
};

// === Inline style constants ===
// Dipisahkan sebagai konstanta agar JSX tetap bersih dan mudah dibaca

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: '2rem',
  textAlign: 'center',
};

const cardStyle = {
  maxWidth: '550px',
  padding: '3rem 2rem',
  borderRadius: 'var(--radius-lg)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
};

const iconContainerStyle = {
  display: 'inline-flex',
  padding: '1.5rem',
  borderRadius: '50%',
  background: 'rgba(99, 102, 241, 0.08)',
  marginBottom: '1.5rem',
  cursor: 'pointer',
};

const iconStyle = { fontSize: '3.5rem' };

const titleStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '1rem',
};

const messageStyle = {
  color: 'var(--text-secondary)',
  fontSize: '1rem',
  lineHeight: '1.6',
  marginBottom: '1rem',
};

const subMessageStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.875rem',
  lineHeight: '1.5',
  marginBottom: '1.5rem',
};

const formStyle = {
  marginTop: '2rem',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  paddingTop: '1.5rem',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  marginBottom: '0.5rem',
  display: 'block',
};

const inputWrapperStyle = { position: 'relative' };

const inputIconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
};

const btnSecondaryStyle = {
  background: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
};

export default MaintenancePage;

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSave, FiLock, FiGlobe, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const INITIAL_SITE_SETTINGS = {
  email: '',
  phone: '',
  address: '',
  facebook: '',
  instagram: '',
  linkedin: '',
};

const INITIAL_ACCOUNT_SETTINGS = {
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

const SettingsManager = () => {
  const { user, checkAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'site';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState(INITIAL_SITE_SETTINGS);
  const [account, setAccount] = useState(INITIAL_ACCOUNT_SETTINGS);
  const [prevUserEmail, setPrevUserEmail] = useState(user?.email || '');

  // Sinkronisasi email dari auth context saat user data berubah
  if (user && user.email !== prevUserEmail) {
    setPrevUserEmail(user.email);
    setAccount((prev) => ({ ...prev, email: user.email }));
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.data) {
          setSettings({
            email: data.data.email || '',
            phone: data.data.phone || '',
            address: data.data.address || '',
            facebook: data.data.facebook || '',
            instagram: data.data.instagram || '',
            linkedin: data.data.linkedin || '',
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        toast.error('Gagal memuat pengaturan situs');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Pengaturan situs berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan situs');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (account.newPassword && account.newPassword !== account.confirmNewPassword) {
      return toast.error('Konfirmasi kata sandi baru tidak cocok');
    }
    if (account.newPassword && account.newPassword.length < 6) {
      return toast.error('Kata sandi baru minimal 6 karakter');
    }

    setSaving(true);
    try {
      const response = await api.put('/auth/update-account', {
        email: account.email,
        currentPassword: account.currentPassword,
        newPassword: account.newPassword,
      });
      toast.success(response.data.message || 'Pengaturan akun berhasil disimpan');
      // Reset field password setelah berhasil
      setAccount((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
      // Perbarui auth context agar nama/email di sidebar ikut terupdate
      await checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan akun');
    } finally {
      setSaving(false);
    }
  };

  /** Handler generik untuk perubahan field pengaturan situs */
  const handleSiteChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  /** Handler generik untuk perubahan field pengaturan akun */
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat pengaturan...">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="admin-page">
      {activeTab === 'site' ? (
        <>
          <header className="admin-header">
            <h1>Pengaturan Situs</h1>
            <p className="text-muted">
              Atur informasi kontak dan tautan sosial media untuk ditampilkan di website.
            </p>
          </header>

          <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px' }}>
            <form onSubmit={handleSiteSubmit} aria-label="Formulir pengaturan situs">
              {/* Grup kontak utama — menggunakan fieldset+legend untuk aksesibilitas form */}
              <fieldset>
                <legend style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', width: '100%' }}>
                  <FiGlobe aria-hidden="true" /> Kontak Utama
                </legend>

                <div className="form-group">
                  <label htmlFor="site-email">Alamat Email</label>
                  <input
                    id="site-email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={settings.email}
                    onChange={handleSiteChange}
                    placeholder="hello@propscode.com"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="site-phone">Nomor Telepon / WhatsApp</label>
                  <input
                    id="site-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={settings.phone}
                    onChange={handleSiteChange}
                    placeholder="+62 812 3456 7890"
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="site-address">Alamat Kantor</label>
                  <textarea
                    id="site-address"
                    name="address"
                    className="form-control"
                    value={settings.address}
                    onChange={handleSiteChange}
                    placeholder="Jakarta, Indonesia"
                    rows="3"
                  />
                </div>
              </fieldset>

              {/* Grup sosial media */}
              <fieldset style={{ marginTop: '2rem' }}>
                <legend style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', width: '100%' }}>
                  Sosial Media
                </legend>

                <div className="form-group">
                  <label htmlFor="site-instagram">Link Instagram</label>
                  <input
                    id="site-instagram"
                    type="text"
                    name="instagram"
                    className="form-control"
                    value={settings.instagram}
                    onChange={handleSiteChange}
                    placeholder="https://instagram.com/propscode atau #"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="site-facebook">Link Facebook</label>
                  <input
                    id="site-facebook"
                    type="text"
                    name="facebook"
                    className="form-control"
                    value={settings.facebook}
                    onChange={handleSiteChange}
                    placeholder="https://facebook.com/propscode atau #"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="site-linkedin">Link LinkedIn</label>
                  <input
                    id="site-linkedin"
                    type="text"
                    name="linkedin"
                    className="form-control"
                    value={settings.linkedin}
                    onChange={handleSiteChange}
                    placeholder="https://linkedin.com/company/propscode atau #"
                  />
                </div>
              </fieldset>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave style={{ marginRight: '8px' }} aria-hidden="true" />
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          <header className="admin-header">
            <h1>Pengaturan Akun</h1>
            <p className="text-muted">
              Perbarui alamat email masuk dan kata sandi administrator Anda secara aman.
            </p>
          </header>

          <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
            <form onSubmit={handleAccountSubmit} aria-label="Formulir pengaturan akun">
              {/* Grup identitas akun */}
              <fieldset>
                <legend style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', width: '100%' }}>
                  <FiUser aria-hidden="true" /> Identitas Akun
                </legend>

                <div className="form-group">
                  <label htmlFor="account-email">Alamat Email Admin</label>
                  <input
                    id="account-email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={account.email}
                    onChange={handleAccountChange}
                    placeholder="admin@propscode.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </fieldset>

              {/* Grup ubah kata sandi */}
              <fieldset style={{ marginTop: '2rem' }}>
                <legend style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', width: '100%' }}>
                  <FiLock aria-hidden="true" /> Ubah Kata Sandi
                </legend>

                <div className="form-group">
                  <label htmlFor="account-new-password">
                    Kata Sandi Baru <span className="label-optional">(Opsional)</span>
                  </label>
                  <input
                    id="account-new-password"
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={account.newPassword}
                    onChange={handleAccountChange}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="account-confirm-password">Konfirmasi Kata Sandi Baru</label>
                  <input
                    id="account-confirm-password"
                    type="password"
                    name="confirmNewPassword"
                    className="form-control"
                    value={account.confirmNewPassword}
                    onChange={handleAccountChange}
                    placeholder="Ulangi kata sandi baru"
                    autoComplete="new-password"
                    required={!!account.newPassword}
                  />
                </div>
              </fieldset>

              {/* Grup verifikasi keamanan */}
              <fieldset style={{ marginTop: '2rem' }}>
                <legend style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', width: '100%' }}>
                  Verifikasi Keamanan
                </legend>

                <div className="form-group">
                  <label htmlFor="account-current-password">
                    Kata Sandi Saat Ini{' '}
                    <span style={{ color: 'var(--error)' }} aria-label="wajib diisi">*</span>
                  </label>
                  <input
                    id="account-current-password"
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    value={account.currentPassword}
                    onChange={handleAccountChange}
                    placeholder="Masukkan kata sandi sekarang untuk mengonfirmasi perubahan"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </fieldset>

              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave style={{ marginRight: '8px' }} aria-hidden="true" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </main>
  );
};

export default SettingsManager;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // State digabung dalam satu objek form untuk mengurangi jumlah state individual
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  });

  /**
   * Handler perubahan field login — menggunakan name attribute input
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handler perubahan field registrasi — menggunakan name attribute input
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      return toast.error('Email dan password harus diisi');
    }

    setIsLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password);
      toast.success('Login berhasil!');
      // Arahkan ke halaman yang sesuai berdasarkan role
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal login, periksa kembali kredensial Anda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, company } = registerForm;

    if (!name || !email || !phone || !password) {
      return toast.error('Semua kolom wajib harus diisi');
    }
    if (password !== confirmPassword) {
      return toast.error('Password tidak cocok');
    }

    setIsLoading(true);
    try {
      await register({ name, email, phone, company, password, role: 'client' });
      toast.success('Registrasi berhasil!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.div
        className="auth-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Tab switcher dengan ARIA yang proper untuk aksesibilitas */}
        <div
          className={`auth-switch-container ${isFlipped ? 'is-flipped' : ''}`}
          role="tablist"
          aria-label="Pilih mode autentikasi"
        >
          <div
            className={`auth-switch ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            aria-hidden="true"
          />
          <button
            role="tab"
            aria-selected={!isFlipped}
            aria-controls="panel-login"
            className="btn-reset card-side-label login"
            onClick={() => setIsFlipped(false)}
          >
            Log in
          </button>
          <button
            role="tab"
            aria-selected={isFlipped}
            aria-controls="panel-register"
            className="btn-reset card-side-label signup"
            onClick={() => setIsFlipped(true)}
          >
            Sign up
          </button>
        </div>

        <div className={`flip-card__inner ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Panel Login */}
          <div
            id="panel-login"
            className="flip-card__front"
            role="tabpanel"
            aria-labelledby="tab-login"
            aria-hidden={isFlipped}
          >
            <h1 className="flip-card__title">Log In</h1>
            <form onSubmit={handleLogin} className="flip-card__form" noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="flip-card__input"
                  placeholder="Masukkan email Anda"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  className="flip-card__input"
                  placeholder="Masukkan password Anda"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="flip-card__btn" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Log In'}
              </button>
            </form>
          </div>

          {/* Panel Register */}
          <div
            id="panel-register"
            className="flip-card__back"
            role="tabpanel"
            aria-labelledby="tab-register"
            aria-hidden={!isFlipped}
          >
            <h1 className="flip-card__title">Sign Up</h1>
            <form onSubmit={handleRegister} className="flip-card__form" noValidate>
              <div className="flip-card__grid">
                <div className="form-group">
                  <label htmlFor="reg-name">Nama Lengkap</label>
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    className="flip-card__input"
                    placeholder="Nama lengkap Anda"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    className="flip-card__input"
                    placeholder="email@contoh.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-phone">No. WhatsApp</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    className="flip-card__input"
                    placeholder="+62 8xx xxxx xxxx"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-company">
                    Nama Perusahaan{' '}
                    <span className="label-optional">(Opsional)</span>
                  </label>
                  <input
                    id="reg-company"
                    type="text"
                    name="company"
                    className="flip-card__input"
                    placeholder="PT. Nama Perusahaan Anda"
                    value={registerForm.company}
                    onChange={handleRegisterChange}
                    autoComplete="organization"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    className="flip-card__input"
                    placeholder="Minimal 8 karakter"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm-password">Konfirmasi Password</label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    name="confirmPassword"
                    className="flip-card__input"
                    placeholder="Ulangi password Anda"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="flip-card__btn" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default LoginPage;

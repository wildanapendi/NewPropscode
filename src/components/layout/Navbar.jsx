import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiChevronDown, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setIsCompanyOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: t('navbar.home') },
    { path: '/services', label: t('navbar.services') },
    { path: '/portfolio', label: t('navbar.portfolio') },
    {
      label: t('navbar.company'),
      dropdown: [
        { path: '/blog', label: t('navbar.blog') },
        { path: '/team', label: t('navbar.team') }
      ]
    },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={logoImg} alt="Propscode Logo" style={{ height: '42px', width: 'auto' }} />
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            {navLinks.map((link, idx) => (
              link.dropdown ? (
                <div key={idx} className={`nav-dropdown-wrapper ${isCompanyOpen ? 'mobile-open' : ''}`}>
                  <button
                    type="button"
                    className="nav-link nav-dropdown-toggle"
                    onClick={() => {
                      if (window.innerWidth <= 900) {
                        setIsCompanyOpen(!isCompanyOpen);
                      }
                    }}
                    aria-expanded={isCompanyOpen}
                  >
                    {link.label} <FiChevronDown className={`nav-chevron ${isCompanyOpen ? 'rotated' : ''}`} />
                  </button>
                  <div className={`nav-dropdown-menu ${isCompanyOpen ? 'show' : ''}`}>
                    {link.dropdown.map(sub => (
                      <Link key={sub.path} to={sub.path} className={`nav-dropdown-item ${location.pathname === sub.path ? 'active' : ''}`}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          <div className="navbar-actions">
            <div className="lang-switcher">
              <button className="lang-toggle" onClick={() => i18n.changeLanguage(i18n.language.startsWith('id') ? 'en' : 'id')} aria-label="Toggle Language">
                {i18n.language.startsWith('id') ? (
                  <><img src="https://flagcdn.com/w20/id.png" alt="ID" className="lang-flag-img" /> ID</>
                ) : (
                  <><img src="https://flagcdn.com/w20/us.png" alt="EN" className="lang-flag-img" /> EN</>
                )}
              </button>
            </div>

            {user ? (
              <div className="user-menu">
                <button className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-avatar">
                    {user.avatar ? <img src={user.avatar} alt="" /> : <FiUser />}
                  </div>
                  <span className="user-name">{user.name}</span>
                  <FiChevronDown className={`chevron ${dropdownOpen ? 'open' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu animate-fadeIn">
                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="dropdown-item">
                      <FiGrid /> {t('navbar.dashboard')}
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <FiLogOut /> {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-icon-btn" aria-label="Login">
                <FiUser />
              </Link>
            )}
          </div>
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

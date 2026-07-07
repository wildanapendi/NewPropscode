import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiInstagram, FiFacebook } from 'react-icons/fi';
import api from '../../services/api';
import logoImg from '../../assets/logo.png';
import './Footer.css';

const Footer = () => {
  const [settings, setSettings] = useState({
    email: 'hello@propscode.com',
    phone: '+62 812 3456 7890',
    address: 'Jakarta, Indonesia',
    facebook: '#',
    instagram: '#',
    linkedin: '#'
  });

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data.data && Object.keys(data.data).length > 0) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    }).catch(() => {});
  }, []);

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logoImg} alt="Propscode Logo" style={{ height: '32px', width: 'auto' }} />
            </Link>
            <p className="footer-desc">
              Solusi digital terbaik untuk bisnis Anda. Kami membangun website, aplikasi mobile, dan software custom berkualitas tinggi.
            </p>
            <div className="footer-social">
              <a href={settings.facebook || '#'} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FiFacebook /></a>
              <a href={settings.linkedin || '#'} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
              <a href={settings.instagram || '#'} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Layanan</h4>
            <ul>
              <li><Link to="/services">Website Development</Link></li>
              <li><Link to="/services">Mobile App</Link></li>
              <li><Link to="/services">UI/UX Design</Link></li>
              <li><Link to="/services">Custom Software</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Perusahaan</h4>
            <ul>
              <li><Link to="/team">Tim Kami</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Kontak</h4>
            <ul className="contact-list">
              <li><FiMail /> <span>{settings.email}</span></li>
              <li><FiPhone /> <span>{settings.phone}</span></li>
              <li><FiMapPin /> <span>{settings.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Propscode. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

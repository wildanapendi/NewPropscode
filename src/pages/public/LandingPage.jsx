import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCode, FiSmartphone, FiLayout, FiDatabase, FiCheckCircle, FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api, { getImageUrl } from '../../services/api';
import './LandingPage.css';

// Pemetaan nama icon string ke komponen React Icon
const ICON_MAP = {
  FiGlobe: FiCode,
  FiSmartphone,
  FiLayout,
  FiCode: FiDatabase,
  FiMessageSquare: FiCheckCircle,
};

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const { t } = useTranslation();

  const loadData = async () => {
    try {
      const [sRes, pRes] = await Promise.allSettled([
        api.get('/services'),
        api.get('/portfolio?featured=true&limit=6'),
      ]);
      if (sRes.status === 'fulfilled') setServices(sRes.value.data.data || []);
      if (pRes.status === 'fulfilled') setPortfolio(pRes.value.data.data || []);
    } catch {
      /* gunakan default data */
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultServices = [
    { id: 1, name: t('services.items.web.name'), description: t('services.items.web.desc'), icon: 'FiGlobe', base_price: 5000000 },
    { id: 2, name: t('services.items.mobile.name'), description: t('services.items.mobile.desc'), icon: 'FiSmartphone', base_price: 15000000 },
    { id: 3, name: t('services.items.uiux.name'), description: t('services.items.uiux.desc'), icon: 'FiLayout', base_price: 3000000 },
    { id: 4, name: t('services.items.custom.name'), description: t('services.items.custom.desc'), icon: 'FiCode', base_price: 20000000 },
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  const stats = [
    { label: t('stats.projects'), value: '150+' },
    { label: t('stats.clients'), value: '80+' },
    { label: t('stats.experience'), value: '5+' },
    { label: t('stats.team'), value: '20+' },
  ];

  // Gunakan nama variabel 'testimonial' agar tidak konflik dengan fungsi `t` dari useTranslation
  const testimonials = [
    { name: 'Andi Pratama', company: 'CEO, TechStartup', text: t('testimonials.items.t1'), rating: 5 },
    { name: 'Siti Rahayu', company: 'Marketing Dir, FinCorp', text: t('testimonials.items.t2'), rating: 5 },
    { name: 'Budi Wijaya', company: 'Founder, EduTech', text: t('testimonials.items.t3'), rating: 5 },
  ];

  const defaultPortfolio = [
    { id: 1, title: 'E-Commerce Platform', category: t('portfolio.items.p1.category'), tech_stack: '["React","Node.js","MongoDB"]', description: t('portfolio.items.p1.desc') },
    { id: 2, title: 'Health Tracker App', category: t('portfolio.items.p2.category'), tech_stack: '["React Native","Firebase"]', description: t('portfolio.items.p2.desc') },
    { id: 3, title: 'Corporate Dashboard', category: t('portfolio.items.p3.category'), tech_stack: '["Vue.js","Laravel","MySQL"]', description: t('portfolio.items.p3.desc') },
  ];

  const displayPortfolio = portfolio.length > 0 ? portfolio : defaultPortfolio;

  /**
   * Parse tech_stack yang bisa berupa string JSON atau array langsung
   * @param {string|string[]} techStack
   * @returns {string[]}
   */
  const parseTechStack = (techStack) => {
    if (typeof techStack === 'string') {
      try {
        return JSON.parse(techStack || '[]');
      } catch {
        return [];
      }
    }
    return techStack || [];
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section" id="hero" aria-label="Hero — Beranda">
        <div className="hero-programmer-overlay" aria-hidden="true" />
        <div className="hero-bg-effects" aria-hidden="true">
          <div className="hero-grid-overlay" />
        </div>

        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="hero-badge">
              <FiCode aria-hidden="true" /> {t('hero.badge')}
            </div>

            <h1>
              {t('hero.title_part1')}{' '}
              <br />
              <span className="gradient-text">{t('hero.title_highlight')}</span>{' '}
              {t('hero.title_part2')}
            </h1>

            <p className="hero-subtitle">{t('hero.subtitle')}</p>

            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                {t('hero.btn_start')} <FiArrowRight aria-hidden="true" />
              </Link>
              <Link to="/portfolio" className="btn btn-secondary btn-lg">
                {t('hero.btn_portfolio')}
              </Link>
            </div>
          </motion.div>

          {/* Stats — menggunakan ul/li untuk struktur daftar yang semantik */}
          <ul className="hero-stats" role="list" aria-label="Statistik Propscode">
            {stats.map((stat, index) => (
              <motion.li
                key={stat.label}
                className="stat-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="stat-value gradient-text">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services Section */}
      <section className="section section-alt" id="services-section" aria-labelledby="services-heading">
        <div className="ambient-glow glow-right" aria-hidden="true" />
        <div className="container">
          <header className="section-header">
            <h2 id="services-heading">
              {t('services.title1')}{' '}
              <span className="gradient-text">{t('services.title2')}</span>
            </h2>
            <p className="subtitle">{t('services.subtitle')}</p>
          </header>

          {/* Services grid sebagai ul/li untuk struktur daftar yang tepat */}
          <ul className="grid grid-4 services-grid" role="list" aria-label="Daftar layanan kami">
            {displayServices.map((service, index) => {
              const IconComponent = ICON_MAP[service.icon] || FiCode;
              return (
                <motion.li
                  key={service.id}
                  className="service-card glass-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="service-icon" aria-hidden="true">
                    <IconComponent />
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-price">
                    {t('services.start_from')}{' '}
                    <span className="gradient-text">
                      Rp {(service.base_price / 1_000_000).toFixed(0)} Juta
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          <div className="section-cta">
            <Link to="/services" className="btn btn-outline">
              {t('services.btn_all')} <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section portfolio-section" id="portfolio-section" aria-labelledby="portfolio-heading">
        <div className="ambient-glow glow-left" aria-hidden="true" />
        <div className="container">
          <header className="section-header">
            <h2 id="portfolio-heading">
              {t('portfolio.title1')}{' '}
              <span className="gradient-text">{t('portfolio.title2')}</span>
            </h2>
            <p className="subtitle">{t('portfolio.subtitle')}</p>
          </header>

          <ul className="grid grid-3 portfolio-grid" role="list" aria-label="Portofolio unggulan">
            {displayPortfolio.map((item, index) => {
              const techStack = parseTechStack(item.tech_stack);
              return (
                <motion.li
                  key={item.id}
                  className="portfolio-card glass-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="portfolio-cover">
                    {item.cover_image ? (
                      <img src={getImageUrl(item.cover_image)} alt={item.title} />
                    ) : (
                      <div className="portfolio-placeholder" aria-hidden="true">
                        {item.title.charAt(0)}
                      </div>
                    )}
                    <div className="portfolio-overlay">
                      <span className="badge badge-primary">{item.category}</span>
                    </div>
                  </div>

                  <div className="portfolio-info">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <ul className="portfolio-tech" role="list" aria-label="Tech stack">
                      {techStack.slice(0, 3).map((tech) => (
                        <li key={tech} className="tech-tag">{tech}</li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          <div className="section-cta">
            <Link to="/portfolio" className="btn btn-outline">
              {t('portfolio.btn_all')} <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section section-alt" id="testimonials" aria-labelledby="testimonials-heading">
        <div className="ambient-glow glow-right" aria-hidden="true" />
        <div className="container">
          <header className="section-header">
            <h2 id="testimonials-heading">
              {t('testimonials.title1')}{' '}
              <span className="gradient-text">{t('testimonials.title2')}</span>
            </h2>
            <p className="subtitle">{t('testimonials.subtitle')}</p>
          </header>

          {/* Menggunakan 'testimonial' agar tidak konflik dengan fungsi t() */}
          <ul className="grid grid-3 testimonial-grid" role="list" aria-label="Testimoni klien">
            {testimonials.map((testimonial, index) => (
              <motion.li
                key={testimonial.name}
                className="testimonial-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="testimonial-stars" aria-label={`Rating ${testimonial.rating} dari 5 bintang`}>
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <FiStar key={starIndex} className="star-filled" aria-hidden="true" />
                  ))}
                </div>

                <blockquote>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <footer className="testimonial-author">
                    <div className="author-avatar" aria-hidden="true">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <cite className="author-name">{testimonial.name}</cite>
                      <p className="author-role">{testimonial.company}</p>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta" aria-labelledby="cta-heading">
        <div className="ambient-glow glow-center" aria-hidden="true" />
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 id="cta-heading">{t('cta.title')}</h2>
            <p>{t('cta.subtitle')}</p>
            <div className="cta-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                {t('cta.btn')} <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

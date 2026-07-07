import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import api, { getImageUrl } from '../../services/api';
import { useTranslation } from 'react-i18next';
import './PortfolioPage.css';

const PORTFOLIO_CATEGORIES = ['Semua', 'Web App', 'Mobile App', 'Dashboard', 'Landing Page'];

// Mapping id portfolio dummy ke key translasi
const DUMMY_PORTFOLIO_KEY_MAP = { 1: 'p1', 2: 'p2', 3: 'p3' };

/**
 * Parse tech_stack yang bisa berupa string JSON atau array
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

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const { t } = useTranslation();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const { data } = await api.get('/portfolio');
      setPortfolio(data.data || []);
    } catch {
      // Data dummy untuk tampilan fallback
      setPortfolio([
        { id: 1, title: 'E-Commerce Platform', category: 'Web App', tech_stack: '["React","Node.js","MongoDB"]', description: t('portfolio.items.p1.desc'), demo_url: '#', github_url: '#' },
        { id: 2, title: 'Health Tracker App', category: 'Mobile App', tech_stack: '["React Native","Firebase"]', description: t('portfolio.items.p2.desc'), demo_url: '#' },
        { id: 3, title: 'Corporate Dashboard', category: 'Dashboard', tech_stack: '["Vue.js","Laravel","MySQL"]', description: t('portfolio.items.p3.desc') },
        { id: 4, title: 'Agency Landing Page', category: 'Landing Page', tech_stack: '["Next.js","Tailwind"]', description: 'Website company profile yang sangat cepat.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolio =
    activeCategory === 'Semua'
      ? portfolio
      : portfolio.filter((item) => item.category === activeCategory);

  /**
   * Mendapatkan deskripsi & kategori yang ter-lokalisasi untuk portfolio dummy,
   * atau data asli dari API untuk portfolio nyata.
   */
  const getDisplayData = (item) => {
    const dummyKey = DUMMY_PORTFOLIO_KEY_MAP[item.id];
    return {
      description: dummyKey ? t(`portfolio.items.${dummyKey}.desc`) : item.description,
      category: dummyKey ? t(`portfolio.items.${dummyKey}.category`) : item.category,
    };
  };

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat portofolio...">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="portfolio-page">
      <div className="hexagon-overlay" aria-hidden="true" />

      <div className="container">
        <header className="section-header">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {t('portfolioPage.title1')}{' '}
            <span className="gradient-text">{t('portfolioPage.title2')}</span>
          </motion.h1>
          <motion.p
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('portfolioPage.subtitle')}
          </motion.p>
        </header>

        {/* Filter kategori dalam nav untuk semantic yang tepat */}
        <nav aria-label="Filter kategori portofolio">
          <ul className="portfolio-filters" role="list">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <li key={cat}>
                  <button
                    className={`filter-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={isActive}
                  >
                    {t(`portfolioPage.categories.${cat}`)}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <motion.ul className="grid grid-3 portfolio-grid-page" role="list" aria-label="Daftar portofolio">
          <AnimatePresence mode="popLayout">
            {filteredPortfolio.map((item) => {
              const { description, category } = getDisplayData(item);
              const techStack = parseTechStack(item.tech_stack);

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <article className="portfolio-card glass-card" aria-label={item.title}>
                    <div className="portfolio-cover">
                      {item.cover_image ? (
                        <img src={getImageUrl(item.cover_image)} alt={`Cover proyek ${item.title}`} />
                      ) : (
                        <div className="portfolio-placeholder" aria-hidden="true">
                          {item.title.charAt(0)}
                        </div>
                      )}
                      <div className="portfolio-overlay">
                        <span className="badge badge-primary">
                          {t(`portfolioPage.categories.${category}`) || category}
                        </span>
                      </div>

                      {/* Link demo & source diberi aria-label yang informatif */}
                      <div className="portfolio-links-overlay">
                        {item.demo_url && (
                          <a
                            href={item.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Live demo: ${item.title}`}
                          >
                            <FiExternalLink aria-hidden="true" />
                          </a>
                        )}
                        {item.github_url && (
                          <a
                            href={item.github_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Source code: ${item.title} di GitHub`}
                          >
                            <FiGithub aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="portfolio-info">
                      <h2>{item.title}</h2>
                      <p>{description}</p>
                      <ul className="portfolio-tech" role="list" aria-label="Tech stack">
                        {techStack.map((tech) => (
                          <li key={tech} className="tech-tag">{tech}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </main>
  );
};

export default PortfolioPage;

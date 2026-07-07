import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiSmartphone, FiLayout, FiDatabase, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './ServicesPage.css';

// Konstanta gambar default untuk setiap kategori layanan
const SERVICE_DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
];

// Pemetaan nama icon string ke komponen React Icon
const ICON_MAP = {
  FiGlobe: FiCode,
  FiSmartphone,
  FiLayout,
  FiCode: FiDatabase,
  FiMessageSquare: FiCheckCircle,
};

// Mapping id layanan ke key translasi
const SERVICE_KEY_MAP = { 1: 'web', 2: 'mobile', 3: 'uiux', 4: 'custom' };

/**
 * Parse features yang bisa berupa string JSON atau array
 * @param {string|string[]} features
 * @returns {string[]}
 */
const parseFeatures = (features) => {
  if (typeof features === 'string') {
    try {
      return JSON.parse(features || '[]');
    } catch {
      return [];
    }
  }
  return features || [];
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data.data || []);
    } catch {
      // Data default jika API gagal
      setServices([
        { id: 1, name: t('services.items.web.name'), description: t('services.items.web.desc'), icon: 'FiGlobe', base_price: 5000000, features: '["Responsive Design", "SEO Optimized", "CMS Integration", "SSL Certificate", "1 Year Support"]' },
        { id: 2, name: t('services.items.mobile.name'), description: t('services.items.mobile.desc'), icon: 'FiSmartphone', base_price: 15000000, features: '["Cross Platform", "Push Notification", "API Integration", "App Store Deployment", "1 Year Support"]' },
        { id: 3, name: t('services.items.uiux.name'), description: t('services.items.uiux.desc'), icon: 'FiLayout', base_price: 3000000, features: '["User Research", "Wireframing", "Prototyping", "Design System", "Usability Testing"]' },
        { id: 4, name: t('services.items.custom.name'), description: t('services.items.custom.desc'), icon: 'FiCode', base_price: 20000000, features: '["Requirements Analysis", "Custom Architecture", "Database Design", "API Development", "Deployment"]' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat layanan...">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="services-page">
      <div className="services-container">
        <header className="section-header">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {t('servicesPage.title1')}{' '}
            <span className="gradient-text">{t('servicesPage.title2')}</span>
          </motion.h1>
          <motion.p
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('servicesPage.subtitle')}
          </motion.p>
        </header>

        <div className="services-showcase">
          {services.map((service, index) => {
            const IconComponent = ICON_MAP[service.icon] || FiCode;
            const featuresList = parseFeatures(service.features);
            const isEven = index % 2 !== 0;

            // Ambil gambar dari array konstan berdasarkan index
            const imageUrl = SERVICE_DEFAULT_IMAGES[index % SERVICE_DEFAULT_IMAGES.length];

            // Arah animasi berbeda tiap baris (zigzag)
            const imageAnimX = isEven ? 50 : -50;
            const textAnimX = isEven ? -50 : 50;

            // Nama & deskripsi dari translasi untuk data API, fallback ke data langsung
            const serviceKey = SERVICE_KEY_MAP[service.id];
            const displayName = serviceKey ? t(`services.items.${serviceKey}.name`) : service.name;
            const displayDesc = serviceKey ? t(`services.items.${serviceKey}.desc`) : service.description;

            return (
              <article
                key={service.id}
                className={`service-showcase-row ${isEven ? 'row-reverse' : ''}`}
                aria-label={displayName}
              >
                <motion.div
                  className="service-showcase-image glass-card"
                  initial={{ opacity: 0, x: imageAnimX }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  <img src={imageUrl} alt={`Ilustrasi layanan ${displayName}`} />
                  <div className="service-icon-overlay" aria-hidden="true">
                    <IconComponent />
                  </div>
                </motion.div>

                <motion.div
                  className="service-showcase-content"
                  initial={{ opacity: 0, x: textAnimX }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                >
                  <h2>{displayName}</h2>
                  <p className="service-desc">{displayDesc}</p>

                  <div className="service-price-tag">
                    {t('services.start_from')}{' '}
                    <span className="gradient-text">
                      Rp {(service.base_price / 1_000_000).toFixed(0)} Juta
                    </span>
                  </div>

                  <section className="service-features" aria-label="Fitur utama layanan">
                    <h3>{t('servicesPage.keyFeatures')}</h3>
                    <ul>
                      {featuresList.map((feature) => (
                        <li key={feature}>
                          <FiCheckCircle className="check-icon" aria-hidden="true" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </section>
                </motion.div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;

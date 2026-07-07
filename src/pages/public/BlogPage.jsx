import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api, { getImageUrl } from '../../services/api';
import './BlogPage.css';

const BLOG_CATEGORIES = ['Semua', 'Teknologi', 'Desain', 'Tutorial', 'Bisnis'];

// Mapping id artikel dummy ke key translasi
const DUMMY_BLOG_KEY_MAP = { 1: 'b1', 2: 'b2' };

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { t } = useTranslation();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (category && category !== 'Semua') query.append('category', category);

      const { data } = await api.get(`/blog?${query.toString()}`);
      setPosts(data.data || []);
    } catch {
      // Data dummy untuk tampilan fallback
      setPosts([
        {
          id: 1,
          title: 'Tren Web Development Tahun 2026',
          slug: 'tren-web-dev-2026',
          excerpt: 'Membahas teknologi terbaru yang mendominasi industri web...',
          category: 'Teknologi',
          author_name: 'Ahmad Rizky',
          published_at: new Date().toISOString(),
          cover_image: null,
        },
        {
          id: 2,
          title: 'Pentingnya UI/UX untuk Startup',
          slug: 'pentingnya-uiux-startup',
          excerpt: 'Desain yang baik bukan hanya tentang estetika, tapi juga fungsi...',
          category: 'Desain',
          author_name: 'Sari Dewi',
          published_at: new Date().toISOString(),
          cover_image: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPosts();
  };


  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  /**
   * Mendapatkan judul & excerpt yang ter-lokalisasi untuk artikel dummy,
   * atau teks asli dari API untuk artikel nyata.
   */
  const getDisplayText = (post) => {
    const dummyKey = DUMMY_BLOG_KEY_MAP[post.id];
    return {
      title: dummyKey ? t(`blogPage.items.${dummyKey}.title`) : post.title,
      excerpt: dummyKey ? t(`blogPage.items.${dummyKey}.excerpt`) : post.excerpt,
    };
  };

  return (
    <main className="blog-page">
      <div className="container">
        <header className="section-header">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {t('blogPage.title1')}{' '}
            <span className="gradient-text">{t('blogPage.title2')}</span>
          </motion.h1>
          <motion.p
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('blogPage.subtitle')}
          </motion.p>
        </header>

        <div className="blog-controls">
          {/* role="search" agar screen reader mengenali ini sebagai area pencarian */}
          <form
            onSubmit={handleSearch}
            className="search-bar"
            role="search"
            aria-label="Cari artikel blog"
          >
            <FiSearch className="search-icon" aria-hidden="true" />
            <label htmlFor="blog-search" className="sr-only">
              Kata kunci pencarian
            </label>
            <input
              id="blog-search"
              type="search"
              placeholder={t('blogPage.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
          </form>

          {/* nav + role="list" untuk filter kategori yang accessible */}
          <nav aria-label="Filter kategori artikel">
            <ul className="category-filters" role="list">
              {BLOG_CATEGORIES.map((cat) => {
                const isActive = category === cat || (cat === 'Semua' && !category);
                return (
                  <li key={cat}>
                    <button
                      className={`cat-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setCategory(cat === 'Semua' ? '' : cat)}
                      aria-pressed={isActive}
                    >
                      {t(`blogPage.categories.${cat}`)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Conditional rendering states */}
        {loading ? (
          <div className="loading-page" aria-busy="true" aria-label="Memuat artikel...">
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state" role="status">
            <FiSearch aria-hidden="true" />
            <h2>{t('blogPage.empty')}</h2>
            <p>{t('blogPage.empty_desc')}</p>
          </div>
        ) : (
          /* Gunakan ul/li untuk daftar artikel — lebih semantik dari grid div */
          <ul className="grid grid-3" role="list" aria-label="Daftar artikel">
            {posts.map((post, index) => {
              const { title, excerpt } = getDisplayText(post);
              return (
                <motion.li key={post.id}>
                  <article
                    className="blog-card glass-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="blog-cover">
                      {post.cover_image ? (
                        <img src={getImageUrl(post.cover_image)} alt="" />
                      ) : (
                        <div className="blog-cover-placeholder" aria-hidden="true">
                          {post.title.charAt(0)}
                        </div>
                      )}
                      <div className="blog-category-badge">
                        {t(`blogPage.categories.${post.category}`) || post.category}
                      </div>
                    </div>

                    <div className="blog-content">
                      {/* h2 bukan h3 — halaman hanya punya satu h1 */}
                      <Link to={`/blog/${post.slug}`}>
                        <h2 className="blog-title">{title}</h2>
                      </Link>
                      <p className="blog-excerpt">{excerpt}</p>
                      <footer className="blog-meta">
                        <span>
                          <FiUser aria-hidden="true" /> {post.author_name || 'Admin'}
                        </span>
                        <span>
                          <FiCalendar aria-hidden="true" />{' '}
                          <time dateTime={post.published_at || post.created_at}>
                            {formatDate(post.published_at || post.created_at)}
                          </time>
                        </span>
                      </footer>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
};

export default BlogPage;

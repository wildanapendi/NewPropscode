import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import api from '../../services/api';
import './BlogDetailPage.css';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const { data } = await api.get(`/blog/${slug}`);
      setPost(data.data);
    } catch {
      /* Artikel tidak tersedia dari API */
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat artikel...">
        <div className="spinner" />
      </div>
    );
  }

  if (!post) {
    return (
      <main className="empty-state" role="alert">
        <h2>Artikel tidak ditemukan</h2>
        <Link to="/blog" className="btn btn-primary">
          Kembali ke Blog
        </Link>
      </main>
    );
  }

  // Parse tags yang bisa berupa string JSON atau array
  const tags =
    typeof post.tags === 'string'
      ? (() => {
          try { return JSON.parse(post.tags || '[]'); } catch { return []; }
        })()
      : post.tags || [];

  const publishedDate = post.published_at || post.created_at;

  return (
    <main className="blog-detail-page">
      <div className="container blog-detail-container">
        <Link to="/blog" className="back-link" aria-label="Kembali ke halaman daftar blog">
          <FiArrowLeft aria-hidden="true" /> Kembali ke Blog
        </Link>

        <motion.article
          className="blog-detail-article"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-labelledby="blog-article-title"
        >
          <header className="blog-header">
            <span className="badge badge-primary">{post.category}</span>
            <h1 id="blog-article-title" className="blog-detail-title">
              {post.title}
            </h1>
            <div className="blog-detail-meta">
              <span>
                <FiUser aria-hidden="true" /> {post.author_name || 'Admin'}
              </span>
              <span>
                <FiCalendar aria-hidden="true" />{' '}
                <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
              </span>
            </div>
          </header>

          {post.cover_image && (
            <figure className="blog-main-image">
              <img src={post.cover_image} alt={`Cover artikel: ${post.title}`} />
            </figure>
          )}

          {/* Konten HTML dari CMS — render secara aman */}
          <div
            className="blog-rich-content"
            dangerouslySetInnerHTML={{
              __html: post.content || `<p>${post.excerpt}</p><p>Konten artikel belum ditambahkan.</p>`,
            }}
          />

          {tags.length > 0 && (
            <footer className="blog-tags">
              <FiTag aria-hidden="true" />
              {/* ul/li lebih semantik dari span berulang untuk daftar tag */}
              <ul className="tag-list" role="list" aria-label="Tag artikel">
                {tags.map((tag) => (
                  <li key={tag} className="tag">{tag}</li>
                ))}
              </ul>
            </footer>
          )}
        </motion.article>
      </div>
    </main>
  );
};

export default BlogDetailPage;

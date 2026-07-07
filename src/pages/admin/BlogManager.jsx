import { useState, useEffect, useId } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

import AnimatedUploadButton from '../../components/ui/AnimatedUploadButton';

const INITIAL_FORM_STATE = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  status: 'draft',
};

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [coverImage, setCoverImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // useId untuk menghasilkan ID unik yang stabil untuk asosiasi label-input
  const modalTitleId = useId();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data } = await api.get('/blog');
      setPosts(data.data || []);
    } catch {
      toast.error('Gagal mengambil data blog');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingId(post.id);
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        status: post.status,
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setCoverImage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  /**
   * Handler perubahan field form — menggunakan name attribute untuk menghindari
   * pengulangan setFormData per field (DRY)
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (coverImage) data.append('cover_image', coverImage);

    try {
      if (editingId) {
        await api.put(`/blog/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Artikel berhasil diperbarui');
      } else {
        await api.post('/blog', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Artikel berhasil ditambahkan');
      }
      handleCloseModal();
      loadPosts();
    } catch {
      toast.error('Gagal menyimpan artikel');
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${post.title}"?`)) return;
    try {
      await api.delete(`/blog/${post.id}`);
      toast.success('Artikel berhasil dihapus');
      loadPosts();
    } catch {
      toast.error('Gagal menghapus artikel');
    }
  };

  const modalTitle = editingId ? 'Edit Artikel' : 'Tambah Artikel Baru';

  return (
    <main className="admin-page">
      <header className="admin-header flex-between">
        <div>
          <h1>Manajemen Blog</h1>
          <p className="text-muted">Kelola artikel, berita, dan pembaruan perusahaan.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus aria-hidden="true" /> Tambah Artikel
        </button>
      </header>

      <section className="glass-card table-wrapper" aria-label="Daftar artikel blog">
        <div className="table-container">
          <table className="table">
            <caption className="sr-only">Daftar semua artikel blog yang telah dibuat</caption>
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">Kategori</th>
                <th scope="col">Status</th>
                <th scope="col">Tanggal</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center" aria-busy="true">
                    Memuat data...
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong></td>
                    <td>{post.category}</td>
                    <td>
                      <span className={`badge badge-${post.status === 'published' ? 'success' : 'warning'}`}>
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString('id-ID')}
                      </time>
                    </td>
                    <td>
                      <div className="table-actions" role="group" aria-label={`Aksi untuk artikel ${post.title}`}>
                        <button
                          className="btn-icon edit"
                          onClick={() => handleOpenModal(post)}
                          aria-label={`Edit artikel: ${post.title}`}
                        >
                          <FiEdit2 aria-hidden="true" />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(post)}
                          aria-label={`Hapus artikel: ${post.title}`}
                        >
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Form — dengan atribut ARIA dialog yang proper */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="modal-content lg">
            <div className="modal-header">
              <h2 id={modalTitleId}>{modalTitle}</h2>
              <button
                className="modal-close"
                onClick={handleCloseModal}
                aria-label="Tutup modal"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="blog-title">Judul Artikel</label>
                  <input
                    id="blog-title"
                    type="text"
                    name="title"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="blog-category">Kategori</label>
                  <input
                    id="blog-category"
                    type="text"
                    name="category"
                    className="form-control"
                    required
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="blog-cover">Cover Image <span className="label-optional">(Opsional)</span></label>
                <div style={{ marginTop: '0.5rem' }}>
                  <AnimatedUploadButton
                    id="blog-cover"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                    fileName={coverImage ? coverImage.name : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="blog-excerpt">Ringkasan (Excerpt)</label>
                <textarea
                  id="blog-excerpt"
                  name="excerpt"
                  className="form-control"
                  style={{ minHeight: '60px' }}
                  value={formData.excerpt}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-content">Konten (HTML)</label>
                <textarea
                  id="blog-content"
                  name="content"
                  className="form-control"
                  style={{ minHeight: '200px', fontFamily: 'var(--font-mono)' }}
                  value={formData.content}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-status">Status Publikasi</label>
                <select
                  id="blog-status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default BlogManager;

import { useState, useEffect, useId } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedUploadButton from '../../components/ui/AnimatedUploadButton';

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  category: 'Web App',
  demo_url: '',
  is_featured: 0,
};

const PORTFOLIO_CATEGORIES = ['Web App', 'Mobile App', 'Dashboard', 'Landing Page'];

const PortfolioManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [coverImage, setCoverImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const modalTitleId = useId();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const { data } = await api.get('/portfolio?limit=50');
      setItems(data.data || []);
    } catch {
      toast.error('Gagal mengambil data portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        demo_url: item.demo_url || '',
        is_featured: item.is_featured ? 1 : 0,
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
   * Handler generik untuk perubahan field form teks/select
   */
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || name === 'is_featured' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (coverImage) data.append('cover_image', coverImage);

    try {
      if (editingId) {
        await api.put(`/portfolio/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Portfolio berhasil diperbarui');
      } else {
        await api.post('/portfolio', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Portfolio berhasil ditambahkan');
      }
      handleCloseModal();
      loadPortfolio();
    } catch {
      toast.error('Gagal menyimpan portfolio');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus portfolio "${item.title}"?`)) return;
    try {
      await api.delete(`/portfolio/${item.id}`);
      toast.success('Portfolio berhasil dihapus');
      loadPortfolio();
    } catch {
      toast.error('Gagal menghapus portfolio');
    }
  };

  const modalTitle = editingId ? 'Edit Portfolio' : 'Tambah Portfolio Baru';

  return (
    <main className="admin-page">
      <header className="admin-header flex-between">
        <div>
          <h1>Manajemen Portfolio</h1>
          <p className="text-muted">Kelola etalase karya dan proyek Propscode.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus aria-hidden="true" /> Tambah Portfolio
        </button>
      </header>

      <section className="glass-card table-wrapper" aria-label="Daftar portfolio">
        <div className="table-container">
          <table className="table">
            <caption className="sr-only">Daftar semua item portfolio Propscode</caption>
            <thead>
              <tr>
                <th scope="col">Judul Proyek</th>
                <th scope="col">Kategori</th>
                <th scope="col">Featured</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center" aria-busy="true">
                    Memuat data...
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.category}</td>
                    <td>
                      {item.is_featured ? (
                        <span className="badge badge-primary">Featured</span>
                      ) : (
                        <span className="badge badge-secondary">Biasa</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions" role="group" aria-label={`Aksi untuk ${item.title}`}>
                        <button
                          className="btn-icon edit"
                          onClick={() => handleOpenModal(item)}
                          aria-label={`Edit portfolio: ${item.title}`}
                        >
                          <FiEdit2 aria-hidden="true" />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(item)}
                          aria-label={`Hapus portfolio: ${item.title}`}
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
          <div className="modal-content">
            <div className="modal-header">
              <h2 id={modalTitleId}>{modalTitle}</h2>
              <button className="modal-close" onClick={handleCloseModal} aria-label="Tutup modal">
                <FiX aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="portfolio-title">Judul Proyek</label>
                <input
                  id="portfolio-title"
                  type="text"
                  name="title"
                  className="form-control"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="portfolio-category">Kategori</label>
                  <select
                    id="portfolio-category"
                    name="category"
                    className="form-control"
                    required
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    {PORTFOLIO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="portfolio-featured">Tampilkan di Landing Page?</label>
                  <select
                    id="portfolio-featured"
                    name="is_featured"
                    className="form-control"
                    value={formData.is_featured}
                    onChange={handleFormChange}
                  >
                    <option value={1}>Ya, tampilkan (Featured)</option>
                    <option value={0}>Tidak</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="portfolio-cover">
                  Cover Image <span className="label-optional">(Opsional)</span>
                </label>
                <div style={{ marginTop: '0.5rem' }}>
                  <AnimatedUploadButton
                    id="portfolio-cover"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                    fileName={coverImage ? coverImage.name : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="portfolio-description">Deskripsi Proyek</label>
                <textarea
                  id="portfolio-description"
                  name="description"
                  className="form-control"
                  required
                  style={{ minHeight: '80px' }}
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio-demo-url">
                  URL Demo / Live <span className="label-optional">(Opsional)</span>
                </label>
                <input
                  id="portfolio-demo-url"
                  type="url"
                  name="demo_url"
                  className="form-control"
                  value={formData.demo_url}
                  onChange={handleFormChange}
                  placeholder="https://demo.example.com"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default PortfolioManager;

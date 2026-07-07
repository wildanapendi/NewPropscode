import { useState, useEffect, useId } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  icon: 'FiCode',
  base_price: 0,
};

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);

  const modalTitleId = useId();

  // useEffect tanpa setTimeout — pemanggilan async tidak memerlukan delay buatan
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data.data || []);
    } catch {
      toast.error('Gagal mengambil data layanan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        name: service.name,
        description: service.description,
        icon: service.icon,
        base_price: service.base_price,
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  /**
   * Handler generik untuk perubahan field form
   */
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, formData);
        toast.success('Layanan berhasil diperbarui');
      } else {
        await api.post('/services', formData);
        toast.success('Layanan berhasil ditambahkan');
      }
      handleCloseModal();
      loadServices();
    } catch {
      toast.error('Gagal menyimpan layanan');
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Yakin ingin menghapus layanan "${service.name}"?`)) return;
    try {
      await api.delete(`/services/${service.id}`);
      toast.success('Layanan berhasil dihapus');
      loadServices();
    } catch {
      toast.error('Gagal menghapus layanan');
    }
  };

  const modalTitle = editingId ? 'Edit Layanan' : 'Tambah Layanan Baru';

  return (
    <main className="admin-page">
      <header className="admin-header flex-between">
        <div>
          <h1>Manajemen Layanan</h1>
          <p className="text-muted">Kelola jenis layanan yang ditawarkan beserta estimasi harganya.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus aria-hidden="true" /> Tambah Layanan
        </button>
      </header>

      <section className="glass-card table-wrapper" aria-label="Daftar layanan">
        <div className="table-container">
          <table className="table">
            <caption className="sr-only">Daftar layanan yang ditawarkan Propscode beserta harga dasarnya</caption>
            <thead>
              <tr>
                <th scope="col">Nama Layanan</th>
                <th scope="col">Harga Dasar</th>
                <th scope="col">Icon</th>
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
                services.map((service) => (
                  <tr key={service.id}>
                    <td><strong>{service.name}</strong></td>
                    <td>Rp {Number(service.base_price).toLocaleString('id-ID')}</td>
                    <td><code>{service.icon}</code></td>
                    <td>
                      <div className="table-actions" role="group" aria-label={`Aksi untuk layanan ${service.name}`}>
                        <button
                          className="btn-icon edit"
                          onClick={() => handleOpenModal(service)}
                          aria-label={`Edit layanan: ${service.name}`}
                        >
                          <FiEdit2 aria-hidden="true" />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(service)}
                          aria-label={`Hapus layanan: ${service.name}`}
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
                <label htmlFor="service-name">Nama Layanan</label>
                <input
                  id="service-name"
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-price">Harga Dasar Minimal (Rp)</label>
                <input
                  id="service-price"
                  type="number"
                  name="base_price"
                  className="form-control"
                  required
                  min="0"
                  value={formData.base_price}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-icon">
                  Icon Component{' '}
                  <span className="label-optional">(Contoh: FiGlobe, FiSmartphone)</span>
                </label>
                <input
                  id="service-icon"
                  type="text"
                  name="icon"
                  className="form-control"
                  required
                  value={formData.icon}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-description">Deskripsi Singkat</label>
                <textarea
                  id="service-description"
                  name="description"
                  className="form-control"
                  required
                  style={{ minHeight: '80px' }}
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ServiceManager;

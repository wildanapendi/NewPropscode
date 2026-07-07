import { useState, useEffect, useId } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedUploadButton from '../../components/ui/AnimatedUploadButton';

const INITIAL_FORM_STATE = {
  name: '',
  position: '',
  bio: '',
  email: '',
  linkedin: '',
  github: '',
  is_active: 1,
};

const TeamManager = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [photo, setPhoto] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const modalTitleId = useId();

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const { data } = await api.get('/team');
      setTeam(data.data || []);
    } catch {
      toast.error('Gagal mengambil data tim');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name,
        position: member.position,
        bio: member.bio,
        email: member.email || '',
        linkedin: member.linkedin || '',
        github: member.github || '',
        is_active: member.is_active,
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setPhoto(null);
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
      [name]: type === 'number' || name === 'is_active' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (photo) data.append('photo', photo);

    try {
      if (editingId) {
        await api.put(`/team/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Data anggota berhasil diperbarui');
      } else {
        await api.post('/team', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Anggota berhasil ditambahkan');
      }
      handleCloseModal();
      loadTeam();
    } catch {
      toast.error('Gagal menyimpan data anggota');
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Yakin ingin menghapus anggota "${member.name}"?`)) return;
    try {
      await api.delete(`/team/${member.id}`);
      toast.success('Anggota berhasil dihapus');
      loadTeam();
    } catch {
      toast.error('Gagal menghapus anggota');
    }
  };

  const modalTitle = editingId ? 'Edit Anggota Tim' : 'Tambah Anggota Tim Baru';

  return (
    <main className="admin-page">
      <header className="admin-header flex-between">
        <div>
          <h1>Manajemen Tim &amp; HR</h1>
          <p className="text-muted">Kelola profil anggota tim yang ditampilkan di website.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus aria-hidden="true" /> Tambah Anggota
        </button>
      </header>

      <section className="glass-card table-wrapper" aria-label="Daftar anggota tim">
        <div className="table-container">
          <table className="table">
            <caption className="sr-only">Daftar semua anggota tim Propscode</caption>
            <thead>
              <tr>
                <th scope="col">Foto</th>
                <th scope="col">Nama Lengkap</th>
                <th scope="col">Posisi</th>
                <th scope="col">Status</th>
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
                team.map((member) => (
                  <tr key={member.id}>
                    <td>
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={`Foto profil ${member.name}`}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.position}</td>
                    <td>
                      <span className={`badge badge-${member.is_active ? 'success' : 'error'}`}>
                        {member.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions" role="group" aria-label={`Aksi untuk anggota ${member.name}`}>
                        <button
                          className="btn-icon edit"
                          onClick={() => handleOpenModal(member)}
                          aria-label={`Edit anggota: ${member.name}`}
                        >
                          <FiEdit2 aria-hidden="true" />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(member)}
                          aria-label={`Hapus anggota: ${member.name}`}
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
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="team-name">Nama Lengkap</label>
                  <input
                    id="team-name"
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team-position">Posisi / Jabatan</label>
                  <input
                    id="team-position"
                    type="text"
                    name="position"
                    className="form-control"
                    required
                    value={formData.position}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="team-photo">
                  Foto Profil <span className="label-optional">(Opsional)</span>
                </label>
                <div style={{ marginTop: '0.5rem' }}>
                  <AnimatedUploadButton
                    id="team-photo"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    fileName={photo ? photo.name : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="team-bio">Bio Singkat</label>
                <textarea
                  id="team-bio"
                  name="bio"
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  required
                  value={formData.bio}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="team-linkedin">LinkedIn URL</label>
                  <input
                    id="team-linkedin"
                    type="url"
                    name="linkedin"
                    className="form-control"
                    value={formData.linkedin}
                    onChange={handleFormChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team-github">GitHub URL</label>
                  <input
                    id="team-github"
                    type="url"
                    name="github"
                    className="form-control"
                    value={formData.github}
                    onChange={handleFormChange}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="team-status">Status Aktif</label>
                <select
                  id="team-status"
                  name="is_active"
                  className="form-control"
                  value={formData.is_active}
                  onChange={handleFormChange}
                >
                  <option value={1}>Aktif (Tampil di website)</option>
                  <option value={0}>Nonaktif (Sembunyikan)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeamManager;

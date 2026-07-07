import { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase } from 'react-icons/fi';
import api from '../../services/api';

const HRManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data || []);
    } catch {
      /* Biarkan tabel kosong, tidak ada toast karena modul ini bersifat view-only */
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1>Human Resource (HR)</h1>
        <p className="text-muted">Lihat daftar pengguna dan klien yang terdaftar di sistem.</p>
      </header>

      <section className="glass-card table-wrapper" aria-labelledby="users-table-heading">
        <div className="card-header">
          <h2 id="users-table-heading">
            <FiUsers aria-hidden="true" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Daftar Pengguna / Klien
          </h2>
        </div>
        <div className="table-container">
          <table className="table" aria-label="Daftar pengguna terdaftar">
            <caption className="sr-only">
              Daftar semua pengguna dan klien yang telah mendaftar di sistem Propscode
            </caption>
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Email</th>
                <th scope="col">Perusahaan</th>
                <th scope="col">Role</th>
                <th scope="col">Tgl Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center" aria-busy="true">
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.company || '—'}</td>
                    <td>
                      <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <time dateTime={user.created_at}>
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </time>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modul penggajian — dalam pengembangan */}
      <aside
        className="glass-card"
        style={{ marginTop: '2rem', padding: '2rem' }}
        aria-label="Modul dalam pengembangan"
      >
        <div className="empty-state">
          <FiBriefcase aria-hidden="true" />
          <h2>Modul Penggajian &amp; Absensi</h2>
          <p>Fitur ini sedang dalam tahap pengembangan dan akan dirilis pada versi berikutnya.</p>
        </div>
      </aside>
    </main>
  );
};

export default HRManager;

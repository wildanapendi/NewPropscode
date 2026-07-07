import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiX, FiChevronDown, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const statusOptions = [
  { value: 'pending', label: 'Menunggu Konfirmasi (Pending)' },
  { value: 'confirmed', label: 'Dikonfirmasi (Confirmed)' },
  { value: 'in_progress', label: 'Sedang Dikerjakan (In Progress)' },
  { value: 'testing', label: 'Testing & Review' },
  { value: 'revision', label: 'Revisi (Revision)' },
  { value: 'done', label: 'Selesai (Done)' },
  { value: 'cancelled', label: 'Dibatalkan (Cancelled)' },
];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', staging_url: '', handover_url: '', notes: '', final_price: '' });

  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [orderLinks, setOrderLinks] = useState([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [discussionOrder, setDiscussionOrder] = useState(null);
  const [discussionReply, setDiscussionReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);

  const openLinksModal = async (orderId) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrderLinks(data.data.assets || []);
      setIsLinksModalOpen(true);
    } catch {
      toast.error('Gagal mengambil data link');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data || []);
    } catch {
      toast.error('Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/orders/${selectedOrder.id}/status`, updateData);
      toast.success('Status pesanan berhasil diperbarui');
      setIsModalOpen(false);
      loadOrders();
    } catch {
      toast.error('Gagal update status pesanan');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Pesanan berhasil dihapus');
      setDeleteConfirmOrder(null);
      loadOrders();
    } catch {
      toast.error('Gagal menghapus pesanan');
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      staging_url: order.staging_url || '',
      handover_url: order.handover_url || '',
      notes: '',
      final_price: order.final_price || ''
    });
    setIsModalOpen(true);
  };

  const openDiscussionModal = (order) => {
    setDiscussionOrder(order);
    setDiscussionReply('');
    setIsDiscussionModalOpen(true);
  };

  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    if (!discussionReply.trim()) return toast.error('Pesan tidak boleh kosong');
    setSubmittingReply(true);
    try {
      await api.post(`/orders/${discussionOrder.id}/comments`, { message: discussionReply });
      toast.success('Balasan berhasil dikirim');
      setDiscussionReply('');
      const { data } = await api.get('/orders');
      setOrders(data.data || []);
      const updatedOrder = (data.data || []).find(o => o.id === discussionOrder.id);
      if (updatedOrder) setDiscussionOrder(updatedOrder);
    } catch {
      toast.error('Gagal mengirim balasan');
    } finally {
      setSubmittingReply(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Pending' },
      confirmed: { bg: 'var(--info-bg)', color: 'var(--info)', label: 'Dikonfirmasi' },
      in_progress: { bg: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', label: 'In Progress' },
      testing: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Testing' },
      revision: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Revisi' },
      done: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Selesai' },
      cancelled: { bg: 'var(--error-bg)', color: 'var(--error)', label: 'Dibatalkan' },
    };
    const mapped = map[status] || map.pending;
    return <span className="badge" style={{ background: mapped.bg, color: mapped.color }}>{mapped.label}</span>;
  };

  const getNotesHistory = (order) => {
    if (!order || !order.notes) return [];
    try {
      const parsed = JSON.parse(order.notes);
      if (Array.isArray(parsed)) return parsed;
      return [{ date: order.updated_at, message: order.notes, role: 'admin', name: 'Admin' }];
    } catch (e) {
      return [{ date: order.updated_at, message: order.notes, role: 'admin', name: 'Admin' }];
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header flex-between">
        <div>
          <h1>Manajemen Pesanan</h1>
          <p className="text-muted">Kelola semua pesanan klien dan perbarui status pengerjaan.</p>
        </div>
      </div>

      <div className="glass-card table-wrapper">
        <div className="card-header">
          <div style={{ position: 'relative', width: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-control" placeholder="Cari nomor pesanan/klien..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Klien</th>
                <th>Proyek</th>
                <th>Layanan</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : orders.map(order => (
                <tr key={order.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{order.order_number}</span></td>
                  <td>{order.client_name}</td>
                  <td>{order.project_name}</td>
                  <td>{order.service_name}</td>
                  <td>{statusBadge(order.status)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" style={{ color: 'var(--info)' }} onClick={() => openLinksModal(order.id)} title="Lihat Link Client"><FiEye /></button>
                      <button className="btn-icon" style={{ color: 'var(--accent-primary)', position: 'relative' }} onClick={() => openDiscussionModal(order)} title="Diskusi Klien">
                        <FiMessageSquare />
                        {getNotesHistory(order).length > 0 && getNotesHistory(order)[getNotesHistory(order).length - 1].role === 'client' && (
                          <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }} />
                        )}
                      </button>
                      <button className="btn-icon edit" onClick={() => openUpdateModal(order)} title="Update Status"><FiEdit2 /></button>
                      <button className="btn-icon" style={{ color: 'var(--error)' }} onClick={() => setDeleteConfirmOrder(order)} title="Hapus Pesanan"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Status: {selectedOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Status Pengerjaan</label>
                <div
                  className="form-control"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <span>
                    {statusOptions.find(opt => opt.value === updateData.status)?.label || 'Pilih Status'}
                  </span>
                  <FiChevronDown style={{ transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} />
                </div>

                <AnimatePresence>
                  {isStatusDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        zIndex: 50,
                        marginTop: '0.25rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden'
                      }}
                    >
                      {statusOptions.map(option => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setUpdateData({...updateData, status: option.value});
                            setIsStatusDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            background: updateData.status === option.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: updateData.status === option.value ? 'var(--accent-primary)' : 'var(--text-primary)',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (updateData.status !== option.value) e.currentTarget.style.background = 'var(--bg-tertiary)';
                          }}
                          onMouseLeave={(e) => {
                            if (updateData.status !== option.value) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label>Harga Disepakati / Deal (Rp)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Misal: 7500000"
                  value={updateData.final_price}
                  onChange={e => setUpdateData({...updateData, final_price: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>URL Staging Server (Opsional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://staging.propscode.com/..."
                  value={updateData.staging_url}
                  onChange={e => setUpdateData({...updateData, staging_url: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>URL Aset Handover (Opsional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Link Google Drive / Figma / dll..."
                  value={updateData.handover_url}
                  onChange={e => setUpdateData({...updateData, handover_url: e.target.value})}
                />
              </div>



              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLinksModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Daftar Link Klien</h3>
              <button className="modal-close" onClick={() => setIsLinksModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 0' }}>
              {orderLinks.length === 0 ? (
                <p className="text-muted text-center py-4">Belum ada link yang dikirimkan oleh klien.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orderLinks.map(link => (
                    <div key={link.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{link.file_name}</strong>
                      <a href={link.file_path} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--info)', wordBreak: 'break-all', textDecoration: 'underline' }}>
                        {link.file_path}
                      </a>
                      <small className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        {new Date(link.created_at).toLocaleString('id-ID')}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDiscussionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Diskusi: {discussionOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setIsDiscussionModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', marginBottom: '1.5rem' }}>
                {getNotesHistory(discussionOrder).length === 0 ? (
                  <p className="text-muted text-center py-4">Belum ada riwayat diskusi dengan klien ini.</p>
                ) : (
                  getNotesHistory(discussionOrder).map((note, idx) => {
                    const isAdmin = note.role === 'admin';
                    return (
                      <div key={idx} style={{
                        alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: isAdmin ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: isAdmin ? 'white' : 'var(--text-primary)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        borderBottomRightRadius: isAdmin ? '0' : 'var(--radius-md)',
                        borderBottomLeftRadius: isAdmin ? 'var(--radius-md)' : '0',
                      }}>
                        <div style={{ fontSize: '0.75rem', color: isAdmin ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                          <strong>{note.name || (isAdmin ? 'Admin' : 'Klien')}</strong>
                          <span>{new Date(note.date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{note.message}</p>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleDiscussionSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <textarea
                    className="form-control"
                    placeholder="Tulis balasan pesan untuk klien..."
                    value={discussionReply}
                    onChange={e => setDiscussionReply(e.target.value)}
                    style={{ minHeight: '80px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={submittingReply}>
                    {submittingReply ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {deleteConfirmOrder && (
          <motion.div
            className="modal-overlay"
            style={{ zIndex: 1000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'var(--error-bg)', color: 'var(--error)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem'
              }}>
                <FiTrash2 />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Hapus Pesanan?</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Apakah Anda yakin ingin menghapus pesanan <strong>{deleteConfirmOrder.order_number}</strong> dari daftar? (Klien tetap akan dapat melihat pesanan ini di riwayat mereka).
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmOrder(null)} style={{ flex: 1 }}>Batal</button>
                <button className="btn" onClick={() => handleDeleteOrder(deleteConfirmOrder.id)} style={{ flex: 1, background: 'var(--error)', color: 'white' }}>Ya, Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManager;

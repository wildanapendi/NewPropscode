import { useState, useCallback, useId } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiUpload, FiX, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import './ProjectDetailPage.css';

// Konstanta di luar komponen agar tidak dibuat ulang setiap render
const TELEGRAM_BOT_API_URL = import.meta.env.VITE_TELEGRAM_BOT_URL || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

// Style untuk area notifikasi Telegram
const telegramNoticeStyle = {
  background: 'rgba(37,211,102,0.08)',
  border: '1px solid rgba(37,211,102,0.25)',
  borderRadius: 'var(--radius-md)',
  padding: '0.75rem 1rem',
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginTop: '0.75rem',
};

// Status config di luar komponen
const STATUS_CONFIG = {
  pending:     { label: 'Menunggu Konfirmasi', color: 'warning',  Icon: FiClock },
  confirmed:   { label: 'Dikonfirmasi',        color: 'info',     Icon: FiCheckCircle },
  in_progress: { label: 'Sedang Dikerjakan',   color: 'primary',  Icon: FiAlertCircle },
  testing:     { label: 'Testing / Review',    color: 'info',     Icon: FiAlertCircle },
  revision:    { label: 'Revisi',              color: 'warning',  Icon: FiAlertCircle },
  done:        { label: 'Selesai',             color: 'success',  Icon: FiCheckCircle },
  cancelled:   { label: 'Dibatalkan',          color: 'error',    Icon: FiAlertCircle },
};

// Semua milestone dalam urutan progres proyek
const PROGRESS_MILESTONES = ['pending', 'confirmed', 'in_progress', 'testing', 'done'];

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { order, assets, loading, loadOrder } = useProjectDetail(id);

  const [newLink, setNewLink] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);

  const [message, setMessage] = useState('');
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const [deleteAssetId, setDeleteAssetId] = useState(null);

  const linkFormId = useId();
  const messageFormId = useId();
  const deleteModalTitleId = useId();

  const handleLinkSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newLink.trim()) return toast.error('URL tidak boleh kosong');

    setSubmittingLink(true);
    try {
      await api.post(`/orders/${id}/links`, {
        link_name: linkDescription.trim() || newLink,
        link_url: newLink.trim(),
      });
      toast.success('Link berhasil dikirim ke admin');
      setNewLink('');
      setLinkDescription('');
      loadOrder();

      // Notifikasi Telegram jika tersedia
      if (TELEGRAM_BOT_API_URL && TELEGRAM_CHAT_ID) {
        const text = `📎 Link baru dari klien #${id}:\n${newLink}`;
        fetch(TELEGRAM_BOT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
        }).catch(() => { /* Notifikasi gagal — tidak kritis */ });
      }
    } catch {
      toast.error('Gagal mengirim link');
    } finally {
      setSubmittingLink(false);
    }
  }, [id, newLink, linkDescription, loadOrder]);

  const handleMessageSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Pesan tidak boleh kosong');

    setSubmittingMessage(true);
    try {
      await api.post(`/orders/${id}/comments`, { message: message.trim() });
      toast.success('Pesan berhasil dikirim ke tim admin');
      setMessage('');
      loadOrder();
    } catch {
      toast.error('Gagal mengirim pesan');
    } finally {
      setSubmittingMessage(false);
    }
  }, [id, message, loadOrder]);

  const handleDeleteAsset = useCallback(async (assetId) => {
    try {
      await api.delete(`/orders/${id}/links/${assetId}`);
      toast.success('Link berhasil dihapus');
      setDeleteAssetId(null);
      loadOrder();
    } catch {
      toast.error('Gagal menghapus link');
    }
  }, [id, loadOrder]);

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat detail proyek...">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <main className="empty-state" role="alert">
        <FiAlertCircle aria-hidden="true" />
        <h2>Proyek tidak ditemukan</h2>
        <p>Pastikan Anda memiliki akses ke proyek ini.</p>
      </main>
    );
  }

  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const { Icon: StatusIcon } = statusConf;

  const currentMilestoneIndex = PROGRESS_MILESTONES.indexOf(order.status);

  return (
    <main className="project-detail-page">
      <div className="container">
        {/* Header proyek */}
        <header className="project-detail-header">
          <div>
            <span className="order-number">{order.order_number}</span>
            <h1>{order.project_name}</h1>
          </div>
          <span className={`badge badge-${statusConf.color} badge-lg`}>
            <StatusIcon aria-hidden="true" /> {statusConf.label}
          </span>
        </header>

        <div className="project-detail-layout">
          {/* ===== Konten Utama ===== */}
          <div className="project-main">

            {/* Progress Tracker — ol semantik untuk langkah berurutan */}
            <section className="glass-card project-section" aria-labelledby="progress-heading">
              <h2 id="progress-heading">Progress Proyek</h2>
              <ol className="progress-tracker" aria-label="Tahapan progress proyek">
                {PROGRESS_MILESTONES.map((milestone, index) => {
                  const milestoneConf = STATUS_CONFIG[milestone];
                  const isCompleted = index < currentMilestoneIndex;
                  const isCurrent = index === currentMilestoneIndex;
                  return (
                    <li
                      key={milestone}
                      className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span className="progress-dot" aria-hidden="true">
                        {isCompleted ? '✓' : index + 1}
                      </span>
                      <span className="progress-label">{milestoneConf?.label || milestone}</span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Form kirim link — dengan label yang terhubung */}
            <section className="glass-card project-section" aria-labelledby={linkFormId}>
              <h2 id={linkFormId}>Kirim Link / Referensi</h2>
              <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Kirimkan link Google Drive, Figma, referensi desain, atau aset lain kepada tim admin.
              </p>

              <form onSubmit={handleLinkSubmit} aria-label="Form pengiriman link ke admin">
                <div className="form-group">
                  <label htmlFor="link-description">Nama / Deskripsi Link</label>
                  <input
                    id="link-description"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Referensi desain Dribbble"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="link-url">URL / Link</label>
                  <input
                    id="link-url"
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    required
                  />
                </div>

                {TELEGRAM_BOT_API_URL && (
                  <p style={telegramNoticeStyle}>
                    ✅ Link yang dikirim akan diteruskan sebagai notifikasi ke tim melalui Telegram.
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingLink}
                    aria-label="Kirim link ke admin"
                  >
                    <FiUpload aria-hidden="true" style={{ marginRight: '8px' }} />
                    {submittingLink ? 'Mengirim...' : 'Kirim Link'}
                  </button>
                </div>
              </form>
            </section>

            {/* Riwayat link yang dikirim */}
            {assets.length > 0 && (
              <section className="glass-card project-section" aria-labelledby="assets-heading">
                <h2 id="assets-heading">Link yang Dikirimkan</h2>
                <ul role="list" aria-label="Daftar link yang telah dikirim">
                  {assets.map((asset) => (
                    <li
                      key={asset.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <div>
                        <a
                          href={asset.file_path}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--info)', textDecoration: 'underline', fontSize: '0.9rem' }}
                          aria-label={`Buka: ${asset.file_name}`}
                        >
                          {asset.file_name}
                        </a>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <time dateTime={asset.created_at}>{formatDate(asset.created_at)}</time>
                        </p>
                      </div>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--error)' }}
                        onClick={() => setDeleteAssetId(asset.id)}
                        aria-label={`Hapus link: ${asset.file_name}`}
                      >
                        <FiX aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Form diskusi / pesan ke admin */}
            <section className="glass-card project-section" aria-labelledby={messageFormId}>
              <h2 id={messageFormId}>Diskusi dengan Tim Admin</h2>
              <form onSubmit={handleMessageSubmit} aria-label="Form diskusi dengan tim admin">
                <div className="form-group">
                  <label htmlFor="discussion-message">Pesan</label>
                  <textarea
                    id="discussion-message"
                    className="form-control"
                    rows="4"
                    placeholder="Tulis pertanyaan, catatan, atau update untuk tim admin..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingMessage}
                  >
                    <FiSend aria-hidden="true" style={{ marginRight: '8px' }} />
                    {submittingMessage ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* ===== Sidebar: Info Proyek ===== */}
          <aside className="project-sidebar" aria-label="Informasi proyek">
            <div className="glass-card project-section">
              <h2>Informasi Proyek</h2>
              <dl className="project-info-list">
                <div className="info-row">
                  <dt>Layanan</dt>
                  <dd>{order.service_name || '—'}</dd>
                </div>
                <div className="info-row">
                  <dt>Tanggal Pesanan</dt>
                  <dd>
                    <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
                  </dd>
                </div>
                {order.timeline && (
                  <div className="info-row">
                    <dt>Estimasi Waktu</dt>
                    <dd>{order.timeline}</dd>
                  </div>
                )}
                {order.budget_range && (
                  <div className="info-row">
                    <dt>Budget Range</dt>
                    <dd>{order.budget_range}</dd>
                  </div>
                )}
                {order.final_price && (
                  <div className="info-row">
                    <dt>Harga Disepakati</dt>
                    <dd className="gradient-text">
                      Rp {Number(order.final_price).toLocaleString('id-ID')}
                    </dd>
                  </div>
                )}
                {order.staging_url && (
                  <div className="info-row">
                    <dt>URL Staging</dt>
                    <dd>
                      <a href={order.staging_url} target="_blank" rel="noreferrer" style={{ color: 'var(--info)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                        Lihat Staging
                      </a>
                    </dd>
                  </div>
                )}
                {order.handover_url && (
                  <div className="info-row">
                    <dt>Link Handover</dt>
                    <dd>
                      <a href={order.handover_url} target="_blank" rel="noreferrer" style={{ color: 'var(--success)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                        Download Aset Final
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>

      {/* ===== Modal konfirmasi hapus link ===== */}
      {deleteAssetId && (
        <div
          className="modal-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={deleteModalTitleId}
          aria-describedby="delete-asset-desc"
        >
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', padding: '2rem' }}>
            <h2 id={deleteModalTitleId}>Hapus Link?</h2>
            <p id="delete-asset-desc" className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Link ini akan dihapus secara permanen dari daftar.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteAssetId(null)}>
                Batal
              </button>
              <button
                className="btn"
                style={{ background: 'var(--error)', color: 'white' }}
                onClick={() => handleDeleteAsset(deleteAssetId)}
                aria-label="Konfirmasi hapus link ini"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectDetailPage;

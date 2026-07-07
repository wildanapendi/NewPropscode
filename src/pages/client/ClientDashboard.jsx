import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ClientDashboard.css';

// Status config di luar komponen agar tidak dibuat ulang setiap render
const STATUS_CONFIG = {
  pending:     { label: 'Menunggu Konfirmasi', color: 'warning',  Icon: FiClock },
  confirmed:   { label: 'Dikonfirmasi',        color: 'info',     Icon: FiCheckCircle },
  in_progress: { label: 'Sedang Dikerjakan',   color: 'primary',  Icon: FiAlertCircle },
  testing:     { label: 'Testing / Review',    color: 'info',     Icon: FiAlertCircle },
  revision:    { label: 'Revisi',              color: 'warning',  Icon: FiAlertCircle },
  done:        { label: 'Selesai',             color: 'success',  Icon: FiCheckCircle },
  cancelled:   { label: 'Dibatalkan',          color: 'error',    Icon: FiAlertCircle },
};

// Status yang dianggap "aktif" untuk keperluan filter statistik
const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_progress', 'testing', 'revision'];

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data.data || []);
    } catch {
      // Data dummy saat API tidak tersedia
      setOrders([
        { id: 1, order_number: 'PRC-LXP12-ABC', project_name: 'Company Profile Website', status: 'in_progress', created_at: new Date().toISOString() },
        { id: 2, order_number: 'PRC-LXP13-XYZ', project_name: 'Mobile App Design', status: 'done', created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat dashboard...">
        <div className="spinner" />
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'done').length;

  return (
    <main className="client-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <div>
            <h1>Halo, {user?.name} 👋</h1>
            <p className="subtitle">Selamat datang di dashboard klien Propscode.</p>
          </div>
          <Link to="/order/new" className="btn btn-primary">
            <FiPlus aria-hidden="true" /> Buat Pesanan Baru
          </Link>
        </header>

        {/* Statistik ringkas — sebagai ul/li untuk daftar metrik */}
        <ul
          className="dashboard-stats grid grid-3"
          role="list"
          aria-label="Ringkasan proyek Anda"
        >
          <li className="stat-card glass-card">
            <h2>Total Proyek</h2>
            <div className="stat-value">{orders.length}</div>
          </li>
          <li className="stat-card glass-card">
            <h2>Proyek Aktif</h2>
            <div className="stat-value text-primary">{activeOrdersCount}</div>
          </li>
          <li className="stat-card glass-card">
            <h2>Proyek Selesai</h2>
            <div className="stat-value text-success">{completedOrdersCount}</div>
          </li>
        </ul>

        {/* Daftar proyek */}
        <section className="dashboard-projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Proyek Saya</h2>

          {orders.length === 0 ? (
            <div className="empty-state glass-card" role="status">
              <FiAlertCircle aria-hidden="true" />
              <h3>Belum ada proyek</h3>
              <p>Anda belum memiliki proyek yang sedang berjalan.</p>
              <Link to="/order/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Mulai Proyek Pertama
              </Link>
            </div>
          ) : (
            <ul className="project-list grid grid-2" role="list" aria-label="Daftar proyek">
              {orders.map((order, index) => {
                const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const { Icon } = statusConf;

                return (
                  <motion.li
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <article className="project-card glass-card">
                      <div className="project-card-header">
                        <div>
                          <span className="order-number">{order.order_number}</span>
                          <h3>{order.project_name}</h3>
                        </div>
                        <span className={`badge badge-${statusConf.color}`}>
                          <Icon aria-hidden="true" /> {statusConf.label}
                        </span>
                      </div>

                      <div className="project-card-body">
                        <dl className="project-meta">
                          <div className="project-meta-row">
                            <dt className="meta-label">Tanggal Pesanan:</dt>
                            <dd className="meta-value">
                              <time dateTime={order.created_at}>
                                {formatDate(order.created_at)}
                              </time>
                            </dd>
                          </div>
                          {order.service_name && (
                            <div className="project-meta-row">
                              <dt className="meta-label">Layanan:</dt>
                              <dd className="meta-value">{order.service_name}</dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="project-card-footer">
                        <Link to={`/project/${order.id}`} className="btn btn-outline btn-sm w-full">
                          Lihat Detail <FiChevronRight aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default ClientDashboard;

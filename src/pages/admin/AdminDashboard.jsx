import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShoppingBag, FiFileText, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';
import DashboardChart from '../../components/admin/DashboardChart';
import './Admin.css';

// Status badge config — didefinisikan di luar komponen agar tidak dibuat ulang setiap render
const STATUS_BADGE_CONFIG = {
  pending:     { bg: 'var(--warning-bg)',          color: 'var(--warning)',          label: 'Pending' },
  confirmed:   { bg: 'var(--info-bg)',             color: 'var(--info)',             label: 'Dikonfirmasi' },
  in_progress: { bg: 'rgba(99,102,241,0.15)',      color: 'var(--accent-primary)',   label: 'In Progress' },
  testing:     { bg: 'rgba(59,130,246,0.15)',      color: '#60a5fa',                label: 'Testing' },
  done:        { bg: 'var(--success-bg)',          color: 'var(--success)',          label: 'Selesai' },
};

/**
 * Menampilkan badge status pesanan dengan warna yang sesuai
 * @param {string} status
 */
const OrderStatusBadge = ({ status }) => {
  const config = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.pending;
  return (
    <span
      className="badge"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data.data);
    } catch {
      // Data dummy untuk tampilan visual saat API tidak tersedia
      setStats({
        stats: {
          totalOrders: 12,
          activeOrders: 5,
          completedOrders: 7,
          totalClients: 10,
          totalPosts: 15,
          totalPortfolio: 8,
          totalTeam: 4,
        },
        recentOrders: [
          { id: 1, order_number: 'PRC-001', project_name: 'Company Profile', client_name: 'Budi Santoso', status: 'in_progress', created_at: new Date().toISOString() },
          { id: 2, order_number: 'PRC-002', project_name: 'Mobile App ERP', client_name: 'PT. Maju Jaya', status: 'pending', created_at: new Date().toISOString() },
        ],
        chartData: [
          { name: 'Senin', pesanan: 2 }, { name: 'Selasa', pesanan: 4 },
          { name: 'Rabu', pesanan: 3 }, { name: 'Kamis', pesanan: 6 },
          { name: 'Jumat', pesanan: 5 }, { name: 'Sabtu', pesanan: 8 },
          { name: 'Minggu', pesanan: 7 },
        ],
      });
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

  const statCards = [
    { label: 'Total Pesanan',   value: stats.stats.totalOrders,   icon: <FiShoppingBag aria-hidden="true" />, color: 'primary' },
    { label: 'Proyek Aktif',    value: stats.stats.activeOrders,  icon: <FiTrendingUp  aria-hidden="true" />, color: 'info' },
    { label: 'Klien Terdaftar', value: stats.stats.totalClients,  icon: <FiUsers       aria-hidden="true" />, color: 'success' },
    { label: 'Total Artikel',   value: stats.stats.totalPosts,    icon: <FiFileText    aria-hidden="true" />, color: 'warning' },
  ];

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Ringkasan aktivitas dan performa bisnis Propscode.</p>
      </header>

      {/* Stat cards sebagai ul/li — representasi daftar metrik */}
      <ul
        className="grid grid-4"
        role="list"
        aria-label="Ringkasan statistik"
        style={{ marginBottom: '2rem' }}
      >
        {statCards.map((card, index) => (
          <motion.li
            key={card.label}
            className="admin-stat-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`stat-icon bg-${card.color}`}>{card.icon}</div>
            <div>
              <p className="stat-label">{card.label}</p>
              <p className="stat-value">{card.value}</p>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="grid grid-2">
        {/* Tabel pesanan terbaru */}
        <section className="glass-card table-wrapper" aria-labelledby="recent-orders-heading">
          <div className="card-header">
            <h2 id="recent-orders-heading">Pesanan Terbaru</h2>
          </div>
          <div className="table-container">
            <table className="table" aria-label="Daftar pesanan terbaru">
              <caption className="sr-only">5 pesanan terbaru dari klien</caption>
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Proyek</th>
                  <th scope="col">Klien</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{order.project_name}</td>
                      <td>{order.client_name}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      Belum ada pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Grafik aktivitas sistem */}
        <section
          className="glass-card"
          aria-labelledby="activity-chart-heading"
          style={{ padding: '1.5rem' }}
        >
          <h2 id="activity-chart-heading" style={{ marginBottom: '1.5rem' }}>
            Aktivitas Sistem
          </h2>
          {stats.chartData && <DashboardChart data={stats.chartData} />}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;

import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const [activeOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status IN ("confirmed", "in_progress", "testing")');
    const [completedOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "done"');
    const [totalClients] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "client"');
    const [totalPosts] = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    const [totalPortfolio] = await pool.query('SELECT COUNT(*) as count FROM portfolio');
    const [totalTeam] = await pool.query('SELECT COUNT(*) as count FROM team_members WHERE is_active = 1');

    const [recentOrders] = await pool.query(
      `SELECT o.*, u.name as client_name, s.name as service_name
       FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN services s ON o.service_id = s.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    const [ordersByStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    const chartData = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const [dayCount] = await pool.query(
        'SELECT COUNT(*) as count FROM orders WHERE created_at >= ? AND created_at < ?',
        [d, nextD]
      );
      chartData.push({
        name: days[d.getDay()],
        pesanan: dayCount[0].count
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders: totalOrders[0].count,
          pendingOrders: pendingOrders[0].count,
          activeOrders: activeOrders[0].count,
          completedOrders: completedOrders[0].count,
          totalClients: totalClients[0].count,
          totalPosts: totalPosts[0].count,
          totalPortfolio: totalPortfolio[0].count,
          totalTeam: totalTeam[0].count,
        },
        recentOrders,
        ordersByStatus,
        chartData,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone, company, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data users' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    const [unread] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, data: { notifications, unreadCount: unread[0].count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notifikasi ditandai telah dibaca' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update notifikasi' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update notifikasi' });
  }
};

import pool from '../config/db.js';
import { sendTelegramNotification } from '../services/telegram.js';

const generateOrderNumber = () => {
  const prefix = 'PRC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const createOrder = async (req, res) => {
  try {
    const { project_name, description, service_id, budget_min, budget_max, timeline, deadline, steps } = req.body;
    const order_number = generateOrderNumber();

    const [result] = await pool.query(
      'INSERT INTO orders (user_id, order_number, project_name, description, service_id, budget_min, budget_max, timeline, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, order_number, project_name, description, service_id || null, budget_min, budget_max, timeline, deadline || null]
    );

    // Save multi-step form data
    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        await pool.query(
          'INSERT INTO order_steps (order_id, step_number, title, description, data) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, step.step_number, step.title, step.description, JSON.stringify(step.data || {})]
        );
      }
    }

    // Create notification for admins
    const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
    for (const admin of admins) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
        [admin.id, 'Pesanan Baru', `Pesanan baru ${order_number} dari ${req.user.name}`, 'order', result.insertId, 'order']
      );
    }

    // Notifikasi Telegram
    try {
      await sendTelegramNotification(`🆕 *Pesanan Baru*\n📋 ${order_number}\n📁 ${project_name}\n👤 ${req.user.name}`);
    } catch (e) { console.log('Telegram notification skipped:', e.message); }

    res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat', data: { id: result.insertId, order_number } });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, s.name as service_name FROM orders o LEFT JOIN services s ON o.service_id = s.id WHERE o.user_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pesanan' });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, s.name as service_name, u.name as client_name, u.email as client_email
       FROM orders o LEFT JOIN services s ON o.service_id = s.id LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    // Check access
    const order = orders[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const [steps] = await pool.query('SELECT * FROM order_steps WHERE order_id = ? ORDER BY step_number', [order.id]);
    const [assets] = await pool.query('SELECT * FROM order_assets WHERE order_id = ?', [order.id]);
    const [assignments] = await pool.query(
      'SELECT oa.*, tm.name as member_name, tm.position FROM order_assignments oa JOIN team_members tm ON oa.team_member_id = tm.id WHERE oa.order_id = ?',
      [order.id]
    );

    res.json({ success: true, data: { ...order, steps, assets, assignments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = `SELECT o.*, s.name as service_name, u.name as client_name FROM orders o LEFT JOIN services s ON o.service_id = s.id LEFT JOIN users u ON o.user_id = u.id`;
    const conditions = [];
    const params = [];

    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (search) { conditions.push('(o.order_number LIKE ? OR o.project_name LIKE ? OR u.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    conditions.push('o.is_deleted_by_admin = 0');

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY o.created_at DESC';
    const offset = (page - 1) * limit;
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [orders] = await pool.query(query, params);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil semua pesanan' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, staging_url, production_url, handover_url, notes, final_price } = req.body;

    // Fetch existing order to append notes
    const [existingOrders] = await pool.query('SELECT notes FROM orders WHERE id = ?', [req.params.id]);
    if (existingOrders.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    let currentNotes = [];
    if (existingOrders[0].notes) {
      try {
        currentNotes = JSON.parse(existingOrders[0].notes);
        if (!Array.isArray(currentNotes)) {
          currentNotes = [{ date: new Date().toISOString(), message: existingOrders[0].notes, role: 'admin', name: 'Admin' }];
        }
      } catch (e) {
        currentNotes = [{ date: new Date().toISOString(), message: existingOrders[0].notes, role: 'admin', name: 'Admin' }];
      }
    }

    if (notes && notes.trim() !== '') {
      currentNotes.push({ date: new Date().toISOString(), message: notes.trim(), role: 'admin', name: 'Admin Propscode' });
    }
    const updatedNotesStr = currentNotes.length > 0 ? JSON.stringify(currentNotes) : null;

    let query = 'UPDATE orders SET status = ?';
    let params = [status];
    if (staging_url !== undefined) { query += ', staging_url = ?'; params.push(staging_url); }
    if (production_url !== undefined) { query += ', production_url = ?'; params.push(production_url); }
    if (handover_url !== undefined) { query += ', handover_url = ?'; params.push(handover_url); }
    if (notes !== undefined) { query += ', notes = ?'; params.push(updatedNotesStr); }
    if (final_price !== undefined) { query += ', final_price = ?'; params.push(final_price || null); }
    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);

    // Notify client
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length > 0) {
      const order = orders[0];
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
        [order.user_id, 'Status Update', `Pesanan ${order.order_number} diperbarui ke: ${status}`, 'order', order.id, 'order']
      );

      try {
        await sendTelegramNotification(`📊 *Status Update*\n📋 ${order.order_number}\n🔄 ${status}`);
      } catch (e) { /* skip */ }
    }

    res.json({ success: true, message: 'Status pesanan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update status' });
  }
};

export const uploadOrderAsset = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan' });

    const [result] = await pool.query(
      'INSERT INTO order_assets (order_id, file_name, file_path, file_type, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, req.file.originalname, `/uploads/assets/${req.file.filename}`, req.file.mimetype, req.file.size, req.user.id]
    );

    res.status(201).json({ success: true, message: 'File berhasil diunggah', data: { id: result.insertId, path: `/uploads/assets/${req.file.filename}` } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal upload file' });
  }
};

export const assignTeamMember = async (req, res) => {
  try {
    const { team_member_id, role } = req.body;
    await pool.query(
      'INSERT INTO order_assignments (order_id, team_member_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?',
      [req.params.id, team_member_id, role, role]
    );
    res.json({ success: true, message: 'Tim berhasil ditugaskan' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menugaskan tim' });
  }
};

export const removeTeamAssignment = async (req, res) => {
  try {
    await pool.query('DELETE FROM order_assignments WHERE order_id = ? AND team_member_id = ?', [req.params.id, req.params.memberId]);
    res.json({ success: true, message: 'Penugasan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal hapus penugasan' });
  }
};

export const addOrderLink = async (req, res) => {
  try {
    const { link_url, link_name } = req.body;
    if (!link_url) return res.status(400).json({ success: false, message: 'URL tidak boleh kosong' });

    const [result] = await pool.query(
      'INSERT INTO order_assets (order_id, file_name, file_path, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, link_name || 'Link Eksternal', link_url, 'link', req.user.id]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Link berhasil ditambahkan', 
      data: { id: result.insertId, file_name: link_name || 'Link Eksternal', file_path: link_url, file_type: 'link' } 
    });
  } catch (error) {
    console.error('Failed to add link:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan link' });
  }
};

export const deleteOrderLink = async (req, res) => {
  try {
    const { id, linkId } = req.params;
    
    const [assets] = await pool.query('SELECT * FROM order_assets WHERE id = ? AND order_id = ?', [linkId, id]);
    if (assets.length === 0) return res.status(404).json({ success: false, message: 'Link tidak ditemukan' });

    // Validate that only the uploader or an admin can delete it
    if (req.user.role !== 'admin' && assets[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await pool.query('DELETE FROM order_assets WHERE id = ?', [linkId]);
    res.json({ success: true, message: 'Link berhasil dihapus' });
  } catch (error) {
    console.error('Failed to delete link:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus link' });
  }
};

export const addOrderComment = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
    }

    const [existingOrders] = await pool.query('SELECT notes, user_id, order_number FROM orders WHERE id = ?', [req.params.id]);
    if (existingOrders.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    const order = existingOrders[0];

    // Client can only comment on their own order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    let currentNotes = [];
    if (order.notes) {
      try {
        currentNotes = JSON.parse(order.notes);
        if (!Array.isArray(currentNotes)) {
          currentNotes = [{ date: new Date().toISOString(), message: order.notes, role: 'admin', name: 'Admin' }];
        }
      } catch (e) {
        currentNotes = [{ date: new Date().toISOString(), message: order.notes, role: 'admin', name: 'Admin' }];
      }
    }

    currentNotes.push({ 
      date: new Date().toISOString(), 
      message: message.trim(), 
      role: req.user.role,
      name: req.user.name 
    });

    const updatedNotesStr = JSON.stringify(currentNotes);
    await pool.query('UPDATE orders SET notes = ? WHERE id = ?', [updatedNotesStr, req.params.id]);

    // Send Notification to admin if client commented
    if (req.user.role === 'client') {
       const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
       for (const admin of admins) {
          await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
            [admin.id, 'Pesan Baru Klien', `Klien menambahkan komentar pada pesanan ${order.order_number}`, 'order', req.params.id, 'order']
          );
       }
       // Notifikasi Telegram untuk admin
       try {
         await sendTelegramNotification(`💬 *Pesan Klien Baru*\n📋 ${order.order_number}\n👤 ${req.user.name}\n📝 "${message.substring(0, 50)}..."`);
       } catch (e) { /* skip */ }
    }

    res.json({ success: true, message: 'Komentar berhasil ditambahkan' });
  } catch (error) {
    console.error('Failed to add comment:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan komentar' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    // Check if order exists
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    // Soft delete: hanya menyembunyikan dari admin
    await pool.query('UPDATE orders SET is_deleted_by_admin = 1 WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Pesanan berhasil disembunyikan dari riwayat Admin' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pesanan' });
  }
};

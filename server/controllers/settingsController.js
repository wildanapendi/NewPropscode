import pool from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_settings LIMIT 1');
    if (rows.length === 0) {
      return res.json({ success: true, data: {} });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { email, phone, address, facebook, instagram, linkedin } = req.body;
    
    const [rows] = await pool.query('SELECT id FROM site_settings LIMIT 1');
    
    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO site_settings (email, phone, address, facebook, instagram, linkedin) VALUES (?, ?, ?, ?, ?, ?)',
        [email, phone, address, facebook, instagram, linkedin]
      );
    } else {
      await pool.query(
        'UPDATE site_settings SET email = ?, phone = ?, address = ?, facebook = ?, instagram = ?, linkedin = ? WHERE id = ?',
        [email, phone, address, facebook, instagram, linkedin, rows[0].id]
      );
    }
    
    res.json({ success: true, message: 'Pengaturan berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan' });
  }
};

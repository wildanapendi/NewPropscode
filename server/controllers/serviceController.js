import pool from '../config/db.js';

export const getAllServices = async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM services WHERE is_active = 1 ORDER BY order_index ASC');
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data layanan' });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM services WHERE slug = ?', [req.params.slug]);
    if (services.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    res.json({ success: true, data: services[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil layanan' });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, description, icon, base_price, features } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.query(
      'INSERT INTO services (name, slug, description, icon, base_price, features) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, description, icon, base_price || 0, JSON.stringify(features || [])]
    );
    res.status(201).json({ success: true, message: 'Layanan berhasil dibuat', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat layanan' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { name, description, icon, base_price, features, is_active } = req.body;
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

    await pool.query(
      'UPDATE services SET name = ?, slug = ?, description = ?, icon = ?, base_price = ?, features = ?, is_active = ? WHERE id = ?',
      [name, slug, description, icon, base_price, JSON.stringify(features || []), is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ success: true, message: 'Layanan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update layanan' });
  }
};

export const deleteService = async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Layanan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal hapus layanan' });
  }
};

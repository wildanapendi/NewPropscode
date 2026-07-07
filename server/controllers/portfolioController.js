import pool from '../config/db.js';

export const getAllPortfolio = async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 12 } = req.query;
    let query = 'SELECT * FROM portfolio';
    const conditions = [];
    const params = [];

    if (category) { conditions.push('category = ?'); params.push(category); }
    if (featured === 'true') { conditions.push('is_featured = 1'); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY order_index ASC, created_at DESC';
    const offset = (page - 1) * limit;
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [items] = await pool.query(query, params);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil portfolio' });
  }
};

export const getPortfolioBySlug = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM portfolio WHERE slug = ?', [req.params.slug]);
    if (items.length === 0) return res.status(404).json({ success: false, message: 'Portfolio tidak ditemukan' });
    res.json({ success: true, data: items[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil portfolio' });
  }
};

export const createPortfolio = async (req, res) => {
  try {
    const { title, description, tech_stack, demo_url, github_url, client_name, category, is_featured } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cover_image = req.file ? `/uploads/portfolio/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO portfolio (title, slug, description, cover_image, tech_stack, demo_url, github_url, client_name, category, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, description, cover_image, JSON.stringify(tech_stack || []), demo_url, github_url, client_name, category, is_featured ? 1 : 0]
    );
    res.status(201).json({ success: true, message: 'Portfolio berhasil dibuat', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat portfolio' });
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const { title, description, tech_stack, demo_url, github_url, client_name, category, is_featured } = req.body;
    const cover_image = req.file ? `/uploads/portfolio/${req.file.filename}` : undefined;
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

    let query = 'UPDATE portfolio SET title = ?, slug = ?, description = ?, tech_stack = ?, demo_url = ?, github_url = ?, client_name = ?, category = ?, is_featured = ?';
    let params = [title, slug, description, JSON.stringify(tech_stack || []), demo_url, github_url, client_name, category, is_featured ? 1 : 0];

    if (cover_image) { query += ', cover_image = ?'; params.push(cover_image); }
    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ success: true, message: 'Portfolio berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update portfolio' });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    await pool.query('DELETE FROM portfolio WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Portfolio berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal hapus portfolio' });
  }
};

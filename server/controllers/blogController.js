import pool from '../config/db.js';

export const getAllPosts = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    let query = 'SELECT bp.*, u.name as author_name FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id';
    let countQuery = 'SELECT COUNT(*) as total FROM blog_posts bp';
    const conditions = [];
    const params = [];

    if (category) { conditions.push('bp.category = ?'); params.push(category); }
    if (status) { conditions.push('bp.status = ?'); params.push(status); }
    else { conditions.push('bp.status = "published"'); }
    if (search) { conditions.push('(bp.title LIKE ? OR bp.excerpt LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    if (conditions.length > 0) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ' ORDER BY bp.published_at DESC, bp.created_at DESC';
    const offset = (page - 1) * limit;
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [posts] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params);

    res.json({
      success: true,
      data: posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data blog' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const [posts] = await pool.query(
      'SELECT bp.*, u.name as author_name FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id WHERE bp.slug = ?',
      [req.params.slug]
    );
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }
    await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [posts[0].id]);
    res.json({ success: true, data: posts[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil artikel' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cover_image = req.file ? `/uploads/blog/${req.file.filename}` : null;
    const published_at = status === 'published' ? new Date() : null;

    const [result] = await pool.query(
      'INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author_id, category, tags, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, excerpt, content, cover_image, req.user.id, category, JSON.stringify(tags || []), status || 'draft', published_at]
    );

    res.status(201).json({ success: true, message: 'Artikel berhasil dibuat', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat artikel' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body;
    const cover_image = req.file ? `/uploads/blog/${req.file.filename}` : undefined;
    let slug;
    if (title) slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const published_at = status === 'published' ? new Date() : undefined;

    let query = 'UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, category = ?, tags = ?, status = ?';
    let params = [title, slug, excerpt, content, category, JSON.stringify(tags || []), status];

    if (cover_image) { query += ', cover_image = ?'; params.push(cover_image); }
    if (published_at) { query += ', published_at = ?'; params.push(published_at); }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ success: true, message: 'Artikel berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update artikel' });
  }
};

export const deletePost = async (req, res) => {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal hapus artikel' });
  }
};

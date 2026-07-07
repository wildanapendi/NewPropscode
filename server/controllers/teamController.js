import pool from '../config/db.js';

export const getAllMembers = async (req, res) => {
  try {
    const [members] = await pool.query(
      'SELECT * FROM team_members WHERE is_active = 1 ORDER BY order_index ASC'
    );
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data tim' });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const [members] = await pool.query('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    if (members.length === 0) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    res.json({ success: true, data: members[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data anggota' });
  }
};

export const createMember = async (req, res) => {
  try {
    const { name, position, bio, email, phone, linkedin, github, instagram, order_index } = req.body;
    const photo = req.file ? `/uploads/team/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO team_members (name, position, bio, photo, email, phone, linkedin, github, instagram, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, position, bio, photo, email, phone, linkedin, github, instagram, order_index || 0]
    );
    res.status(201).json({ success: true, message: 'Anggota tim berhasil ditambahkan', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambah anggota' });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { name, position, bio, email, phone, linkedin, github, instagram, order_index, is_active } = req.body;
    const photo = req.file ? `/uploads/team/${req.file.filename}` : undefined;

    let query = 'UPDATE team_members SET name = ?, position = ?, bio = ?, email = ?, phone = ?, linkedin = ?, github = ?, instagram = ?, order_index = ?, is_active = ?';
    let params = [name, position, bio, email, phone, linkedin, github, instagram, order_index, is_active !== undefined ? is_active : 1];

    if (photo) { query += ', photo = ?'; params.push(photo); }
    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ success: true, message: 'Data anggota berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update anggota' });
  }
};

export const deleteMember = async (req, res) => {
  try {
    await pool.query('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Anggota berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal hapus anggota' });
  }
};

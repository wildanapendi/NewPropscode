import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'propscode_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, company) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, company || null]
    );

    const token = generateToken({ id: result.insertId, email, role: 'client', name });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { token, user: { id: result.insertId, name, email, role: 'client' } },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Gagal registrasi' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi dengan format yang benar' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun dinonaktifkan' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Gagal login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone, company, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    let query = 'UPDATE users SET name = ?, phone = ?, company = ?';
    let params = [name, phone, company];

    if (avatar) {
      query += ', avatar = ?';
      params.push(avatar);
    }

    query += ' WHERE id = ?';
    params.push(req.user.id);

    await pool.query(query, params);

    res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update profil' });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Kata sandi saat ini wajib diisi untuk verifikasi keamanan' });
    }

    // 1. Dapatkan user saat ini
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    const user = users[0];

    // 2. Verifikasi kata sandi saat ini
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Kata sandi saat ini salah' });
    }

    // 3. Jika email berubah, pastikan belum digunakan akun lain
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar pada akun lain' });
      }
    }

    // 4. Update data ke database
    let query = 'UPDATE users SET email = ?';
    let params = [email];

    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(req.user.id);

    await pool.query(query, params);

    // Dapatkan data user terbaru
    const [updatedUsers] = await pool.query(
      'SELECT id, name, email, role, phone, company, avatar FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Pengaturan akun berhasil diperbarui',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan akun' });
  }
};


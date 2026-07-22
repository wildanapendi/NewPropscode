/**
 * ============================================================
 * SCRIPT AUDIT & DIAGNOSA LOGIN ADMIN
 * Jalankan: node audit-login.js
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DIVIDER = '─'.repeat(50);
const OK = '✅';
const FAIL = '❌';
const WARN = '⚠️ ';

console.log('\n' + DIVIDER);
console.log('  🔍 AUDIT DIAGNOSA LOGIN ADMIN - PROPSCODE');
console.log(DIVIDER + '\n');

// ============================================================
// 1. Cek variabel .env
// ============================================================
console.log('📋 [1] Memeriksa .env Variabel...');
const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
let envOk = true;
for (const key of requiredEnv) {
  const val = process.env[key];
  if (!val || val.includes('your_') || val.includes('here')) {
    console.log(`  ${FAIL} ${key} = "${val}" — BELUM DIISI / PLACEHOLDER`);
    envOk = false;
  } else {
    const display = key === 'JWT_SECRET' ? val.substring(0, 8) + '...' : val;
    console.log(`  ${OK} ${key} = "${display}"`);
  }
}

if (!envOk) {
  console.log('\n  Isi semua variabel .env dulu sebelum melanjutkan.\n');
  process.exit(1);
}

// ============================================================
// 2. Cek koneksi database
// ============================================================
console.log(`\n${DIVIDER}`);
console.log('🗄️  [2] Memeriksa Koneksi Database...');
let conn;
try {
  conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });
  console.log(`  ${OK} Koneksi ke MySQL berhasil!`);
  console.log(`     Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`     User: ${process.env.DB_USER}`);
  console.log(`     DB  : ${process.env.DB_NAME}`);
} catch (err) {
  console.log(`  ${FAIL} GAGAL terhubung ke database!`);
  console.log(`     Error: ${err.message}`);
  console.log('\n  Tips:');
  console.log('     - Pastikan MySQL/XAMPP sudah berjalan');
  console.log('     - Periksa DB_HOST, DB_USER, DB_PASSWORD, DB_NAME di .env');
  console.log('     - Pastikan database "' + process.env.DB_NAME + '" sudah dibuat\n');
  process.exit(1);
}

// ============================================================
// 3. Cek tabel yang dibutuhkan
// ============================================================
console.log(`\n${DIVIDER}`);
console.log('📊 [3] Memeriksa Tabel Database...');
const requiredTables = ['users', 'services', 'orders', 'notifications', 'portfolio', 'blog_posts', 'team_members', 'site_settings'];
for (const table of requiredTables) {
  try {
    const [rows] = await conn.query(`SELECT COUNT(*) as count FROM \`${table}\``);
    console.log(`  ${OK} Tabel "${table}" ada — ${rows[0].count} baris`);
  } catch {
    console.log(`  ${FAIL} Tabel "${table}" TIDAK DITEMUKAN — Impor schema.sql terlebih dahulu!`);
  }
}

// ============================================================
// 4. Cek data user admin
// ============================================================
console.log(`\n${DIVIDER}`);
console.log('👤 [4] Memeriksa Akun Admin...');
const adminEmail = 'admin@propscode.com';
const [adminRows] = await conn.query('SELECT id, name, email, role, password, is_active FROM users WHERE email = ?', [adminEmail]);

if (adminRows.length === 0) {
  console.log(`  ${FAIL} Akun admin "${adminEmail}" TIDAK DITEMUKAN di database!`);
  console.log(`     Impor ulang schema.sql atau tambahkan manual.`);
} else {
  const admin = adminRows[0];
  console.log(`  ${OK} Akun ditemukan:`);
  console.log(`     ID     : ${admin.id}`);
  console.log(`     Nama   : ${admin.name}`);
  console.log(`     Role   : ${admin.role}`);
  console.log(`     Aktif  : ${admin.is_active ? 'Ya' : 'Tidak'}`);
  console.log(`     Hash   : ${admin.password.substring(0, 20)}...`);

  if (admin.role !== 'admin') {
    console.log(`  ${FAIL} Role bukan 'admin' — tidak bisa akses dashboard admin!`);
  }
  if (!admin.is_active) {
    console.log(`  ${FAIL} Akun is_active = 0 — akun dinonaktifkan!`);
    console.log(`     Jalankan: UPDATE users SET is_active = 1 WHERE email = 'admin@propscode.com';`);
  }

  // ============================================================
  // 5. Verifikasi hash password
  // ============================================================
  console.log(`\n${DIVIDER}`);
  console.log('🔑 [5] Memverifikasi Hash Password...');
  const testPasswords = ['admin123', 'Admin123', 'admin', 'password', 'AdminPropscode2026!', 'client123'];
  let passwordFound = null;

  for (const testPwd of testPasswords) {
    const match = await bcrypt.compare(testPwd, admin.password);
    if (match) {
      console.log(`  ${OK} Password cocok: "${testPwd}"`);
      passwordFound = testPwd;
      break;
    }
  }

  if (!passwordFound) {
    console.log(`  ${WARN} Tidak ada password umum yang cocok dengan hash di DB.`);
    console.log(`     Hash di DB: ${admin.password}`);
    console.log(`     Gunakan query reset di bagian [7] di bawah.`);
  }

  // ============================================================
  // 6. Simulasi JWT
  // ============================================================
  console.log(`\n${DIVIDER}`);
  console.log('🔐 [6] Simulasi JWT Token...');
  if (passwordFound) {
    try {
      const secret = process.env.JWT_SECRET || 'propscode_secret';
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
        secret,
        { expiresIn: '7d' }
      );
      const decoded = jwt.verify(token, secret);
      console.log(`  ${OK} JWT berhasil dibuat & diverifikasi`);
      console.log(`     Role dari token: ${decoded.role}`);
      console.log(`     Token (30 char): ${token.substring(0, 30)}...`);
    } catch (jwtErr) {
      console.log(`  ${FAIL} JWT gagal: ${jwtErr.message}`);
      console.log(`     Pastikan JWT_SECRET di .env sudah benar dan tidak ada karakter khusus.`);
    }
  } else {
    console.log(`  ${WARN} Skipped — password tidak cocok`);
  }
}

// ============================================================
// 7. Perintah Reset Password
// ============================================================
console.log(`\n${DIVIDER}`);
console.log('📋 [7] Perintah Reset Password Admin');
console.log(DIVIDER);
const newHash = await bcrypt.hash('admin123', 10);
console.log(`\n  Jalankan query SQL ini di phpMyAdmin / HeidiSQL / Terminal MySQL:\n`);
console.log(`  UPDATE users`);
console.log(`    SET password = '${newHash}',`);
console.log(`        is_active = 1,`);
console.log(`        role = 'admin'`);
console.log(`    WHERE email = 'admin@propscode.com';\n`);
console.log(`  Setelah reset, login menggunakan:`);
console.log(`  Email    : admin@propscode.com`);
console.log(`  Password : admin123`);

await conn.end();
console.log('\n' + DIVIDER);
console.log('  Audit selesai!');
console.log(DIVIDER + '\n');

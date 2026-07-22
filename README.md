# Propscode V2

Propscode V2 adalah platform manajemen layanan digital fullstack modern yang dirancang untuk mengelola alur kerja pemesanan proyek, showcase portofolio, publikasi artikel blog, serta manajemen tim secara terintegrasi. Platform ini menggunakan arsitektur terpisah (decoupled) berbasis React dan Vite pada sisi antarmuka, serta Express.js dan MySQL pada sisi backend API.

---

## Arsitektur & Teknologi

### Frontend
- **Framework & Build Tool**: React 19, Vite 8
- **State & Routing**: React Router Dom 7, Context API (AuthContext)
- **UI & Animasi**: Framer Motion, React Icons, Recharts, React Hot Toast
- **Internasionalisasi**: i18next, react-i18next, i18next-browser-languagedetector
- **HTTP Client**: Axios dengan request/response interceptors

### Backend
- **Runtime & Framework**: Node.js (ES Modules), Express.js 5
- **Database Engine**: MySQL / MariaDB (Driver: mysql2 dengan Connection Pooling)
- **Autentikasi & Keamanan**: JSON Web Token (JWT), Bcrypt.js, Helmet, HPP (HTTP Parameter Pollution Protection), Rate Limiter
- **Notifikasi**: Telegram Bot API, n8n Webhook Integration
- **Manajemen Berkas**: Multer untuk penanganan upload aset dan gambar

---

## Fitur Utama

### 1. Sistem Autentikasi & Otorisasi
- Multi-role access control (Admin dan Client)
- Pengamanan endpoint API berbasis JWT (Bearer Token)
- Enkripsi kata sandi menggunakan hashing Bcrypt
- Manajemen profil pengguna dan pengaturan akun mandiri

### 2. Manajemen Pesanan & Proyek (Order Management)
- Formulir pemesanan multi-langkah (Multi-step order wizard)
- Pelacakan status proyek secara berkala (Pending, Confirmed, In Progress, Testing, Done, Cancelled)
- Manajemen aset proyek (Upload dokumen pendukung dan link eksternal)
- Penugasan anggota tim internal ke proyek spesifik (Order Assignment)
- Sistem catatan dan komunikasi internal per pesanan

### 3. Dashboard Admin & Analitik
- Ringkasan statistik performa bisnis (Total pesanan, klien aktif, statistik status)
- Visualisasi grafik tren pesanan mingguan menggunakan Recharts
- Manajemen katalog layanan (CRUD Layanan & Paket Harga)
- Manajemen postingan blog (Draft & Published status)
- Manajemen daftar portofolio dan showcase karya
- Manajemen data anggota tim internal

### 4. Notifikasi Real-time & Integrasi
- Notifikasi in-app untuk pembaruan status pesanan dan pesan baru
- Integrasi bot Telegram untuk notifikasi otomatis ke grup admin
- Dukungan webhook n8n untuk otomasi alur kerja lanjutan

### 5. Keamanan & Pemeliharaan
- Fitur Maintenance Mode berbasis variabel lingkungan atau flag file (.maintenance)
- Fitur token bypass (x-maintenance-bypass) untuk akses pengembang saat pemeliharaan
- Perlindungan dari penjelajahan langsung API dari browser (apiProtect middleware)

---

## Persyaratan Sistem

Pastikan perangkat lunak berikut sudah terpasang pada lingkungan pengembangan atau server Anda:

- **Node.js**: Versi 18.x atau yang lebih baru
- **npm**: Versi 9.x atau yang lebih baru
- **MySQL / MariaDB**: MySQL versi 8.0+ atau MariaDB versi 10.4+

---

## Panduan Instalasi & Konfigurasi

### 1. Klon Repositori

```bash
git clone https://github.com/your-org/propscode-v2.git
cd propscode-v2
```

### 2. Konfigurasi Variabel Lingkungan (.env)

Buat file `.env` di folder akar project dengan menyalin template `.env.example`:

```bash
cp .env.example .env
```

Berikut adalah daftar variabel lingkungan yang wajib dikonfigurasi:

#### Database
- `DB_HOST`: Host database MySQL (Default: `localhost`)
- `DB_PORT`: Port database MySQL (Default: `3306`)
- `DB_USER`: Username database (Default: `root`)
- `DB_PASSWORD`: Password database (Kosongkan jika tanpa password)
- `DB_NAME`: Nama database aplikasi (Default: `propscode_db`)

#### Keamanan JWT
- `JWT_SECRET`: Kunci rahasia untuk enkripsi token JWT
- `JWT_EXPIRES_IN`: Masa berlaku token (Default: `7d`)

#### Server Backend
- `PORT`: Port backend API server (Default: `5000`)
- `PORT_API_URL`: Base URL internal API (Default: `http://localhost:5000/api`)

#### Server Frontend
- `FRONTEND_URL`: URL frontend untuk otorisasi CORS (Default: `http://localhost:5173`)
- `VITE_API_URL`: Path API frontend (Gunakan `/api` untuk menggunakan Vite Proxy)

#### Bot Telegram (Opsional)
- `TELEGRAM_BOT_TOKEN`: Token bot dari @BotFather
- `TELEGRAM_CHAT_ID`: ID chat atau grup penerima notifikasi

#### Mode Pemeliharaan (Maintenance Mode)
- `MAINTENANCE_MODE`: Set `true` untuk mengaktifkan pemeliharaan sistem
- `MAINTENANCE_BYPASS_TOKEN`: Token rahasia HTTP Header (`x-maintenance-bypass`) untuk bypass pengembang

---

### 3. Inisialisasi Database

Jalankan skrip SQL yang telah disediakan pada folder `server/schema.sql` untuk membuat tabel dan memasukkan data awal:

```bash
# Menggunakan MySQL Command Line
mysql -u root -p -e "CREATE DATABASE propscode_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p propscode_db < server/schema.sql
```

Atau lakukan impor file `server/schema.sql` secara manual melalui phpMyAdmin, DBeaver, TablePlus, atau MySQL Workbench.

---

### 4. Instalasi Dependency

Instal dependensi untuk modul frontend dan backend:

```bash
# Instal dependensi frontend (di root direktori)
npm install

# Instal dependensi backend
cd server
npm install
cd ..
```

---

## Menjalankan Aplikasi

Jalankan backend server dan frontend dev server pada dua terminal terpisah.

### Terminal 1: Backend API Server
```bash
cd server
npm run dev
```
Server backend akan berjalan pada `http://localhost:5000`

### Terminal 2: Frontend Client
```bash
npm run dev
```
Server frontend akan berjalan pada `http://localhost:5173`

---

## Kredensial Akun Pengujian

Setelah skrip database diimpor, gunakan kredensial bawaan berikut untuk menguji sistem:

| Peran | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@propscode.com` | `admin123` | Akses penuh Dashboard Admin |
| **Client** | `client@demo.com` | `client123` | Akses Dashboard Klien & Pemesanan |

---

## Struktur Direktori Project

```
propscode-v2/
├── .env.example             # Template konfigurasi environment
├── .env                     # Konfigurasi environment lokal (Diabaikan oleh git)
├── index.html               # Entry point HTML Vite
├── package.json             # Manifest dependensi frontend
├── vite.config.js           # Konfigurasi bundler Vite dan proxy API
├── public/                  # Aset statis publik
├── src/                     # Source code frontend (React)
│   ├── assets/              # Gambar dan gaya statis
│   ├── components/          # Komponen UI reusable (Layout, Navbar, Sidebar)
│   ├── context/             # React Context (AuthContext)
│   ├── hooks/               # Custom React Hooks
│   ├── locales/             # File translasi bahasa (i18n)
│   ├── pages/               # Halaman aplikasi (Admin, Client, Public, Auth)
│   └── services/            # Modul API client (Axios configuration)
└── server/                  # Source code backend (Express.js)
    ├── index.js             # Entry point Express server
    ├── package.json         # Manifest dependensi backend
    ├── schema.sql           # Skema database & data inisialisasi
    ├── audit-login.js       # Skrip diagnosa & pengujian login
    ├── config/              # Konfigurasi koneksi MySQL pool
    ├── controllers/         # Handler logika bisnis per rute
    ├── middleware/           # Middleware autentikasi, CORS, & maintenance
    ├── routes/               # Definisi endpoint API Express
    ├── services/             # Layanan notifikasi (Telegram, Webhook)
    └── uploads/              # Direktori penyimpanan file unggahan
```

---

## Referensi API Endpoint

| Method | Endpoint | Fungsi | Akses |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Pendaftaran akun klien baru | Publik |
| POST | `/api/auth/login` | Otentikasi dan penerbitan token JWT | Publik |
| GET | `/api/auth/me` | Mengambil profil pengguna aktif | Authenticated |
| GET | `/api/services` | Mengambil katalog layanan | Publik |
| GET | `/api/orders` | Mengambil daftar pesanan | Authenticated |
| POST | `/api/orders` | Membuat pesanan proyek baru | Client / Admin |
| PUT | `/api/orders/:id/status` | Memperbarui status & rincian pesanan | Admin |
| GET | `/api/admin/stats` | Mengambil data statistik dashboard | Admin |
| GET | `/api/health` | Pemeriksaan status kesehatan server | Publik |

---

## Penanganan Masalah (Troubleshooting)

### 1. Gagal Terhubung ke Database (ERR_CONNECTION_REFUSED / ER_ACCESS_DENIED)
- Pastikan service MySQL/MariaDB sudah aktif.
- Periksa kesesuaian `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` pada file `.env`.
- Jalankan skrip diagnosa backend: `node server/audit-login.js`.

### 2. Masalah CORS (Cross-Origin Resource Sharing)
- Pastikan variabel `FRONTEND_URL` di file `.env` sesuai dengan port frontend yang aktif.
- Pastikan variabel `VITE_API_URL` di file `.env` diisi dengan `/api` agar menggunakan sistem proxy dari Vite.

### 3. Sesi Login Berakhir Secara Tiba-Tiba (401 Unauthorized)
- Sistem secara otomatis menghapus token yang sudah tidak berlaku dan mengarahkan kembali ke halaman login.
- Periksa kembali konfigurasi `JWT_SECRET` pada file `.env`.

---

## Lisensi

Hak Cipta Terpelihara - Propscode Studio. Penggunaan dan pendistribusian ulang memerlukan izin tertulis.

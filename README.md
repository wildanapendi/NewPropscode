# Propscode V2

Fullstack web application untuk manajemen layanan digital — dibangun dengan **React + Vite** (frontend) dan **Express.js + MySQL** (backend).

## Tech Stack

| Layer     | Teknologi                                    |
| --------- | -------------------------------------------- |
| Frontend  | React 19, Vite 8, Framer Motion, React Icons |
| Backend   | Express 5, Node.js (ESM)                     |
| Database  | MySQL / MariaDB (via mysql2)                 |
| Auth      | JWT (jsonwebtoken + bcryptjs)                |
| Notifikasi| Telegram Bot API, n8n Webhook                |
| i18n      | i18next + react-i18next                      |

## Fitur Utama

- Autentikasi JWT (login/register) dengan role `admin` & `client`
- Manajemen pesanan (order) dengan tracking status & assignment
- Portfolio showcase
- Blog management (draft/publish)
- Team member management
- Notifikasi real-time (in-app, Telegram, n8n webhook)
- Support ticket system
- File upload untuk order assets
- Multi-bahasa (i18n)

---

## Prerequisites

Pastikan tools berikut sudah terinstall:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **MySQL** >= 8.0 atau **MariaDB** >= 10.4 — [Download MySQL](https://dev.mysql.com/downloads/) / [XAMPP](https://www.apachefriends.org/)
- **npm** >= 9.x (sudah termasuk di Node.js)

---

## Setup & Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/your-org/propscode-v2.git
cd propscode-v2
```

### 2. Konfigurasi Environment Variables

```bash
# Salin file template environment
cp .env.example .env
```

Buka file `.env` dan sesuaikan nilai-nilainya. Berikut penjelasan setiap variabel:

#### 🗄️ Database

| Variable      | Deskripsi                          | Default          | Wajib |
| ------------- | ---------------------------------- | ---------------- | ----- |
| `DB_HOST`     | Host database MySQL                | `localhost`      | ✅    |
| `DB_PORT`     | Port database MySQL                | `3306`           | ✅    |
| `DB_USER`     | Username database                  | `root`           | ✅    |
| `DB_PASSWORD` | Password database                  | _(kosong)_       | ✅    |
| `DB_NAME`     | Nama database                      | `propscode_db`   | ✅    |

#### JWT Authentication

| Variable         | Deskripsi                                    | Default                    | Wajib |
| ---------------- | -------------------------------------------- | -------------------------- | ----- |
| `JWT_SECRET`     | Secret key untuk sign/verify JWT token       | `your_jwt_secret_key_here` | ✅    |
| `JWT_EXPIRES_IN` | Durasi expired token (format: `7d`, `24h`)   | `7d`                       | ✅    |

> **⚠️ Penting:** Generate JWT secret yang kuat untuk production:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

#### 🖥️ Server

| Variable        | Deskripsi                     | Default                          | Wajib |
| --------------- | ----------------------------- | -------------------------------- | ----- |
| `PORT`          | Port backend API server       | `5000`                           | ✅    |
| `PORT_API_URL`  | Base URL API (internal ref)   | `http://localhost:5000/api`      | ✅    |
| `FRONTEND_URL`  | URL frontend (untuk CORS)     | `http://localhost:5173`          | ✅    |

#### 🌐 Frontend (Vite)

| Variable        | Deskripsi                     | Default                          | Wajib |
| --------------- | ----------------------------- | -------------------------------- | ----- |
| `VITE_API_URL`  | URL API yang diakses frontend | `http://localhost:5000/api`      | ❌    |

> **💡 Catatan:** Variabel dengan prefix `VITE_` otomatis tersedia di frontend melalui `import.meta.env.VITE_*`

#### 📱 Telegram Bot _(Opsional)_

| Variable             | Deskripsi                        | Cara Mendapatkan                          |
| -------------------- | -------------------------------- | ----------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Token bot dari @BotFather        | Buka @BotFather di Telegram → `/newbot`   |
| `TELEGRAM_CHAT_ID`   | Chat ID grup Telegram            | Gunakan @RawDataBot atau API `getUpdates` |

#### 🔗 n8n Webhook _(Opsional)_

| Variable          | Deskripsi                    | Cara Mendapatkan                          |
| ----------------- | ---------------------------- | ----------------------------------------- |
| `N8N_WEBHOOK_URL` | URL webhook dari n8n         | Buat workflow di n8n → tambahkan node Webhook |

### 3. Setup Database

```bash
# Buat database baru di MySQL
mysql -u root -p -e "CREATE DATABASE propscode_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# Import schema & data awal
mysql -u root -p propscode_db < server/schema.sql
```

> Atau jika menggunakan **phpMyAdmin**: buat database `propscode_db`, lalu import file `server/schema.sql` melalui tab "Import".

### 4. Install Dependencies

```bash
# Install dependencies frontend (root project)
npm install

# Install dependencies backend
cd server
npm install
cd ..
```

### 5. Jalankan Aplikasi

Buka **2 terminal** terpisah:

**Terminal 1 — Backend API Server:**
```bash
cd server
npm run dev
# 🚀 Server berjalan di http://localhost:5000
```

**Terminal 2 — Frontend Dev Server:**
```bash
npm run dev
# ⚡ Frontend berjalan di http://localhost:5173
```

### 6. Akses Aplikasi

| URL                             | Deskripsi           |
| ------------------------------- | ------------------- |
| `http://localhost:5173`         | Frontend (React)    |
| `http://localhost:5000/api`     | Backend API         |
| `http://localhost:5000/api/health` | Health check     |

### Akun Default

| Email                  | Password         | Role    |
| ---------------------- | ---------------- | ------- |
| `admin@propscode.com`  | _(lihat schema)_ | `admin` |

---

## Struktur Project

```
propscode-v2/
├── .env.example          # Template environment variables (BACA INI)
├── .env                  # Environment variables lokal (JANGAN commit!)
├── index.html            # Entry point Vite
├── package.json          # Dependencies frontend
├── vite.config.js        # Konfigurasi Vite
├── public/               # Static assets
├── src/                  # Source code frontend (React)
│   └── services/
│       └── api.js        # Axios instance + interceptors
├── server/               # Source code backend (Express)
│   ├── index.js          # Entry point server
│   ├── package.json      # Dependencies backend
│   ├── schema.sql        # SQL schema + seed data
│   ├── migrate.js        # Migration script
│   ├── config/
│   │   └── db.js         # MySQL connection pool
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API route definitions
│   ├── services/          # Telegram, webhook services
│   └── uploads/           # Uploaded files (user assets)
```

---

## API Routes

| Method | Endpoint               | Deskripsi                |
| ------ | ---------------------- | ------------------------ |
| `*`    | `/api/auth/*`          | Autentikasi (login/register) |
| `*`    | `/api/blog/*`          | Blog management          |
| `*`    | `/api/portfolio/*`     | Portfolio CRUD           |
| `*`    | `/api/team/*`          | Team member management   |
| `*`    | `/api/services/*`      | Services management      |
| `*`    | `/api/orders/*`        | Order management         |
| `*`    | `/api/admin/*`         | Admin dashboard          |
| `*`    | `/api/webhook/*`       | Webhook handlers         |
| `GET`  | `/api/health`          | Health check             |

---

## Troubleshooting

### Database connection failed
- Pastikan MySQL/MariaDB sudah berjalan
- Cek konfigurasi `DB_*` di file `.env`
- Pastikan database sudah dibuat dan schema sudah di-import

### CORS Error di browser
- Pastikan `FRONTEND_URL` di `.env` sesuai dengan URL frontend yang berjalan
- Default: `http://localhost:5173`

### Token expired / 401 Unauthorized
- User akan otomatis redirect ke halaman login
- Sesuaikan `JWT_EXPIRES_IN` jika durasi terlalu pendek

---

## License

Private — All rights reserved.

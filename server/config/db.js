import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: "../.env" });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 2,
});

// Test connection
pool
  .getConnection()
  .then((conn) => {
    console.log("Database connected successfully");
    conn.release();
  })
  .catch((err) => {
    console.error(
      "Database connection failed: Coba periksa Koneksi nya lagi",
      err.message,
    );
  });

export default pool;

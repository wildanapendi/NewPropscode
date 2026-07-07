import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const maintenanceMiddleware = (req, res, next) => {
  const flagPath = path.resolve(__dirname, '../../.maintenance');
  const altFlagPath = path.resolve(__dirname, '../../.maintaince');
  const hasFlagFile = fs.existsSync(flagPath) || fs.existsSync(altFlagPath);
  const isMaintenanceEnv = process.env.MAINTENANCE_MODE === 'true';
  const isMaintenanceActive = hasFlagFile || isMaintenanceEnv;

  if (isMaintenanceActive) {
    // 1. Pengecualian rute: health check, login, dan file static uploads
    const isExcluded =
      req.path === '/api/health' ||
      req.path === '/api/auth/login' ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/api/uploads');

    // 2. Cek apakah ada token bypass
    const bypassToken = req.headers['x-maintenance-bypass'];
    const expectedBypass = process.env.MAINTENANCE_BYPASS_TOKEN;
    const isBypassed = bypassToken === expectedBypass;

    if (!isExcluded && !isBypassed) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: 'Situs sedang dalam pemeliharaan (maintenance) untuk meningkatkan performa. Kami akan segera kembali!'
      });
    }
  }

  next();
};

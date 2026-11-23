import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

import barangRoutes from './routes/barangRoutes.js';
import kategoriRoutes from './routes/kategoriRoutes.js';
import transaksiRoutes from './routes/transaksiRoutes.js';
import { getDashboard } from './controllers/barangController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public'); // folder PWA

const app = express();

app.use(cors());
app.use(express.json());

// ---------- REST API ----------
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Inventra API berjalan', data: { version: '1.0.0' } });
});
app.use('/api/barang', barangRoutes);
app.use('/api/categories', kategoriRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.get('/api/dashboard', getDashboard);

// Endpoint /api/... yang tidak ada
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// ---------- PWA (file statis di folder public) ----------
app.use(
  express.static(publicDir, {
    setHeaders: (res, filePath) => {
      // service worker tidak boleh di-cache browser agar update cepat terdeteksi
      if (filePath.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache');
    },
  })
);

// Halaman lain yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Halaman tidak ditemukan' });
});

// Error handler (misalnya JSON body tidak valid)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.type === 'entity.parse.failed' ? 'Format JSON tidak valid' : err.message || 'Terjadi kesalahan pada server',
  });
});

const PORT = process.env.PORT || 3000;

// Di Vercel app tidak perlu listen(); cukup di-export
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Inventra berjalan di http://localhost:${PORT}`));
}

export default app;

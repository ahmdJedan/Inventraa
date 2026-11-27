// Service Worker Inventra
// - App shell (HTML/CSS/JS) disimpan di cache agar aplikasi tetap terbuka saat offline.
// - Data inventaris (/api/...) TIDAK disimpan di cache: selalu diambil dari REST API.
const CACHE = 'inventra-v7';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/config.js',
  './js/api.js',
  './js/utils.js',
  './js/services/barangService.js',
  './js/services/kategoriService.js',
  './js/services/transaksiService.js',
  './js/pages/home.js',
  './js/pages/barang.js',
  './js/pages/barangDetail.js',
  './js/pages/barangForm.js',
  './js/pages/ruangan.js',
  './js/pages/ruanganDetail.js',
  './js/pages/kategori.js',
  './js/pages/kategoriDetail.js',
  './js/pages/kategoriForm.js',
  './js/pages/transaksi.js',
  './js/pages/transaksiDetail.js',
  './js/pages/transaksiForm.js',
  './js/pages/profile.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Hanya tangani GET untuk file aplikasi. Request ke /api TIDAK pernah di-cache
  // (data inventaris harus selalu terbaru dari server).
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api')) return;

  // Network-first: ambil versi terbaru, jika offline pakai cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        const salinan = res.clone();
        caches.open(CACHE).then((c) => c.put(req, salinan));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});

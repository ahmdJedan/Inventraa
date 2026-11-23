import { render as home } from './pages/home.js';
import { render as barang } from './pages/barang.js';
import { render as barangDetail } from './pages/barangDetail.js';
import { render as barangForm } from './pages/barangForm.js';
import { render as ruangan } from './pages/ruangan.js';
import { render as ruanganDetail } from './pages/ruanganDetail.js';
import { render as kategori } from './pages/kategori.js';
import { render as kategoriDetail } from './pages/kategoriDetail.js';
import { render as kategoriForm } from './pages/kategoriForm.js';
import { render as transaksi } from './pages/transaksi.js';
import { render as transaksiDetail } from './pages/transaksiDetail.js';
import { render as transaksiForm } from './pages/transaksiForm.js';
import { render as profile } from './pages/profile.js';

// Daftar route (urutan penting: "tambah" dan "edit" sebelum ":id")
const routes = [
  [/^\/?$/, home, 'home'],
  [/^\/barang$/, barang, 'barang'],
  [/^\/barang\/tambah$/, barangForm, 'barang'],
  [/^\/barang\/edit\/([^/]+)$/, barangForm, 'barang'],
  [/^\/barang\/([^/]+)$/, barangDetail, 'barang'],
  [/^\/ruangan$/, ruangan, 'ruangan'],
  [/^\/ruangan\/([^/]+)$/, ruanganDetail, 'ruangan'],
  [/^\/kategori$/, kategori, 'kategori'],
  [/^\/kategori\/tambah$/, kategoriForm, 'kategori'],
  [/^\/kategori\/edit\/([^/]+)$/, kategoriForm, 'kategori'],
  [/^\/kategori\/([^/]+)$/, kategoriDetail, 'kategori'],
  [/^\/transaksi$/, transaksi, 'transaksi'],
  [/^\/transaksi\/tambah$/, transaksiForm, 'transaksi'],
  [/^\/transaksi\/edit\/([^/]+)$/, transaksiForm, 'transaksi'],
  [/^\/transaksi\/([^/]+)$/, transaksiDetail, 'transaksi'],
  [/^\/profile$/, profile, 'profile'],
];

const view = document.getElementById('view');

function router() {
  const path = location.hash.replace(/^#/, '') || '/';

  for (const [pola, halaman, tab] of routes) {
    const cocok = path.match(pola);
    if (cocok) {
      const params = cocok.slice(1).map(decodeURIComponent);
      // Tandai menu aktif di sidebar (desktop) dan bottom nav (HP)
      document.querySelectorAll('[data-tab]').forEach((a) => {
        const juga = (a.dataset.also || '').split(' ');
        a.classList.toggle('active', a.dataset.tab === tab || juga.includes(tab));
      });
      window.scrollTo(0, 0);
      halaman(view, params);
      return;
    }
  }

  view.innerHTML = '<div class="state"><div class="big">🧭</div><p>Halaman tidak ditemukan.</p><a class="btn" href="#/">Ke Home</a></div>';
}

window.addEventListener('hashchange', router);
router();

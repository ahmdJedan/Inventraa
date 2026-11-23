import { BarangService } from '../services/barangService.js';
import { appbar, muat } from '../utils.js';

export function render(view) {
  view.innerHTML = appbar('Inventra') + `
    <main class="content">
      <section class="hero">
        <h2>Inventra</h2>
        <p>Sistem Inventaris Barang</p>
      </section>
      <div id="stat"></div>
      <h3 class="section-title">Akses Cepat</h3>
      <div class="shortcuts">
      <a class="card shortcut" href="#/barang"><span class="avatar soft">📦</span>
        <div><strong>Data Barang</strong><span>Lihat dan kelola barang</span></div><span class="chev">›</span></a>
      <a class="card shortcut" href="#/kategori"><span class="avatar soft">🗂️</span>
        <div><strong>Kategori</strong><span>Kelola kategori barang</span></div><span class="chev">›</span></a>
      </div>
    </main>`;

  const stat = view.querySelector('#stat');
  muat(
    stat,
    () => BarangService.getDashboard(),
    (d) => {
      stat.innerHTML = `<div class="stat-grid">
        ${kartu('Total Barang', d.total_barang, '📦', 'blue')}
        ${kartu('Kategori', d.total_kategori, '🗂️', 'indigo')}
        ${kartu('Barang Kondisi Baik', d.barang_kondisi_baik, '✅', 'green')}
        ${kartu('Barang Rusak', d.barang_rusak, '🛠️', 'red')}
      </div>`;
    },
    'Gagal mengambil data ringkasan.\nSilakan coba lagi.'
  );
}

function kartu(judul, nilai, ikon, warna) {
  return `<div class="card stat ${warna}"><span class="avatar">${ikon}</span>
    <strong>${Number(nilai) || 0}</strong><span class="muted">${judul}</span></div>`;
}

import { BarangService } from '../services/barangService.js';
import { appbar, muat, esc, kondisiClass, emptyView } from '../utils.js';

export function render(view) {
  view.innerHTML =
    appbar('Daftar Barang', {
      actions: `<a class="icon-btn" href="#/kategori" aria-label="Kategori" title="Kategori">🗂️</a>`,
    }) + `
    <main class="content">
      <input id="cari" class="search" type="search" placeholder="🔍 Cari barang" autocomplete="off" />
      <div id="daftar"></div>
    </main>
    <a class="fab" href="#/barang/tambah" aria-label="Tambah Barang">＋</a>`;

  const daftar = view.querySelector('#daftar');
  const cari = view.querySelector('#cari');
  let semua = [];

  function gambar() {
    const kata = cari.value.trim().toLowerCase();
    const data = semua.filter(
      (b) => b.nama_barang.toLowerCase().includes(kata) || b.kode_barang.toLowerCase().includes(kata)
    );
    if (data.length === 0) {
      daftar.innerHTML = emptyView(
        kata ? 'Barang tidak ditemukan.' : 'Belum ada data barang.\nTekan tombol + untuk menambah.'
      );
      return;
    }
    daftar.innerHTML = data
      .map(
        (b) => `<a class="card item" href="#/barang/${encodeURIComponent(b.id)}">
          <span class="avatar blue">📦</span>
          <div class="item-body">
            <strong>${esc(b.nama_barang)}</strong>
            <span>Kode: ${esc(b.kode_barang)}</span>
            <span>Jumlah: ${esc(b.jumlah)} ${esc(b.satuan)}</span>
            <span>Lokasi: ${esc(b.lokasi)}</span>
            <span class="chip ${kondisiClass(b.kondisi)}">Kondisi: ${esc(b.kondisi)}</span>
          </div><span class="chev">›</span></a>`
      )
      .join('');
  }

  muat(
    daftar,
    () => BarangService.getAll(),
    (data) => {
      semua = data;
      gambar();
    },
    'Gagal mengambil data barang.\nSilakan coba lagi.'
  );

  cari.addEventListener('input', gambar);
}

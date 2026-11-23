import { KategoriService } from '../services/kategoriService.js';
import { appbar, muat, esc, emptyView } from '../utils.js';

export function render(view) {
  view.innerHTML = appbar('Kategori', { back: '#/barang' }) + `
    <main class="content" id="daftar"></main>
    <a class="fab" href="#/kategori/tambah" aria-label="Tambah Kategori">＋</a>`;
  const daftar = view.querySelector('#daftar');

  muat(
    daftar,
    () => KategoriService.getAll(),
    (data) => {
      if (data.length === 0) {
        daftar.innerHTML = emptyView('Belum ada kategori.\nTekan tombol + untuk menambah.');
        return;
      }
      daftar.innerHTML = data
        .map(
          (k) => `<a class="card item" href="#/kategori/${encodeURIComponent(k.id)}">
            <span class="avatar soft">🗂️</span>
            <div class="item-body"><strong>${esc(k.name)}</strong>
              ${k.description ? `<span class="clamp">${esc(k.description)}</span>` : ''}</div>
            <span class="chev">›</span></a>`
        )
        .join('');
    },
    'Gagal mengambil data kategori.\nSilakan coba lagi.'
  );
}

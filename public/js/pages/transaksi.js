import { TransaksiService } from '../services/transaksiService.js';
import { appbar, muat, esc, formatTanggal, emptyView } from '../utils.js';

export function render(view) {
  view.innerHTML = appbar('Transaksi') + `
    <main class="content" id="daftar"></main>
    <a class="fab" href="#/transaksi/tambah" aria-label="Tambah Transaksi">＋</a>`;
  const daftar = view.querySelector('#daftar');

  muat(
    daftar,
    () => TransaksiService.getAll(),
    (data) => {
      if (data.length === 0) {
        daftar.innerHTML = emptyView('Belum ada transaksi.\nTekan tombol + untuk menambah.');
        return;
      }
      daftar.innerHTML = data
        .map((t) => {
          const masuk = t.jenis_transaksi === 'Barang Masuk';
          const b = t.barang || {};
          return `<a class="card item" href="#/transaksi/${encodeURIComponent(t.id)}">
            <span class="avatar ${masuk ? 'green' : 'red'}">${masuk ? '⬇️' : '⬆️'}</span>
            <div class="item-body">
              <span class="${masuk ? 'text-ok' : 'text-bad'} bold">${esc(t.jenis_transaksi)}</span>
              <strong>${esc(b.nama_barang || '-')}</strong>
              <span class="muted">${esc(formatTanggal(t.tanggal_transaksi))}</span>
            </div>
            <strong class="${masuk ? 'text-ok' : 'text-bad'}">${masuk ? '+' : '-'}${esc(t.jumlah)} ${esc(b.satuan || '')}</strong>
          </a>`;
        })
        .join('');
    },
    'Gagal mengambil data transaksi.\nSilakan coba lagi.'
  );
}

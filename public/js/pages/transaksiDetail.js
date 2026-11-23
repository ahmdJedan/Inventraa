import { TransaksiService } from '../services/transaksiService.js';
import { appbar, muat, detailRow, formatTanggal, konfirmasi, showSnack } from '../utils.js';

export function render(view, [id]) {
  view.innerHTML = appbar('Detail Transaksi', { back: '#/transaksi' }) + '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    () => TransaksiService.getById(id),
    (t) => {
      const masuk = t.jenis_transaksi === 'Barang Masuk';
      const b = t.barang || {};
      isi.innerHTML = `
        <div class="card detail">
          ${detailRow('Jenis Transaksi', t.jenis_transaksi)}
          ${detailRow('Nama Barang', b.nama_barang)}
          ${detailRow('Kode Barang', b.kode_barang)}
          ${detailRow('Jumlah', `${masuk ? '+' : '-'}${t.jumlah} ${b.satuan || ''}`)}
          ${detailRow('Tanggal', formatTanggal(t.tanggal_transaksi))}
          ${detailRow('Keterangan', t.keterangan)}
        </div>
        <div class="btn-row">
          <a class="btn btn-outline" href="#/transaksi/edit/${encodeURIComponent(t.id)}">✏️ Edit</a>
          <button class="btn btn-danger" id="hapus">🗑️ Hapus</button>
        </div>`;

      isi.querySelector('#hapus').addEventListener('click', async () => {
        const yakin = await konfirmasi(
          'Apakah Anda yakin ingin menghapus transaksi ini? Stok barang akan disesuaikan kembali.'
        );
        if (!yakin) return;
        try {
          await TransaksiService.delete(t.id);
          showSnack('Data transaksi berhasil dihapus');
          location.hash = '#/transaksi';
        } catch (err) {
          showSnack(err.message, true);
        }
      });
    },
    'Gagal mengambil detail transaksi.\nSilakan coba lagi.'
  );
}

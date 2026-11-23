import { BarangService } from '../services/barangService.js';
import { appbar, muat, esc, detailRow, formatTanggal, konfirmasi, showSnack } from '../utils.js';

export function render(view, [id]) {
  view.innerHTML = appbar('Detail Barang', { back: '#/barang' }) + '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    () => BarangService.getById(id),
    (b) => {
      isi.innerHTML = `
        <div class="card detail">
          ${detailRow('Nama Barang', b.nama_barang)}
          ${detailRow('Kode', b.kode_barang)}
          ${detailRow('Kategori', b.categories ? b.categories.name : '-')}
          ${detailRow('Jumlah', `${b.jumlah} ${b.satuan}`)}
          ${detailRow('Lokasi', b.lokasi)}
          ${detailRow('Kondisi', b.kondisi)}
          ${detailRow('Tanggal Masuk', formatTanggal(b.tanggal_masuk))}
          ${detailRow('Deskripsi', b.deskripsi)}
        </div>
        <div class="btn-row">
          <a class="btn btn-outline" href="#/barang/edit/${encodeURIComponent(b.id)}">✏️ Edit</a>
          <button class="btn btn-danger" id="hapus">🗑️ Hapus</button>
        </div>`;

      isi.querySelector('#hapus').addEventListener('click', async () => {
        if (!(await konfirmasi('Apakah Anda yakin ingin menghapus barang ini?'))) return;
        try {
          await BarangService.delete(b.id);
          showSnack('Data barang berhasil dihapus');
          location.hash = '#/barang'; // kembali ke halaman Barang (list dimuat ulang)
        } catch (err) {
          showSnack(err.message, true);
        }
      });
    },
    'Gagal mengambil detail barang.\nSilakan coba lagi.'
  );
}

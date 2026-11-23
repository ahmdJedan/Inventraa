import { KategoriService } from '../services/kategoriService.js';
import { BarangService } from '../services/barangService.js';
import { appbar, muat, esc, detailRow, konfirmasi, showSnack } from '../utils.js';

export function render(view, [id]) {
  view.innerHTML = appbar('Detail Kategori', { back: '#/kategori' }) + '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    async () => {
      const [kategori, semuaBarang] = await Promise.all([KategoriService.getById(id), BarangService.getAll()]);
      return { kategori, barang: semuaBarang.filter((b) => b.category_id === id) };
    },
    ({ kategori: k, barang }) => {
      isi.innerHTML = `
        <div class="card detail">
          ${detailRow('Nama Kategori', k.name)}
          ${detailRow('Deskripsi', k.description)}
          ${detailRow('Jumlah Jenis Barang', barang.length)}
        </div>
        <div class="btn-row">
          <a class="btn btn-outline" href="#/kategori/edit/${encodeURIComponent(k.id)}">✏️ Edit</a>
          <button class="btn btn-danger" id="hapus">🗑️ Hapus</button>
        </div>
        <h3 class="section-title">Barang dalam kategori ini</h3>
        ${
          barang.length === 0
            ? '<p class="muted">Belum ada barang pada kategori ini.</p>'
            : barang
                .map(
                  (b) => `<a class="card item" href="#/barang/${encodeURIComponent(b.id)}">
                    <div class="item-body"><strong>${esc(b.nama_barang)}</strong>
                      <span>${esc(b.kode_barang)} • ${esc(b.jumlah)} ${esc(b.satuan)}</span></div>
                    <span class="chev">›</span></a>`
                )
                .join('')
        }`;

      isi.querySelector('#hapus').addEventListener('click', async () => {
        if (!(await konfirmasi('Apakah Anda yakin ingin menghapus kategori ini?'))) return;
        try {
          await KategoriService.delete(k.id);
          showSnack('Data kategori berhasil dihapus');
          location.hash = '#/kategori';
        } catch (err) {
          showSnack(err.message, true); // mis. kategori masih dipakai barang
        }
      });
    },
    'Gagal mengambil detail kategori.\nSilakan coba lagi.'
  );
}

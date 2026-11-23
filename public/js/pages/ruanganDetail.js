import { BarangService } from '../services/barangService.js';
import { appbar, muat, esc, detailRow, kondisiClass } from '../utils.js';

export function render(view, [namaRuangan]) {
  const decodedNama = decodeURIComponent(namaRuangan || '');

  view.innerHTML =
    appbar('Detail Ruangan', { back: '#/ruangan' }) +
    '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    async () => {
      const semuaBarang = await BarangService.getAll();
      const barangDiRuangan = semuaBarang.filter((b) => b.lokasi === decodedNama);
      return { barang: barangDiRuangan };
    },
    ({ barang }) => {
      const totalJenis = barang.length;
      const totalUnit = barang.reduce((sum, b) => sum + (Number(b.jumlah) || 0), 0);
      const baik = barang.filter((b) => b.kondisi === 'Baik').length;
      const rusakRingan = barang.filter((b) => b.kondisi === 'Rusak Ringan').length;
      const rusakBerat = barang.filter((b) => b.kondisi === 'Rusak Berat').length;

      isi.innerHTML = `
        <div class="card detail">
          ${detailRow('Nama Ruangan', decodedNama)}
          ${detailRow('Total Jenis Barang', totalJenis)}
          ${detailRow('Total Unit Fisik', `${totalUnit} unit`)}
          ${detailRow('Kondisi Baik', `${baik} barang`)}
          ${detailRow('Kondisi Rusak Ringan', `${rusakRingan} barang`)}
          ${detailRow('Kondisi Rusak Berat', `${rusakBerat} barang`)}
        </div>

        <h3 class="section-title">Daftar Barang di ${esc(decodedNama)}</h3>
        ${
          barang.length === 0
            ? '<p class="muted">Belum ada barang yang tercatat di ruangan ini.</p>'
            : barang
                .map(
                  (b) => `<a class="card item" href="#/barang/${encodeURIComponent(b.id)}">
                    <span class="avatar blue">📦</span>
                    <div class="item-body">
                      <strong>${esc(b.nama_barang)}</strong>
                      <span>Kode: ${esc(b.kode_barang)} • Jumlah: ${esc(b.jumlah)} ${esc(b.satuan)}</span>
                      <span class="chip ${kondisiClass(b.kondisi)}">Kondisi: ${esc(b.kondisi)}</span>
                    </div>
                    <span class="chev">›</span>
                  </a>`
                )
                .join('')
        }
      `;
    },
    'Gagal mengambil detail ruangan.\nSilakan coba lagi.'
  );
}

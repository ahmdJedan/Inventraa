import { BarangService } from '../services/barangService.js';
import { appbar, muat, esc, emptyView } from '../utils.js';

export function render(view) {
  view.innerHTML =
    appbar('Ruangan Gedung') +
    `
    <main class="content">
      <input id="cari" class="search" type="search" placeholder="🔍 Cari ruangan dalam gedung" autocomplete="off" />
      <div id="daftar"></div>
    </main>`;

  const daftar = view.querySelector('#daftar');
  const cari = view.querySelector('#cari');
  let dataRuangan = [];

  function gambar() {
    const kata = cari.value.trim().toLowerCase();
    const difilter = dataRuangan.filter((r) => r.nama.toLowerCase().includes(kata));

    if (difilter.length === 0) {
      daftar.innerHTML = emptyView(kata ? 'Ruangan tidak ditemukan.' : 'Belum ada data ruangan.');
      return;
    }

    daftar.innerHTML = difilter
      .map(
        (r) => `<a class="card item" href="#/ruangan/${encodeURIComponent(r.nama)}">
          <span class="avatar soft">🏢</span>
          <div class="item-body">
            <strong>${esc(r.nama)}</strong>
            <span>${esc(r.totalJenis)} jenis barang • Total ${esc(r.totalUnit)} unit</span>
            ${
              r.rusak > 0
                ? `<span class="chip bad">${esc(r.rusak)} barang perlu perbaikan</span>`
                : `<span class="chip ok">${esc(r.baik)} kondisi baik</span>`
            }
          </div>
          <span class="chev">›</span>
        </a>`
      )
      .join('');
  }

  muat(
    daftar,
    async () => {
      const [lokasiList, semuaBarang] = await Promise.all([
        BarangService.getLokasi().catch(() => []),
        BarangService.getAll().catch(() => []),
      ]);

      // Gabungkan daftar lokasi standar dan lokasi barang yang ada
      const daftarNamaLokasi = Array.from(
        new Set([...(Array.isArray(lokasiList) ? lokasiList : []), ...semuaBarang.map((b) => b.lokasi).filter(Boolean)])
      );

      dataRuangan = daftarNamaLokasi.map((nama) => {
        const barangDiRuangan = semuaBarang.filter((b) => b.lokasi === nama);
        const totalJenis = barangDiRuangan.length;
        const totalUnit = barangDiRuangan.reduce((sum, b) => sum + (Number(b.jumlah) || 0), 0);
        const baik = barangDiRuangan.filter((b) => b.kondisi === 'Baik').length;
        const rusak = barangDiRuangan.filter((b) => b.kondisi && b.kondisi !== 'Baik').length;

        return {
          nama,
          totalJenis,
          totalUnit,
          baik,
          rusak,
        };
      });

      gambar();
    },
    'Gagal mengambil data ruangan gedung.\nSilakan coba lagi.'
  );

  cari.addEventListener('input', gambar);
}

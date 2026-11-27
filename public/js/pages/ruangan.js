import { BarangService } from '../services/barangService.js';
import { appbar, muat, esc, emptyView } from '../utils.js';

export function render(view) {
  view.innerHTML =
    appbar('Ruangan Gedung') +
    `
    <main class="content">
      <input id="cari" class="search" type="search" placeholder="🔍 Cari nama ruangan atau nama barang..." autocomplete="off" />
      <div id="daftar"></div>
    </main>`;

  const daftar = view.querySelector('#daftar');
  const cari = view.querySelector('#cari');
  let dataRuangan = [];

  function gambar() {
    const kata = cari.value.trim().toLowerCase();
    const difilter = dataRuangan.filter((r) => {
      if (!kata) return true;
      const matchRuang = r.nama.toLowerCase().includes(kata);
      const matchBarang = r.daftarBarang.some(
        (b) =>
          (b.nama_barang && b.nama_barang.toLowerCase().includes(kata)) ||
          (b.kode_barang && b.kode_barang.toLowerCase().includes(kata))
      );
      return matchRuang || matchBarang;
    });

    if (difilter.length === 0) {
      daftar.innerHTML = emptyView(
        kata ? `Ruangan atau barang "${esc(kata)}" tidak ditemukan.` : 'Belum ada data ruangan.'
      );
      return;
    }

    daftar.innerHTML = difilter
      .map((r) => {
        let matchInfo = '';
        if (kata && !r.nama.toLowerCase().includes(kata)) {
          const itemCocok = r.daftarBarang
            .filter(
              (b) =>
                (b.nama_barang && b.nama_barang.toLowerCase().includes(kata)) ||
                (b.kode_barang && b.kode_barang.toLowerCase().includes(kata))
            )
            .map((b) => esc(b.nama_barang))
            .slice(0, 3)
            .join(', ');
          if (itemCocok) {
            matchInfo = `<small class="muted" style="margin-top:2px; display:block;">🔍 Ditemukan: ${itemCocok}</small>`;
          }
        }

        return `<a class="card item" href="#/ruangan/${encodeURIComponent(r.nama)}">
          <span class="avatar soft">🏢</span>
          <div class="item-body">
            <strong>${esc(r.nama)}</strong>
            <span>${esc(r.totalJenis)} jenis barang • Total ${esc(r.totalUnit)} unit</span>
            ${
              r.rusak > 0
                ? `<span class="chip bad">${esc(r.rusak)} barang perlu perbaikan</span>`
                : `<span class="chip ok">${esc(r.baik)} kondisi baik</span>`
            }
            ${matchInfo}
          </div>
          <span class="chev">›</span>
        </a>`;
      })
      .join('');
  }

  muat(
    daftar,
    async () => {
      const [lokasiList, semuaBarang] = await Promise.all([
        BarangService.getLokasi().catch(() => []),
        BarangService.getAll().catch(() => []),
      ]);

      const daftarNamaLokasi = Array.from(
        new Set([
          ...(Array.isArray(lokasiList) ? lokasiList : []),
          ...(Array.isArray(semuaBarang) ? semuaBarang.map((b) => b.lokasi).filter(Boolean) : []),
        ])
      );

      return {
        daftarNamaLokasi,
        semuaBarang: Array.isArray(semuaBarang) ? semuaBarang : [],
      };
    },
    ({ daftarNamaLokasi, semuaBarang }) => {
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
          daftarBarang: barangDiRuangan,
        };
      });

      gambar();
    },
    'Gagal mengambil data ruangan gedung.\nSilakan coba lagi.'
  );

  cari.addEventListener('input', gambar);
}

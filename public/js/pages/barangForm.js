import { BarangService } from '../services/barangService.js';
import { KategoriService } from '../services/kategoriService.js';
import { appbar, muat, field, textareaField, selectField, tampilErrors, showSnack, hariIni } from '../utils.js';

const KONDISI = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

export function render(view, [id]) {
  const isEdit = Boolean(id);
  view.innerHTML =
    appbar(isEdit ? 'Edit Barang' : 'Tambah Barang', { back: isEdit ? `#/barang/${encodeURIComponent(id)}` : '#/barang' }) +
    '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    async () => {
      const [kategori, barang, kode, lokasi] = await Promise.all([
        KategoriService.getAll(),
        isEdit ? BarangService.getById(id) : Promise.resolve(null),
        isEdit ? Promise.resolve(null) : BarangService.getKodeBerikutnya(), // pratinjau kode otomatis
        BarangService.getLokasi(), // pilihan lokasi dari server
      ]);
      return { kategori, barang, kode: kode ? kode.kode_barang : '', lokasi };
    },
    ({ kategori, barang, kode, lokasi }) => tampilForm(isi, kategori, barang, kode, lokasi),
    'Gagal mengambil data.\nSilakan coba lagi.'
  );
}

function tampilForm(isi, kategori, b, kodeBaru, daftarLokasi) {
  const v = b || { satuan: 'Unit', kondisi: 'Baik', tanggal_masuk: hariIni() };

  isi.innerHTML = `<form id="form" novalidate class="form form-2col">
    ${field({
      name: 'kode_barang',
      label: b ? 'Kode Barang' : 'Kode Barang (otomatis)',
      value: b ? v.kode_barang : kodeBaru,
      extra: 'readonly tabindex="-1"', // tidak bisa diketik; dibuat otomatis oleh server
    })}
    ${field({ name: 'nama_barang', label: 'Nama Barang', value: v.nama_barang })}
    ${textareaField({ name: 'deskripsi', label: 'Deskripsi (opsional)', value: v.deskripsi })}
    ${selectField({
      name: 'category_id',
      label: 'Kategori',
      options: kategori.map((k) => ({ value: k.id, label: k.name })),
      value: v.category_id,
      placeholder: '-- Pilih kategori --',
    })}
    ${selectField({
      name: 'lokasi',
      label: 'Lokasi (di dalam gedung)',
      options: daftarLokasi.map((l) => ({ value: l, label: l })),
      value: v.lokasi,
      placeholder: '-- Pilih lokasi --',
    })}
    ${selectField({
      name: 'kondisi',
      label: 'Kondisi',
      options: KONDISI.map((k) => ({ value: k, label: k })),
      value: v.kondisi,
      placeholder: '-- Pilih kondisi --',
    })}
    <div class="two">
      ${field({ name: 'jumlah', label: 'Jumlah', type: 'number', value: v.jumlah ?? '', extra: 'inputmode="numeric" min="0"' })}
      ${field({ name: 'satuan', label: 'Satuan', value: v.satuan })}
    </div>
    ${field({ name: 'tanggal_masuk', label: 'Tanggal Masuk', type: 'date', value: (v.tanggal_masuk || '').slice(0, 10) })}
    <button class="btn btn-primary" type="submit" id="simpan">💾 Simpan</button>
  </form>`;

  const form = isi.querySelector('#form');
  const tombol = isi.querySelector('#simpan');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const errors = validasi(d);
    tampilErrors(form, errors);
    if (Object.keys(errors).length) return;

    const payload = {
      nama_barang: d.nama_barang.trim(),
      deskripsi: d.deskripsi.trim() || null,
      category_id: d.category_id,
      lokasi: d.lokasi.trim(),
      kondisi: d.kondisi,
      jumlah: Number(d.jumlah),
      satuan: d.satuan.trim() || 'Unit',
      tanggal_masuk: d.tanggal_masuk || null,
    };

    tombol.disabled = true;
    tombol.textContent = 'Menyimpan...';
    try {
      if (b) {
        await BarangService.update(b.id, payload);
        showSnack('Data barang berhasil diubah');
        location.hash = `#/barang/${encodeURIComponent(b.id)}`;
      } else {
        const baru = await BarangService.create(payload);
        showSnack(`Data barang berhasil ditambahkan (kode: ${baru && baru.kode_barang ? baru.kode_barang : '-'})`);
        location.hash = '#/barang';
      }
    } catch (err) {
      showSnack(err.message, true);
      tombol.disabled = false;
      tombol.textContent = '💾 Simpan';
    }
  });
}

function validasi(d) {
  const e = {};
  if (!d.nama_barang.trim()) e.nama_barang = 'Nama barang tidak boleh kosong.';
  if (!d.category_id) e.category_id = 'Kategori wajib dipilih.';
  if (!d.lokasi) e.lokasi = 'Lokasi wajib dipilih.';
  if (!d.kondisi) e.kondisi = 'Kondisi wajib dipilih.';

  if (d.jumlah === '') e.jumlah = 'Jumlah tidak boleh kosong.';
  else if (!Number.isInteger(Number(d.jumlah))) e.jumlah = 'Jumlah harus berupa angka bulat.';
  else if (Number(d.jumlah) < 0) e.jumlah = 'Jumlah tidak boleh negatif.';
  return e;
}

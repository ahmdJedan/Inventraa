import { TransaksiService } from '../services/transaksiService.js';
import { BarangService } from '../services/barangService.js';
import {
  appbar, muat, field, textareaField, selectField, tampilErrors, showSnack, hariIni, emptyView, esc,
} from '../utils.js';

const JENIS = ['Barang Masuk', 'Barang Keluar'];

export function render(view, [id]) {
  const isEdit = Boolean(id);
  view.innerHTML =
    appbar(isEdit ? 'Edit Transaksi' : 'Tambah Transaksi', {
      back: isEdit ? `#/transaksi/${encodeURIComponent(id)}` : '#/transaksi',
    }) + '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    async () => {
      const [barang, transaksi] = await Promise.all([
        BarangService.getAll(),
        isEdit ? TransaksiService.getById(id) : Promise.resolve(null),
      ]);
      return { barang, transaksi };
    },
    ({ barang, transaksi }) => {
      if (barang.length === 0) {
        isi.innerHTML = emptyView('Belum ada barang.\nTambahkan barang terlebih dahulu.');
        return;
      }
      tampilForm(isi, barang, transaksi);
    },
    'Gagal mengambil data barang.\nSilakan coba lagi.'
  );
}

function tampilForm(isi, daftarBarang, t) {
  const v = t || { tanggal_transaksi: hariIni() };

  // Stok yang tersedia untuk transaksi keluar (saat edit: stok tanpa transaksi ini)
  const stokTersedia = (b) => {
    if (!t) return b.jumlah;
    return b.jumlah - (t.jenis_transaksi === 'Barang Masuk' ? t.jumlah : -t.jumlah);
  };

  isi.innerHTML = `<form id="form" novalidate class="form">
    ${selectField({
      name: 'barang_id',
      label: 'Barang',
      options: daftarBarang.map((b) => ({ value: b.id, label: `${b.nama_barang} (stok: ${b.jumlah})` })),
      value: v.barang_id,
      placeholder: '-- Pilih barang --',
      disabled: Boolean(t), // barang tidak dapat diganti saat edit
    })}
    <small class="muted" id="stok-info"></small>
    ${selectField({
      name: 'jenis_transaksi',
      label: 'Jenis Transaksi',
      options: JENIS.map((j) => ({ value: j, label: j })),
      value: v.jenis_transaksi,
      placeholder: '-- Pilih jenis --',
    })}
    ${field({ name: 'jumlah', label: 'Jumlah', type: 'number', value: v.jumlah ?? '', extra: 'inputmode="numeric" min="1"' })}
    ${textareaField({ name: 'keterangan', label: 'Keterangan (opsional)', value: v.keterangan, rows: 2 })}
    ${field({ name: 'tanggal_transaksi', label: 'Tanggal Transaksi', type: 'date', value: (v.tanggal_transaksi || '').slice(0, 10) })}
    <button class="btn btn-primary" type="submit" id="simpan">💾 Simpan</button>
  </form>`;

  const form = isi.querySelector('#form');
  const tombol = isi.querySelector('#simpan');
  const info = isi.querySelector('#stok-info');
  const barangId = () => (t ? t.barang_id : form.elements.barang_id.value);
  const barangTerpilih = () => daftarBarang.find((b) => b.id === barangId());

  function updateInfo() {
    const b = barangTerpilih();
    info.textContent = b ? `Stok saat ini: ${b.jumlah} ${b.satuan}` : '';
  }
  updateInfo();
  form.elements.barang_id.addEventListener('change', updateInfo);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const b = barangTerpilih();
    const errors = {};

    if (!b) errors.barang_id = 'Barang wajib dipilih.';
    if (!d.jenis_transaksi) errors.jenis_transaksi = 'Jenis transaksi wajib dipilih.';

    if (d.jumlah === '') errors.jumlah = 'Jumlah tidak boleh kosong.';
    else if (!Number.isInteger(Number(d.jumlah))) errors.jumlah = 'Jumlah harus berupa angka bulat.';
    else if (Number(d.jumlah) <= 0) errors.jumlah = 'Jumlah harus lebih dari 0.';
    else if (d.jenis_transaksi === 'Barang Keluar' && b && Number(d.jumlah) > stokTersedia(b)) {
      errors.jumlah = `Barang keluar tidak boleh melebihi stok (tersedia: ${stokTersedia(b)}).`;
    }

    tampilErrors(form, errors);
    if (Object.keys(errors).length) return;

    const payload = {
      barang_id: b.id,
      jenis_transaksi: d.jenis_transaksi,
      jumlah: Number(d.jumlah),
      keterangan: d.keterangan.trim() || null,
      tanggal_transaksi: d.tanggal_transaksi || null,
    };

    tombol.disabled = true;
    tombol.textContent = 'Menyimpan...';
    try {
      if (t) {
        await TransaksiService.update(t.id, payload);
        showSnack('Data transaksi berhasil diubah');
        location.hash = `#/transaksi/${encodeURIComponent(t.id)}`;
      } else {
        await TransaksiService.create(payload);
        showSnack('Data transaksi berhasil ditambahkan');
        location.hash = '#/transaksi';
      }
    } catch (err) {
      showSnack(err.message, true); // mis. "Stok tidak mencukupi. Stok tersedia: 5 ..."
      tombol.disabled = false;
      tombol.textContent = '💾 Simpan';
    }
  });
}

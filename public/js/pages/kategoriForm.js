import { KategoriService } from '../services/kategoriService.js';
import { appbar, muat, field, textareaField, tampilErrors, showSnack } from '../utils.js';

export function render(view, [id]) {
  const isEdit = Boolean(id);
  view.innerHTML =
    appbar(isEdit ? 'Edit Kategori' : 'Tambah Kategori', {
      back: isEdit ? `#/kategori/${encodeURIComponent(id)}` : '#/kategori',
    }) + '<main class="content" id="isi"></main>';
  const isi = view.querySelector('#isi');

  muat(
    isi,
    () => (isEdit ? KategoriService.getById(id) : Promise.resolve(null)),
    (k) => tampilForm(isi, k),
    'Gagal mengambil data kategori.\nSilakan coba lagi.'
  );
}

function tampilForm(isi, k) {
  isi.innerHTML = `<form id="form" novalidate class="form">
    ${field({ name: 'name', label: 'Nama Kategori', value: k ? k.name : '' })}
    ${textareaField({ name: 'description', label: 'Deskripsi (opsional)', value: k ? k.description : '' })}
    <button class="btn btn-primary" type="submit" id="simpan">💾 Simpan</button>
  </form>`;

  const form = isi.querySelector('#form');
  const tombol = isi.querySelector('#simpan');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const errors = {};
    if (!d.name.trim()) errors.name = 'Nama kategori tidak boleh kosong.';
    tampilErrors(form, errors);
    if (Object.keys(errors).length) return;

    const payload = { name: d.name.trim(), description: d.description.trim() || null };
    tombol.disabled = true;
    tombol.textContent = 'Menyimpan...';
    try {
      if (k) {
        await KategoriService.update(k.id, payload);
        showSnack('Data kategori berhasil diubah');
        location.hash = `#/kategori/${encodeURIComponent(k.id)}`;
      } else {
        await KategoriService.create(payload);
        showSnack('Data kategori berhasil ditambahkan');
        location.hash = '#/kategori';
      }
    } catch (err) {
      showSnack(err.message, true);
      tombol.disabled = false;
      tombol.textContent = '💾 Simpan';
    }
  });
}

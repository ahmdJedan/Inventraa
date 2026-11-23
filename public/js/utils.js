// Fungsi bantu yang dipakai oleh semua halaman

/** Escape HTML — WAJIB dipakai untuk setiap data dari API yang dimasukkan ke innerHTML */
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** "2026-11-19" -> "19 November 2026" */
export function formatTanggal(iso) {
  if (!iso) return '-';
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  if (isNaN(d)) return String(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Tanggal hari ini (zona waktu lokal) dalam format yyyy-mm-dd */
export function hariIni() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const kondisiClass = (k) => (k === 'Baik' ? 'ok' : k === 'Rusak Ringan' ? 'warn' : 'bad');

/** App bar. back = href tombol kembali, actions = HTML tombol aksi (opsional) */
export function appbar(title, { back = null, actions = '' } = {}) {
  return `<header class="appbar">
    ${back ? `<a class="icon-btn" href="${esc(back)}" aria-label="Kembali">←</a>` : '<span class="icon-btn spacer"></span>'}
    <h1>${esc(title)}</h1>
    <div class="appbar-actions">${actions || '<span class="icon-btn spacer"></span>'}</div>
  </header>`;
}

// ---------- State: Loading / Error / Empty ----------
export const loadingView = () =>
  `<div class="state"><div class="spinner"></div><p>Loading...</p></div>`;

export const errorView = (pesan, detail = '') =>
  `<div class="state"><div class="big">☁️</div>
    <p class="state-title">${esc(pesan).replace(/\n/g, '<br>')}</p>
    ${detail ? `<p class="muted">${esc(detail)}</p>` : ''}
    <button class="btn" data-retry>↻ Coba Lagi</button></div>`;

export const emptyView = (pesan) =>
  `<div class="state"><div class="big">📭</div><p class="muted">${esc(pesan).replace(/\n/g, '<br>')}</p></div>`;

/**
 * Pola standar setiap request: Loading -> Success / Error (dengan tombol Coba Lagi).
 * ambil()  : fungsi async yang mengambil data dari API
 * tampil() : fungsi yang menggambar data ke container
 */
export async function muat(container, ambil, tampil, pesanError) {
  container.innerHTML = loadingView();
  try {
    const data = await ambil();
    tampil(data);
  } catch (err) {
    container.innerHTML = errorView(pesanError, err.message);
    const tombol = container.querySelector('[data-retry]');
    if (tombol) tombol.addEventListener('click', () => muat(container, ambil, tampil, pesanError));
  }
}

// ---------- Snackbar ----------
let snackTimer;
export function showSnack(pesan, error = false) {
  const el = document.getElementById('snack');
  el.textContent = pesan;
  el.className = 'snack show' + (error ? ' error' : '');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => (el.className = 'snack'), 3500);
}

// ---------- Dialog konfirmasi ----------
export function konfirmasi(pesan) {
  return new Promise((resolve) => {
    const dlg = document.createElement('dialog');
    dlg.className = 'dialog';
    dlg.innerHTML = `<p>${esc(pesan)}</p>
      <div class="dialog-actions">
        <button class="btn btn-text" value="batal">Batal</button>
        <button class="btn btn-text danger" value="hapus">Hapus</button>
      </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) dlg.close(b.value);
    });
    dlg.addEventListener('close', () => {
      const ok = dlg.returnValue === 'hapus';
      dlg.remove();
      resolve(ok);
    });
    dlg.showModal();
  });
}

// ---------- Helper form ----------
export function field({ name, label, type = 'text', value = '', placeholder = '', extra = '' }) {
  return `<div class="field"><label for="f-${name}">${esc(label)}</label>
    <input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${extra} />
    <small class="err" data-err="${name}"></small></div>`;
}

export function textareaField({ name, label, value = '', rows = 3 }) {
  return `<div class="field"><label for="f-${name}">${esc(label)}</label>
    <textarea id="f-${name}" name="${name}" rows="${rows}">${esc(value)}</textarea>
    <small class="err" data-err="${name}"></small></div>`;
}

export function selectField({ name, label, options, value = '', placeholder = '-- Pilih --', disabled = false }) {
  const opsi = options
    .map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(value) ? 'selected' : ''}>${esc(o.label)}</option>`)
    .join('');
  return `<div class="field"><label for="f-${name}">${esc(label)}</label>
    <select id="f-${name}" name="${name}" ${disabled ? 'disabled' : ''}>
      <option value="">${esc(placeholder)}</option>${opsi}</select>
    <small class="err" data-err="${name}"></small></div>`;
}

/** Tampilkan pesan error validasi di bawah masing-masing input */
export function tampilErrors(form, errors) {
  form.querySelectorAll('[data-err]').forEach((el) => {
    const pesan = errors[el.dataset.err] || '';
    el.textContent = pesan;
    const input = form.elements[el.dataset.err];
    if (input) input.classList.toggle('invalid', !!pesan);
  });
}

export const detailRow = (label, value) =>
  `<div class="row"><span class="label">${esc(label)}</span><span class="value">${esc(value === '' || value == null ? '-' : value)}</span></div>`;

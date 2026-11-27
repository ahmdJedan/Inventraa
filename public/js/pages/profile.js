import { appbar, esc, showSnack } from '../utils.js';
import { BASE_URL, getStoredApiUrl, setApiUrl } from '../config.js';

export function render(view) {
  const teknologi = [
    'Android APK',
    'Progressive Web App',
    'JavaScript',
    'Node.js',
    'Express.js',
    'Supabase',
    'REST API',
  ];

  view.innerHTML =
    appbar('Profile') +
    `
    <main class="content narrow">
      <section class="hero center">
        <div class="logo">📦</div>
        <h2 class="spaced">INVENTRA</h2>
        <p>Sistem Inventaris Barang Di Gedung</p>
      </section>

      <div class="card detail">
        <div class="row"><span class="label">Nama</span><span class="value">Ahmad Zaydan Iswandi</span></div>
        <div class="row"><span class="label">NIM</span><span class="value">21120124130079</span></div>
        <div class="row"><span class="label">Teknologi</span>
          <span class="chips">${teknologi.map((t) => `<span class="chip soft">${esc(t)}</span>`).join('')}</span></div>
      </div>

      <div class="card detail">
        <strong>Pengaturan Server API (Khusus APK)</strong>
        <p class="muted" style="margin: 6px 0 12px; font-size: 13px;">
          Di aplikasi Android (APK), Anda dapat mengarahkan URL API ke backend Vercel atau IP komputer lokal (misal: <code>http://192.168.1.10:3000/api</code>).
        </p>
        <div class="field">
          <label for="server-url">URL Server API:</label>
          <input id="server-url" class="search" style="margin-top:6px; width:100%;" type="text" value="${esc(
            getStoredApiUrl() || BASE_URL
          )}" placeholder="https://contoh-app.vercel.app/api atau /api" />
        </div>
        <div class="btn-row" style="margin-top: 10px;">
          <button class="btn btn-outline" id="btn-reset-api">Reset Default</button>
          <button class="btn" id="btn-simpan-api">Simpan URL</button>
        </div>
      </div>

      <div class="card detail">
        <strong>Tentang Aplikasi</strong>
        <p>Inventra membantu organisasi, laboratorium, kantor, atau kampus mengelola barang
        inventaris di dalam gedung: mencatat barang dan kategori, memantau kondisi dan stok per ruangan, serta mempermudah audit fisik barang. Seluruh data diambil dari REST API
        (Express.js + Supabase) dan dapat dijalankan via PWA maupun aplikasi Android (.apk).</p>
      </div>
    </main>`;

  const inputUrl = view.querySelector('#server-url');
  const btnSimpan = view.querySelector('#btn-simpan-api');
  const btnReset = view.querySelector('#btn-reset-api');

  btnSimpan.addEventListener('click', () => {
    const val = inputUrl.value.trim();
    setApiUrl(val);
    showSnack('URL Server API berhasil disimpan!');
    setTimeout(() => location.reload(), 600);
  });

  btnReset.addEventListener('click', () => {
    setApiUrl('');
    inputUrl.value = '/api';
    showSnack('URL Server API dikembalikan ke default!');
    setTimeout(() => location.reload(), 600);
  });
}

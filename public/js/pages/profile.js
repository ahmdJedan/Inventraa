import { appbar, esc, showSnack } from '../utils.js';
import {
  SUPABASE_URL,
  getApiMode,
  getCustomApiUrl,
  setApiConfig,
} from '../config.js';

export function render(view) {
  const teknologi = [
    'Android APK',
    'Capacitor',
    'Progressive Web App',
    'JavaScript',
    'Supabase Cloud',
    'PostgreSQL',
    'Node.js & Express',
    'REST API',
  ];

  const currentMode = getApiMode();
  const currentCustomUrl = getCustomApiUrl();

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
        <strong>Status Koneksi Database (APK & Web)</strong>
        <p class="muted" style="margin: 6px 0 10px; font-size: 13px;">
          Aplikasi telah dikonfigurasi agar dapat terhubung langsung ke cloud database Supabase tanpa harus menyalakan server komputer lokal.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 13px; color: #166534;">
          <strong>🟢 Status:</strong> ${currentMode === 'supabase'
      ? 'Terhubung langsung ke Supabase Cloud Database'
      : currentCustomUrl
        ? `Server Kustom (${esc(currentCustomUrl)})`
        : 'Otomatis (Express API dengan Fallback Supabase)'
    }
          <div style="margin-top: 4px; font-size: 12px; color: #15803d; word-break: break-all;">
            Target Host: ${esc(currentCustomUrl || SUPABASE_URL)}
          </div>
        </div>

        <div class="field">
          <label for="select-mode">Mode Koneksi:</label>
          <select id="select-mode" style="margin-top: 4px; width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);">
            <option value="supabase" ${currentMode === 'supabase' ? 'selected' : ''}>
              🟢 Supabase Cloud (Rekomendasi untuk APK - Selalu Online)
            </option>
            <option value="auto" ${currentMode === 'auto' ? 'selected' : ''}>
              🔄 Otomatis (Coba Server Express, fallback Supabase)
            </option>
            <option value="custom" ${currentMode === 'custom' ? 'selected' : ''}>
              ⚙️ Server Express / Vercel Kustom
            </option>
          </select>
        </div>

        <div class="field" id="box-custom-url" style="margin-top: 10px; ${currentMode === 'custom' ? '' : 'display: none;'}">
          <label for="server-url">URL Server API (opsional):</label>
          <input id="server-url" class="search" style="margin-top:6px; width:100%;" type="text" value="${esc(
      currentCustomUrl
    )}" placeholder="https://contoh.vercel.app/api atau http://192.168.1.10:3000/api" />
        </div>

        <div class="btn-row" style="margin-top: 12px;">
          <button class="btn btn-outline" id="btn-reset-api">Kembalikan ke Default</button>
          <button class="btn" id="btn-simpan-api">Simpan Pengaturan</button>
        </div>
      </div>

      <div class="card detail">
        <strong>Tentang Aplikasi</strong>
        <p>Inventra membantu organisasi, laboratorium, kantor, atau kampus mengelola barang
        inventaris di dalam gedung: mencatat barang dan kategori, memantau kondisi dan stok per ruangan, serta mempermudah audit fisik barang. Seluruh data tersimpan aman di database Supabase Cloud.</p>
      </div>
    </main>`;

  const selectMode = view.querySelector('#select-mode');
  const boxCustom = view.querySelector('#box-custom-url');
  const inputUrl = view.querySelector('#server-url');
  const btnSimpan = view.querySelector('#btn-simpan-api');
  const btnReset = view.querySelector('#btn-reset-api');

  selectMode.addEventListener('change', () => {
    boxCustom.style.display = selectMode.value === 'custom' ? 'block' : 'none';
  });

  btnSimpan.addEventListener('click', () => {
    const mode = selectMode.value;
    const url = inputUrl.value.trim();
    setApiConfig(mode, url);
    showSnack('Pengaturan koneksi berhasil disimpan!');
    setTimeout(() => location.reload(), 600);
  });

  btnReset.addEventListener('click', () => {
    setApiConfig('supabase', '');
    showSnack('Koneksi dikembalikan ke Supabase Cloud (Default)!');
    setTimeout(() => location.reload(), 600);
  });
}

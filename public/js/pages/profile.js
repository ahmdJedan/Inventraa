import { appbar, esc } from '../utils.js';

export function render(view) {
  const teknologi = ['Progressive Web App', 'JavaScript', 'Node.js', 'Express.js', 'Supabase', 'REST API'];

  view.innerHTML = appbar('Profile') + `
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
        <strong>Tentang Aplikasi</strong>
        <p>Inventra membantu organisasi, laboratorium, kantor, atau kampus mengelola barang
        inventaris: mencatat barang dan kategori, memantau kondisi dan stok, serta mencatat
        transaksi barang masuk dan barang keluar. Seluruh data diambil dari REST API
        (Express.js + Supabase) dan aplikasi dapat dipasang ke layar utama perangkat.</p>
      </div>
    </main>`;
}

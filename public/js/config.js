// Konfigurasi API & Supabase Database untuk Inventra

// Supabase Cloud Credentials (Publishable anon key - aman untuk client/APK)
export const SUPABASE_URL = "https://nhxeqxlxlspkxwdahzzl.supabase.co";
export const SUPABASE_KEY = "sb_publishable_ZXkHQgs00cvWvKLilnlRIQ_h3Kak09s";

// Daftar ruangan resmi di dalam gedung kantor
export const DAFTAR_LOKASI = [
  'Lobby / Resepsionis',
  'Ruang Kerja',
  'Ruang Rapat',
  'Ruang Direktur',
  'Ruang Server',
  'Ruang Arsip',
  'Gudang',
  'Pantry',
  'Toilet',
  'Mushola',
  'Ruang Istirahat',
  'Koridor',
];

/**
 * Mengetahui mode koneksi API:
 * - 'supabase': Terhubung langsung ke Supabase Cloud (Default & Rekomendasi di APK Android)
 * - 'custom'  : Menggunakan server Express / Vercel eksternal
 * - 'auto'    : Mencoba Express /api terlebih dahulu, otomatis fallback ke Supabase
 */
export function getApiMode() {
  const customMode = localStorage.getItem('INVENTRA_API_MODE');
  if (customMode) return customMode;

  // Di APK Android (Capacitor/WebView), langsung gunakan Supabase Cloud agar 100% online
  const isApk =
    typeof window !== 'undefined' &&
    (window.Capacitor != null ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && !window.location.port));

  return isApk ? 'supabase' : 'auto';
}

export function getCustomApiUrl() {
  return localStorage.getItem('INVENTRA_CUSTOM_API') || '';
}

export function setApiConfig(mode, customUrl = '') {
  localStorage.setItem('INVENTRA_API_MODE', mode);
  if (customUrl) {
    localStorage.setItem('INVENTRA_CUSTOM_API', customUrl.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('INVENTRA_CUSTOM_API');
  }
}

// Kompatibilitas dengan kode lama
export const BASE_URL = getApiMode() === 'supabase' ? 'Supabase Cloud Database' : (getCustomApiUrl() || '/api');

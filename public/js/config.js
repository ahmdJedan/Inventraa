// Satu-satunya tempat untuk mengatur Base URL API.
//
// - Web PWA: default "/api" (PWA dan API satu domain).
// - Android APK: membaca URL dari localStorage (bisa diubah di menu Profile),
//   atau default ke backend Vercel / IP server lokal.

export function getBaseUrl() {
  const custom = localStorage.getItem('INVENTRA_API_URL');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }

  // Deteksi apakah sedang berjalan di dalam APK Android (Capacitor/WebView)
  const isApk =
    typeof window !== 'undefined' &&
    (window.Capacitor != null ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && !window.location.port));

  if (isApk) {
    return 'https://inventraa.vercel.app/api';
  }

  return '/api';
}

export const BASE_URL = getBaseUrl();

export function setApiUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('INVENTRA_API_URL');
  } else {
    localStorage.setItem('INVENTRA_API_URL', url.trim().replace(/\/+$/, ''));
  }
}

export function getStoredApiUrl() {
  return localStorage.getItem('INVENTRA_API_URL') || '';
}

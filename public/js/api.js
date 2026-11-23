import { BASE_URL } from './config.js';

export class ApiError extends Error {}

// Lapisan paling bawah: semua request HTTP lewat sini.
// Mengembalikan isi field "data" dari response API.
async function kirim(endpoint, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(BASE_URL + endpoint, {
      ...options,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
    });

    const teks = await res.text();
    let body = null;
    if (teks) {
      try {
        body = JSON.parse(teks);
      } catch {
        throw new ApiError('Respons server tidak valid. Periksa BASE_URL API di js/config.js.');
      }
    }

    if (!res.ok) {
      throw new ApiError((body && body.message) || `Terjadi kesalahan (kode ${res.status})`);
    }
    return body && body.data !== undefined ? body.data : null;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('Koneksi timeout. Periksa jaringan Anda.');
    throw new ApiError('Tidak dapat terhubung ke server.');
  } finally {
    clearTimeout(timer);
  }
}

export const ApiService = {
  get: (endpoint) => kirim(endpoint),
  post: (endpoint, data) => kirim(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => kirim(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => kirim(endpoint, { method: 'DELETE' }),
};

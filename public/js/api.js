import {
  SUPABASE_URL,
  SUPABASE_KEY,
  DAFTAR_LOKASI,
  getApiMode,
  getCustomApiUrl,
} from './config.js';

export class ApiError extends Error {}

const sbHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Adapter Supabase Langsung (Direct PostgREST).
 * Memungkinkan aplikasi web & APK Android membaca/menulis ke database Supabase
 * secara mandiri tanpa tergantung server Express lokal yang harus selalu menyala.
 */
async function sbDirect(method, endpoint, body = null) {
  // 1. GET /barang/lokasi
  if (method === 'GET' && endpoint === '/barang/lokasi') {
    return DAFTAR_LOKASI;
  }

  // 2. GET /barang/kode-berikutnya
  if (method === 'GET' && endpoint === '/barang/kode-berikutnya') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/barang?select=kode_barang`, {
      headers: sbHeaders,
    });
    if (!res.ok) throw new ApiError('Gagal mengambil kode barang dari Supabase.');
    const items = await res.json();
    let max = 0;
    for (const item of items) {
      const m = /^BRG-(\d+)$/.exec(item.kode_barang);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return { kode_barang: 'BRG-' + String(max + 1).padStart(4, '0') };
  }

  // 3. GET /dashboard
  if (method === 'GET' && endpoint === '/dashboard') {
    const [bRes, cRes, baikRes, rusakRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/barang?select=id`, {
        headers: { ...sbHeaders, Prefer: 'count=exact' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/categories?select=id`, {
        headers: { ...sbHeaders, Prefer: 'count=exact' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/barang?select=id&kondisi=eq.Baik`, {
        headers: { ...sbHeaders, Prefer: 'count=exact' },
      }),
      fetch(
        `${SUPABASE_URL}/rest/v1/barang?select=id&kondisi=in.(Rusak%20Ringan,Rusak%20Berat)`,
        {
          headers: { ...sbHeaders, Prefer: 'count=exact' },
        }
      ),
    ]);

    const getCount = (res) => {
      const cr = res.headers.get('content-range');
      if (cr && cr.includes('/')) return parseInt(cr.split('/')[1], 10) || 0;
      return 0;
    };

    return {
      total_barang: getCount(bRes),
      total_kategori: getCount(cRes),
      barang_kondisi_baik: getCount(baikRes),
      barang_rusak: getCount(rusakRes),
    };
  }

  // 4. /barang
  if (endpoint === '/barang' || endpoint.startsWith('/barang?')) {
    if (method === 'GET') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/barang?select=*,categories(id,name)&order=nama_barang`,
        { headers: sbHeaders }
      );
      if (!res.ok) throw new ApiError('Gagal mengambil data barang dari database.');
      return await res.json();
    }
    if (method === 'POST') {
      const payload = { ...body };
      if (!payload.kode_barang) {
        const nextKode = await sbDirect('GET', '/barang/kode-berikutnya');
        payload.kode_barang = nextKode.kode_barang;
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/barang`, {
        method: 'POST',
        headers: { ...sbHeaders, Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new ApiError(data?.message || 'Gagal menambahkan barang ke database.');
      return Array.isArray(data) ? data[0] : data;
    }
  }

  // 5. /barang/:id
  const matchBarangId = endpoint.match(/^\/barang\/([^/]+)$/);
  if (matchBarangId) {
    const id = decodeURIComponent(matchBarangId[1]);
    if (method === 'GET') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/barang?select=*,categories(id,name)&id=eq.${encodeURIComponent(
          id
        )}`,
        { headers: sbHeaders }
      );
      const data = await res.json();
      if (!res.ok || !data.length) throw new ApiError('Data barang tidak ditemukan.');
      return data[0];
    }
    if (method === 'PUT') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/barang?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: { ...sbHeaders, Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new ApiError(data?.message || 'Gagal memperbarui data barang.');
      return Array.isArray(data) ? data[0] : data;
    }
    if (method === 'DELETE') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/barang?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: sbHeaders,
        }
      );
      if (!res.ok) throw new ApiError('Gagal menghapus data barang.');
      return { id };
    }
  }

  // 6. /categories
  if (endpoint === '/categories' || endpoint.startsWith('/categories?')) {
    if (method === 'GET') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name`, {
        headers: sbHeaders,
      });
      if (!res.ok) throw new ApiError('Gagal mengambil data kategori.');
      return await res.json();
    }
    if (method === 'POST') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
        method: 'POST',
        headers: { ...sbHeaders, Prefer: 'return=representation' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new ApiError(data?.message || 'Gagal menambahkan kategori.');
      return Array.isArray(data) ? data[0] : data;
    }
  }

  // 7. /categories/:id
  const matchCatId = endpoint.match(/^\/categories\/([^/]+)$/);
  if (matchCatId) {
    const id = decodeURIComponent(matchCatId[1]);
    if (method === 'GET') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,
        { headers: sbHeaders }
      );
      const data = await res.json();
      if (!res.ok || !data.length) throw new ApiError('Data kategori tidak ditemukan.');
      return data[0];
    }
    if (method === 'PUT') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: { ...sbHeaders, Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new ApiError(data?.message || 'Gagal memperbarui kategori.');
      return Array.isArray(data) ? data[0] : data;
    }
    if (method === 'DELETE') {
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/barang?select=id&category_id=eq.${encodeURIComponent(
          id
        )}&limit=1`,
        { headers: sbHeaders }
      );
      const checkData = await checkRes.json();
      if (Array.isArray(checkData) && checkData.length > 0) {
        throw new ApiError(
          'Kategori tidak dapat dihapus karena masih digunakan oleh data barang.'
        );
      }
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: sbHeaders,
        }
      );
      if (!res.ok) throw new ApiError('Gagal menghapus kategori.');
      return { id };
    }
  }

  throw new ApiError(`Aksi tidak dikenali: ${endpoint}`);
}

/**
 * Fungsi kirim request:
 * Menjalankan request ke Express atau Supabase Direct dengan mekanisme fallback otomatis.
 */
async function kirim(endpoint, options = {}) {
  const mode = getApiMode();

  // Mode Supabase Langsung (Wajib & Default di APK Android)
  if (mode === 'supabase') {
    return await sbDirect(
      options.method || 'GET',
      endpoint,
      options.body ? JSON.parse(options.body) : null
    );
  }

  // Mode Custom Express / Auto
  const customUrl = getCustomApiUrl();
  const baseUrl =
    customUrl ||
    (typeof window !== 'undefined' && window.location.origin
      ? '/api'
      : 'http://localhost:3000/api');

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(baseUrl + endpoint, {
      ...options,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    const teks = await res.text();
    let body = null;
    if (teks) {
      try {
        body = JSON.parse(teks);
      } catch {
        // Abaikan parse error, akan ditangani di bawah
      }
    }

    if (res.ok) {
      return body && body.data !== undefined ? body.data : body;
    }

    if (res.status === 400 || res.status === 404) {
      throw new ApiError((body && body.message) || `Error ${res.status}`);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Jika koneksi ke server Express gagal / offline, langsung beralih ke Supabase Cloud
    console.warn(
      `[Inventra] Server ${baseUrl} tidak dapat dijangkau. Beralih ke Supabase Direct...`
    );
    return await sbDirect(
      options.method || 'GET',
      endpoint,
      options.body ? JSON.parse(options.body) : null
    );
  }
}

export const ApiService = {
  get: (endpoint) => kirim(endpoint),
  post: (endpoint, data) =>
    kirim(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    kirim(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => kirim(endpoint, { method: 'DELETE' }),
};

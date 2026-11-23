import { supabase } from '../config/supabaseClient.js';
import { HttpError } from '../utils/response.js';

const TABLE = 'barang';
const SELECT = '*, categories(id, name)';

export const getAll = async () => {
  const { data, error } = await supabase.from(TABLE).select(SELECT).order('nama_barang');
  if (error) throw error;
  return data;
};

export const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};

export const create = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select(SELECT).single();
  if (error) throw error;
  return data;
};

// ---------- Kode barang otomatis: BRG-0001, BRG-0002, ... ----------
const PREFIX = 'BRG-';

export const generateKode = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('kode_barang')
    .like('kode_barang', `${PREFIX}%`);
  if (error) throw error;

  // cari nomor terbesar yang sudah dipakai (kode lama seperti BRG-001 juga terbaca)
  let terbesar = 0;
  for (const row of data) {
    const cocok = /^BRG-(\d+)$/.exec(row.kode_barang);
    if (cocok) terbesar = Math.max(terbesar, parseInt(cocok[1], 10));
  }
  return `${PREFIX}${String(terbesar + 1).padStart(4, '0')}`;
};

// Membuat barang dengan kode otomatis. Jika dua orang menyimpan bersamaan
// dan kode bentrok (unique), proses diulang dengan kode berikutnya.
export const createDenganKodeOtomatis = async (payload) => {
  for (let percobaan = 0; percobaan < 5; percobaan++) {
    const kode = await generateKode();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...payload, kode_barang: kode })
      .select(SELECT)
      .single();
    if (!error) return data;
    if (error.code !== '23505') throw error; // bukan bentrok kode -> lempar error
  }
  throw new HttpError('Gagal membuat kode barang otomatis. Silakan coba lagi.', 500);
};

export const update = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(SELECT)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const remove = async (id) => {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
};

// Menghitung jumlah baris (untuk dashboard)
const hitung = async (tabel, filter) => {
  let query = supabase.from(tabel).select('*', { count: 'exact', head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
};

export const getStatistik = async () => {
  const [total_barang, total_kategori, barang_kondisi_baik, barang_rusak] = await Promise.all([
    hitung('barang'),
    hitung('categories'),
    hitung('barang', (q) => q.eq('kondisi', 'Baik')),
    hitung('barang', (q) => q.in('kondisi', ['Rusak Ringan', 'Rusak Berat'])),
  ]);
  return { total_barang, total_kategori, barang_kondisi_baik, barang_rusak };
};

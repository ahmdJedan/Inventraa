import { supabase } from '../config/supabaseClient.js';
import { HttpError } from '../utils/response.js';

const TABLE = 'transaksi';
const SELECT = '*, barang(id, kode_barang, nama_barang, satuan, jumlah)';

// Pengaruh transaksi terhadap stok: masuk = +jumlah, keluar = -jumlah
const delta = (jenis, jumlah) => (jenis === 'Barang Masuk' ? jumlah : -jumlah);

const ambilBarang = async (id) => {
  const { data, error } = await supabase
    .from('barang')
    .select('id, nama_barang, jumlah')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError('Data barang tidak ditemukan', 404);
  return data;
};

const setStok = async (barangId, stok) => {
  const { error } = await supabase.from('barang').update({ jumlah: stok }).eq('id', barangId);
  if (error) throw error;
};

const pesanStok = (tersedia, diminta) =>
  `Stok tidak mencukupi. Stok tersedia: ${Math.max(tersedia, 0)}. Jumlah yang diminta: ${diminta}`;

export const getAll = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .order('tanggal_transaksi', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  return data;
};

export const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};

export const create = async ({ barang_id, jenis_transaksi, jumlah, keterangan, tanggal_transaksi }) => {
  const barang = await ambilBarang(barang_id);

  if (jenis_transaksi === 'Barang Keluar' && jumlah > barang.jumlah) {
    throw new HttpError(pesanStok(barang.jumlah, jumlah), 400);
  }
  const stokBaru = barang.jumlah + delta(jenis_transaksi, jumlah);

  const payload = { barang_id, jenis_transaksi, jumlah, keterangan: keterangan || null };
  if (tanggal_transaksi) payload.tanggal_transaksi = tanggal_transaksi;

  const { data, error } = await supabase.from(TABLE).insert(payload).select('id').single();
  if (error) throw error;

  try {
    await setStok(barang_id, stokBaru);
  } catch (e) {
    // batalkan transaksi jika stok gagal diperbarui
    await supabase.from(TABLE).delete().eq('id', data.id);
    throw e;
  }
  return getById(data.id);
};

// Barang pada transaksi tidak dapat diganti (hapus lalu buat transaksi baru)
export const update = async (id, { jenis_transaksi, jumlah, keterangan, tanggal_transaksi }) => {
  const lama = await getById(id);
  if (!lama) return null;

  const barang = await ambilBarang(lama.barang_id);
  const stokDasar = barang.jumlah - delta(lama.jenis_transaksi, lama.jumlah); // stok tanpa transaksi ini
  const stokBaru = stokDasar + delta(jenis_transaksi, jumlah);
  if (stokBaru < 0) throw new HttpError(pesanStok(stokDasar, jumlah), 400);

  await setStok(lama.barang_id, stokBaru);

  const payload = { jenis_transaksi, jumlah, keterangan: keterangan || null };
  if (tanggal_transaksi) payload.tanggal_transaksi = tanggal_transaksi;

  const { error } = await supabase.from(TABLE).update(payload).eq('id', id);
  if (error) {
    await setStok(lama.barang_id, barang.jumlah); // kembalikan stok
    throw error;
  }
  return getById(id);
};

export const remove = async (id) => {
  const lama = await getById(id);
  if (!lama) return null;

  const barang = await ambilBarang(lama.barang_id);
  const stokBaru = barang.jumlah - delta(lama.jenis_transaksi, lama.jumlah); // batalkan efek transaksi
  if (stokBaru < 0) {
    throw new HttpError('Transaksi tidak dapat dihapus karena stok barang akan menjadi negatif', 400);
  }

  await setStok(lama.barang_id, stokBaru);
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) {
    await setStok(lama.barang_id, barang.jumlah);
    throw error;
  }
  return lama;
};

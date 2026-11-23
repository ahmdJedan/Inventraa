import * as Transaksi from '../models/transaksiModel.js';
import { sukses, gagal, tanganiError } from '../utils/response.js';

const JENIS = ['Barang Masuk', 'Barang Keluar'];

const validasi = (b, perluBarang) => {
  if (perluBarang && !b.barang_id) return 'Barang wajib dipilih';
  if (!b.jenis_transaksi || !JENIS.includes(b.jenis_transaksi))
    return 'Jenis transaksi harus Barang Masuk atau Barang Keluar';
  const jumlah = Number(b.jumlah);
  if (!Number.isInteger(jumlah) || jumlah <= 0) return 'Jumlah harus berupa angka bulat lebih dari 0';
  return null;
};

const bersihkan = (b) => ({
  barang_id: b.barang_id,
  jenis_transaksi: b.jenis_transaksi,
  jumlah: Number(b.jumlah),
  keterangan: b.keterangan ? String(b.keterangan).trim() : null,
  tanggal_transaksi: b.tanggal_transaksi || null,
});

export const getAll = async (req, res) => {
  try {
    const data = await Transaksi.getAll();
    return sukses(res, 'Data transaksi berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const getById = async (req, res) => {
  try {
    const data = await Transaksi.getById(req.params.id);
    if (!data) return gagal(res, 'Data transaksi tidak ditemukan', 404);
    return sukses(res, 'Data transaksi berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const create = async (req, res) => {
  try {
    const pesan = validasi(req.body, true);
    if (pesan) return gagal(res, pesan, 400);
    const data = await Transaksi.create(bersihkan(req.body));
    return sukses(res, 'Data transaksi berhasil ditambahkan', data, 201);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const update = async (req, res) => {
  try {
    const pesan = validasi(req.body, false);
    if (pesan) return gagal(res, pesan, 400);
    const data = await Transaksi.update(req.params.id, bersihkan(req.body));
    if (!data) return gagal(res, 'Data transaksi tidak ditemukan', 404);
    return sukses(res, 'Data transaksi berhasil diubah', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const remove = async (req, res) => {
  try {
    const data = await Transaksi.remove(req.params.id);
    if (!data) return gagal(res, 'Data transaksi tidak ditemukan', 404);
    return sukses(res, 'Data transaksi berhasil dihapus', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

import * as Barang from '../models/barangModel.js';
import { sukses, gagal, tanganiError } from '../utils/response.js';
import { DAFTAR_LOKASI } from '../utils/lokasi.js';

const KONDISI = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

const validasi = (b) => {
  if (!b.nama_barang || !String(b.nama_barang).trim()) return 'Nama barang tidak boleh kosong';
  if (!b.category_id) return 'Kategori wajib dipilih';
  if (!b.lokasi || !String(b.lokasi).trim()) return 'Lokasi wajib dipilih';
  if (!DAFTAR_LOKASI.includes(String(b.lokasi).trim())) return 'Lokasi tidak valid. Pilih salah satu lokasi yang tersedia';
  if (b.kondisi && !KONDISI.includes(b.kondisi)) return 'Kondisi harus Baik, Rusak Ringan, atau Rusak Berat';
  const jumlah = Number(b.jumlah ?? 0);
  if (!Number.isInteger(jumlah)) return 'Jumlah harus berupa angka bulat';
  if (jumlah < 0) return 'Jumlah tidak boleh negatif';
  return null;
};

// kode_barang sengaja tidak diambil dari input: dibuat otomatis oleh server
const bersihkan = (b) => {
  const data = {
    nama_barang: String(b.nama_barang).trim(),
    deskripsi: b.deskripsi ? String(b.deskripsi).trim() : null,
    category_id: b.category_id,
    lokasi: String(b.lokasi).trim(),
    kondisi: b.kondisi || 'Baik',
    jumlah: Number(b.jumlah ?? 0),
    satuan: b.satuan ? String(b.satuan).trim() : 'Unit',
  };
  if (b.tanggal_masuk) data.tanggal_masuk = b.tanggal_masuk;
  return data;
};

export const getAll = async (req, res) => {
  try {
    const data = await Barang.getAll();
    return sukses(res, 'Data barang berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const getLokasi = (req, res) =>
  sukses(res, 'Daftar lokasi berhasil diambil', DAFTAR_LOKASI);

export const getKodeBerikutnya = async (req, res) => {
  try {
    const kode = await Barang.generateKode();
    return sukses(res, 'Kode barang berikutnya berhasil dibuat', { kode_barang: kode });
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const getById = async (req, res) => {
  try {
    const data = await Barang.getById(req.params.id);
    if (!data) return gagal(res, 'Data barang tidak ditemukan', 404);
    return sukses(res, 'Data barang berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const create = async (req, res) => {
  try {
    const pesan = validasi(req.body);
    if (pesan) return gagal(res, pesan, 400);
    const data = await Barang.createDenganKodeOtomatis(bersihkan(req.body));
    return sukses(res, 'Data barang berhasil ditambahkan', data, 201);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const update = async (req, res) => {
  try {
    const pesan = validasi(req.body);
    if (pesan) return gagal(res, pesan, 400);
    const data = await Barang.update(req.params.id, bersihkan(req.body));
    if (!data) return gagal(res, 'Data barang tidak ditemukan', 404);
    return sukses(res, 'Data barang berhasil diubah', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const remove = async (req, res) => {
  try {
    const data = await Barang.remove(req.params.id);
    if (!data) return gagal(res, 'Data barang tidak ditemukan', 404);
    return sukses(res, 'Data barang berhasil dihapus', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const getDashboard = async (req, res) => {
  try {
    const data = await Barang.getStatistik();
    return sukses(res, 'Data dashboard berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

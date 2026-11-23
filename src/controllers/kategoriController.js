import * as Kategori from '../models/kategoriModel.js';
import { sukses, gagal, tanganiError } from '../utils/response.js';

const validasi = (b) => {
  if (!b.name || !String(b.name).trim()) return 'Nama kategori tidak boleh kosong';
  return null;
};
const bersihkan = (b) => ({
  name: String(b.name).trim(),
  description: b.description ? String(b.description).trim() : null,
});

export const getAll = async (req, res) => {
  try {
    const data = await Kategori.getAll();
    return sukses(res, 'Data kategori berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const getById = async (req, res) => {
  try {
    const data = await Kategori.getById(req.params.id);
    if (!data) return gagal(res, 'Data kategori tidak ditemukan', 404);
    return sukses(res, 'Data kategori berhasil diambil', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const create = async (req, res) => {
  try {
    const pesan = validasi(req.body);
    if (pesan) return gagal(res, pesan, 400);
    const data = await Kategori.create(bersihkan(req.body));
    return sukses(res, 'Data kategori berhasil ditambahkan', data, 201);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const update = async (req, res) => {
  try {
    const pesan = validasi(req.body);
    if (pesan) return gagal(res, pesan, 400);
    const data = await Kategori.update(req.params.id, bersihkan(req.body));
    if (!data) return gagal(res, 'Data kategori tidak ditemukan', 404);
    return sukses(res, 'Data kategori berhasil diubah', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

export const remove = async (req, res) => {
  try {
    const data = await Kategori.remove(req.params.id);
    if (!data) return gagal(res, 'Data kategori tidak ditemukan', 404);
    return sukses(res, 'Data kategori berhasil dihapus', data);
  } catch (e) {
    return tanganiError(res, e);
  }
};

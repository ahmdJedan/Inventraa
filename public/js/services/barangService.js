import { ApiService } from '../api.js';

export const BarangService = {
  getAll: () => ApiService.get('/barang'),
  getById: (id) => ApiService.get(`/barang/${encodeURIComponent(id)}`),
  create: (data) => ApiService.post('/barang', data),
  update: (id, data) => ApiService.put(`/barang/${encodeURIComponent(id)}`, data),
  delete: (id) => ApiService.delete(`/barang/${encodeURIComponent(id)}`),
  getLokasi: () => ApiService.get('/barang/lokasi'),
  getKodeBerikutnya: () => ApiService.get('/barang/kode-berikutnya'),
  getDashboard: () => ApiService.get('/dashboard'),
};

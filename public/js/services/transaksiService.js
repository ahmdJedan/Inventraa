import { ApiService } from '../api.js';

export const TransaksiService = {
  getAll: () => ApiService.get('/transaksi'),
  getById: (id) => ApiService.get(`/transaksi/${encodeURIComponent(id)}`),
  create: (data) => ApiService.post('/transaksi', data),
  update: (id, data) => ApiService.put(`/transaksi/${encodeURIComponent(id)}`, data),
  delete: (id) => ApiService.delete(`/transaksi/${encodeURIComponent(id)}`),
};

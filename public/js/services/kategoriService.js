import { ApiService } from '../api.js';

export const KategoriService = {
  getAll: () => ApiService.get('/categories'),
  getById: (id) => ApiService.get(`/categories/${encodeURIComponent(id)}`),
  create: (data) => ApiService.post('/categories', data),
  update: (id, data) => ApiService.put(`/categories/${encodeURIComponent(id)}`, data),
  delete: (id) => ApiService.delete(`/categories/${encodeURIComponent(id)}`),
};

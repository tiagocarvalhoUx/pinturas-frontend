import api from './api';

export const portfolioService = {
  async getAll(featured?: boolean) {
    const res = await api.get('/portfolio', { params: featured ? { featured: true } : {} });
    return res.data.portfolio;
  },

  async getById(id: string) {
    const res = await api.get(`/portfolio/${id}`);
    return res.data.item;
  },

  async create(data: FormData) {
    const res = await api.post('/portfolio', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.item;
  },

  async remove(id: string) {
    await api.delete(`/portfolio/${id}`);
  },
};

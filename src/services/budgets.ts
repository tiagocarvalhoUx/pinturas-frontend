import api from './api';

export const budgetService = {
  async create(data: FormData) {
    const res = await api.post('/budgets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s para upload de imagens
    });
    return res.data.budget;
  },

  async getMyBudgets() {
    const res = await api.get('/budgets/my');
    return res.data.budgets;
  },

  async getAllBudgets(status?: string) {
    const res = await api.get('/budgets', { params: status ? { status } : {} });
    return res.data.budgets;
  },

  async getById(id: string) {
    const res = await api.get(`/budgets/${id}`);
    return res.data.budget;
  },

  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/budgets/${id}`, data);
    return res.data.budget;
  },

  async rate(id: string, stars: number, comment: string) {
    const res = await api.post(`/budgets/${id}/rate`, { stars, comment });
    return res.data.budget;
  },
};

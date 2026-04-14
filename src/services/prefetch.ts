import api from './api';
import { budgetService } from './budgets';
import { portfolioService } from './portfolio';
import { useAppStore } from '../store/appStore';

/**
 * Busca todos os dados necessários em paralelo logo após o login.
 * Chamado uma vez — as telas exibem o cache imediatamente.
 */
export async function prefetchAll(role: 'client' | 'admin') {
  const { setBudgets, setPortfolio, setAdminStats } = useAppStore.getState();

  const tasks: Promise<void>[] = [
    // Portfolio — todos os usuários
    portfolioService.getAll()
      .then(setPortfolio)
      .catch(() => {}),

    // Orçamentos
    (role === 'admin'
      ? budgetService.getAllBudgets()
      : budgetService.getMyBudgets()
    ).then(setBudgets).catch(() => {}),
  ];

  // Stats do admin
  if (role === 'admin') {
    tasks.push(
      api.get('/users/admin/stats')
        .then((r) => setAdminStats(r.data.stats))
        .catch(() => {})
    );
  }

  await Promise.all(tasks);
}

/** Ping para acordar o servidor Render (evita cold start) */
export function warmupBackend() {
  api.get('/health').catch(() => {});
}

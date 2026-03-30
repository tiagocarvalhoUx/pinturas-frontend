export const SERVICE_LABELS: Record<string, string> = {
  internal: 'Pintura Interna',
  external: 'Pintura Externa',
  texture: 'Textura e Grafiato',
  lacquering: 'Laqueação',
  waterproofing: 'Impermeabilização',
  restoration: 'Restauração',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  quoted: 'Orçado',
  approved: 'Aprovado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706',
  quoted: '#2563EB',
  approved: '#7C3AED',
  in_progress: '#0891B2',
  completed: '#059669',
  cancelled: '#DC2626',
};

export const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

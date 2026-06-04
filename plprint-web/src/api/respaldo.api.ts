import { apiClient } from './client';

export interface Backup {
  filename: string;
  size: number;
  size_mb: string;
  created_at: string;
  download_url: string;
}

export interface DbStats {
  tablas: { nombre: string; registros: number }[];
  totalTablas: number;
}

export const respaldoApi = {
  generate: () => apiClient.post<{ data: Backup }>('/respaldo'),
  list: () => apiClient.get<{ data: Backup[] }>('/respaldo/list'),
  remove: (filename: string) => apiClient.delete(`/respaldo/${filename}`),
  getStats: () => apiClient.get<{ data: DbStats }>('/respaldo/stats'),
  getDownloadUrl: (filename: string) => `/respaldo/download/${filename}`,
};

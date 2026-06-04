import { apiClient } from './client';

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
  created_at: string;
}

export const unidadesMedidaApi = {
  getAll: () => apiClient.get<{ success: boolean; data: UnidadMedida[] }>('/unidades-medida'),
  create: (data: { nombre: string; abreviatura: string }) => apiClient.post('/unidades-medida', data),
  update: (id: number, data: Partial<{ nombre: string; abreviatura: string }>) =>
    apiClient.put(`/unidades-medida/${id}`, data),
  remove: (id: number) => apiClient.delete(`/unidades-medida/${id}`),
};

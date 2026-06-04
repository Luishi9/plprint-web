import { apiClient } from './client';
import { InsumoDTO, AjusteInsumoDTO } from '@/types/insumo.types';

export const insumosApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/insumos', { params }),

  getById: (id: number) => apiClient.get(`/insumos/${id}`),

  create: (data: InsumoDTO) => apiClient.post('/insumos', data),

  update: (id: number, data: Partial<InsumoDTO>) => apiClient.put(`/insumos/${id}`, data),

  remove: (id: number) => apiClient.delete(`/insumos/${id}`),

  getInventarioBySucursal: (sucursalId: number, params?: { search?: string }) =>
    apiClient.get(`/insumos/sucursal/${sucursalId}`, { params }),

  ajustarStock: (data: AjusteInsumoDTO) => apiClient.post('/insumos/ajuste', data),
};

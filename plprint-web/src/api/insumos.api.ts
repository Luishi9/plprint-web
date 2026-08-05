import { apiClient } from './client';
import { InsumoDTO, AjusteInsumoDTO } from '@/types/insumo.types';

export const insumosApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sucursalId?: number }) =>
    apiClient.get('/insumos', { params }),

  getById: (id: number) => apiClient.get(`/insumos/${id}`),

  create: (data: InsumoDTO) => apiClient.post('/insumos', data),

  update: (id: number, data: Partial<InsumoDTO>) => apiClient.put(`/insumos/${id}`, data),

  remove: (id: number) => apiClient.delete(`/insumos/${id}`),

  getInventarioBySucursal: (sucursalId: number, params?: { search?: string }) =>
    apiClient.get(`/insumos/sucursal/${sucursalId}`, { params }),

  ajustarStock: (data: AjusteInsumoDTO) => apiClient.post('/insumos/ajuste', data),

  descargarPlantilla: () =>
    apiClient.get('/insumos/plantilla', { responseType: 'blob' }),

  exportCatalog: (sucursalId?: number) =>
    apiClient.get('/insumos/exportar', { params: { sucursalId }, responseType: 'blob' }),

  previewImport: (formData: FormData) =>
    apiClient.post('/insumos/importar/preview', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  confirmImport: (payload: { token: string; decisiones: Record<string, string>; sucursalId: number }) =>
    apiClient.post('/insumos/importar/confirmar', payload),
};

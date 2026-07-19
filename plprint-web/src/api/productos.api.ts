import { apiClient } from './client';

export interface ProductoParams {
  page?: number;
  limit?: number;
  search?: string;
  categoriaId?: number;
  categoriaTipo?: string;
  sucursalId?: number;
}

export const productosApi = {
  getAll: (params: ProductoParams) => apiClient.get('/productos', { params }),
  getById: (id: number) => apiClient.get(`/productos/${id}`),
  getInsumos: (id: number) => apiClient.get(`/productos/${id}/insumos`),
  create: (data: FormData) =>
    apiClient.post('/productos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) =>
    apiClient.put(`/productos/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id: number) => apiClient.delete(`/productos/${id}`),
  previewImport: (formData: FormData) =>
    apiClient.post('/productos/importar/preview', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  confirmImport: (payload: { token: string; decisiones: Record<string, string>; sucursalId: number }) =>
    apiClient.post('/productos/importar/confirmar', payload),
  descargarPlantilla: () =>
    apiClient.get('/productos/plantilla', { responseType: 'blob' }),
  exportCatalog: (sucursalId?: number) =>
    apiClient.get('/productos/exportar', { params: { sucursalId }, responseType: 'blob' }),
};

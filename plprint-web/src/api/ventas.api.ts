import { apiClient } from './client';

export interface ProductoConInsumos {
  productoId: number;
  nombre: string;
  insumos: Array<{ insumoId: number; nombre: string; cantidad: number; unidad: string }>;
}

export const ventasApi = {
  getAll: (params?: object) => apiClient.get('/ventas', { params }),
  getById: (id: number) => apiClient.get(`/ventas/${id}`),
  // Endpoint publico (sin auth) - retorna solo campos seguros para el QR del ticket
  getPublicById: (id: number) => apiClient.get(`/ventas/public/${id}`),
  create: (data: object) => apiClient.post('/ventas', data),
  cancel: (id: number, data?: { insumosDecision?: Array<{ productoId: number; accion: 'revertir' | 'merma' }> }) =>
    apiClient.patch(`/ventas/${id}/cancelar`, data ?? {}),
  getProductosConInsumos: (id: number) => apiClient.get(`/ventas/${id}/productos-con-insumos`),
  validarInsumos: (data: { sucursalId: number; items: Array<{ productoId: number; cantidad: number }> }) =>
    apiClient.post('/ventas/validar-insumos', data),
};

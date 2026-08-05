import { apiClient } from './client';

export interface InventarioAjuste {
  productoId: number;
  sucursalId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  notas?: string;
  stockMinimo?: number;
}

export const inventarioApi = {
  getBySucursal: (sucursalId: number, params?: object) =>
    apiClient.get(`/inventario/sucursal/${sucursalId}`, { params }),
  ajustar: (data: InventarioAjuste) => apiClient.post('/inventario/ajuste', data),
  getKardex: (productoId: number, sucursalId: number) =>
    apiClient.get(`/inventario/kardex/${productoId}/${sucursalId}`),
};

import { apiClient } from './client';

export interface CompraInsumo {
  id: number;
  insumo_id: number;
  sucursal_id: number | null;
  proveedor_id: number | null;
  usuario_id: number | null;
  cantidad: string;
  precio_unitario: string;
  total: string;
  notas: string | null;
  fecha: string;
  created_at: string;
  insumos?: { id: number; nombre: string; unidad_medida: string };
  proveedores?: { id: number; nombre: string };
  sucursales?: { id: number; nombre: string };
  usuarios?: { id: number; nombre: string };
}

export const comprasApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/compras', { params }),
  getById: (id: number) => apiClient.get(`/compras/${id}`),
  create: (data: {
    insumo_id: number; cantidad: number; precio_unitario: number;
    proveedor_id?: number; sucursal_id?: number; notas?: string; fecha?: string;
  }) => apiClient.post('/compras', data),
  createBatch: (data: {
    items: Array<{
      insumo_id: number; cantidad: number; precio_unitario: number;
      proveedor_id?: number; notas?: string;
    }>;
    sucursal_id: number;
    factura?: string;
    fecha?: string;
  }) => apiClient.post('/compras/batch', data),
  remove: (id: number) => apiClient.delete(`/compras/${id}`),
};

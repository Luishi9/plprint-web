import { apiClient } from './client';

export interface Merma {
  id: number;
  tipo: 'producto' | 'insumo';
  producto_id: number | null;
  insumo_id: number | null;
  sucursal_id: number | null;
  usuario_id: number | null;
  venta_id: number | null;
  maquina_id: number | null;
  cantidad: string;
  motivo: string;
  costo_estimado: string | null;
  fecha: string;
  created_at: string;
  productos?: { id: number; nombre: string; unidad_medida: string; maquina_id?: number | null } | null;
  insumos?: { id: number; nombre: string; unidad_medida: string } | null;
  sucursales?: { id: number; nombre: string } | null;
  usuarios?: { id: number; nombre: string } | null;
  maquinas?: { id: number; nombre: string } | null;
}

export const mermasApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/mermas', { params }),
  getById: (id: number) => apiClient.get(`/mermas/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/mermas', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/mermas/${id}`, data),
  remove: (id: number) => apiClient.delete(`/mermas/${id}`),
};

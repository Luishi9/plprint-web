import { apiClient } from './client';

export interface CategoriaGasto {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  _count?: { gastos: number };
}

export interface Gasto {
  id: number;
  categoria_id: number;
  sucursal_id: number | null;
  usuario_id: number | null;
  concepto: string;
  monto: string;
  tipo: 'gasto' | 'ingreso' | 'retiro';
  autorizado_por: number | null;
  comprobante_url: string | null;
  notas: string | null;
  fecha: string;
  categoria?: { id: number; nombre: string };
  sucursales?: { id: number; nombre: string };
  usuarios?: { id: number; nombre: string };
}

export const categoriasGastosApi = {
  getAll: () => apiClient.get<{ success: boolean; data: CategoriaGasto[] }>('/gastos/categorias'),
  create: (data: { nombre: string; descripcion?: string }) => apiClient.post('/gastos/categorias', data),
  update: (id: number, data: { nombre?: string; descripcion?: string }) =>
    apiClient.put(`/gastos/categorias/${id}`, data),
  remove: (id: number) => apiClient.delete(`/gastos/categorias/${id}`),
};

export const gastosApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/gastos', { params }),
  getById: (id: number) => apiClient.get(`/gastos/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/gastos', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/gastos/${id}`, data),
  remove: (id: number) => apiClient.delete(`/gastos/${id}`),
};

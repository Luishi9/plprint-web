import { apiClient } from './client';

export interface Categoria {
  id: number;
  nombre: string;
  tipo: 'venta' | 'produccion';
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  _count?: { productos: number };
}

export const categoriasApi = {
  getAll: (tipo?: 'venta' | 'produccion') =>
    apiClient.get<{ success: boolean; data: Categoria[] }>('/categorias', { params: tipo ? { tipo } : undefined }),
  create: (data: { nombre: string; tipo?: 'venta' | 'produccion'; descripcion?: string }) =>
    apiClient.post('/categorias', data),
  update: (id: number, data: Partial<{ nombre: string; tipo: 'venta' | 'produccion'; descripcion: string }>) =>
    apiClient.put(`/categorias/${id}`, data),
  remove: (id: number) => apiClient.delete(`/categorias/${id}`),
};

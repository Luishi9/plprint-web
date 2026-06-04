import { apiClient } from './client';

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  rfc: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  _count?: { productos: number; insumos: number };
}

export interface ProveedorInput {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  rfc?: string;
  direccion?: string;
  notas?: string;
}

export const proveedoresApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/proveedores', { params }),
  getById: (id: number) => apiClient.get(`/proveedores/${id}`),
  create: (data: ProveedorInput) => apiClient.post('/proveedores', data),
  update: (id: number, data: Partial<ProveedorInput>) => apiClient.put(`/proveedores/${id}`, data),
  remove: (id: number) => apiClient.delete(`/proveedores/${id}`),
};

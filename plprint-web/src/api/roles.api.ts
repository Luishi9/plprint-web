import { apiClient } from './client';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  es_sistema: boolean;
  _count?: { usuarios: number; rol_permisos: number };
  permisos?: { id: number; modulo: string; accion: string }[];
}

export interface Permiso {
  id: number;
  modulo: string;
  accion: string;
  descripcion: string | null;
}

export interface CreateRolDTO {
  nombre: string;
  descripcion?: string;
  permisos: number[];
}

export interface UpdateRolDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: number[];
}

export const rolesApi = {
  getAll: () => apiClient.get<{ data: Rol[] }>('/roles'),
  getById: (id: number) => apiClient.get<{ data: Rol }>(`/roles/${id}`),
  create: (data: CreateRolDTO) => apiClient.post('/roles', data),
  update: (id: number, data: UpdateRolDTO) => apiClient.put(`/roles/${id}`, data),
  remove: (id: number) => apiClient.delete(`/roles/${id}`),
  getPermisos: () => apiClient.get<{ data: Permiso[] }>('/roles/permisos'),
  toggleActivo: (id: number) => apiClient.patch(`/roles/${id}/toggle`),
};

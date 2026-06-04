import { apiClient } from './client';

export interface MetodoPago {
  id: number;
  nombre: string;
  icono: string | null;
  activo: boolean;
  es_sistema: boolean;
  _count?: { ventas: number };
}

export interface CreateMetodoPagoDTO {
  nombre: string;
  icono?: string;
}

export interface UpdateMetodoPagoDTO {
  nombre?: string;
  icono?: string;
  activo?: boolean;
}

export const metodosPagoApi = {
  getAll: () => apiClient.get<{ data: MetodoPago[] }>('/metodos-pago'),
  getById: (id: number) => apiClient.get<{ data: MetodoPago }>(`/metodos-pago/${id}`),
  create: (data: CreateMetodoPagoDTO) => apiClient.post('/metodos-pago', data),
  update: (id: number, data: UpdateMetodoPagoDTO) => apiClient.put(`/metodos-pago/${id}`, data),
  remove: (id: number) => apiClient.delete(`/metodos-pago/${id}`),
  toggleActivo: (id: number) => apiClient.patch(`/metodos-pago/${id}/toggle`),
};

import { apiClient } from './client';

export interface Abono {
  id: number;
  venta_id: number;
  usuario_id: number | null;
  monto: string;
  metodo_pago: string;
  notas: string | null;
  fecha: string;
  usuarios?: { id: number; nombre: string };
}

export const abonosApi = {
  getByVenta: (ventaId: number) => apiClient.get(`/abonos/venta/${ventaId}`),
  registrar: (ventaId: number, data: { monto: number; metodo_pago: string; notas?: string }) =>
    apiClient.post(`/abonos/venta/${ventaId}`, data),
  remove: (id: number) => apiClient.delete(`/abonos/${id}`),
};

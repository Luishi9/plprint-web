import { apiClient } from './client';

export interface CotizacionItem {
  id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number | string;
  descuento?: number | string;
  subtotal?: number | string;
  ancho_m?: number | string;
  alto_m?: number | string;
  unidad_medida_detalle?: string;
  productos?: { id: number; nombre: string; precio_venta: number | string };
}

export interface Cotizacion {
  id: number;
  folio: string;
  cliente_id: number | null;
  sucursal_id: number | null;
  usuario_id: number | null;
  total: string;
  descuento: string;
  descuento_motivo: string | null;
  notas: string | null;
  estado: 'pendiente' | 'convertida' | 'cancelada';
  venta_id: number | null;
  created_at: string;
  clientes?: { id: number; nombre: string } | null;
  usuarios?: { id: number; nombre: string } | null;
  sucursales?: { id: number; nombre: string } | null;
  cotizacion_detalle?: CotizacionItem[];
  _count?: { cotizacion_detalle: number };
}

export const cotizacionesApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/cotizaciones', { params }),
  getById: (id: number) => apiClient.get(`/cotizaciones/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/cotizaciones', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/cotizaciones/${id}`, data),
  convertirAVenta: (id: number, data: Record<string, unknown>) =>
    apiClient.post(`/cotizaciones/${id}/convertir-venta`, data),
  cancelar: (id: number) => apiClient.post(`/cotizaciones/${id}/cancelar`),
};

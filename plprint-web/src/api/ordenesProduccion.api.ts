import { apiClient } from './client';

export type EstatusOrden = 'pendiente' | 'en_proceso' | 'terminado' | 'entregado' | 'cancelado';
export type PrioridadOrden = 'baja' | 'normal' | 'alta' | 'urgente';

export interface OrdenProduccion {
  id: number;
  sucursal_id: number;
  producto_id: number;
  cantidad: number;
  cantidad_producida: number;
  estatus: EstatusOrden;
  prioridad: PrioridadOrden;
  fecha_creacion: string;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_fin_real: string | null;
  usuario_creador_id: number | null;
  usuario_asignado_id: number | null;
  maquina_id: number | null;
  notas: string | null;
  motivo_cancelacion: string | null;
  created_at: string;
  updated_at: string;
  sucursales?: { id: number; nombre: string };
  productos?: {
    id: number;
    nombre: string;
    codigo: string | null;
    precio_venta: string;
    imagen_url: string | null;
    producto_insumos?: Array<{
      insumo_id: number;
      cantidad_requerida: string;
      insumos?: { id: number; nombre: string; unidad_medida: string; codigo: string | null };
    }>;
  };
  maquinas?: { id: number; nombre: string; tipo: string } | null;
  usuario_creador?: { id: number; nombre: string } | null;
  usuario_asignado?: { id: number; nombre: string } | null;
  historial?: Array<{
    id: number;
    estatus_anterior: EstatusOrden | null;
    estatus_nuevo: EstatusOrden;
    usuario_id: number | null;
    notas: string | null;
    created_at: string;
    usuario?: { id: number; nombre: string } | null;
  }>;
}

export interface OrdenProduccionParams {
  estatus?: EstatusOrden;
  sucursalId?: number;
  productoId?: number;
  usuarioAsignadoId?: number;
  prioridad?: PrioridadOrden;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface CreateOrdenDTO {
  sucursalId: number;
  productoId: number;
  cantidad: number;
  prioridad?: PrioridadOrden;
  fechaFinEstimada?: string | null;
  usuarioAsignadoId?: number | null;
  maquinaId?: number | null;
  notas?: string | null;
}

export interface UpdateOrdenDTO {
  cantidad?: number;
  prioridad?: PrioridadOrden;
  fechaFinEstimada?: string | null;
  usuarioAsignadoId?: number | null;
  maquinaId?: number | null;
  notas?: string | null;
  cantidadProducida?: number;
}

export interface CambiarEstatusDTO {
  nuevoEstatus: EstatusOrden;
  notas?: string | null;
  cantidadProducida?: number;
}

export interface EstadisticasProduccion {
  total: number;
  porEstatus: Record<string, number>;
  porPrioridad: Record<string, number>;
}

export const ordenesProduccionApi = {
  getAll: (params?: OrdenProduccionParams) =>
    apiClient.get<{ data: OrdenProduccion[] }>('/ordenes-produccion', { params }),
  getById: (id: number) =>
    apiClient.get<{ data: OrdenProduccion }>(`/ordenes-produccion/${id}`),
  getEstadisticas: (sucursalId?: number) =>
    apiClient.get<{ data: EstadisticasProduccion }>('/ordenes-produccion/estadisticas', {
      params: sucursalId ? { sucursalId } : {},
    }),
  create: (data: CreateOrdenDTO) => apiClient.post('/ordenes-produccion', data),
  update: (id: number, data: UpdateOrdenDTO) => apiClient.put(`/ordenes-produccion/${id}`, data),
  cambiarEstatus: (id: number, data: CambiarEstatusDTO) =>
    apiClient.patch(`/ordenes-produccion/${id}/estatus`, data),
  remove: (id: number) => apiClient.delete(`/ordenes-produccion/${id}`),
};

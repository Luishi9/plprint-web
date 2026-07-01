import { apiClient } from './client';

export interface Maquina {
  id: number;
  sucursal_id: number;
  nombre: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  contador_total: number;
  contador_inicial: number;
  reset_diario: boolean;
  activo: boolean;
  fecha_instalacion: string;
  created_at: string;
  updated_at: string;
  sucursales?: { id: number; nombre: string };
  _count?: { impresiones: number; productos: number };
}

export interface MaquinaStats {
  hoy: number;
  semana: number;
  mes: number;
  total: number;
  recientes: Array<{
    id: number;
    maquina_id: number;
    producto_id: number | null;
    venta_id: number | null;
    merma_id: number | null;
    fue_merma: boolean;
    fecha: string;
    productos?: { id: number; nombre: string } | null;
    usuarios?: { id: number; nombre: string } | null;
  }>;
}

export interface MaquinaReporteCorte {
  maquina_id: number;
  nombre: string;
  tipo: string;
  contador_inicial: number;
  contador_total: number;
  impresiones_periodo: number;
  mermas_periodo: number;
  impresiones_exitosas: number;
}

export interface ReporteCorteResponse {
  maquinas: MaquinaReporteCorte[];
  total_impresiones: number;
  total_mermas: number;
}

export const maquinasApi = {
  getAll: (params?: Record<string, string | number | boolean | undefined>) =>
    apiClient.get<{ success: boolean; data: Maquina[] }>('/maquinas', { params }),
  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: Maquina }>(`/maquinas/${id}`),
  getStats: (id: number, desde?: string) =>
    apiClient.get<{ success: boolean; data: MaquinaStats }>(`/maquinas/${id}/stats`, {
      params: desde ? { desde } : undefined,
    }),
  getReporteCorte: (sucursalId: number, fechaDesde: string) =>
    apiClient.get<{ success: boolean; data: ReporteCorteResponse }>('/maquinas/reporte-corte', {
      params: { sucursalId, fechaDesde },
    }),
  create: (data: Partial<Maquina>) => apiClient.post('/maquinas', data),
  update: (id: number, data: Partial<Maquina>) => apiClient.put(`/maquinas/${id}`, data),
  remove: (id: number) => apiClient.delete(`/maquinas/${id}`),
};

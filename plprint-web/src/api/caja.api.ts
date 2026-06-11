import { apiClient } from './client';

export interface CorteCaja {
  id: number;
  sucursal_id: number;
  usuario_apertura_id: number;
  fecha_apertura: string;
  monto_inicial: string;
  fecha_cierre: string | null;
  usuario_cierre_id: number | null;
  monto_final_esperado: string | null;
  monto_final_real: string | null;
  diferencia: string | null;
  observaciones: string | null;
  estado: 'abierta' | 'cerrada';
  created_at: string;
  updated_at: string;
  sucursales?: { id: number; nombre: string };
  usuario_apertura?: { id: number; nombre: string };
  usuario_cierre?: { id: number; nombre: string };
}

export interface MovimientoCaja {
  fecha: string;
  usuario: string;
  usuario_id: number | null;
  tipo: string;
  tipo_display: string;
  monto: number;
  signo: number;
  metodo_pago: string;
  sucursal_id: number | null;
  referencia_id: number;
  referencia_tipo: string;
  concepto?: string;
}

export interface ResumenCaja {
  total_ventas: number;
  total_ingresos: number;
  total_gastos: number;
  total_retiros: number;
  total_efectivo_ventas: number;
  total_abonos_efectivo: number;
  efectivo_esperado: number;
  monto_inicial: number;
  ventas_por_metodo_pago: Array<{ metodo: string; total: number }>;
}

export type CorteListado = CorteCaja;

export const cajaApi = {
  getEstado: (sucursalId: number) =>
    apiClient.get<{ success: boolean; data: CorteCaja | null }>('/caja/estado', { params: { sucursalId } }),

  aperturar: (data: { sucursal_id: number; monto_inicial: number }) =>
    apiClient.post('/caja/apertura', data),

  realizarCorte: (data: { corte_id: number; monto_final_real: number; observaciones?: string }) =>
    apiClient.post('/caja/corte', data),

  getMovimientos: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/caja/movimientos', { params }),

  getCortes: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/caja/cortes', { params }),

  getCorteById: (id: number) =>
    apiClient.get<{ success: boolean; data: CorteCaja }>(`/caja/cortes/${id}`),

  getCorteReimprimir: (id: number) =>
    apiClient.get<{ success: boolean; data: { corte: CorteCaja; movimientos: MovimientoCaja[]; resumen: ResumenCaja } }>(`/caja/cortes/${id}/reimprimir`),

  registrarIngreso: (data: { sucursal_id: number; categoria_id: number; concepto: string; monto: number; notas?: string }) =>
    apiClient.post('/caja/ingreso', data),

  registrarGasto: (data: { sucursal_id: number; categoria_id: number; concepto: string; monto: number; notas?: string }) =>
    apiClient.post('/caja/gasto', data),

  registrarRetiro: (data: { sucursal_id: number; categoria_id: number; concepto: string; monto: number; notas?: string; autorizado_por?: number }) =>
    apiClient.post('/caja/retiro', data),
};

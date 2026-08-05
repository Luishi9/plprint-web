import { apiClient } from './client';

export interface AuditLog {
  id: number;
  usuario_id: number | null;
  accion: string;
  modulo: string;
  descripcion: string | null;
  detalle: string | null;
  ip: string | null;
  created_at: string;
  usuarios?: { id: number; nombre: string; email: string } | null;
}

export interface AuditStats {
  total: number;
  ultimos_7_dias: number;
  por_modulo: { modulo: string; total: number }[];
  por_accion: { accion: string; total: number }[];
}

export const auditLogApi = {
  getAll: (params: {
    page?: number;
    limit?: number;
    usuarioId?: number;
    modulo?: string;
    accion?: string;
    desde?: string;
    hasta?: string;
  } = {}) => apiClient.get<{ data: AuditLog[]; meta: { page: number; limit: number; total: number; totalPages: number } }>('/audit-log', { params }),
  getById: (id: number) => apiClient.get<{ data: AuditLog }>(`/audit-log/${id}`),
  getStats: () => apiClient.get<{ data: AuditStats }>('/audit-log/estadisticas'),
};

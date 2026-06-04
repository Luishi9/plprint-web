import { apiClient } from './client';

export interface NotificacionConfig {
  id: number;
  tipo: string;
  activo: boolean;
  umbral: string | null;
}

export interface UpdateNotificacionDTO {
  activo?: boolean;
  umbral?: number | null;
}

export const notificacionesApi = {
  getAllConfig: () => apiClient.get<{ data: NotificacionConfig[] }>('/notificaciones/config'),
  getConfigByTipo: (tipo: string) =>
    apiClient.get<{ data: NotificacionConfig }>(`/notificaciones/config/${tipo}`),
  updateConfig: (tipo: string, data: UpdateNotificacionDTO) =>
    apiClient.put(`/notificaciones/config/${tipo}`, data),
  getResumen: () => apiClient.get<{
    data: {
      stock_bajo_productos: number;
      stock_bajo_insumos: number;
      ventas_dia: number;
      ventas_dia_total: number;
      ventas_canceladas: number;
      productos_sin_stock: number;
      total: number;
    };
  }>('/notificaciones/resumen'),
};

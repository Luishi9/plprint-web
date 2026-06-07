import { apiClient } from './client';

export type TipoMedida = 'm2' | 'ml';

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
  es_medida: boolean;
  tipo_medida: TipoMedida | null;
  created_at: string;
}

export const unidadesMedidaApi = {
  getAll: () => apiClient.get('/unidades-medida'),
  create: (data: { nombre: string; abreviatura: string; es_medida?: boolean; tipo_medida?: TipoMedida | null }) =>
    apiClient.post('/unidades-medida', data),
  update: (id: number, data: Partial<{ nombre: string; abreviatura: string; es_medida: boolean; tipo_medida: TipoMedida | null }>) =>
    apiClient.put(`/unidades-medida/${id}`, data),
  remove: (id: number) => apiClient.delete(`/unidades-medida/${id}`),
};

export const TIPO_MEDIDA_LABEL: Record<TipoMedida, string> = {
  m2: 'por m²',
  ml: 'por metro lineal',
};

export interface CalculoMedida {
  precioUnitario: number;
  labelUnidad: string;
  unidadCantidad: number;
}

export const calcularPrecioItem = (
  precioVenta: number,
  _cantidad: number,
  unidad: { es_medida: boolean; tipo_medida: TipoMedida | null } | null | undefined,
  medidas: { ancho_m: number; alto_m: number } = { ancho_m: 0, alto_m: 0 },
): CalculoMedida => {
  if (!unidad?.es_medida || !unidad.tipo_medida) {
    return { precioUnitario: precioVenta, labelUnidad: '', unidadCantidad: 0 };
  }
  if (unidad.tipo_medida === 'm2') {
    const area = (medidas.ancho_m || 0) * (medidas.alto_m || 0);
    return { precioUnitario: precioVenta * area, labelUnidad: `${area.toFixed(2)} m²`, unidadCantidad: area };
  }
  const largo = medidas.alto_m || 0;
  return { precioUnitario: precioVenta * largo, labelUnidad: `${largo.toFixed(2)} m`, unidadCantidad: largo };
};

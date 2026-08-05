import { apiClient } from './client';

export type NivelPrecio = 'medio_mayoreo' | 'mayoreo' | 'super_mayoreo';

export interface NivelPrecioItem {
  id: number;
  producto_id: number;
  nivel: NivelPrecio;
  cantidad_minima: number;
  precio: number | string;
  activo: boolean;
}

export interface PrecioVolumenInput {
  nivel: NivelPrecio;
  cantidad_minima: number;
  precio: number;
}

export const preciosProductoApi = {
  getByProducto: (productoId: number) => apiClient.get(`/productos/${productoId}/precios`),
  create: (productoId: number, data: PrecioVolumenInput) => apiClient.post(`/productos/${productoId}/precios`, data),
  update: (productoId: number, precioId: number, data: Partial<PrecioVolumenInput & { activo: boolean }>) =>
    apiClient.put(`/productos/${productoId}/precios/${precioId}`, data),
  remove: (productoId: number, precioId: number) => apiClient.delete(`/productos/${productoId}/precios/${precioId}`),
};

export const NIVELES_LABEL: Record<NivelPrecio, string> = {
  medio_mayoreo: 'Medio mayoreo',
  mayoreo: 'Mayoreo',
  super_mayoreo: 'Super mayoreo',
};

export const calcularPrecioPorVolumen = (
  precioBase: number,
  cantidad: number,
  precios: Array<{ nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>,
): { precio: number; nivel: NivelPrecio | null } => {
  const aplicables = precios
    .filter((p) => p.activo && cantidad >= p.cantidad_minima)
    .sort((a, b) => b.cantidad_minima - a.cantidad_minima);
  if (aplicables.length === 0) return { precio: precioBase, nivel: null };
  const ganador = aplicables[0];
  return { precio: Number(ganador.precio), nivel: ganador.nivel as NivelPrecio };
};

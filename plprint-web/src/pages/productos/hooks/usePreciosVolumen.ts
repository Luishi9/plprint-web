import { useState } from 'react';
import { preciosProductoApi, NivelPrecio } from '@/api/preciosProducto.api';

type PrecioNivelState = { id: number | null; cantidad_minima: string; precio: string };

const INITIAL_STATE: Record<NivelPrecio, PrecioNivelState> = {
  medio_mayoreo: { id: null, cantidad_minima: '', precio: '' },
  mayoreo: { id: null, cantidad_minima: '', precio: '' },
  super_mayoreo: { id: null, cantidad_minima: '', precio: '' },
};

export function usePreciosVolumen() {
  const [preciosVolumen, setPreciosVolumen] = useState<Record<NivelPrecio, PrecioNivelState>>(INITIAL_STATE);

  const cargarPreciosVolumen = async (productoId: number) => {
    try {
      const res = await preciosProductoApi.getByProducto(productoId);
      const items = (res.data?.data || []) as Array<{ id: number; nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
      const reset: Record<NivelPrecio, PrecioNivelState> = { ...INITIAL_STATE };
      items.forEach((it) => {
        if (it.nivel in reset) {
          reset[it.nivel as NivelPrecio] = {
            id: it.id,
            cantidad_minima: String(it.cantidad_minima),
            precio: String(it.precio),
          };
        }
      });
      setPreciosVolumen(reset);
    } catch (e) {
      console.error('Error cargando precios por volumen', e);
    }
  };

  const sincronizarPreciosVolumen = async (productoId: number) => {
    const niveles: NivelPrecio[] = ['medio_mayoreo', 'mayoreo', 'super_mayoreo'];
    await Promise.all(niveles.map(async (nivel) => {
      const actual = preciosVolumen[nivel];
      const tieneCantidad = actual.cantidad_minima.trim() !== '';
      const tienePrecio = actual.precio.trim() !== '';
      const completo = tieneCantidad && tienePrecio;
      try {
        if (completo && actual.id) {
          await preciosProductoApi.update(productoId, actual.id, {
            cantidad_minima: Number(actual.cantidad_minima),
            precio: Number(actual.precio),
          });
        } else if (completo && !actual.id) {
          await preciosProductoApi.create(productoId, {
            nivel,
            cantidad_minima: Number(actual.cantidad_minima),
            precio: Number(actual.precio),
          });
        } else if (!completo && actual.id) {
          await preciosProductoApi.remove(productoId, actual.id);
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        const msg = err.response?.data?.message || `Error al guardar precio ${nivel}`;
        console.error(msg, e);
      }
    }));
  };

  const resetPreciosVolumen = () => setPreciosVolumen(INITIAL_STATE);

  const handlePrecioChange = (nivel: NivelPrecio, field: 'cantidad_minima' | 'precio', value: string) => {
    setPreciosVolumen((prev) => ({ ...prev, [nivel]: { ...prev[nivel], [field]: value } }));
  };

  return {
    preciosVolumen,
    setPreciosVolumen,
    cargarPreciosVolumen,
    sincronizarPreciosVolumen,
    resetPreciosVolumen,
    handlePrecioChange,
  };
}

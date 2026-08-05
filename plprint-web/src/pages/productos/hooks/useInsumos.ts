import { useState } from 'react';
import type { Insumo } from '@/types/insumo.types';

interface InsumoSeleccionado {
  insumoId: number;
  cantidadRequerida: number;
  insumo: Insumo;
}

export function useInsumos(initialInsumos: Insumo[]) {
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([]);
  const [insumoBusqueda, setInsumoBusqueda] = useState('');
  const [showInsumosDropdown, setShowInsumosDropdown] = useState(false);

  const agregarInsumo = (insumoId: number) => {
    const insumo = initialInsumos.find(i => i.id === insumoId);
    if (!insumo) return;
    if (insumosSeleccionados.some(i => i.insumoId === insumoId)) return;
    setInsumosSeleccionados([...insumosSeleccionados, { insumoId, cantidadRequerida: 1, insumo }]);
    setInsumoBusqueda('');
  };

  const quitarInsumo = (insumoId: number) => {
    setInsumosSeleccionados(insumosSeleccionados.filter(i => i.insumoId !== insumoId));
  };

  const cambiarCantidadInsumo = (insumoId: number, cantidad: number) => {
    setInsumosSeleccionados(
      insumosSeleccionados.map(i =>
        i.insumoId === insumoId ? { ...i, cantidadRequerida: cantidad } : i
      )
    );
  };

  const setInsumos = (insumos: InsumoSeleccionado[]) => setInsumosSeleccionados(insumos);

  return {
    insumosSeleccionados,
    insumoBusqueda,
    showInsumosDropdown,
    setInsumoBusqueda,
    setShowInsumosDropdown,
    setInsumos,
    agregarInsumo,
    quitarInsumo,
    cambiarCantidadInsumo,
  };
}

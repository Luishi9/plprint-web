import { useConfigStore } from '@/store/configStore';

export function useIva() {
  const activo = useConfigStore((s) => s.getBool('iva_activo'));
  const porcentaje = useConfigStore((s) => s.getNum('iva_porcentaje'));

  /** Calcula el desglose de IVA sobre un subtotal. Si IVA está inactivo retorna 0. */
  const calcular = (subtotal: number) => {
    if (!activo || porcentaje <= 0) return { base: subtotal, iva: 0, total: subtotal };
    const base = subtotal / (1 + porcentaje / 100);
    const iva = subtotal - base;
    return { base, iva, total: subtotal };
  };

  return { activo, porcentaje, calcular };
}

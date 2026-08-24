import { useConfigStore } from '@/store/configStore';

export function useIva() {
  const activo = useConfigStore((s) => s.getBool('iva_activo'));
  const porcentaje = useConfigStore((s) => s.getNum('iva_porcentaje'));
  const incluidoEnPrecios = useConfigStore((s) => s.getBool('iva_incluido_en_precios'));

  /**
   * Calcula el desglose de IVA sobre un subtotal (ya con descuento aplicado).
   *
   * - Si IVA inactivo o porcentaje <= 0: retorna 0 (sin desglose).
   * - Si `iva_incluido_en_precios=false` (default): IVA adicional
   *     base = subtotal, iva = base * pct/100, total = base + iva
   * - Si `iva_incluido_en_precios=true`: IVA incluido (desglose)
   *     base = subtotal / (1 + pct/100), iva = subtotal - base, total = subtotal
   *
   * Debe coincidir con el calculo del backend en ventas.service.ts.
   */
  const calcular = (subtotal: number) => {
    if (!activo || porcentaje <= 0) return { base: subtotal, iva: 0, total: subtotal };
    if (incluidoEnPrecios) {
      const base = subtotal / (1 + porcentaje / 100);
      return { base, iva: subtotal - base, total: subtotal };
    }
    const iva = subtotal * (porcentaje / 100);
    return { base: subtotal, iva, total: subtotal + iva };
  };

  return { activo, porcentaje, incluidoEnPrecios, calcular };
}

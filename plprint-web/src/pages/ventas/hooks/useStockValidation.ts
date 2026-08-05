import { useState } from 'react';
import { ventasApi } from '@/api/ventas.api';
import { calcularPrecioPorVolumen } from '@/api/preciosProducto.api';
import { calcularPrecioItem, TipoMedida } from '@/api/unidadesMedida.api';
import { Faltante } from '@/components/forms/StockInsuficienteModal';
import type { CartItemData } from './useCart';

interface ProductoCatalogo {
  id: number;
  nombre: string;
  precio_venta: string;
  imagen_url: string | null;
  codigo: string | null;
  producto_precios?: Array<{ nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
  unidad_info?: { es_medida: boolean; tipo_medida: TipoMedida | null };
  ancho_rollo?: number | null;
  cobrar_minimo_1?: boolean;
}

interface StockAlert {
  open: boolean;
  productoNombre: string;
  cantidadSolicitada: number;
  faltantes: Faltante[];
  pendingProduct: ProductoCatalogo | null;
}

export function useStockValidation(
  sucursalEfectiva: { id: number } | null,
  cart: CartItemData[],
  addToCart: (p: ProductoCatalogo) => void,
  updateQty: (id: number, delta: number) => void,
  setQty: (id: number, newQty: number) => void,
  setCart: React.Dispatch<React.SetStateAction<CartItemData[]>>,
) {
  const [stockAlert, setStockAlert] = useState<StockAlert | null>(null);

  const validarStockYAgregar = async (p: ProductoCatalogo) => {
    if (!sucursalEfectiva) return;
    const existing = cart.find((i) => i.productoId === p.id);
    const cantidadFinal = (existing?.cantidad || 0) + 1;
    try {
      const res = await ventasApi.validarInsumos({
        sucursalId: sucursalEfectiva.id,
        items: [{ productoId: p.id, cantidad: cantidadFinal }],
      });
      const data = res.data?.data as { suficiente: boolean; faltantes: Faltante[] };
      if (data && !data.suficiente && data.faltantes.length > 0) {
        setStockAlert({ open: true, productoNombre: p.nombre, cantidadSolicitada: cantidadFinal, faltantes: data.faltantes, pendingProduct: p });
        return;
      }
    } catch (e) { console.error('Error validando stock:', e); }
    addToCart(p);
  };

  const validarStockYActualizarQty = async (id: number, delta: number) => {
    if (delta > 0 && sucursalEfectiva) {
      const item = cart.find((i) => i.productoId === id);
      if (item) {
        const nuevaCantidad = item.cantidad + delta;
        try {
          const res = await ventasApi.validarInsumos({
            sucursalId: sucursalEfectiva.id,
            items: [{ productoId: id, cantidad: nuevaCantidad }],
          });
          const data = res.data?.data as { suficiente: boolean; faltantes: Faltante[] };
          if (data && !data.suficiente && data.faltantes.length > 0) {
            setStockAlert({ open: true, productoNombre: item.nombre, cantidadSolicitada: nuevaCantidad, faltantes: data.faltantes, pendingProduct: null });
            return;
          }
        } catch (e) { console.error('Error validando stock:', e); }
      }
    }
    updateQty(id, delta);
  };

  const validarStockYSetQty = async (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    if (sucursalEfectiva) {
      const item = cart.find((i) => i.productoId === id);
      if (item && nuevaCantidad > item.cantidad) {
        try {
          const res = await ventasApi.validarInsumos({
            sucursalId: sucursalEfectiva.id,
            items: [{ productoId: id, cantidad: nuevaCantidad }],
          });
          const data = res.data?.data as { suficiente: boolean; faltantes: Faltante[] };
          if (data && !data.suficiente && data.faltantes.length > 0) {
            setStockAlert({ open: true, productoNombre: item.nombre, cantidadSolicitada: nuevaCantidad, faltantes: data.faltantes, pendingProduct: null });
            return;
          }
        } catch (e) { console.error('Error validando stock:', e); }
      }
    }
    setQty(id, nuevaCantidad);
  };

  const handleQtyInputBlur = (id: number, qtyInputs: Record<number, string>, setQtyInputs: React.Dispatch<React.SetStateAction<Record<number, string>>>) => {
    const raw = qtyInputs[id];
    if (raw === undefined || raw === '') {
      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 1) {
      validarStockYSetQty(id, val);
    }
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const continuarConStockAlert = (p: ProductoCatalogo | null) => {
    if (p) {
      setCart((prev) => {
        const ex = prev.find((i) => i.productoId === p.id);
        if (ex) {
          return prev.map((i) =>
            i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1 } : i,
          );
        }
        const niveles = p.producto_precios || [];
        const calc = calcularPrecioPorVolumen(Number(p.precio_venta), 1, niveles);
        const esMedida = !!p.unidad_info?.es_medida;
        const tipoMedida = p.unidad_info?.tipo_medida ?? null;
        const calcMedida = calcularPrecioItem(
          Number(p.precio_venta),
          1,
          { es_medida: esMedida, tipo_medida: tipoMedida },
          undefined,
          p.cobrar_minimo_1 ?? false,
        );
        return [...prev, {
          productoId: p.id,
          nombre: p.nombre,
          precioBase: Number(p.precio_venta),
          precioUnitario: esMedida && tipoMedida ? (calcMedida.precioUnitario || calc.precio) : calc.precio,
          cantidad: 1,
          descuento: 0,
          niveles,
          nivelAplicado: calc.nivel,
          esMedida,
          tipoMedida,
          ancho_m: p.ancho_rollo || 0,
          alto_m: 0,
          labelUnidad: calcMedida.labelUnidad,
          anchoRollo: p.ancho_rollo ?? null,
          cobrarMinimo1: p.cobrar_minimo_1 ?? false,
        }];
      });
    }
    setStockAlert(null);
  };

  return {
    stockAlert,
    setStockAlert,
    validarStockYAgregar,
    validarStockYActualizarQty,
    validarStockYSetQty,
    handleQtyInputBlur,
    continuarConStockAlert,
  };
}

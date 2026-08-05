import { useState } from 'react';
import { calcularPrecioPorVolumen, NivelPrecio } from '@/api/preciosProducto.api';
import { calcularPrecioItem, TipoMedida } from '@/api/unidadesMedida.api';

export interface CartItemData {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  precioBase: number;
  cantidad: number;
  descuento: number;
  niveles: Array<{ nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
  nivelAplicado: NivelPrecio | null;
  esMedida: boolean;
  tipoMedida: TipoMedida | null;
  ancho_m: number;
  alto_m: number;
  labelUnidad: string;
  anchoRollo: number | null;
  cobrarMinimo1: boolean;
}

interface ProductoCart {
  id: number;
  nombre: string;
  precio_venta: string;
  producto_precios?: Array<{ nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
  unidad_info?: { es_medida: boolean; tipo_medida: TipoMedida | null };
  ancho_rollo?: number | null;
  cobrar_minimo_1?: boolean;
}

function calcularRecalculado(item: CartItemData, cantidad: number, medidas?: { ancho_m: number; alto_m: number }) {
  const calcPrecio = calcularPrecioPorVolumen(item.precioBase, cantidad, item.niveles);
  const itemMedidas = medidas || (item.anchoRollo
    ? { ancho_m: 0, alto_m: item.alto_m }
    : { ancho_m: item.ancho_m, alto_m: item.alto_m });
  const calcMedida = calcularPrecioItem(
    item.precioBase, cantidad,
    { es_medida: item.esMedida, tipo_medida: item.tipoMedida },
    itemMedidas, item.cobrarMinimo1,
  );
  return {
    precioUnitario: item.esMedida && item.tipoMedida
      ? (calcMedida.precioUnitario || calcPrecio.precio)
      : calcPrecio.precio,
    nivelAplicado: calcPrecio.nivel,
    labelUnidad: calcMedida.labelUnidad,
  };
}

export function useCart() {
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({});

  const addToCart = (p: ProductoCart) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.productoId === p.id);
      if (ex) {
        const nuevaCantidad = ex.cantidad + 1;
        const recalc = calcularRecalculado(ex, nuevaCantidad);
        return prev.map((i) =>
          i.productoId === p.id ? { ...i, cantidad: nuevaCantidad, ...recalc } : i,
        );
      }
      const niveles = p.producto_precios || [];
      const calcPrecio = calcularPrecioPorVolumen(Number(p.precio_venta), 1, niveles);
      const esMedida = !!p.unidad_info?.es_medida;
      const tipoMedida = p.unidad_info?.tipo_medida ?? null;
      const anchoRollo = p.ancho_rollo ?? null;
      const cobrarMinimo1 = p.cobrar_minimo_1 ?? false;
      const calcMedida = calcularPrecioItem(
        Number(p.precio_venta), 1,
        { es_medida: esMedida, tipo_medida: tipoMedida },
        { ancho_m: 0, alto_m: 0 }, cobrarMinimo1,
      );
      return [...prev, {
        productoId: p.id,
        nombre: p.nombre,
        precioBase: Number(p.precio_venta),
        precioUnitario: esMedida && tipoMedida ? (calcMedida.precioUnitario || calcPrecio.precio) : calcPrecio.precio,
        cantidad: 1,
        descuento: 0,
        niveles,
        nivelAplicado: calcPrecio.nivel,
        esMedida,
        tipoMedida,
        ancho_m: anchoRollo || 0,
        alto_m: 0,
        labelUnidad: calcMedida.labelUnidad,
        anchoRollo,
        cobrarMinimo1,
      }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.reduce<CartItemData[]>((acc, i) => {
        if (i.productoId === id) {
          const cantidad = Math.max(1, i.cantidad + delta);
          if (cantidad > 0) acc.push({ ...i, cantidad, ...calcularRecalculado(i, cantidad) });
        } else if (i.cantidad > 0) {
          acc.push(i);
        }
        return acc;
      }, []),
    );
  };

  const setQty = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.productoId !== id) return i;
        const cantidad = Math.max(1, nuevaCantidad);
        const recalc = calcularRecalculado(i, cantidad);
        return { ...i, cantidad, ...recalc };
      }),
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((i) => i.productoId !== id));
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleQtyInputChange = (id: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleQtyInputBlur = (id: number) => {
    setQtyInputs((prev) => {
      const raw = prev[id];
      if (raw === undefined || raw === '') {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return prev;
    });
    const raw = qtyInputs[id];
    if (raw !== undefined && raw !== '') {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 1) {
        setQty(id, val);
      }
    }
  };

  const setMedidas = (id: number, medidas: { ancho_m: number; alto_m: number }) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.productoId !== id) return i;
        const recalc = calcularRecalculado(i, i.cantidad, medidas);
        return { ...i, ancho_m: medidas.ancho_m, alto_m: medidas.alto_m, ...recalc };
      }),
    );
  };

  const subtotal = cart.reduce((acc, i) => acc + i.precioUnitario * i.cantidad - i.descuento, 0);

  const setCartItems = (items: CartItemData[] | ((prev: CartItemData[]) => CartItemData[])) => setCart(items as any);

  return {
    cart, setCart: setCartItems,
    qtyInputs, setQtyInputs,
    subtotal,
    addToCart, updateQty, setQty,
    removeItem, handleQtyInputChange, handleQtyInputBlur, setMedidas,
  };
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { productosApi } from '@/api/productos.api';
import { clientesApi } from '@/api/clientes.api';
import { ventasApi } from '@/api/ventas.api';
import { cotizacionesApi, Cotizacion } from '@/api/cotizaciones.api';
import { calcularPrecioPorVolumen, NivelPrecio, NIVELES_LABEL } from '@/api/preciosProducto.api';
import { calcularPrecioItem, TipoMedida } from '@/api/unidadesMedida.api';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { useIva } from '@/hooks/useIva';
import { useMoney } from '@/hooks/useMoney';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { TicketImpresion, TicketData, buildTicketHtml } from './components/TicketImpresion';
import QRTicketModal from './components/QRTicketModal';
import CotizacionSelectorModal from '@/components/forms/CotizacionSelectorModal';
import { useCotizacionPdfBuilder } from '@/components/forms/CotizacionPdf';
import MontoRecibidoInput from '@/components/forms/MontoRecibidoInput';
import StockInsuficienteModal, { Faltante } from '@/components/forms/StockInsuficienteModal';
import { getImageUrl } from '@/utils/format';

interface ProductoCatalogo {
  id: number;
  nombre: string;
  precio_venta: string;
  imagen_url: string | null;
  codigo: string | null;
  producto_precios?: Array<{ nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
  unidad_info?: { es_medida: boolean; tipo_medida: TipoMedida | null };
}

interface CartItem {
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
}

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
}

export default function NuevaVentaPage() {
  const navigate = useNavigate();
  const { sucursalActiva } = useSucursalStore() as any;
  const { usuario } = useAuthStore();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;

  // Catálogo
  const [productSearch, setProductSearch] = useState('');
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({});
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [descuentoMotivo, setDescuentoMotivo] = useState('');

  // Cliente
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showClientes, setShowClientes] = useState(false);

  // Pago
  const [metodoPago, setMetodoPago] = useState<string>('efectivo');
  const [notas, setNotas] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingCotizacion, setIsSavingCotizacion] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [cotizacionFolio, setCotizacionFolio] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [cotizacionOrigenId, setCotizacionOrigenId] = useState<number | null>(null);
  const [showCotizacionesModal, setShowCotizacionesModal] = useState(false);
  const [stockAlert, setStockAlert] = useState<{
    open: boolean;
    productoNombre: string;
    cantidadSolicitada: number;
    faltantes: Faltante[];
    pendingProduct: ProductoCatalogo | null;
  } | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Buscar productos con debounce
  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productosApi.getAll({ search: productSearch || undefined, limit: 20 });
        setProductos(res.data?.data || []);
      } catch (e: any) {
        if (e?.code !== 'ERR_CANCELED') console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Buscar clientes con debounce
  useEffect(() => {
    if (!clienteSearch.trim()) { setClientes([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await clientesApi.getAll({ search: clienteSearch, limit: 5 });
        setClientes(res.data?.data || []);
      } catch (_) { }
    }, 300);
    return () => clearTimeout(timer);
  }, [clienteSearch]);

  const addToCart = async (p: ProductoCatalogo) => {
    if (!sucursalEfectiva) return;
    // Calcular cantidad final tentativa
    const existing = cart.find((i) => i.productoId === p.id);
    const cantidadFinal = (existing?.cantidad || 0) + 1;
    // Validar stock de insumos
    try {
      const res = await ventasApi.validarInsumos({
        sucursalId: sucursalEfectiva.id,
        items: [{ productoId: p.id, cantidad: cantidadFinal }],
      });
      const data = res.data?.data as { suficiente: boolean; faltantes: Array<{ insumo: string; requerido: number; disponible: number; deficit: number }> };
      if (data && !data.suficiente && data.faltantes.length > 0) {
        setStockAlert({
          open: true,
          productoNombre: p.nombre,
          cantidadSolicitada: cantidadFinal,
          faltantes: data.faltantes,
          pendingProduct: p,
        });
        return;
      }
    } catch (e) {
      console.error('Error validando stock:', e);
    }
    setCart((prev) => {
      const ex = prev.find((i) => i.productoId === p.id);
      if (ex) {
        const nuevaCantidad = ex.cantidad + 1;
        const calcPrecio = calcularPrecioPorVolumen(ex.precioBase, nuevaCantidad, ex.niveles);
        const calcMedida = calcularPrecioItem(
          ex.precioBase,
          nuevaCantidad,
          { es_medida: ex.esMedida, tipo_medida: ex.tipoMedida },
          { ancho_m: ex.ancho_m, alto_m: ex.alto_m },
        );
        return prev.map((i) =>
          i.productoId === p.id
            ? {
              ...i,
              cantidad: nuevaCantidad,
              precioUnitario: i.esMedida && i.tipoMedida ? (calcMedida.precioUnitario || calcPrecio.precio) : calcPrecio.precio,
              nivelAplicado: calcPrecio.nivel,
              labelUnidad: calcMedida.labelUnidad,
            }
            : i,
        );
      }
      const niveles = p.producto_precios || [];
      const calcPrecio = calcularPrecioPorVolumen(Number(p.precio_venta), 1, niveles);
      const esMedida = !!p.unidad_info?.es_medida;
      const tipoMedida = p.unidad_info?.tipo_medida ?? null;
      const calcMedida = calcularPrecioItem(
        Number(p.precio_venta),
        1,
        { es_medida: esMedida, tipo_medida: tipoMedida },
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
        ancho_m: 0,
        alto_m: 0,
        labelUnidad: calcMedida.labelUnidad,
      }];
    });
  };

  const updateQty = async (id: number, delta: number) => {
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
            setStockAlert({
              open: true,
              productoNombre: item.nombre,
              cantidadSolicitada: nuevaCantidad,
              faltantes: data.faltantes,
              pendingProduct: null,
            });
            return;
          }
        } catch (e) {
          console.error('Error validando stock:', e);
        }
      }
    }
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productoId !== id) return i;
          const cantidad = Math.max(1, i.cantidad + delta);
          const calcPrecio = calcularPrecioPorVolumen(i.precioBase, cantidad, i.niveles);
          const calcMedida = calcularPrecioItem(
            i.precioBase,
            cantidad,
            { es_medida: i.esMedida, tipo_medida: i.tipoMedida },
            { ancho_m: i.ancho_m, alto_m: i.alto_m },
          );
          return {
            ...i,
            cantidad,
            precioUnitario: i.esMedida && i.tipoMedida ? (calcMedida.precioUnitario || calcPrecio.precio) : calcPrecio.precio,
            nivelAplicado: calcPrecio.nivel,
            labelUnidad: calcMedida.labelUnidad,
          };
        })
        .filter((i) => i.cantidad > 0),
    );
  };

  const setQty = async (id: number, nuevaCantidad: number) => {
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
            setStockAlert({
              open: true,
              productoNombre: item.nombre,
              cantidadSolicitada: nuevaCantidad,
              faltantes: data.faltantes,
              pendingProduct: null,
            });
            return;
          }
        } catch (e) {
          console.error('Error validando stock:', e);
        }
      }
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.productoId !== id) return i;
        const cantidad = Math.max(1, nuevaCantidad);
        const calcPrecio = calcularPrecioPorVolumen(i.precioBase, cantidad, i.niveles);
        const calcMedida = calcularPrecioItem(
          i.precioBase,
          cantidad,
          { es_medida: i.esMedida, tipo_medida: i.tipoMedida },
          { ancho_m: i.ancho_m, alto_m: i.alto_m },
        );
        return {
          ...i,
          cantidad,
          precioUnitario: i.esMedida && i.tipoMedida ? (calcMedida.precioUnitario || calcPrecio.precio) : calcPrecio.precio,
          nivelAplicado: calcPrecio.nivel,
          labelUnidad: calcMedida.labelUnidad,
        };
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
      setQty(id, val);
    }
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const setMedidas = (id: number, medidas: { ancho_m: number; alto_m: number }) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.productoId !== id) return i;
        const calcMedida = calcularPrecioItem(
          i.precioBase,
          i.cantidad,
          { es_medida: i.esMedida, tipo_medida: i.tipoMedida },
          medidas,
        );
        const calcPrecio = calcularPrecioPorVolumen(i.precioBase, i.cantidad, i.niveles);
        return {
          ...i,
          ancho_m: medidas.ancho_m,
          alto_m: medidas.alto_m,
          precioUnitario: i.esMedida && i.tipoMedida ? (calcMedida.precioUnitario || calcPrecio.precio) : calcPrecio.precio,
          labelUnidad: calcMedida.labelUnidad,
        };
      }),
    );
  };

  const subtotal = cart.reduce((acc, i) => acc + i.precioUnitario * i.cantidad - i.descuento, 0);
  const subtotalConDescuento = Math.max(0, subtotal - descuentoGlobal);
  const { activo: ivaActivo, porcentaje: ivaPorcentaje, calcular: calcularIva } = useIva();
  const { format: money, simbolo: monedaSimbolo, decimales: monedaDecimales } = useMoney();
  const { src: logoSrc } = useEmpresaLogo();
  const { activos: metodosPagoActivos, getLabel: getMetodoLabel, getIcon: getMetodoIcon } = useMetodosPago();
  const cotizacionPdf = useCotizacionPdfBuilder();
  const desgloseIva = calcularIva(subtotalConDescuento);
  const total = desgloseIva.total;

  useEffect(() => {
    if (metodosPagoActivos.length === 0) return;
    if (!metodosPagoActivos.some((m) => m.nombre.toLowerCase() === metodoPago.toLowerCase())) {
      setMetodoPago(metodosPagoActivos[0].nombre.toLowerCase());
    }
  }, [metodosPagoActivos, metodoPago]);

  const handleSubmit = async () => {
    if (!cart.length) return;
    if (!sucursalEfectiva) { alert('No hay sucursal activa.'); return; }
    const invalidItem = cart.find((i) => !Number.isInteger(i.cantidad) || i.cantidad < 1);
    if (invalidItem) {
      alert(`Cantidad inválida para "${invalidItem.nombre}". Ingresa un número entero mayor a 0.`);
      return;
    }
    if (descuentoGlobal > 0 && descuentoMotivo.trim().length < 3) {
      alert('Debes indicar el motivo del descuento (mínimo 3 caracteres).');
      return;
    }
    const montoRecibidoNum = Number(montoRecibido) || 0;
    if (montoRecibidoNum < 0) { alert('El monto recibido no puede ser negativo.'); return; }
    setIsSubmitting(true);
    try {
      // Si viene de cotización, convertirla directamente
      if (cotizacionOrigenId) {
        const res = await cotizacionesApi.convertirAVenta(cotizacionOrigenId, {
          descuento: descuentoGlobal,
          descuento_motivo: descuentoGlobal > 0 ? descuentoMotivo.trim() : undefined,
          sucursal_id: sucursalEfectiva.id,
          metodo_pago: metodoPago,
          notas: notas || undefined,
        });
        const ventaId = (res.data as { data: { id: number } }).data.id;
        setSuccessId(ventaId);
        setCotizacionOrigenId(null);
        const cambioCot = Math.max(0, montoRecibidoNum - total);
        const saldoCot = Math.max(0, total - montoRecibidoNum);
        setTicketData({
          ventaId,
          fecha: new Date(),
          sucursal: sucursalEfectiva?.nombre ?? 'Sucursal',
          cajero: usuario?.nombre ?? 'Cajero',
          cliente: clienteSeleccionado?.nombre ?? 'Público General',
          metodoPago,
          metodoPagoLabel: getMetodoLabel(metodoPago),
          items: cart.map((i) => ({
            nombre: i.nombre,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            descuento: i.descuento,
            ancho_m: i.ancho_m || undefined,
            alto_m: i.alto_m || undefined,
            labelUnidad: i.labelUnidad || undefined,
            esMedida: i.esMedida,
            tipoMedida: i.tipoMedida,
          })),
          subtotal,
          descuentoGlobal,
          monedaSimbolo,
          monedaDecimales,
          base: desgloseIva.base,
          iva: desgloseIva.iva,
          ivaPorcentaje,
          ivaActivo,
          total,
          montoRecibido: montoRecibidoNum > 0 ? montoRecibidoNum : undefined,
          cambio: cambioCot > 0 ? cambioCot : undefined,
          saldoPendiente: saldoCot > 0 ? saldoCot : undefined,
          notas: notas || undefined,
        });
        return;
      }

      // Validar stock de insumos antes de crear la venta (última barrera)
      await ventasApi.validarInsumos({
        sucursalId: sucursalEfectiva.id,
        items: cart.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
        })),
      });

      const estadoPago = montoRecibidoNum >= total ? 'pagada' : (montoRecibidoNum > 0 ? 'parcial' : 'pendiente');

      const res = await ventasApi.create({
        sucursalId: sucursalEfectiva.id,
        clienteId: clienteSeleccionado?.id,
        metodoPago,
        descuento: descuentoGlobal,
        descuento_motivo: descuentoGlobal > 0 ? descuentoMotivo.trim() : undefined,
        notas: notas || undefined,
        estadoPago,
        saldoInicial: estadoPago === 'pagada' ? 0 : (total - montoRecibidoNum),
        items: cart.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          ...(i.esMedida && i.ancho_m > 0 ? { ancho_m: i.ancho_m } : {}),
          ...(i.esMedida && i.alto_m > 0 ? { alto_m: i.alto_m } : {}),
          ...(i.esMedida && i.tipoMedida ? { unidad_medida_detalle: i.tipoMedida } : {}),
        })),
      });
      const ventaId = res.data?.data?.id ?? res.data?.id ?? 1;
      setSuccessId(ventaId);
      const cambio = Math.max(0, montoRecibidoNum - total);
      const saldoPendiente = Math.max(0, total - montoRecibidoNum);
      setTicketData({
        ventaId,
        fecha: new Date(),
        sucursal: sucursalEfectiva?.nombre ?? 'Sucursal',
        cajero: usuario?.nombre ?? 'Cajero',
        cliente: clienteSeleccionado?.nombre ?? 'Público General',
        metodoPago,
        metodoPagoLabel: getMetodoLabel(metodoPago),
        items: cart.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          ancho_m: i.ancho_m || undefined,
          alto_m: i.alto_m || undefined,
          labelUnidad: i.labelUnidad || undefined,
          esMedida: i.esMedida,
          tipoMedida: i.tipoMedida,
        })),
        subtotal,
        descuentoGlobal,
        monedaSimbolo,
        monedaDecimales,
        base: desgloseIva.base,
        iva: desgloseIva.iva,
        ivaPorcentaje,
        ivaActivo,
        total,
        montoRecibido: montoRecibidoNum > 0 ? montoRecibidoNum : undefined,
        cambio: cambio > 0 ? cambio : undefined,
        saldoPendiente: saldoPendiente > 0 ? saldoPendiente : undefined,
        notas: notas || undefined,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar la venta';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardarComoCotizacion = async () => {
    if (!cart.length) return;
    if (!sucursalEfectiva) { alert('No hay sucursal activa.'); return; }
    if (descuentoGlobal > 0 && descuentoMotivo.trim().length < 3) {
      alert('Debes indicar el motivo del descuento (mínimo 3 caracteres).');
      return;
    }
    setIsSavingCotizacion(true);
    try {
      const payload = {
        cliente_id: clienteSeleccionado?.id,
        sucursal_id: sucursalEfectiva.id,
        descuento: descuentoGlobal,
        descuento_motivo: descuentoGlobal > 0 ? descuentoMotivo.trim() : undefined,
        notas: notas || undefined,
        items: cart.map((i) => ({
          producto_id: i.productoId,
          cantidad: i.cantidad,
          precio_unitario: i.precioUnitario,
          descuento: i.descuento,
          ...(i.esMedida && i.ancho_m > 0 ? { ancho_m: i.ancho_m } : {}),
          ...(i.esMedida && i.alto_m > 0 ? { alto_m: i.alto_m } : {}),
          ...(i.esMedida && i.tipoMedida ? { unidad_medida_detalle: i.tipoMedida } : {}),
        })),
      };
      if (cotizacionOrigenId) {
        const res = await cotizacionesApi.update(cotizacionOrigenId, payload);
        const data = (res.data as { data: { id: number; folio: string } }).data;
        setCotizacionFolio(data.folio);
      } else {
        const res = await cotizacionesApi.create(payload);
        const data = (res.data as { data: { id: number; folio: string } }).data;
        setCotizacionFolio(data.folio);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Error al guardar cotización');
    } finally {
      setIsSavingCotizacion(false);
    }
  };

  const cargarCotizacion = async (cot: Cotizacion) => {
    try {
      let detalle = cot.cotizacion_detalle;
      if (!detalle || detalle.length === 0) {
        const res = await cotizacionesApi.getById(cot.id);
        detalle = (res.data as { data: { cotizacion_detalle: typeof detalle } }).data.cotizacion_detalle;
      }
      if (!detalle) return;
      setCart(detalle.map((d) => ({
        productoId: d.producto_id,
        nombre: d.productos?.nombre || `Producto #${d.producto_id}`,
        precioBase: Number(d.precio_unitario),
        precioUnitario: Number(d.precio_unitario),
        cantidad: d.cantidad,
        descuento: Number(d.descuento || 0),
        niveles: [],
        nivelAplicado: null,
        esMedida: false,
        tipoMedida: null,
        ancho_m: d.ancho_m ? Number(d.ancho_m) : 0,
        alto_m: d.alto_m ? Number(d.alto_m) : 0,
        labelUnidad: '',
      })));
      if (cot.cliente_id && cot.clientes) {
        setClienteSeleccionado({ id: cot.clientes.id, nombre: cot.clientes.nombre });
      }
      setDescuentoGlobal(Number(cot.descuento));
      setDescuentoMotivo(cot.descuento_motivo || '');
      setNotas(cot.notas || '');
      setCotizacionOrigenId(cot.id);
    } catch (e) {
      console.error(e);
      alert('Error al cargar la cotización');
    }
  };

  if (cotizacionFolio) {
    const handleDescargarPdf = () => {
      cotizacionPdf.descargarPdf({
        folio: cotizacionFolio,
        fecha: new Date(),
        cliente: clienteSeleccionado?.nombre || 'Público General',
        vendedor: usuario?.nombre || '—',
        sucursal: sucursalEfectiva?.nombre || '—',
        items: cart.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          ancho_m: i.ancho_m || undefined,
          alto_m: i.alto_m || undefined,
          labelUnidad: i.labelUnidad || undefined,
          esMedida: i.esMedida,
          tipoMedida: i.tipoMedida,
        })),
        subtotal,
        descuento: descuentoGlobal,
        descuentoMotivo: descuentoMotivo || undefined,
        total,
        notas: notas || undefined,
        logoUrl: logoSrc,
      });
    };

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 flex items-center justify-center">
            <Icon name="draw" size={40} className="text-[#2e9e9b]" />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Cotización guardada!</h2>
          <p className="text-muted-foreground">Folio: <span className="text-[#2e9e9b] font-mono font-bold">{cotizacionFolio}</span></p>
          <p className="text-3xl font-bold text-[#2e9e9b]">
            {money(total)}
          </p>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setCart([]);
                setClienteSeleccionado(null);
                setDescuentoGlobal(0);
                setDescuentoMotivo('');
                setNotas('');
                setMontoRecibido('');
                setCotizacionFolio(null);
              }}
              className="border-border"
            >
              Nueva cotización
            </Button>
            <Button
              onClick={handleDescargarPdf}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
            >
              <Icon name="download" size={16} />
              Descargar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCotizacionFolio(null);
                navigate('/cotizaciones');
              }}
              className="border-border"
            >
              Ver cotizaciones
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (successId) {
    const handlePrint = () => {
      if (!ticketData) return;
      const html = buildTicketHtml(ticketData, logoSrc);
      const printWin = window.open('', '_blank', 'width=420,height=700,scrollbars=yes');
      if (!printWin) { alert('Permite las ventanas emergentes para imprimir.'); return; }
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      // Esperar a que carguen las imágenes antes de imprimir
      printWin.onload = () => { printWin.focus(); printWin.print(); };
    };

    return (
      <>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <TicketImpresion ref={ticketRef} data={ticketData} />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 flex items-center justify-center">
              <Icon name="check" size={40} className="text-[#2e9e9b]" />
            </div>
            <h2 className="text-2xl font-bold text-white">¡Venta registrada!</h2>
            <p className="text-muted-foreground">Venta #{successId} completada correctamente.</p>
            <p className="text-3xl font-bold text-[#2e9e9b]">
              {money(total)}
            </p>
            <div className="flex gap-3 mt-2 flex-wrap justify-center">
              <Button
                variant="outline"
                onClick={() => { setCart([]); setSuccessId(null); setClienteSeleccionado(null); setDescuentoGlobal(0); setDescuentoMotivo(''); setNotas(''); setTicketData(null); setMontoRecibido(''); }}
                className="border-border"
              >
                Nueva venta
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="border-border gap-2"
              >
                <Icon name="print" size={16} />
                Imprimir ticket
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQR(true)}
                className="border-border gap-2"
              >
                <Icon name="qr_code" size={16} />
                QR para cliente
              </Button>
              <Button
                onClick={() => navigate('/ventas')}
                className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
              >
                Ver historial
              </Button>
            </div>
          </motion.div>
        </div>

        <QRTicketModal data={ticketData} open={showQR} onClose={() => setShowQR(false)} />
      </>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ventas')} className="text-muted-foreground hover:text-white">
            <Icon name="arrow_back" size={18} />
          </Button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Icon name="shopping_cart" className="text-[#2e9e9b]" size={24} />
              Nueva Venta
            </h2>
            <p className="text-xs text-muted-foreground">{sucursalEfectiva?.nombre ?? 'Sin sucursal'}</p>
          </div>
        </div>
        <RequirePermission modulo="cotizaciones" accion="ver">
          <Button
            variant="outline"
            onClick={() => setShowCotizacionesModal(true)}
            className="border-[#2e9e9b]/40 text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
          >
            <Icon name="description" size={16} className="mr-2" /> Ver cotizaciones
          </Button>
        </RequirePermission>
      </div>

      {cotizacionOrigenId && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 rounded-md px-3 py-2 text-xs text-[#2e9e9b] flex items-center justify-between"
        >
          <span>
            <Icon name="draw" size={12} className="inline mr-1" />
            Productos cargados desde cotización #{cotizacionOrigenId}. Al confirmar se generará la venta automáticamente.
          </span>
          <button
            onClick={() => setCotizacionOrigenId(null)}
            className="text-muted-foreground hover:text-white"
          >
            <Icon name="close" size={14} />
          </button>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 h-[calc(100vh-12rem)]">

        {/* LEFT — Catálogo */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 h-full">
          <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                {isSearching
                  ? <Icon name="progress_activity" className="h-4 w-4 text-[#2e9e9b] animate-spin" />
                  : <Icon name="search" className="h-4 w-4 text-muted-foreground" />}
              </div>
              <Input
                placeholder="Buscar producto por nombre o código..."
                className="pl-9 bg-card border-border focus-visible:ring-[#2e9e9b]"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productSearch && productos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-card border border-border rounded-lg shadow-xl z-10">
                  {productos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        addToCart(p);
                        setProductSearch('');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#2e9e9b]/10 transition-colors text-left border-b border-border/50 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-background/50 flex-shrink-0 flex items-center justify-center">
                        {p.imagen_url ? (
                          <img src={getImageUrl(p.imagen_url)} alt={p.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Icon name="inventory_2" size={16} className="text-muted-foreground/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.nombre}</p>
                        <p className="text-xs text-muted-foreground">{p.codigo ? `#${p.codigo}` : 'Sin código'}</p>
                      </div>
                      <span className="text-sm font-bold text-[#2e9e9b]">{money(Number(p.precio_venta))}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 min-h-0">
                <AnimatePresence>
                  {productos.map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => addToCart(p)}
                      className="group relative flex flex-col items-stretch rounded-xl border border-border bg-card/60 hover:border-[#2e9e9b]/50 hover:bg-card transition-all text-left overflow-hidden p-3"
                    >

                      <div className="flex-1 min-h-0 mb-2 text-center">
                        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{p.nombre}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-background/50 flex-shrink-0 flex items-center justify-center">
                          {p.imagen_url ? (
                            <img src={getImageUrl(p.imagen_url)} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                              <Icon name="inventory_2" size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-lg font-extrabold text-[#2e9e9b]">{money(Number(p.precio_venta))}</span>
                          <span className="text-xs text-muted-foreground">{p.codigo ? `#${p.codigo}` : ''}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {p.unidad_info?.es_medida && p.unidad_info.tipo_medida && (
                            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                              {p.unidad_info.tipo_medida === 'm2' ? 'm²' : 'ml'}
                            </span>
                          )}
                          {p.producto_precios && p.producto_precios.filter((n) => n.activo).length > 0 && (
                            <span className="text-[10px] text-muted-foreground">Precios por volumen disponibles</span>
                          )}
                        </div>

                        <button type="button" className="inline-flex items-center gap-2 bg-[#2e9e9b] text-black rounded px-2 py-1 text-sm font-semibold shadow-sm">
                          <Icon name="add" size={14} />
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {!isSearching && productos.length === 0 && (
                  <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground text-sm">
                    No se encontraron productos.
                  </div>
                )}
              </div>
            </div>

            {/* Carrito */}
            <div className="rounded-xl border border-border bg-card/50 flex flex-col overflow-hidden h-[320px]">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Icon name="shopping_cart" size={14} className="text-[#2e9e9b]" />
                  Carrito
                </span>
                <span className="text-xs text-muted-foreground">{cart.length} ítem(s)</span>
              </div>
              <div className="flex-1 flex flex-col divide-y divide-border overflow-y-auto">
                <AnimatePresence>
                  {cart.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center text-sm text-muted-foreground">
                      Agrega productos del catálogo
                    </motion.div>
                  )}
                  {cart.map((item) => (
                    <motion.div
                      key={item.productoId}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-foreground">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.esMedida && item.labelUnidad
                            ? `${item.labelUnidad} × ${money(item.precioBase)} c/u`
                            : `${money(item.precioUnitario)} c/u`}
                        </p>
                        {item.nivelAplicado && (
                          <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                            {NIVELES_LABEL[item.nivelAplicado]}
                          </span>
                        )}
                      </div>
                      {item.esMedida && (
                        <div className="flex items-center gap-1 text-xs font-mono">
                          <span className="text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                            {item.tipoMedida === 'm2' ? 'm²' : 'ml'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.ancho_m || ''}
                            placeholder="ancho"
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              setMedidas(item.productoId, { ancho_m: isNaN(v) ? 0 : v, alto_m: item.alto_m });
                            }}
                            className="w-14 text-center bg-transparent border border-border rounded-md px-1 py-0.5 focus:outline-none focus:border-[#2e9e9b] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                          />
                          {item.tipoMedida === 'm2' && <span className="text-muted-foreground">×</span>}
                          {item.tipoMedida === 'm2' && (
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.alto_m || ''}
                              placeholder="alto"
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                setMedidas(item.productoId, { ancho_m: item.ancho_m, alto_m: isNaN(v) ? 0 : v });
                              }}
                              className="w-14 text-center bg-transparent border border-border rounded-md px-1 py-0.5 focus:outline-none focus:border-[#2e9e9b] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          )}
                          <span className="text-muted-foreground">m</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.productoId, -1)} className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-white/5 text-muted-foreground">
                          <Icon name="remove" size={10} />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={qtyInputs[item.productoId] ?? item.cantidad}
                          onChange={(e) => {
                            handleQtyInputChange(item.productoId, e.target.value);
                          }}
                          onBlur={() => handleQtyInputBlur(item.productoId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-10 text-center text-sm font-mono bg-transparent border border-border rounded-md px-1 py-0.5 focus:outline-none focus:border-[#2e9e9b] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <button onClick={() => updateQty(item.productoId, 1)} className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-white/5 text-muted-foreground">
                          <Icon name="add" size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#2e9e9b] w-20 text-right font-mono">
                        {money(item.precioUnitario * item.cantidad)}
                      </span>
                      <button onClick={() => removeItem(item.productoId)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                        <Icon name="delete" size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-[380px] shrink-0">

          {/* Cliente */}
          <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Cliente</p>
            {clienteSeleccionado ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{clienteSeleccionado.nombre}</p>
                  {clienteSeleccionado.telefono && <p className="text-xs text-muted-foreground">{clienteSeleccionado.telefono}</p>}
                </div>
                <button onClick={() => setClienteSeleccionado(null)} className="text-xs text-muted-foreground hover:text-white underline">
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Público General (buscar cliente...)"
                  className="bg-background border-border text-sm focus-visible:ring-[#2e9e9b]"
                  value={clienteSearch}
                  onChange={(e) => { setClienteSearch(e.target.value); setShowClientes(true); }}
                  onFocus={() => setShowClientes(true)}
                />
                {showClientes && clientes.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    {clientes.map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={() => { setClienteSeleccionado(c); setClienteSearch(''); setShowClientes(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 border-b border-border/50 last:border-0"
                      >
                        <p className="font-medium">{c.nombre}</p>
                        {c.telefono && <p className="text-xs text-muted-foreground">{c.telefono}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Método de pago</p>
            {metodosPagoActivos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Cargando métodos de pago…</p>
            ) : (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.min(metodosPagoActivos.length, 3)}, minmax(0, 1fr))` }}
              >
                {metodosPagoActivos.map((m) => {
                  const value = m.nombre.toLowerCase();
                  const iconName = getMetodoIcon(value);
                  const isActive = metodoPago === value;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMetodoPago(value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${isActive
                        ? 'border-[#2e9e9b] bg-[#2e9e9b]/10 text-[#2e9e9b]'
                        : 'border-border text-muted-foreground hover:border-border/80 hover:bg-white/5'
                        }`}
                    >
                      <Icon name={iconName} size={16} />
                      <span className="line-clamp-1 text-center">{m.nombre}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monto recibido + cambio/saldo */}
          <MontoRecibidoInput
            total={total}
            value={montoRecibido}
            onChange={setMontoRecibido}
            simbolo={monedaSimbolo}
          />

          {/* Descuento + Notas + Total */}
          <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Descuento ($)</p>
                <Input
                  type="number"
                  min={0}
                  value={descuentoGlobal || ''}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDescuentoGlobal(v);
                    if (v === 0) setDescuentoMotivo('');
                  }}
                  placeholder="0.00"
                  className="bg-background border-border text-sm font-mono focus-visible:ring-[#2e9e9b]"
                />
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-xs text-muted-foreground">Subtotal</span>
                <span className="text-sm font-mono text-muted-foreground">{money(subtotal)}</span>
              </div>
            </div>

            {descuentoGlobal > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  Motivo del descuento <span className="text-red-500">*</span>
                </p>
                <Input
                  required
                  minLength={3}
                  maxLength={255}
                  value={descuentoMotivo}
                  onChange={(e) => setDescuentoMotivo(e.target.value)}
                  placeholder="Ej. Cliente frecuente, promoción, daño..."
                  className="bg-background border-border text-sm focus-visible:ring-[#2e9e9b]"
                />
              </div>
            )}

            <Input
              placeholder="Notas (opcional)"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="bg-background border-border text-sm focus-visible:ring-[#2e9e9b]"
            />

            {ivaActivo && ivaPorcentaje > 0 && (
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                <div className="flex justify-between">
                  <span>Base</span>
                  <span className="font-mono">{money(desgloseIva.base)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({ivaPorcentaje}%)</span>
                  <span className="font-mono">{money(desgloseIva.iva)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-3xl font-bold text-[#2e9e9b]">
                {money(total)}
              </span>
            </div>

            <Button
              disabled={cart.length === 0 || isSubmitting || isSavingCotizacion}
              onClick={handleSubmit}
              className="w-full h-12 text-base bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-bold shadow-[0_0_20px_rgba(153,255,61,0.25)] disabled:opacity-40"
            >
              {isSubmitting ? <Icon name="progress_activity" size={18} className="animate-spin" /> : (
                <>
                  <Icon name="check" size={18} className="mr-2" />
                  {cotizacionOrigenId ? 'Confirmar y Convertir' : 'Confirmar venta'}
                </>
              )}
            </Button>

            <RequirePermission modulo="cotizaciones" accion={cotizacionOrigenId ? 'editar' : 'crear'}>
              <Button
                disabled={cart.length === 0 || isSubmitting || isSavingCotizacion}
                onClick={handleGuardarComoCotizacion}
                variant="outline"
                className="w-full h-11 text-sm border-[#2e9e9b]/40 text-[#2e9e9b] hover:bg-[#2e9e9b]/10 disabled:opacity-40"
              >
                {isSavingCotizacion ? <Icon name="progress_activity" size={16} className="mr-2 animate-spin" /> : (
                  <Icon name="draw" size={16} className="mr-2" />
                )}
                {cotizacionOrigenId ? 'Actualizar Cotización' : 'Guardar como Cotización'}
              </Button>
            </RequirePermission>

            {cotizacionOrigenId && (
              <p className="text-[10px] text-center text-muted-foreground">
                Cotización cargada: edita productos y guarda con "Actualizar", o confirma para convertir en venta.
              </p>
            )}
          </div>
        </div>
      </div>

      <CotizacionSelectorModal
        open={showCotizacionesModal}
        onOpenChange={setShowCotizacionesModal}
        onSeleccionar={cargarCotizacion}
      />

      {stockAlert && (
        <StockInsuficienteModal
          open={stockAlert.open}
          onOpenChange={(v) => { if (!v) setStockAlert(null); }}
          productoNombre={stockAlert.productoNombre}
          cantidadSolicitada={stockAlert.cantidadSolicitada}
          faltantes={stockAlert.faltantes}
          onCancelar={() => setStockAlert(null)}
          onContinuar={() => {
            if (stockAlert.pendingProduct) {
              const p = stockAlert.pendingProduct;
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
                  ancho_m: 0,
                  alto_m: 0,
                  labelUnidad: calcMedida.labelUnidad,
                }];
              });
            }
            setStockAlert(null);
          }}
        />
      )}
    </div>
  );
}


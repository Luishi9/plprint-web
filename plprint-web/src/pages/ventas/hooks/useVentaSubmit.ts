import { useState } from 'react';
import { ventasApi } from '@/api/ventas.api';
import { cotizacionesApi, Cotizacion } from '@/api/cotizaciones.api';
import { sileo } from 'sileo';
import type { CartItemData } from './useCart';
import type { TicketData } from '../components/TicketImpresion';

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
}

interface UseVentaSubmitParams {
  cart: CartItemData[];
  sucursalEfectiva: { id: number; nombre: string } | null;
  usuario: { nombre: string } | null;
  clienteSeleccionado: Cliente | null;
  descuentoGlobal: number;
  descuentoMotivo: string;
  metodoPago: string;
  notas: string;
  montoRecibido: string;
  subtotal: number;
  desgloseIva: { base: number; iva: number; total: number };
  total: number;
  monedaSimbolo: string;
  monedaDecimales: number;
  ivaActivo: boolean;
  ivaPorcentaje: number;
  getMetodoLabel: (m: string) => string;
}

export function useVentaSubmit(
  params: UseVentaSubmitParams,
  setters: {
    setCart: React.Dispatch<React.SetStateAction<CartItemData[]>>;
    setClienteSeleccionado: (c: { id: number; nombre: string; telefono?: string } | null) => void;
    setDescuentoGlobal: (n: number) => void;
    setDescuentoMotivo: (s: string) => void;
    setNotas: (s: string) => void;
  },
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingCotizacion, setIsSavingCotizacion] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [cotizacionFolio, setCotizacionFolio] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [cotizacionOrigenId, setCotizacionOrigenId] = useState<number | null>(null);
  const [showCotizacionesModal, setShowCotizacionesModal] = useState(false);

  const { setCart, setClienteSeleccionado, setDescuentoGlobal, setDescuentoMotivo, setNotas } = setters;

  const {
    cart, sucursalEfectiva, usuario, clienteSeleccionado,
    descuentoGlobal, descuentoMotivo, metodoPago, notas, montoRecibido,
    subtotal, desgloseIva, total, monedaSimbolo, monedaDecimales,
    ivaActivo, ivaPorcentaje, getMetodoLabel,
  } = params;

  const handleSubmit = async () => {
    if (!cart.length) return;
    if (!sucursalEfectiva) { sileo.error({ title: 'No hay sucursal activa.' }); return; }
    const invalidItem = cart.find((i) => !Number.isInteger(i.cantidad) || i.cantidad < 1);
    if (invalidItem) {
      sileo.error({ title: `Cantidad inválida para "${invalidItem.nombre}". Ingresa un número entero mayor a 0.` });
      return;
    }
    if (descuentoGlobal > 0 && descuentoMotivo.trim().length < 3) {
      sileo.warning({ title: 'Debes indicar el motivo del descuento (mínimo 3 caracteres).' });
      return;
    }
    const montoRecibidoNum = Number(montoRecibido) || 0;
    if (montoRecibidoNum < 0) { sileo.error({ title: 'El monto recibido no puede ser negativo.' }); return; }
    setIsSubmitting(true);
    try {
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
      sileo.error({ title: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardarComoCotizacion = async () => {
    if (!cart.length) return;
    if (!sucursalEfectiva) { sileo.error({ title: 'No hay sucursal activa.' }); return; }
    if (descuentoGlobal > 0 && descuentoMotivo.trim().length < 3) {
      sileo.warning({ title: 'Debes indicar el motivo del descuento (mínimo 3 caracteres).' });
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
      sileo.error({ title: e.response?.data?.message || 'Error al guardar cotización' });
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
        anchoRollo: null,
        cobrarMinimo1: false,
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
      sileo.error({ title: 'Error al cargar la cotización' });
    }
  };

  return {
    isSubmitting,
    isSavingCotizacion,
    successId,
    setSuccessId,
    cotizacionFolio,
    setCotizacionFolio,
    ticketData,
    setTicketData,
    showQR,
    setShowQR,
    cotizacionOrigenId,
    setCotizacionOrigenId,
    showCotizacionesModal,
    setShowCotizacionesModal,
    handleSubmit,
    handleGuardarComoCotizacion,
    cargarCotizacion,
  };
}

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cotizacionesApi, Cotizacion } from '@/api/cotizaciones.api';
import { clientesApi } from '@/api/clientes.api';
import { productosApi } from '@/api/productos.api';
import { TipoMedida } from '@/api/unidadesMedida.api';
import { useSucursalStore } from '@/store/sucursalStore';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useCotizacionPdfBuilder } from '@/components/forms/CotizacionPdf';
import { sileo } from 'sileo';
import { ItemForm } from './CotizacionFormModal';

export interface Cliente { id: number; nombre: string; }
export interface Producto {
  id: number;
  nombre: string;
  precio_venta: number | string;
  unidad_info?: { es_medida: boolean; tipo_medida: TipoMedida | null };
  ancho_rollo?: number | null;
}

export type FiltroEstado = 'todas' | 'pendiente' | 'convertida' | 'cancelada';

export function useCotizaciones() {
  const { sucursalActiva } = useSucursalStore();
  const { src: logoSrc } = useEmpresaLogo();
  const cotizacionPdf = useCotizacionPdfBuilder();
  const navigate = useNavigate();

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('pendiente');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cotizacion | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [descuento, setDescuento] = useState('0');
  const [descuentoMotivo, setDescuentoMotivo] = useState('');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [convertirItem, setConvertirItem] = useState<Cotizacion | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const [cancelarItem, setCancelarItem] = useState<Cotizacion | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchCotizaciones = useCallback(async (opts?: { pageOverride?: number; resetPage?: boolean }) => {
    try {
      setIsLoading(true);
      const targetPage = opts?.resetPage ? 1 : (opts?.pageOverride ?? page);
      if (opts?.resetPage && page !== 1) setPage(1);
      const res = await cotizacionesApi.getAll({
        page: targetPage, limit, search: search || undefined,
        estado: filtroEstado === 'todas' ? undefined : filtroEstado,
      });
      const data = (res.data as { data: Cotizacion[]; meta: { total: number } });
      setCotizaciones(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [page, search, filtroEstado, limit]);

  const cargarCatalogos = async () => {
    try {
      const [c, p] = await Promise.all([
        clientesApi.getAll({ page: 1, limit: 100 }),
        productosApi.getAll({ page: 1, limit: 100, ...(sucursalActiva?.id && { sucursalId: sucursalActiva.id }) }),
      ]);
      setClientes((c.data as { data: Cliente[] }).data || []);
      setProductos((p.data as { data: Producto[] }).data || []);
    } catch (e) { console.error(e); }
  };

  const abrirCrear = () => {
    setEditando(null);
    setClienteId(null);
    setItems([]);
    setDescuento('0');
    setDescuentoMotivo('');
    setNotas('');
    setFormError('');
    cargarCatalogos();
    setModalOpen(true);
  };

  const abrirEditar = async (c: Cotizacion) => {
    if (c.estado !== 'pendiente') return;
    let full = c;
    if (!c.cotizacion_detalle || c.cotizacion_detalle.length === 0) {
      try {
        const res = await cotizacionesApi.getById(c.id);
        full = (res.data as { data: Cotizacion }).data;
      } catch (e) {
        console.error(e);
      }
    }
    setEditando(full);
    setClienteId(full.cliente_id);
    setDescuento(String(full.descuento));
    setDescuentoMotivo(full.descuento_motivo || '');
    setNotas(full.notas || '');
    setItems((full.cotizacion_detalle || []).map((d) => ({
      producto_id: d.producto_id,
      cantidad: d.cantidad,
      precio_unitario: Number(d.precio_unitario),
      descuento: Number(d.descuento || 0),
      ancho_m: d.ancho_m ? Number(d.ancho_m) : 0,
      alto_m: d.alto_m ? Number(d.alto_m) : 0,
      esMedida: false,
      tipoMedida: null,
      anchoRollo: null,
    })));
    setFormError('');
    await cargarCatalogos();
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (items.length === 0) { setFormError('Agrega al menos un producto.'); return; }
    try {
      setIsSaving(true);
      const payload = {
        cliente_id: clienteId || undefined,
        ...(sucursalActiva?.id && { sucursal_id: sucursalActiva.id }),
        descuento: Number(descuento) || 0,
        descuento_motivo: descuentoMotivo.trim() || undefined,
        notas: notas.trim() || undefined,
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          descuento: i.descuento || 0,
          ...(i.esMedida && i.ancho_m > 0 ? { ancho_m: i.ancho_m } : {}),
          ...(i.esMedida && i.alto_m > 0 ? { alto_m: i.alto_m } : {}),
          ...(i.esMedida && i.tipoMedida ? { unidad_medida_detalle: i.tipoMedida } : {}),
        })),
      };
      if (editando) {
        await cotizacionesApi.update(editando.id, payload);
      } else {
        await cotizacionesApi.create(payload);
      }
      setModalOpen(false);
      await fetchCotizaciones();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al guardar.');
    } finally { setIsSaving(false); }
  };

  const handleConvertir = async () => {
    if (!convertirItem) return;
    try {
      setIsConverting(true);
      const res = await cotizacionesApi.convertirAVenta(convertirItem.id, {
        ...(sucursalActiva?.id && { sucursal_id: sucursalActiva.id }),
        metodo_pago: 'efectivo',
      });
      const venta = (res.data as { data: { id: number } }).data;
      setConvertirItem(null);
      await fetchCotizaciones();
      navigate(`/ventas?ticket=${venta.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      sileo.error({ title: err.response?.data?.message || 'No se pudo convertir la cotización.' });
    } finally { setIsConverting(false); }
  };

  const handleCancelar = async () => {
    if (!cancelarItem) return;
    try {
      setIsCanceling(true);
      await cotizacionesApi.cancelar(cancelarItem.id);
      setCancelarItem(null);
      await fetchCotizaciones();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      sileo.error({ title: err.response?.data?.message || 'No se pudo cancelar.' });
    } finally { setIsCanceling(false); }
  };

  const handleDescargarPdf = async (c: Cotizacion) => {
    try {
      let detalle = c.cotizacion_detalle;
      if (!detalle || detalle.length === 0) {
        const res = await cotizacionesApi.getById(c.id);
        detalle = (res.data as { data: { cotizacion_detalle: typeof detalle } }).data.cotizacion_detalle;
      }
      const itemsPdf = (detalle || []).map((d) => ({
        nombre: d.productos?.nombre || `Producto #${d.producto_id}`,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precio_unitario),
        descuento: Number(d.descuento || 0),
      }));
      const subtotal = itemsPdf.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
      const descuento = Number(c.descuento);
      cotizacionPdf.descargarPdf({
        folio: c.folio,
        fecha: new Date(c.created_at),
        cliente: c.clientes?.nombre || 'Público General',
        vendedor: c.usuarios?.nombre || '—',
        sucursal: c.sucursales?.nombre || '—',
        items: itemsPdf,
        subtotal,
        descuento,
        descuentoMotivo: c.descuento_motivo || undefined,
        total: Number(c.total),
        notas: c.notas || undefined,
        logoUrl: logoSrc,
      });
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'Error al generar PDF' });
    }
  };

  return {
    cotizaciones, isLoading, search, filtroEstado, page, total, limit,
    modalOpen, editando, clienteId, items, descuento, descuentoMotivo, notas,
    isSaving, formError, clientes, productos,
    convertirItem, isConverting, cancelarItem, isCanceling,
    setSearch, setFiltroEstado, setPage, setModalOpen, setClienteId, setItems,
    setDescuento, setDescuentoMotivo, setNotas, setFormError,
    setConvertirItem, setCancelarItem,
    fetchCotizaciones, abrirCrear, abrirEditar, handleGuardar,
    handleConvertir, handleCancelar, handleDescargarPdf,
  };
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Search, Loader2, Filter, Send, X, Check, Ban, Pencil, ArrowRight, Download,
} from 'lucide-react';

import { cotizacionesApi, Cotizacion } from '@/api/cotizaciones.api';
import { clientesApi } from '@/api/clientes.api';
import { productosApi } from '@/api/productos.api';
import { calcularPrecioItem, TipoMedida } from '@/api/unidadesMedida.api';
import { useMoney } from '@/hooks/useMoney';
import { useSucursalStore } from '@/store/sucursalStore';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useCotizacionPdfBuilder } from '@/components/forms/CotizacionPdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const ESTADO_CLS: Record<string, string> = {
  pendiente:  'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  convertida: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30',
  cancelada:  'bg-red-500/10 text-red-400 border-red-500/30',
};

interface Cliente { id: number; nombre: string; }
interface Producto { id: number; nombre: string; precio_venta: number | string; unidad_info?: { es_medida: boolean; tipo_medida: TipoMedida | null }; }

interface ItemForm {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  ancho_m: number;
  alto_m: number;
  esMedida: boolean;
  tipoMedida: TipoMedida | null;
}

export default function CotizacionesPage() {
  const { simbolo, format: money } = useMoney();
  const sucursalActual = useSucursalStore((s) => s.sucursalActiva);
  const { src: logoSrc } = useEmpresaLogo();
  const cotizacionPdf = useCotizacionPdfBuilder();
  const navigate = useNavigate();

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendiente' | 'convertida' | 'cancelada'>('pendiente');
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

  const fetchCotizaciones = async () => {
    try {
      setIsLoading(true);
      const res = await cotizacionesApi.getAll({
        page, limit, search: search || undefined, estado: filtroEstado === 'todas' ? undefined : filtroEstado,
      });
      const data = (res.data as { data: Cotizacion[]; meta: { total: number } });
      setCotizaciones(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCotizaciones(); }, [page, filtroEstado]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchCotizaciones(); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const cargarCatalogos = async () => {
    try {
      const [c, p] = await Promise.all([
        clientesApi.getAll({ page: 1, limit: 100 }),
        productosApi.getAll({ page: 1, limit: 100 }),
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
    })));
    setFormError('');
    await cargarCatalogos();
    setModalOpen(true);
  };

  const agregarItem = () => {
    if (productos.length === 0) return;
    const p0 = productos[0];
    const esMedida = !!p0.unidad_info?.es_medida;
    setItems([...items, {
      producto_id: p0.id,
      cantidad: 1,
      precio_unitario: Number(p0.precio_venta),
      descuento: 0,
      ancho_m: 0,
      alto_m: 0,
      esMedida,
      tipoMedida: p0.unidad_info?.tipo_medida ?? null,
    }]);
  };

  const actualizarItem = (idx: number, field: keyof ItemForm, value: number) => {
    const nuevos = [...items];
    nuevos[idx] = { ...nuevos[idx], [field]: value };
    if (field === 'producto_id') {
      const p = productos.find((pp) => pp.id === value);
      if (p) {
        nuevos[idx].precio_unitario = Number(p.precio_venta);
        nuevos[idx].esMedida = !!p.unidad_info?.es_medida;
        nuevos[idx].tipoMedida = p.unidad_info?.tipo_medida ?? null;
        nuevos[idx].ancho_m = 0;
        nuevos[idx].alto_m = 0;
      }
    }
    setItems(nuevos);
  };

  const eliminarItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((acc, i) => acc + (i.cantidad * i.precio_unitario - (i.descuento || 0)), 0);
  const totalCalc = Math.max(0, subtotal - Number(descuento || 0));

  const handleGuardar = async () => {
    if (items.length === 0) { setFormError('Agrega al menos un producto.'); return; }
    try {
      setIsSaving(true);
      const payload = {
        cliente_id: clienteId || undefined,
        ...(sucursalActual?.id && { sucursal_id: sucursalActual.id }),
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
      fetchCotizaciones();
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
        ...(sucursalActual?.id && { sucursal_id: sucursalActual.id }),
        metodo_pago: 'efectivo',
      });
      const venta = (res.data as { data: { id: number } }).data;
      setConvertirItem(null);
      fetchCotizaciones();
      navigate(`/ventas?ticket=${venta.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'No se pudo convertir la cotización.');
    } finally { setIsConverting(false); }
  };

  const handleCancelar = async () => {
    if (!cancelarItem) return;
    try {
      setIsCanceling(true);
      await cotizacionesApi.cancelar(cancelarItem.id);
      setCancelarItem(null);
      fetchCotizaciones();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'No se pudo cancelar.');
    } finally { setIsCanceling(false); }
  };

  const handleDescargarPdf = async (c: Cotizacion) => {
    try {
      let detalle = c.cotizacion_detalle;
      if (!detalle || detalle.length === 0) {
        const res = await cotizacionesApi.getById(c.id);
        detalle = (res.data as { data: { cotizacion_detalle: typeof detalle } }).data.cotizacion_detalle;
      }
      const items = (detalle || []).map((d) => ({
        nombre: d.productos?.nombre || `Producto #${d.producto_id}`,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precio_unitario),
        descuento: Number(d.descuento || 0),
      }));
      const subtotal = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
      const descuento = Number(c.descuento);
      cotizacionPdf.descargarPdf({
        folio: c.folio,
        fecha: new Date(c.created_at),
        cliente: c.clientes?.nombre || 'Público General',
        vendedor: c.usuarios?.nombre || '—',
        sucursal: c.sucursales?.nombre || '—',
        items,
        subtotal,
        descuento,
        descuentoMotivo: c.descuento_motivo || undefined,
        total: Number(c.total),
        notas: c.notas || undefined,
        logoUrl: logoSrc,
      });
    } catch (e) {
      console.error(e);
      alert('Error al generar PDF');
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="text-[#2e9e9b]" size={32} />
            Cotizaciones
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crea cotizaciones y conviértelas en venta cuando el cliente acepte.
          </p>
        </motion.div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar folio o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64 bg-background"
            />
          </div>
          <RequirePermission modulo="cotizaciones" accion="crear">
            <Button
              onClick={abrirCrear}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva
            </Button>
          </RequirePermission>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Filter size={14} className="text-muted-foreground" />
        {[
          { v: 'pendiente' as const,  label: 'Pendientes' },
          { v: 'convertida' as const, label: 'Convertidas' },
          { v: 'cancelada' as const,  label: 'Canceladas' },
          { v: 'todas' as const,      label: 'Todas' },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => { setFiltroEstado(opt.v); setPage(1); }}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              filtroEstado === opt.v
                ? 'bg-[#2e9e9b] text-black font-semibold'
                : 'bg-background border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto"
      >
        <table className="w-full text-sm text-left text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Folio</th>
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold text-center">Items</th>
              <th className="px-6 py-4 font-semibold text-right">Total</th>
              <th className="px-6 py-4 font-semibold text-center">Estado</th>
              <th className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2e9e9b]" />
              </td></tr>
            ) : cotizaciones.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                <FileText size={32} className="mx-auto mb-2 opacity-20" />
                <p>{search || filtroEstado !== 'todas' ? 'Sin resultados.' : 'No hay cotizaciones.'}</p>
              </td></tr>
            ) : (
              <AnimatePresence>
                {cotizaciones.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#2e9e9b]">{c.folio}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(c.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{c.clientes?.nombre || 'Público General'}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{c._count?.cotizacion_detalle ?? c.cotizacion_detalle?.length ?? 0}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-foreground">
                      {money(Number(c.total))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${ESTADO_CLS[c.estado] || ''}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="cotizaciones" accion="exportar_pdf">
                          <button
                            onClick={() => handleDescargarPdf(c)}
                            title="Descargar PDF"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
                          >
                            <Download size={14} />
                          </button>
                        </RequirePermission>
                        {c.estado === 'pendiente' && (
                          <>
                            <RequirePermission modulo="cotizaciones" accion="editar">
                              <button
                                onClick={() => abrirEditar(c)}
                                title="Editar"
                                className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
                              >
                                <Pencil size={14} />
                              </button>
                            </RequirePermission>
                            <RequirePermission modulo="cotizaciones" accion="convertir_venta">
                              <button
                                onClick={() => setConvertirItem(c)}
                                title="Convertir a venta"
                                className="p-1.5 rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10"
                              >
                                <Send size={14} />
                              </button>
                            </RequirePermission>
                            <RequirePermission modulo="cotizaciones" accion="cancelar">
                              <button
                                onClick={() => setCancelarItem(c)}
                                title="Cancelar"
                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Ban size={14} />
                              </button>
                            </RequirePermission>
                          </>
                        )}
                        {c.estado === 'convertida' && c.venta_id && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <ArrowRight size={10} /> Venta #{c.venta_id}
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </motion.div>

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{cotizaciones.length} de {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <span className="font-mono">Pág. {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>Siguiente</Button>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
              {editando ? `Editar ${editando.folio}` : 'Nueva cotización'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Cliente</label>
                <select
                  value={clienteId || ''}
                  onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
                >
                  <option value="">Público General</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Descuento ({simbolo})</label>
                <Input
                  type="number" step="0.01" min="0"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {Number(descuento) > 0 && (
              <div>
                <label className="text-sm font-medium block mb-1.5">Motivo del descuento *</label>
                <Input
                  value={descuentoMotivo}
                  onChange={(e) => setDescuentoMotivo(e.target.value)}
                  placeholder="Mínimo 3 caracteres..."
                  className="bg-background"
                  minLength={3}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Productos</label>
                <Button size="sm" variant="outline" onClick={agregarItem} type="button">
                  <Plus size={14} className="mr-1" /> Agregar
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Sin productos.</p>
                ) : items.map((it, idx) => {
                  const calcMedida = it.esMedida
                    ? calcularPrecioItem(it.precio_unitario, it.cantidad, { es_medida: true, tipo_medida: it.tipoMedida }, { ancho_m: it.ancho_m, alto_m: it.alto_m })
                    : { precioUnitario: 0, labelUnidad: '' };
                  const subtotal = it.esMedida
                    ? calcMedida.precioUnitario * it.cantidad - (it.descuento || 0)
                    : it.cantidad * it.precio_unitario - (it.descuento || 0);
                  return (
                    <div key={idx} className="flex flex-col gap-1.5 bg-background/40 border border-border rounded-md p-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={it.producto_id}
                          onChange={(e) => actualizarItem(idx, 'producto_id', Number(e.target.value))}
                          className="flex-1 bg-background border border-border rounded text-sm px-2 py-1 min-w-0"
                        >
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                        <Input
                          type="number" min="1" value={it.cantidad}
                          onChange={(e) => actualizarItem(idx, 'cantidad', Number(e.target.value))}
                          className="w-16 bg-background"
                          title="Cantidad (piezas)"
                        />
                        <span className="text-xs text-muted-foreground w-6 text-center">×</span>
                        <Input
                          type="number" step="0.01" min="0" value={it.precio_unitario}
                          onChange={(e) => actualizarItem(idx, 'precio_unitario', Number(e.target.value))}
                          className="w-24 bg-background"
                          title="Precio unitario base"
                        />
                        <span className="font-mono text-sm text-[#2e9e9b] w-24 text-right">
                          {money(subtotal)}
                        </span>
                        <button
                          onClick={() => eliminarItem(idx)}
                          className="p-1 text-muted-foreground hover:text-red-400"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {it.esMedida && (
                        <div className="flex items-center gap-2 pl-1 text-xs">
                          <span className="text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                            {it.tipoMedida === 'm2' ? 'm²' : 'ml'}
                          </span>
                          <span className="text-muted-foreground">ancho</span>
                          <Input
                            type="number" step="0.01" min="0" value={it.ancho_m || ''}
                            onChange={(e) => {
                              const nuevos = [...items];
                              nuevos[idx] = { ...nuevos[idx], ancho_m: parseFloat(e.target.value) || 0 };
                              setItems(nuevos);
                            }}
                            className="w-20 h-7 bg-background"
                            placeholder="0"
                          />
                          {it.tipoMedida === 'm2' && (
                            <>
                              <span className="text-muted-foreground">alto</span>
                              <Input
                                type="number" step="0.01" min="0" value={it.alto_m || ''}
                                onChange={(e) => {
                                  const nuevos = [...items];
                                  nuevos[idx] = { ...nuevos[idx], alto_m: parseFloat(e.target.value) || 0 };
                                  setItems(nuevos);
                                }}
                                className="w-20 h-7 bg-background"
                                placeholder="0"
                              />
                            </>
                          )}
                          <span className="text-muted-foreground">m</span>
                          {calcMedida.labelUnidad && (
                            <span className="text-muted-foreground ml-auto">= {calcMedida.labelUnidad}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Notas</label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales..."
                className="bg-background min-h-[50px]"
              />
            </div>

            <div className="bg-background/50 border border-border rounded-md p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-2xl font-bold text-[#2e9e9b] font-mono">{money(totalCalc)}</span>
            </div>

            {formError && <p className="text-red-400 text-xs">{formError}</p>}
          </div>

          <DialogFooter className="gap-2 flex justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={isSaving || items.length === 0}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
              {editando ? 'Guardar' : 'Crear cotización'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CONFIRMAR CONVERSIÓN */}
      <Dialog open={!!convertirItem} onOpenChange={(v) => { if (!v) setConvertirItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="text-[#2e9e9b]" size={20} /> ¿Convertir a venta?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se convertirá la cotización <span className="text-white font-semibold">{convertirItem?.folio}</span>{' '}
              en una venta. Se respetarán los precios originales y se descontará el inventario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={() => setConvertirItem(null)} disabled={isConverting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConvertir}
              disabled={isConverting}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isConverting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Convertir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CONFIRMAR CANCELACIÓN */}
      <Dialog open={!!cancelarItem} onOpenChange={(v) => { if (!v) setCancelarItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Ban className="text-red-400" size={20} /> ¿Cancelar cotización?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se cancelará <span className="text-white font-semibold">{cancelarItem?.folio}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelarItem(null)} disabled={isCanceling}>
              Volver
            </Button>
            <Button
              onClick={handleCancelar}
              disabled={isCanceling}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isCanceling ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Sí, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { ordenesProduccionApi, OrdenProduccion, EstatusOrden, PrioridadOrden } from '@/api/ordenesProduccion.api';
import { productosApi } from '@/api/productos.api';
import { useSucursalStore } from '@/store/sucursalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getImageUrl } from '@/utils/format';

const ESTATUS_META: Record<EstatusOrden, { label: string; icon: string; cls: string; ringCls: string }> = {
  pendiente: {
    label: 'Pendientes',
    icon: 'schedule',
    cls: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    ringCls: 'data-[state=active]:bg-slate-500/15 data-[state=active]:text-slate-200',
  },
  en_proceso: {
    label: 'En proceso',
    icon: 'play_arrow',
    cls: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    ringCls: 'data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-300',
  },
  terminado: {
    label: 'Terminadas',
    icon: 'inventory',
    cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    ringCls: 'data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-300',
  },
  entregado: {
    label: 'Entregadas',
    icon: 'check_circle',
    cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30',
    ringCls: 'data-[state=active]:bg-[#2e9e9b]/15 data-[state=active]:text-[#2e9e9b]',
  },
  cancelado: {
    label: 'Canceladas',
    icon: 'cancel',
    cls: 'bg-red-500/10 text-red-400 border-red-500/30',
    ringCls: 'data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400',
  },
};

const PRIORIDAD_META: Record<PrioridadOrden, { label: string; cls: string }> = {
  baja:    { label: 'Baja',    cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  normal:  { label: 'Normal',  cls: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  alta:    { label: 'Alta',    cls: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  urgente: { label: 'Urgente', cls: 'bg-red-500/10 text-red-300 border-red-500/30' },
};

const formatDate = (s: string | null | undefined) => {
  if (!s) return '—';
  try { return format(new Date(s), "dd MMM, HH:mm", { locale: es }); } catch { return '—'; }
};

export default function ProduccionPage() {
  const { sucursalActiva } = useSucursalStore();

  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<EstatusOrden | 'todas'>('pendiente');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<OrdenProduccion | null>(null);
  const [detalleOpen, setDetalleOpen] = useState<OrdenProduccion | null>(null);
  const [estatusOpen, setEstatusOpen] = useState<OrdenProduccion | null>(null);
  const [eliminarItem, setEliminarItem] = useState<OrdenProduccion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrdenes = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, unknown> = {
        ...(tab !== 'todas' && { estatus: tab }),
        ...(search.trim() && { search: search.trim() }),
      };
      const res = await ordenesProduccionApi.getAll(params);
      setOrdenes((res.data as { data: OrdenProduccion[] }).data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOrdenes(); }, [tab]);

  useEffect(() => {
    const t = setTimeout(fetchOrdenes, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const counts = ordenes.reduce<Record<string, number>>((acc, o) => {
    acc[o.estatus] = (acc[o.estatus] ?? 0) + 1;
    return acc;
  }, {});

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await ordenesProduccionApi.remove(eliminarItem.id);
      alert('Orden eliminada');
      setEliminarItem(null);
      fetchOrdenes();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Error al eliminar');
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="factory" size={32} className="text-[#2e9e9b]" />
            Producción
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Órdenes de fabricación y control de avance
            {sucursalActiva && ` — ${sucursalActiva.nombre}`}
          </p>
        </motion.div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por producto, código..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <RequirePermission modulo="produccion" accion="crear">
            <Button
              onClick={() => { setEditando(null); setModalOpen(true); }}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold whitespace-nowrap"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nueva orden
            </Button>
          </RequirePermission>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as EstatusOrden | 'todas')}>
        <TabsList className="bg-card/50 border border-border h-auto p-1 flex flex-wrap gap-1">
          <TabsTrigger value="pendiente" className={ESTATUS_META.pendiente.ringCls}>
            <Icon name="schedule" size={13} className="mr-1.5" /> Pendientes
            <span className="ml-1.5 text-[10px] opacity-70">({counts.pendiente ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="en_proceso" className={ESTATUS_META.en_proceso.ringCls}>
            <Icon name="play_arrow" size={13} className="mr-1.5" /> En proceso
            <span className="ml-1.5 text-[10px] opacity-70">({counts.en_proceso ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="terminado" className={ESTATUS_META.terminado.ringCls}>
            <Icon name="inventory" size={13} className="mr-1.5" /> Terminadas
            <span className="ml-1.5 text-[10px] opacity-70">({counts.terminado ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="entregado" className={ESTATUS_META.entregado.ringCls}>
            <Icon name="check_circle" size={13} className="mr-1.5" /> Entregadas
            <span className="ml-1.5 text-[10px] opacity-70">({counts.entregado ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelado" className={ESTATUS_META.cancelado.ringCls}>
            <Icon name="cancel" size={13} className="mr-1.5" /> Canceladas
            <span className="ml-1.5 text-[10px] opacity-70">({counts.cancelado ?? 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <TablaOrdenes
            ordenes={ordenes}
            isLoading={isLoading}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onVerDetalle={setDetalleOpen}
            onEditar={(o) => { setEditando(o); setModalOpen(true); }}
            onEstatus={setEstatusOpen}
            onEliminar={setEliminarItem}
            onRefresh={fetchOrdenes}
          />
        </TabsContent>
      </Tabs>

      <OrdenProduccionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        editando={editando}
        onSaved={fetchOrdenes}
      />

      <DetalleOrdenModal
        orden={detalleOpen}
        onClose={() => setDetalleOpen(null)}
      />

      <CambiarEstatusModal
        orden={estatusOpen}
        onClose={() => setEstatusOpen(null)}
        onSaved={fetchOrdenes}
      />

      <Dialog open={!!eliminarItem} onOpenChange={() => setEliminarItem(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Icon name="delete" size={18} className="text-red-400" />
              Eliminar orden #{eliminarItem?.id}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La orden debe estar en estatus pendiente o cancelado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEliminarItem(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-500/90 hover:bg-red-500"
            >
              {isDeleting ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TablaProps {
  ordenes: OrdenProduccion[];
  isLoading: boolean;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  onVerDetalle: (o: OrdenProduccion) => void;
  onEditar: (o: OrdenProduccion) => void;
  onEstatus: (o: OrdenProduccion) => void;
  onEliminar: (o: OrdenProduccion) => void;
  onRefresh: () => void;
}

function TablaOrdenes({
  ordenes, isLoading, expandedId, setExpandedId,
  onVerDetalle, onEditar, onEstatus, onEliminar,
}: TablaProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Icon name="hourglass_top" size={24} className="animate-spin text-[#2e9e9b]" />
      </div>
    );
  }

  if (ordenes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/30 p-12 flex flex-col items-center text-center text-muted-foreground">
        <Icon name="factory" size={48} className="opacity-20 mb-3" />
        <p className="text-sm">No hay órdenes en este estatus.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold w-12"></th>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold text-center">Cantidad</th>
              <th className="px-4 py-3 font-semibold text-center">Avance</th>
              <th className="px-4 py-3 font-semibold">Estatus</th>
              <th className="px-4 py-3 font-semibold">Prioridad</th>
              <th className="px-4 py-3 font-semibold">Asignado</th>
              <th className="px-4 py-3 font-semibold">Máquina</th>
              <th className="px-4 py-3 font-semibold">Creada</th>
              <th className="px-4 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {ordenes.map((o, i) => {
                const estatusMeta = ESTATUS_META[o.estatus];
                const prioMeta = PRIORIDAD_META[o.prioridad];
                const isExpanded = expandedId === o.id;
                const avance = o.cantidad_producida / o.cantidad;
                const puedeEditar = o.estatus !== 'cancelado' && o.estatus !== 'entregado';
                const puedeEliminar = o.estatus === 'pendiente' || o.estatus === 'cancelado';

                return (
                  <Fragment key={o.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-background/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : o.id)}
                          className="text-muted-foreground hover:text-white"
                        >
                          {isExpanded ? <Icon name="keyboard_arrow_up" size={14} /> : <Icon name="keyboard_arrow_down" size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{String(o.id).padStart(5, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {o.productos?.imagen_url ? (
                            <img
                              src={getImageUrl(o.productos.imagen_url)}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center">
                              <Icon name="inventory_2" size={14} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{o.productos?.nombre ?? '—'}</p>
                            {o.productos?.codigo && (
                              <p className="text-[10px] text-muted-foreground font-mono">{o.productos.codigo}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">
                        {o.cantidad}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {o.cantidad_producida}/{o.cantidad}
                          </span>
                          <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden border border-border">
                            <div
                              className={`h-full transition-all ${
                                avance >= 1 ? 'bg-emerald-400' :
                                avance > 0   ? 'bg-blue-400' :
                                'bg-slate-500'
                              }`}
                              style={{ width: `${Math.min(100, avance * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${estatusMeta.cls}`}>
                          <Icon name={estatusMeta.icon} size={11} /> {estatusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${prioMeta.cls}`}>
                          {prioMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {o.usuario_asignado?.nombre ?? <span className="italic">sin asignar</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {o.maquinas?.nombre ?? <span className="italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(o.fecha_creacion)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onVerDetalle(o)}
                            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-[#2e9e9b]"
                            title="Ver detalle"
                          >
                            <Icon name="history" size={14} />
                          </button>
                          <RequirePermission modulo="produccion" accion="cambiar_estatus">
                            {o.estatus !== 'entregado' && o.estatus !== 'cancelado' && (
                              <button
                                onClick={() => onEstatus(o)}
                                className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-blue-400"
                                title="Cambiar estatus"
                              >
                                <Icon name="play_arrow" size={14} />
                              </button>
                            )}
                          </RequirePermission>
                          <RequirePermission modulo="produccion" accion="editar">
                            {puedeEditar && (
                              <button
                                onClick={() => onEditar(o)}
                                className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-amber-400"
                                title="Editar"
                              >
                                <Icon name="edit" size={14} />
                              </button>
                            )}
                          </RequirePermission>
                          <RequirePermission modulo="produccion" accion="cancelar">
                            {puedeEliminar && (
                              <button
                                onClick={() => onEliminar(o)}
                                className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400"
                                title="Eliminar"
                              >
                                <Icon name="delete" size={14} />
                              </button>
                            )}
                          </RequirePermission>
                        </div>
                      </td>
                    </motion.tr>

                    {isExpanded && (
                      <tr className="bg-background/20">
                        <td colSpan={11} className="px-4 py-3 border-b border-border">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            {o.notas && (
                              <div className="md:col-span-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Notas</p>
                                <p className="text-foreground/80">{o.notas}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Sucursal</p>
                              <p className="text-foreground/80">{o.sucursales?.nombre ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Creada por</p>
                              <p className="text-foreground/80">{o.usuario_creador?.nombre ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Inicio / Fin real</p>
                              <p className="text-foreground/80">
                                {formatDate(o.fecha_inicio)} → {formatDate(o.fecha_fin_real)}
                              </p>
                            </div>
                            {o.fecha_fin_estimada && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Fin estimado</p>
                                <p className="text-foreground/80">{formatDate(o.fecha_fin_estimada)}</p>
                              </div>
                            )}
                            {o.motivo_cancelacion && (
                              <div className="md:col-span-3">
                                <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Motivo de cancelación</p>
                                <p className="text-red-300/80">{o.motivo_cancelacion}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface OrdenProduccionModalProps {
  open: boolean;
  onClose: () => void;
  editando: OrdenProduccion | null;
  onSaved: () => void;
}

function OrdenProduccionModal({ open, onClose, editando, onSaved }: OrdenProduccionModalProps) {
  const { sucursalActiva } = useSucursalStore();

  const [productos, setProductos] = useState<Array<{ id: number; nombre: string; codigo: string | null; imagen_url: string | null }>>([]);
  const [usuarios, setUsuarios] = useState<Array<{ id: number; nombre: string }>>([]);
  const [maquinas, setMaquinas] = useState<Array<{ id: number; nombre: string; tipo: string }>>([]);

  const [productoId, setProductoId] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(1);
  const [prioridad, setPrioridad] = useState<PrioridadOrden>('normal');
  const [fechaFinEstimada, setFechaFinEstimada] = useState<string>('');
  const [usuarioAsignadoId, setUsuarioAsignadoId] = useState<number | null>(null);
  const [maquinaId, setMaquinaId] = useState<number | null>(null);
  const [notas, setNotas] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    const cargar = async () => {
      try {
        const [pRes, uRes, mRes] = await Promise.all([
          productosApi.getAll({ page: 1, limit: 200 }),
          fetch('/api/v1/usuarios?limit=100', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }).then(r => r.json()).catch(() => ({ data: [] })),
          fetch('/api/v1/maquinas?activa=true', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        ]);
        setProductos(((pRes.data as any)?.data) || []);
        setUsuarios(((uRes as any)?.data) || []);
        setMaquinas(((mRes as any)?.data) || []);
      } catch (e) { console.error(e); }
    };
    cargar();
  }, [open]);

  useEffect(() => {
    if (editando) {
      setProductoId(editando.producto_id);
      setCantidad(editando.cantidad);
      setPrioridad(editando.prioridad);
      setFechaFinEstimada(editando.fecha_fin_estimada ? editando.fecha_fin_estimada.split('T')[0] : '');
      setUsuarioAsignadoId(editando.usuario_asignado_id);
      setMaquinaId(editando.maquina_id);
      setNotas(editando.notas ?? '');
    } else {
      setProductoId(0);
      setCantidad(1);
      setPrioridad('normal');
      setFechaFinEstimada('');
      setUsuarioAsignadoId(null);
      setMaquinaId(null);
      setNotas('');
    }
    setFormError('');
  }, [editando, open]);

  const handleGuardar = async () => {
    if (!productoId) { setFormError('Selecciona un producto.'); return; }
    if (cantidad <= 0) { setFormError('La cantidad debe ser mayor a 0.'); return; }
    if (!sucursalActiva) { setFormError('No hay sucursal activa.'); return; }

    setIsSaving(true);
    setFormError('');
    try {
      const payload = {
        sucursalId: sucursalActiva.id,
        productoId,
        cantidad,
        prioridad,
        fechaFinEstimada: fechaFinEstimada || null,
        usuarioAsignadoId: usuarioAsignadoId || null,
        maquinaId: maquinaId || null,
        notas: notas.trim() || null,
      };
      if (editando) {
        await ordenesProduccionApi.update(editando.id, payload);
        alert('Orden actualizada');
      } else {
        await ordenesProduccionApi.create(payload);
        alert('Orden creada');
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="factory" size={18} className="text-[#2e9e9b]" />
            {editando ? `Editar orden #${editando.id}` : 'Nueva orden de producción'}
          </DialogTitle>
          <DialogDescription>
            Define el producto a fabricar, cantidad y asignación
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Producto *</label>
            <Select value={String(productoId)} onValueChange={(v) => setProductoId(Number(v))}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecciona un producto..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border max-h-72">
                {productos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre} {p.codigo ? `(${p.codigo})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Cantidad *</label>
            <Input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="bg-background border-border font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Prioridad</label>
            <Select value={prioridad} onValueChange={(v) => setPrioridad(v as PrioridadOrden)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Fecha fin estimada</label>
            <Input
              type="date"
              value={fechaFinEstimada}
              onChange={(e) => setFechaFinEstimada(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Asignado a</label>
            <Select
              value={usuarioAsignadoId ? String(usuarioAsignadoId) : 'none'}
              onValueChange={(v) => setUsuarioAsignadoId(v === 'none' ? null : Number(v))}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                <SelectItem value="none">— Sin asignar —</SelectItem>
                {usuarios.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Máquina</label>
            <Select
              value={maquinaId ? String(maquinaId) : 'none'}
              onValueChange={(v) => setMaquinaId(v === 'none' ? null : Number(v))}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Sin máquina" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                <SelectItem value="none">— Sin máquina —</SelectItem>
                {maquinas.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.nombre} ({m.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Notas</label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Instrucciones especiales, materiales, etc."
              className="bg-background border-border"
            />
          </div>

          {formError && (
            <div className="md:col-span-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <Icon name="error" size={14} /> {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button
            onClick={handleGuardar}
            disabled={isSaving}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            {isSaving ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : editando ? 'Guardar cambios' : 'Crear orden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DetalleModalProps {
  orden: OrdenProduccion | null;
  onClose: () => void;
}

function DetalleOrdenModal({ orden, onClose }: DetalleModalProps) {
  if (!orden) return null;

  return (
    <Dialog open={!!orden} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="factory" size={18} className="text-[#2e9e9b]" />
            Orden #{String(orden.id).padStart(5, '0')}
          </DialogTitle>
          <DialogDescription>
            {orden.productos?.nombre} × {orden.cantidad}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Estatus</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${ESTATUS_META[orden.estatus].cls}`}>
                {ESTATUS_META[orden.estatus].label}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Prioridad</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${PRIORIDAD_META[orden.prioridad].cls}`}>
                {PRIORIDAD_META[orden.prioridad].label}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sucursal</p>
              <p className="text-foreground/80">{orden.sucursales?.nombre ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Asignado a</p>
              <p className="text-foreground/80 flex items-center gap-1">
                <Icon name="person" size={11} /> {orden.usuario_asignado?.nombre ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Máquina</p>
              <p className="text-foreground/80 flex items-center gap-1">
                <Icon name="memory" size={11} /> {orden.maquinas?.nombre ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Avance</p>
              <p className="text-foreground/80 font-mono">{orden.cantidad_producida}/{orden.cantidad}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Creada</p>
              <p className="text-foreground/80">{formatDate(orden.fecha_creacion)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Inicio</p>
              <p className="text-foreground/80">{formatDate(orden.fecha_inicio)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Fin real</p>
              <p className="text-foreground/80">{formatDate(orden.fecha_fin_real)}</p>
            </div>
          </div>

          {/* Insumos requeridos */}
          {orden.productos?.producto_insumos && orden.productos.producto_insumos.length > 0 && (
            <div className="rounded-lg border border-border bg-background/30 p-3">
              <p className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Icon name="inventory_2" size={13} className="text-[#2e9e9b]" /> Insumos requeridos (BOM)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {orden.productos.producto_insumos.map((pi) => (
                  <div key={pi.insumo_id} className="flex items-center justify-between bg-card/50 rounded px-2 py-1.5">
                    <span className="text-foreground/80">{pi.insumos?.nombre ?? `#${pi.insumo_id}`}</span>
                    <span className="font-mono text-muted-foreground">
                      {Number(pi.cantidad_requerida) * orden.cantidad} {pi.insumos?.unidad_medida}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {orden.historial && orden.historial.length > 0 && (
            <div className="rounded-lg border border-border bg-background/30 p-3">
              <p className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Icon name="history" size={13} className="text-blue-400" /> Historial de cambios
              </p>
              <div className="space-y-2">
                {orden.historial.map((h) => (
                  <div key={h.id} className="flex gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-[#2e9e9b]" />
                      <div className="w-px flex-1 bg-border" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-foreground/80">
                        {h.estatus_anterior
                          ? <>Cambió de <b>{h.estatus_anterior}</b> a <b>{h.estatus_nuevo}</b></>
                          : <>Creada en estatus <b>{h.estatus_nuevo}</b></>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {h.usuario?.nombre ?? '—'} · {formatDate(h.created_at)}
                      </p>
                      {h.notas && <p className="text-[10px] text-muted-foreground italic mt-0.5">{h.notas}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CambiarEstatusModalProps {
  orden: OrdenProduccion | null;
  onClose: () => void;
  onSaved: () => void;
}

function CambiarEstatusModal({ orden, onClose, onSaved }: CambiarEstatusModalProps) {
  const [nuevoEstatus, setNuevoEstatus] = useState<EstatusOrden>('en_proceso');
  const [cantidadProducida, setCantidadProducida] = useState<number>(0);
  const [motivo, setMotivo] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (orden) {
      setNuevoEstatus('en_proceso');
      setCantidadProducida(orden.cantidad);
      setMotivo('');
      setFormError('');
    }
  }, [orden]);

  if (!orden) return null;

  const transiciones: Record<EstatusOrden, EstatusOrden[]> = {
    pendiente:   ['en_proceso', 'cancelado'],
    en_proceso:  ['terminado', 'cancelado'],
    terminado:   ['entregado', 'cancelado'],
    entregado:   [],
    cancelado:   [],
  };

  const opciones = transiciones[orden.estatus] || [];

  const handleGuardar = async () => {
    if (opciones.length === 0) { setFormError('Esta orden no permite más cambios.'); return; }
    if (!opciones.includes(nuevoEstatus)) {
      setFormError(`Transición inválida. Solo: ${opciones.join(', ')}`);
      return;
    }
    if (nuevoEstatus === 'cancelado' && !motivo.trim()) {
      setFormError('Indica el motivo de cancelación.');
      return;
    }
    if (nuevoEstatus === 'terminado' && cantidadProducida < 0) {
      setFormError('La cantidad producida no puede ser negativa.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      await ordenesProduccionApi.cambiarEstatus(orden.id, {
        nuevoEstatus,
        notas: motivo.trim() || null,
        ...(nuevoEstatus === 'terminado' && { cantidadProducida }),
      });
      alert('Estatus actualizado');
      onSaved();
      onClose();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al cambiar estatus');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!orden} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="play_arrow" size={18} className="text-blue-400" />
            Cambiar estatus — Orden #{orden.id}
          </DialogTitle>
          <DialogDescription>
            Actualmente: <b>{ESTATUS_META[orden.estatus].label}</b>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {opciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Esta orden ya no permite cambios de estatus.</p>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nuevo estatus</label>
                <Select value={nuevoEstatus} onValueChange={(v) => setNuevoEstatus(v as EstatusOrden)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                    {opciones.map((e) => (
                      <SelectItem key={e} value={e}>{ESTATUS_META[e].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {nuevoEstatus === 'terminado' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Cantidad producida
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={orden.cantidad}
                    value={cantidadProducida}
                    onChange={(e) => setCantidadProducida(Number(e.target.value))}
                    className="bg-background border-border font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Solicitada: {orden.cantidad}. Se incrementará inventario del producto.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {nuevoEstatus === 'cancelado' ? 'Motivo de cancelación *' : 'Notas (opcional)'}
                </label>
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={2}
                  placeholder={nuevoEstatus === 'cancelado' ? '¿Por qué se cancela?' : 'Comentarios del cambio...'}
                  className="bg-background border-border"
                />
              </div>
            </>
          )}

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <Icon name="error" size={14} /> {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          {opciones.length > 0 && (
            <Button
              onClick={handleGuardar}
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isSaving ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : 'Confirmar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

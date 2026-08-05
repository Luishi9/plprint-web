import { Fragment } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type {
  OrdenProduccion, EstatusOrden, PrioridadOrden,
} from '@/api/ordenesProduccion.api';
import { getImageUrl } from '@/utils/format';
import { OrdenExpandidaRow } from './components/OrdenExpandidaRow';
import { AccionesOrden } from './components/AccionesOrden';

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

export const ESTATUS_META_EXPORT = ESTATUS_META;

interface TablaOrdenesProps {
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

export function TablaOrdenes({
  ordenes, isLoading, expandedId, setExpandedId,
  onVerDetalle, onEditar, onEstatus, onEliminar,
}: TablaOrdenesProps) {
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

                return (
                  <Fragment key={o.id}>
                    <m.tr
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-background/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button type="button"
                          aria-label={isExpanded ? `Contraer orden #${o.id}` : `Expandir orden #${o.id}`}
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
                        <AccionesOrden
                          orden={o}
                          onVerDetalle={onVerDetalle}
                          onEditar={onEditar}
                          onEstatus={onEstatus}
                          onEliminar={onEliminar}
                        />
                      </td>
                    </m.tr>

                    {isExpanded && <OrdenExpandidaRow orden={o} formatDate={formatDate} />}
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

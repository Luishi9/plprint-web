import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type {
  OrdenProduccion, EstatusOrden, PrioridadOrden,
} from '@/api/ordenesProduccion.api';

const ESTATUS_META: Record<EstatusOrden, { label: string; cls: string; ringCls: string }> = {
  pendiente: { label: 'Pendientes', cls: 'bg-slate-500/10 text-slate-300 border-slate-500/30', ringCls: '' },
  en_proceso: { label: 'En proceso', cls: 'bg-blue-500/10 text-blue-300 border-blue-500/30', ringCls: '' },
  terminado: { label: 'Terminadas', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', ringCls: '' },
  entregado: { label: 'Entregadas', cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30', ringCls: '' },
  cancelado: { label: 'Canceladas', cls: 'bg-red-500/10 text-red-400 border-red-500/30', ringCls: '' },
};

const PRIORIDAD_META: Record<PrioridadOrden, { label: string; cls: string }> = {
  baja: { label: 'Baja', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  normal: { label: 'Normal', cls: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  alta: { label: 'Alta', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  urgente: { label: 'Urgente', cls: 'bg-red-500/10 text-red-300 border-red-500/30' },
};

const formatDate = (s: string | null | undefined) => {
  if (!s) return '—';
  try { return format(new Date(s), "dd MMM, HH:mm", { locale: es }); } catch { return '—'; }
};

interface DetalleOrdenModalProps {
  orden: OrdenProduccion | null;
  onClose: () => void;
}

export function DetalleOrdenModal({ orden, onClose }: DetalleOrdenModalProps) {
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


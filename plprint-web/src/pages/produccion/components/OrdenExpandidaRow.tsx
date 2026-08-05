import type { OrdenProduccion } from '@/api/ordenesProduccion.api';

interface OrdenExpandidaRowProps {
  orden: OrdenProduccion;
  formatDate: (s: string | null | undefined) => string;
}

export function OrdenExpandidaRow({ orden, formatDate }: OrdenExpandidaRowProps) {
  return (
    <tr className="bg-background/20">
      <td colSpan={11} className="px-4 py-3 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {orden.notas && (
            <div className="md:col-span-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Notas</p>
              <p className="text-foreground/80">{orden.notas}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Sucursal</p>
            <p className="text-foreground/80">{orden.sucursales?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Creada por</p>
            <p className="text-foreground/80">{orden.usuario_creador?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Inicio / Fin real</p>
            <p className="text-foreground/80">
              {formatDate(orden.fecha_inicio)} → {formatDate(orden.fecha_fin_real)}
            </p>
          </div>
          {orden.fecha_fin_estimada && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Fin estimado</p>
              <p className="text-foreground/80">{formatDate(orden.fecha_fin_estimada)}</p>
            </div>
          )}
          {orden.motivo_cancelacion && (
            <div className="md:col-span-3">
              <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Motivo de cancelación</p>
              <p className="text-red-300/80">{orden.motivo_cancelacion}</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

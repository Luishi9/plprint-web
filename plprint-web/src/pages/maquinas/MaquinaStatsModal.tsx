import { Icon } from '@/components/ui/Icon';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { Maquina, MaquinaStats } from '@/api/maquinas.api';

interface MaquinaStatsModalProps {
  open: boolean;
  maquina: Maquina | null;
  stats: MaquinaStats | null;
  isLoading: boolean;
  onClose: () => void;
}

export function MaquinaStatsModal({ open, maquina, stats, isLoading, onClose }: MaquinaStatsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="analytics" size={20} />
            Estadísticas: {maquina?.nombre}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Contador de impresiones por período
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Icon name="hourglass_top" size={32} className="animate-spin text-[#2e9e9b]" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando estadísticas...</p>
          </div>
        ) : stats ? (
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Hoy</p>
                <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.hoy.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Esta semana</p>
                <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.semana.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Este mes</p>
                <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.mes.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.total.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Icon name="history" size={16} className="text-[#2e9e9b]" />
                Impresiones recientes
              </h3>
              {stats.recientes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay impresiones registradas aún.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.recientes.map((imp) => (
                    <div
                      key={imp.id}
                      className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${imp.fue_merma ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          <Icon
                            name={imp.fue_merma ? 'error' : 'check_circle'}
                            size={16}
                            className={imp.fue_merma ? 'text-red-400' : 'text-green-400'}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {imp.productos?.nombre || 'Producto eliminado'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {imp.fue_merma ? 'Merma' : 'Venta'}
                            {imp.usuarios?.nombre && ` • ${imp.usuarios.nombre}`}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {(() => {
                              if (imp.venta_detalle) {
                                const vd = imp.venta_detalle;
                                const unidad = vd.unidad_medida_detalle || imp.productos?.unidad || 'unidades';
                                const dims = vd.ancho_m && vd.alto_m
                                  ? ` • ${vd.ancho_m} × ${vd.alto_m} m`
                                  : '';
                                return `${vd.cantidad} ${unidad}${dims}`;
                              }
                              if (imp.fue_merma && imp.mermas) {
                                const unidad = imp.productos?.unidad || 'unidades';
                                return `${imp.mermas.cantidad} ${unidad}`;
                              }
                              return `1 ${imp.productos?.unidad || 'unidad'}`;
                            })()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(imp.fecha).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { Cotizacion } from '@/api/cotizaciones.api';

interface CotizacionesTableProps {
  isLoading: boolean;
  cotizaciones: Cotizacion[];
  search: string;
  filtroEstado: string;
  money: (v: number | string) => string;
  onDescargarPdf: (c: Cotizacion) => void;
  onEditar: (c: Cotizacion) => void;
  onConvertir: (c: Cotizacion) => void;
  onCancelar: (c: Cotizacion) => void;
}

const ESTADO_CLS: Record<string, string> = {
  pendiente: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  convertida: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30',
  cancelada: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function CotizacionesTable({
  isLoading, cotizaciones, search, filtroEstado, money,
  onDescargarPdf, onEditar, onConvertir, onCancelar,
}: CotizacionesTableProps) {
  return (
    <m.div
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
              <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
            </td></tr>
          ) : cotizaciones.length === 0 ? (
            <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
              <Icon name="description" size={32} className="mx-auto mb-2 opacity-20" />
              <p>{search || filtroEstado !== 'todas' ? 'Sin resultados.' : 'No hay cotizaciones.'}</p>
            </td></tr>
          ) : (
            <AnimatePresence>
              {cotizaciones.map((c, i) => (
                <m.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
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
                        <button type="button"
                          onClick={() => onDescargarPdf(c)}
                          title="Descargar PDF"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
                        >
                          <Icon name="download" size={14} />
                        </button>
                      </RequirePermission>
                      {c.estado === 'pendiente' && (
                        <>
                          <RequirePermission modulo="cotizaciones" accion="editar">
                            <button type="button"
                              onClick={() => onEditar(c)}
                              title="Editar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="cotizaciones" accion="convertir_venta">
                            <button type="button"
                              onClick={() => onConvertir(c)}
                              title="Convertir a venta"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10"
                            >
                              <Icon name="send" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="cotizaciones" accion="cancelar">
                            <button type="button"
                              onClick={() => onCancelar(c)}
                              title="Cancelar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Icon name="block" size={14} />
                            </button>
                          </RequirePermission>
                        </>
                      )}
                      {c.estado === 'convertida' && c.venta_id && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Icon name="arrow_forward" size={10} /> Venta #{c.venta_id}
                        </span>
                      )}
                    </div>
                  </td>
                </m.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </m.div>
  );
}

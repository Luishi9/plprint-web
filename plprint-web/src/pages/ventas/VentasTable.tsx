import { Fragment } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import { formatLocalDateTime } from '@/utils/localDate';
import type { Venta } from '@/types/venta.types';

interface VentasTableProps {
  isLoading: boolean;
  ventas: Venta[];
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  money: (v: number | string) => string;
  getMetodoLabel: (nombre: string) => string;
  onReprintTicket: (venta: Venta, e: React.MouseEvent) => void;
  onShowQR: (venta: Venta, e: React.MouseEvent) => void;
  onAbonos: (venta: Venta, e: React.MouseEvent) => void;
  onReprintAbonos: (venta: Venta) => void;
  onCancelarVenta: (venta: Venta, e: React.MouseEvent) => void;
}

const ESTADO_PAGO_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pagada:    { label: 'Pagada',    icon: <Icon name="verified" size={12} />,   cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30' },
  parcial:   { label: 'Parcial',   icon: <Icon name="schedule" size={12} />,  cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  pendiente: { label: 'Pendiente', icon: <Icon name="error" size={12} />,     cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

const ESTADO_VENTA_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  cancelada: { label: 'Cancelada', icon: <Icon name="cancel" size={12} />,    cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export function VentasTable({
  isLoading, ventas, expandedId, setExpandedId, money, getMetodoLabel,
  onReprintTicket, onShowQR, onAbonos, onReprintAbonos, onCancelarVenta,
}: VentasTableProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 overflow-y-auto overflow-x-auto shadow-2xl transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="relative">
        <table className="w-full text-sm text-left rtl:text-right text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th scope="col" className="px-4 py-4 font-semibold">#</th>
              <th scope="col" className="px-4 py-4 font-semibold">Fecha</th>
              <th scope="col" className="px-4 py-4 font-semibold">Cliente</th>
              <th scope="col" className="px-4 py-4 font-semibold text-right">Total</th>
              <th scope="col" className="px-4 py-4 font-semibold text-right">Abonado</th>
              <th scope="col" className="px-4 py-4 font-semibold text-right">Saldo</th>
              <th scope="col" className="px-4 py-4 font-semibold text-center">Estado</th>
              <th scope="col" className="px-4 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <Icon name="progress_activity" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                  <p className="mt-2 text-xs text-muted-foreground">Cargando ventas...</p>
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  <Icon name="receipt" size={36} className="mx-auto mb-3 opacity-20" />
                  <p>No se encontraron ventas.</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {ventas.map((venta, i) => {
                  const total = Number(venta.total);
                  const saldo = Number(venta.saldo_pendiente || 0);
                  const abonado = total - saldo;
                  const estadoPago = ESTADO_PAGO_CONFIG[venta.estado_pago || 'pagada'];
                  const isCancelada = venta.estado === 'cancelada';
                  const estadoDisplay = isCancelada ? ESTADO_VENTA_CONFIG.cancelada : estadoPago;
                  const isExpanded = expandedId === venta.id;
                  return (
                    <Fragment key={venta.id}>
                      <m.tr
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : venta.id)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-muted-foreground">#{venta.id}</span>
                            <span className="font-mono text-[10px] text-[#2e9e9b]">{venta.folio}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatLocalDateTime(venta.created_at)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {venta.clientes?.nombre ?? 'Público General'}
                        </td>
                        <td className="px-4 py-4 font-bold text-[#2e9e9b] font-mono text-right">
                          {money(total)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-sm text-[#2e9e9b]">
                          {money(abonado)}
                        </td>
                        <td className={`px-4 py-4 text-right font-mono font-semibold ${saldo > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                          {money(saldo)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoDisplay.cls}`}>
                            {estadoDisplay.icon}
                            {estadoDisplay.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button"
                              onClick={(e) => onReprintTicket(venta, e)}
                              className="p-2 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                              title="Reimprimir ticket"
                            >
                              <Icon name="print" size={16} />
                            </button>
                            <button type="button"
                              onClick={(e) => onShowQR(venta, e)}
                              className="p-2 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                              title="QR para cliente"
                            >
                              <Icon name="qr_code" size={16} />
                            </button>
                            {venta.estado_pago && venta.estado_pago !== 'pagada' && (
                              <RequirePermission modulo="abonos" accion="ver">
                                <button type="button"
                                  onClick={(e) => { e.stopPropagation(); onAbonos(venta, e); }}
                                  className="p-2 rounded hover:bg-[#2e9e9b]/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                  title="Gestionar abonos"
                                >
                                  <Icon name="attach_money" size={16} />
                                </button>
                              </RequirePermission>
                            )}
                            {venta.ventas_abonos && venta.ventas_abonos.length > 0 && (
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); onReprintAbonos(venta); }}
                                className="p-2 rounded hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 transition-colors"
                                title="Imprimir ticket de abonos"
                              >
                                <Icon name="description" size={16} />
                              </button>
                            )}
                            {venta.estado === 'completada' && !isCancelada && (
                              <RequirePermission modulo="ventas" accion="cancelar">
                                <button type="button"
                                  onClick={(e) => onCancelarVenta(venta, e)}
                                  className="p-2 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                  title="Cancelar venta"
                                >
                                  <Icon name="block" size={16} />
                                </button>
                              </RequirePermission>
                            )}
                            {isExpanded
                              ? <Icon name="expand_less" size={16} className="text-muted-foreground" />
                              : <Icon name="expand_more" size={16} className="text-muted-foreground" />}
                          </div>
                        </td>
                      </m.tr>

                      {isExpanded && (
                        <m.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td colSpan={8} className="bg-background/40 p-0 border-b border-border">
                            <div className="px-6 py-4 space-y-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Detalle de productos</p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border text-muted-foreground text-xs">
                                      <th className="text-left py-1 font-normal">Producto</th>
                                      <th className="text-right py-1 font-normal">Cant.</th>
                                      <th className="text-right py-1 font-normal">Precio</th>
                                      <th className="text-right py-1 font-normal">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {venta.venta_detalle.map((d) => (
                                      <tr key={d.id} className="border-b border-border/50 last:border-0">
                                        <td className="py-2">{d.productos?.nombre ?? `Producto #${d.id}`}</td>
                                        <td className="text-right text-muted-foreground">{d.cantidad}</td>
                                        <td className="text-right text-muted-foreground font-mono">
                                          {money(Number(d.precio_unitario))}
                                        </td>
                                        <td className="text-right font-mono text-[#2e9e9b]">
                                          {money(Number(d.subtotal))}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {venta.ventas_abonos && venta.ventas_abonos.length > 0 && (
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Historial de abonos</p>
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); onReprintAbonos(venta); }}
                                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                    >
                                      <Icon name="description" size={12} /> Imprimir ticket
                                    </button>
                                  </div>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-border text-muted-foreground text-xs">
                                        <th className="text-left py-1 font-normal">Fecha</th>
                                        <th className="text-left py-1 font-normal">Método</th>
                                        <th className="text-left py-1 font-normal">Usuario</th>
                                        <th className="text-left py-1 font-normal">Notas</th>
                                        <th className="text-right py-1 font-normal">Monto</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {venta.ventas_abonos.map((a) => (
                                        <tr key={a.id} className="border-b border-border/50 last:border-0">
                                          <td className="py-2 text-muted-foreground text-xs">
                                            {formatLocalDateTime(a.fecha)}
                                          </td>
                                          <td className="py-2">{getMetodoLabel(a.metodo_pago)}</td>
                                          <td className="py-2 text-muted-foreground text-xs">{a.usuarios?.nombre || '—'}</td>
                                          <td className="py-2 text-muted-foreground text-xs italic">{a.notas || '—'}</td>
                                          <td className="py-2 text-right font-mono text-[#2e9e9b] font-semibold">
                                            +{money(Number(a.monto))}
                                          </td>
                                        </tr>
                                      ))}
                                      <tr className="border-t border-border bg-background/30">
                                        <td colSpan={4} className="py-2 text-right text-xs text-muted-foreground">Total abonado:</td>
                                        <td className="py-2 text-right font-mono font-bold text-[#2e9e9b]">
                                          {money(venta.ventas_abonos.reduce((acc, a) => acc + Number(a.monto), 0))}
                                        </td>
                                      </tr>
                                      <tr className="bg-background/30">
                                        <td colSpan={4} className="py-2 text-right text-xs text-muted-foreground">Saldo pendiente:</td>
                                        <td className="py-2 text-right font-mono font-bold text-orange-400">
                                          {money(Number(venta.saldo_pendiente || 0))}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </m.tr>
                      )}
                    </Fragment>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </m.div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { abonosApi, Abono } from '@/api/abonos.api';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface AbonosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaId: number;
  ventaFolio: string;
  ventaTotal: number;
  onAbonoRegistrado?: () => void;
}

export default function AbonosModal({
  open, onOpenChange, ventaId, ventaFolio, ventaTotal, onAbonoRegistrado,
}: AbonosModalProps) {
  const { simbolo } = useMoney();
  const metodosPago = useMetodosPago();

  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [monto, setMonto] = useState('');
  const [metodoPagoNombre, setMetodoPagoNombre] = useState('Efectivo');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAbonos = async () => {
    try {
      setIsLoading(true);
      const res = await abonosApi.getByVenta(ventaId);
      setAbonos((res.data as { data: Abono[] }).data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (open) {
      fetchAbonos();
      setFormOpen(false);
      setMonto('');
      setNotas('');
      setMetodoPagoNombre('Efectivo');
      setFormError('');
    }
  }, [open, ventaId]);

  const totalAbonado = abonos.reduce((acc, a) => acc + Number(a.monto), 0);
  const montoNum = Number(monto) || 0;
  const saldoActual = ventaTotal - totalAbonado;
  const nuevoSaldo = Math.max(0, saldoActual - montoNum);
  const porcentajeNuevoPago = ventaTotal > 0 ? ((totalAbonado + montoNum) / ventaTotal) * 100 : 0;
  const porcentajeActual = ventaTotal > 0 ? (totalAbonado / ventaTotal) * 100 : 0;
  const completa = montoNum >= saldoActual;

  const handleRegistrar = async () => {
    if (!montoNum || montoNum <= 0) { setFormError('Monto debe ser mayor a 0'); return; }
    if (montoNum > saldoActual + 0.01) { setFormError(`Máximo: ${simbolo}${saldoActual.toFixed(2)}`); return; }
    try {
      setIsSaving(true);
      await abonosApi.registrar(ventaId, { monto: montoNum, metodo_pago: metodoPagoNombre, notas: notas.trim() || undefined });
      setMonto('');
      setNotas('');
      setFormError('');
      setFormOpen(false);
      await fetchAbonos();
      onAbonoRegistrado?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al registrar');
    } finally { setIsSaving(false); }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este abono? Se actualizará el saldo de la venta.')) return;
    try {
      await abonosApi.remove(id);
      await fetchAbonos();
      onAbonoRegistrado?.();
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'No se pudo eliminar' });
    }
  };

  const handlePagoRapido = (valor: number) => {
    setMonto(valor.toFixed(2));
    setFormError('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="attach_money" size={20} /> Abonos · Venta {ventaFolio}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gestiona los abonos parciales a esta venta.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background/50 border border-border rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Total</div>
              <div className="text-lg font-bold font-mono">{simbolo}{ventaTotal.toFixed(2)}</div>
            </div>
            <div className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Abonado</div>
              <motion.div
                key={totalAbonado}
                initial={{ scale: 0.85, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-lg font-bold font-mono text-[#2e9e9b]"
              >
                {simbolo}{totalAbonado.toFixed(2)}
              </motion.div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Saldo</div>
              <motion.div
                key={nuevoSaldo}
                animate={{ scale: formOpen && montoNum > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.4 }}
                className={`text-lg font-bold font-mono ${formOpen && montoNum > 0 ? 'text-orange-300' : 'text-red-400'}`}
              >
                {simbolo}{nuevoSaldo.toFixed(2)}
              </motion.div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Progreso de pago</span>
              <motion.span
                key={Math.round(porcentajeActual)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono font-semibold text-[#2e9e9b]"
              >
                {Math.round(porcentajeActual)}%
              </motion.span>
            </div>
            <div className="bg-background/30 h-2.5 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-[#2e9e9b] transition-all"
                initial={false}
                animate={{ width: `${Math.min(100, porcentajeActual)}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              />
              <AnimatePresence>
                {formOpen && montoNum > 0 && (
                  <motion.div
                    initial={{ opacity: 0, width: `${Math.min(100, porcentajeActual)}%` }}
                    animate={{ opacity: 0.5, width: `${Math.min(100, porcentajeNuevoPago)}%` }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="h-full bg-[#48b9b4] absolute top-0 left-0 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Botón principal */}
          {saldoActual > 0.01 && (
            <RequirePermission modulo="abonos" accion="registrar">
              <Button
                onClick={() => setFormOpen(!formOpen)}
                className={`w-full font-semibold transition-all ${
                  formOpen
                    ? 'bg-background text-muted-foreground border border-border hover:bg-background/80'
                    : 'bg-[#2e9e9b] hover:bg-[#48b9b4] text-black shadow-[0_0_15px_rgba(153,255,61,0.25)]'
                }`}
              >
                {formOpen ? (
                  <>
                    <Icon name="close" size={16} className="mr-2" /> Cancelar
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={{ rotate: formOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="inline-flex"
                    >
                      <Icon name="keyboard_arrow_down" size={16} className="mr-2" />
                    </motion.span>
                    Registrar Abono
                  </>
                )}
              </Button>
            </RequirePermission>
          )}

          {saldoActual <= 0.01 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-green-400 font-semibold text-sm py-2 bg-green-500/10 border border-green-500/30 rounded-md"
            >
              ✓ Venta completamente pagada
            </motion.div>
          )}

          {/* ACORDEÓN */}
          <AnimatePresence initial={false}>
            {formOpen && (
              <motion.div
                key="abono-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-background/40 border border-[#2e9e9b]/30 rounded-md p-4 flex flex-col gap-3 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#2e9e9b] font-semibold flex items-center gap-1.5">
                      <Icon name="account_balance_wallet" size={13} /> Saldo actual
                    </span>
                    <motion.span
                      key={saldoActual}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="font-mono font-bold text-red-400"
                    >
                      {simbolo}{saldoActual.toFixed(2)}
                    </motion.span>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                      <Icon name="attach_money" size={12} /> Monto *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={saldoActual}
                      value={monto}
                      onChange={(e) => { setMonto(e.target.value); setFormError(''); }}
                      placeholder="0.00"
                      className="bg-background border-border text-lg font-mono"
                      autoFocus
                    />
                    {/* Botones rápidos */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-muted-foreground self-center">Rápido:</span>
                      {[0.25, 0.5, 0.75, 1].map((frac) => (
                        <button
                          key={frac}
                          type="button"
                          onClick={() => handlePagoRapido(saldoActual * frac)}
                          className="text-[10px] px-2 py-0.5 bg-background border border-border rounded hover:border-[#2e9e9b] hover:text-[#2e9e9b] transition-colors"
                        >
                          {frac === 1 ? 'Todo' : `${frac * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visualización en tiempo real: nuevo saldo */}
                  <AnimatePresence>
                    {montoNum > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`rounded-md p-3 border ${completa ? 'bg-green-500/10 border-green-500/40' : 'bg-orange-500/10 border-orange-500/30'}`}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Saldo después del abono:</span>
                            <motion.span
                              key={nuevoSaldo}
                              initial={{ scale: 1.3, color: completa ? '#10b981' : '#fb923c' }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className={`font-mono font-bold text-lg ${completa ? 'text-green-400' : 'text-orange-400'}`}
                            >
                              {simbolo}{nuevoSaldo.toFixed(2)}
                            </motion.span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{simbolo}{saldoActual.toFixed(2)}</span>
                            <motion.span
                              animate={{ x: 0 }}
                              className="text-[#2e9e9b] font-bold"
                            >−</motion.span>
                            <span className="text-[#2e9e9b] font-semibold">{simbolo}{montoNum.toFixed(2)}</span>
                            <span className="text-muted-foreground">=</span>
                            <span className={completa ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>
                              {simbolo}{nuevoSaldo.toFixed(2)}
                            </span>
                          </div>
                          {completa && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-[10px] text-green-400 font-semibold text-center"
                            >
                              ✓ Este abono completa el pago total
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                      <Icon name="account_balance_wallet" size={12} /> Método de pago
                    </label>
                    <select
                      value={metodoPagoNombre}
                      onChange={(e) => setMetodoPagoNombre(e.target.value)}
                      className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
                    >
                      {metodosPago.metodos.filter((m) => m.activo).map((m) => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                      <Icon name="sticky_note_2" size={12} /> Notas
                    </label>
                    <Textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Opcional..."
                      className="bg-background min-h-[50px]"
                    />
                  </div>

                  {formError && <p className="text-red-400 text-xs">{formError}</p>}

                  <RequirePermission modulo="abonos" accion="registrar">
                    <Button
                      onClick={handleRegistrar}
                      disabled={isSaving || !montoNum || montoNum <= 0}
                      className="w-full bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold disabled:opacity-40"
                    >
                      {isSaving
                        ? <Icon name="hourglass_top" size={16} className="mr-2 animate-spin" />
                        : <Icon name="check" size={16} className="mr-2" />}
                      {completa ? 'Registrar y completar pago' : 'Registrar Abono'}
                    </Button>
                  </RequirePermission>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historial de abonos */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Historial de abonos</h4>
            {isLoading ? (
              <div className="flex justify-center py-6"><Icon name="hourglass_top" size={20} className="animate-spin text-[#2e9e9b]" /></div>
            ) : abonos.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">Sin abonos aún.</div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {abonos.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between bg-background/40 border border-border rounded-md p-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-[#2e9e9b] font-semibold">
                          +{simbolo}{Number(a.monto).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(a.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{metodosPago.getLabel(a.metodo_pago)}
                          {a.usuarios?.nombre && ` · ${a.usuarios.nombre}`}
                        </div>
                        {a.notas && <div className="text-xs text-muted-foreground italic mt-0.5">"{a.notas}"</div>}
                      </div>
                      <RequirePermission modulo="abonos" accion="registrar">
                        <button
                          onClick={() => handleEliminar(a.id)}
                          title="Eliminar"
                          className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <Icon name="delete" size={13} />
                        </button>
                      </RequirePermission>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

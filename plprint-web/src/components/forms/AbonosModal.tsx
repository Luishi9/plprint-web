import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, X, Check, Loader2, Trash2 } from 'lucide-react';

import { abonosApi, Abono } from '@/api/abonos.api';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequirePermission } from '@/components/RequirePermission';
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

  const [nuevoOpen, setNuevoOpen] = useState(false);
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
      setNuevoOpen(false);
      setMonto('');
      setNotas('');
      setMetodoPagoNombre('Efectivo');
      setFormError('');
    }
  }, [open, ventaId]);

  const totalAbonado = abonos.reduce((acc, a) => acc + Number(a.monto), 0);
  const saldoActual = ventaTotal - totalAbonado;
  const porcentajePagado = ventaTotal > 0 ? (totalAbonado / ventaTotal) * 100 : 0;

  const handleRegistrar = async () => {
    const m = Number(monto);
    if (!m || m <= 0) { setFormError('Monto debe ser mayor a 0'); return; }
    if (m > saldoActual + 0.01) { setFormError(`Máximo: ${simbolo}${saldoActual.toFixed(2)}`); return; }
    try {
      setIsSaving(true);
      await abonosApi.registrar(ventaId, { monto: m, metodo_pago: metodoPagoNombre, notas: notas.trim() || undefined });
      setNuevoOpen(false);
      setMonto('');
      setNotas('');
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
      alert('No se pudo eliminar');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
              <DollarSign size={20} /> Abonos · Venta {ventaFolio}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Gestiona los abonos parciales a esta venta.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background/50 border border-border rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Total</div>
                <div className="text-lg font-bold font-mono">{simbolo}{ventaTotal.toFixed(2)}</div>
              </div>
              <div className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Abonado</div>
                <div className="text-lg font-bold font-mono text-[#2e9e9b]">{simbolo}{totalAbonado.toFixed(2)}</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Saldo</div>
                <div className="text-lg font-bold font-mono text-red-400">{simbolo}{saldoActual.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-background/30 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2e9e9b] transition-all"
                style={{ width: `${Math.min(100, porcentajePagado)}%` }}
              />
            </div>

            {saldoActual > 0.01 && (
              <RequirePermission modulo="abonos" accion="registrar">
                <Button
                  onClick={() => setNuevoOpen(true)}
                  className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" /> Registrar Abono
                </Button>
              </RequirePermission>
            )}

            {saldoActual <= 0.01 && (
              <div className="text-center text-green-400 font-semibold text-sm py-2">
                ✓ Venta completamente pagada
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Historial de abonos</h4>
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#2e9e9b]" /></div>
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
                            <Trash2 size={13} />
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

      {/* MODAL NUEVO ABONO */}
      <Dialog open={nuevoOpen} onOpenChange={(v) => { if (!v) setNuevoOpen(false); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">Registrar Abono</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Saldo pendiente: <span className="text-red-400 font-mono font-bold">{simbolo}{saldoActual.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Monto *</label>
              <Input
                type="number" step="0.01" min="0" max={saldoActual}
                value={monto}
                onChange={(e) => { setMonto(e.target.value); setFormError(''); }}
                placeholder="0.00"
                className="bg-background"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Método de pago</label>
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
              <label className="text-sm font-medium block mb-1.5">Notas</label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Opcional..."
                className="bg-background min-h-[50px]"
              />
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
          </div>
          <DialogFooter className="gap-2 flex justify-end">
            <Button variant="outline" onClick={() => setNuevoOpen(false)} disabled={isSaving}>
              <X size={14} className="mr-1" /> Cancelar
            </Button>
            <Button
              onClick={handleRegistrar}
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

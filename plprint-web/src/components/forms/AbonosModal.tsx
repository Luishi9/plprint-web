import { useEffect, useReducer, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { sileo } from 'sileo';

import { abonosApi, Abono } from '@/api/abonos.api';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import { AbonosResumen } from './AbonosResumen';
import { AbonoForm } from './AbonoForm';
import { AbonosList } from './AbonosList';

interface AbonosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaId: number;
  ventaFolio: string;
  ventaTotal: number;
  onAbonoRegistrado?: () => void;
}

interface FormState {
  formOpen: boolean;
  monto: string;
  metodoPagoNombre: string;
  notas: string;
  isSaving: boolean;
  formError: string;
}

const initialForm: FormState = {
  formOpen: false,
  monto: '',
  metodoPagoNombre: 'Efectivo',
  notas: '',
  isSaving: false,
  formError: '',
};

type FormAction =
  | { type: 'reset' }
  | { type: 'set'; field: 'monto' | 'metodoPagoNombre' | 'notas' | 'formError'; value: string }
  | { type: 'setSaving'; value: boolean }
  | { type: 'toggleForm'; value: boolean };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'reset':
      return initialForm;
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'toggleForm':
      return { ...state, formOpen: action.value };
    default:
      return state;
  }
}

export default function AbonosModal({
  open, onOpenChange, ventaId, ventaFolio, ventaTotal, onAbonoRegistrado,
}: AbonosModalProps) {
  const { simbolo } = useMoney();
  const metodosPago = useMetodosPago();

  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [form, dispatch] = useReducer(formReducer, initialForm);

  const fetchAbonos = async () => {
    try {
      setIsLoading(true);
      const res = await abonosApi.getByVenta(ventaId);
      setAbonos((res.data as { data: Abono[] }).data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await abonosApi.getByVenta(ventaId);
        if (cancelled) return;
        setAbonos((res.data as { data: Abono[] }).data || []);
        dispatch({ type: 'reset' });
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [open, ventaId]);

  const totalAbonado = abonos.reduce((acc, a) => acc + Number(a.monto), 0);
  const montoNum = Number(form.monto) || 0;
  const saldoActual = ventaTotal - totalAbonado;
  const nuevoSaldo = Math.max(0, saldoActual - montoNum);
  const porcentajeNuevoPago = ventaTotal > 0 ? ((totalAbonado + montoNum) / ventaTotal) * 100 : 0;
  const porcentajeActual = ventaTotal > 0 ? (totalAbonado / ventaTotal) * 100 : 0;
  const completa = montoNum >= saldoActual;

  const handleRegistrar = async () => {
    if (!montoNum || montoNum <= 0) { dispatch({ type: 'set', field: 'formError', value: 'Monto debe ser mayor a 0' }); return; }
    if (montoNum > saldoActual + 0.01) { dispatch({ type: 'set', field: 'formError', value: `Máximo: ${simbolo}${saldoActual.toFixed(2)}` }); return; }
    try {
      dispatch({ type: 'setSaving', value: true });
      await abonosApi.registrar(ventaId, { monto: montoNum, metodo_pago: form.metodoPagoNombre, notas: form.notas.trim() || undefined });
      dispatch({ type: 'reset' });
      await fetchAbonos();
      onAbonoRegistrado?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      dispatch({ type: 'set', field: 'formError', value: err.response?.data?.message || 'Error al registrar' });
    } finally { dispatch({ type: 'setSaving', value: false }); }
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
    dispatch({ type: 'set', field: 'monto', value: valor.toFixed(2) });
    dispatch({ type: 'set', field: 'formError', value: '' });
  };

  const handleMontoChange = (v: string) => {
    dispatch({ type: 'set', field: 'monto', value: v });
    dispatch({ type: 'set', field: 'formError', value: '' });
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
          <AbonosResumen
            simbolo={simbolo}
            ventaTotal={ventaTotal}
            totalAbonado={totalAbonado}
            nuevoSaldo={nuevoSaldo}
            porcentajeActual={porcentajeActual}
            porcentajeNuevoPago={porcentajeNuevoPago}
            mostrarNuevoPago={form.formOpen && montoNum > 0}
            formOpen={form.formOpen}
            montoNum={montoNum}
          />

          {/* Botón principal */}
          {saldoActual > 0.01 && (
            <RequirePermission modulo="abonos" accion="registrar">
              <Button
                onClick={() => dispatch({ type: 'toggleForm', value: !form.formOpen })}
                className={`w-full font-semibold transition-all ${
                  form.formOpen
                    ? 'bg-background text-muted-foreground border border-border hover:bg-background/80'
                    : 'bg-[#2e9e9b] hover:bg-[#48b9b4] text-black shadow-[0_0_15px_rgba(153,255,61,0.25)]'
                }`}
              >
                {form.formOpen ? (
                  <>
                    <Icon name="close" size={16} className="mr-2" /> Cancelar
                  </>
                ) : (
                  <>
                    <m.span
                      animate={{ rotate: form.formOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="inline-flex"
                    >
                      <Icon name="keyboard_arrow_down" size={16} className="mr-2" />
                    </m.span>
                    Registrar Abono
                  </>
                )}
              </Button>
            </RequirePermission>
          )}

          {saldoActual <= 0.01 && (
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-green-400 font-semibold text-sm py-2 bg-green-500/10 border border-green-500/30 rounded-md"
            >
              ✓ Venta completamente pagada
            </m.div>
          )}

          {/* ACORDEÓN */}
          <AnimatePresence initial={false}>
            {form.formOpen && (
              <m.div
                key="abono-form"
                initial={{ maxHeight: 0, opacity: 0 }}
                animate={{ maxHeight: 1000, opacity: 1 }}
                exit={{ maxHeight: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <AbonoForm
                  simbolo={simbolo}
                  monto={form.monto}
                  montoNum={montoNum}
                  saldoActual={saldoActual}
                  nuevoSaldo={nuevoSaldo}
                  completa={completa}
                  metodoPagoNombre={form.metodoPagoNombre}
                  notas={form.notas}
                  isSaving={form.isSaving}
                  formError={form.formError}
                  metodosPago={metodosPago.metodos}
                  onMontoChange={handleMontoChange}
                  onMetodoChange={(v) => dispatch({ type: 'set', field: 'metodoPagoNombre', value: v })}
                  onNotasChange={(v) => dispatch({ type: 'set', field: 'notas', value: v })}
                  onPagoRapido={handlePagoRapido}
                  onRegistrar={handleRegistrar}
                />
              </m.div>
            )}
          </AnimatePresence>

          {/* Historial de abonos */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Historial ({abonos.length})
            </h4>
            {isLoading ? (
              <div className="text-center text-muted-foreground text-sm py-4">Cargando...</div>
            ) : (
              <AbonosList
                abonos={abonos}
                onEliminar={handleEliminar}
                getMetodoLabel={(n) => metodosPago.getLabel(n)}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

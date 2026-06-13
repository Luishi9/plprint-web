import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMoney } from '@/hooks/useMoney';
import type { CorteCaja, ResumenCaja } from '@/api/caja.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { corte_id: number; monto_final_real: number; observaciones?: string }) => Promise<void>;
  corte: CorteCaja;
  resumen: ResumenCaja;
}

export default function CorteModal({ open, onClose, onConfirm, corte, resumen }: Props) {
  const { simbolo, format: money } = useMoney();
  const [montoReal, setMontoReal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const montoInicial = Number(corte.monto_inicial);
  const efectivoEsperado = montoInicial + resumen.total_efectivo_ventas + resumen.total_ingresos + resumen.total_abonos_efectivo - resumen.total_gastos - resumen.total_retiros;
  const montoRealNum = Number(montoReal);
  const diferencia = montoReal ? montoRealNum - efectivoEsperado : 0;

  const handleConfirm = async () => {
    if (!montoReal || montoRealNum < 0) { setError('Ingresa el monto real contado.'); return; }
    try {
      setIsSaving(true);
      setError('');
      await onConfirm({ corte_id: corte.id, monto_final_real: montoRealNum, observaciones: observaciones.trim() || undefined });
      setMontoReal('');
      setObservaciones('');
      onClose();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al realizar corte.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="account_balance_wallet" size={22} /> Corte de Caja
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Revisa el resumen antes de cerrar la caja.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          <div className="bg-background rounded-lg border border-border p-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Apertura</span>
              <p className="font-mono font-semibold">{money(montoInicial)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Ventas efectivo</span>
              <p className="font-mono font-semibold text-green-400">+{money(resumen.total_efectivo_ventas)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Ingresos</span>
              <p className="font-mono font-semibold text-emerald-400">+{money(resumen.total_ingresos)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Abonos efectivo</span>
              <p className="font-mono font-semibold text-blue-400">+{money(resumen.total_abonos_efectivo)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Gastos</span>
              <p className="font-mono font-semibold text-red-400">-{money(resumen.total_gastos)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Retiros</span>
              <p className="font-mono font-semibold text-orange-400">-{money(resumen.total_retiros)}</p>
            </div>
            <div className="col-span-2 border-t border-border pt-2 mt-1">
              <span className="text-muted-foreground text-xs">Total esperado</span>
              <p className="font-mono text-lg font-bold text-blue-400">{money(efectivoEsperado)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Monto real contado ({simbolo}) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={montoReal}
              onChange={(e) => setMontoReal(e.target.value)}
              className="bg-background text-lg font-bold"
              autoFocus
            />
          </div>

          {montoReal && (
            <div className={`text-sm font-mono font-bold px-3 py-2 rounded-md ${
              diferencia >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              Diferencia: {diferencia >= 0 ? '+' : ''}{money(diferencia)}
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1.5">Observaciones</label>
            <Textarea
              placeholder="Notas sobre el corte (opcional)..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="bg-background min-h-[50px]"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <Icon name="close" size={14} className="mr-1" /> Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
            {isSaving ? <Icon name="progress_activity" size={14} className="mr-1 animate-spin" /> : <Icon name="check" size={14} className="mr-1" />}
            Confirmar Corte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

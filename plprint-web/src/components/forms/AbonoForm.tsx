import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AbonoFormProps {
  simbolo: string;
  monto: string;
  montoNum: number;
  saldoActual: number;
  nuevoSaldo: number;
  completa: boolean;
  metodoPagoNombre: string;
  notas: string;
  isSaving: boolean;
  formError: string;
  metodosPago: { nombre: string }[];
  onMontoChange: (v: string) => void;
  onMetodoChange: (v: string) => void;
  onNotasChange: (v: string) => void;
  onPagoRapido: (valor: number) => void;
  onRegistrar: () => void;
}

export function AbonoForm({
  simbolo, monto, montoNum, saldoActual, nuevoSaldo, completa,
  metodoPagoNombre, notas, isSaving, formError,
  metodosPago: metodos,
  onMontoChange, onMetodoChange, onNotasChange, onPagoRapido, onRegistrar,
}: AbonoFormProps) {
  return (
    <div className="bg-background/40 border border-[#2e9e9b]/30 rounded-md p-4 flex flex-col gap-3 mt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#2e9e9b] font-semibold flex items-center gap-1.5">
          <Icon name="account_balance_wallet" size={13} /> Saldo actual
        </span>
        <m.span
          key={saldoActual}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="font-mono font-bold text-red-400"
        >
          {simbolo}{saldoActual.toFixed(2)}
        </m.span>
      </div>

      <div>
        <label htmlFor="abono-monto" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
          <Icon name="attach_money" size={12} /> Monto *
        </label>
        <Input
          id="abono-monto"
          type="number"
          step="0.01"
          min="0"
          max={saldoActual}
          value={monto}
          onChange={(e) => { onMontoChange(e.target.value); }}
          placeholder="0.00"
          className="bg-background border-border text-lg font-mono"
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] text-muted-foreground self-center">Rápido:</span>
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <button
              key={frac}
              type="button"
              onClick={() => onPagoRapido(saldoActual * frac)}
              className="text-[10px] px-2 py-0.5 bg-background border border-border rounded hover:border-[#2e9e9b] hover:text-[#2e9e9b] transition-colors"
            >
              {frac === 1 ? 'Todo' : `${frac * 100}%`}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {montoNum > 0 && (
          <m.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: 500, opacity: 1 }}
            exit={{ maxHeight: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={`rounded-md p-3 border ${completa ? 'bg-green-500/10 border-green-500/40' : 'bg-orange-500/10 border-orange-500/30'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Saldo después del abono:</span>
                <m.span
                  key={nuevoSaldo}
                  initial={{ scale: 1.3, color: completa ? '#10b981' : '#fb923c' }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`font-mono font-bold text-lg ${completa ? 'text-green-400' : 'text-orange-400'}`}
                >
                  {simbolo}{nuevoSaldo.toFixed(2)}
                </m.span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{simbolo}{saldoActual.toFixed(2)}</span>
                <m.span animate={{ x: 0 }}>→</m.span>
                <span className="text-foreground/70 font-mono">{simbolo}{nuevoSaldo.toFixed(2)}</span>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="abono-metodo-pago" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
          <Icon name="payment" size={12} /> Método de pago
        </label>
        <select
          id="abono-metodo-pago"
          value={metodoPagoNombre}
          onChange={(e) => onMetodoChange(e.target.value)}
          className="w-full bg-background border border-border rounded-md text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e9e9b]/30"
        >
          {metodos.map((m) => (
            <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="abono-notas" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
          <Icon name="notes" size={12} /> Notas (opcional)
        </label>
        <Textarea
          id="abono-notas"
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Ej: Pago parcial en efectivo..."
          className="bg-background border-border text-sm resize-none"
          rows={2}
        />
      </div>

      {formError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
          {formError}
        </div>
      )}

      <Button
        onClick={onRegistrar}
        disabled={isSaving}
        className="w-full bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-bold shadow-[0_0_15px_rgba(46,158,155,0.25)] disabled:opacity-60"
      >
        {isSaving ? (
          <>
            <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin mr-2" />
            Registrando...
          </>
        ) : (
          <>
            <Icon name="check" size={16} className="mr-2" /> Confirmar Abono
          </>
        )}
      </Button>
    </div>
  );
}

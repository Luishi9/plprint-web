import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';

interface MontoRecibidoInputProps {
  total: number;
  value: string;
  onChange: (v: string) => void;
  simbolo: string;
}

export default function MontoRecibidoInput({ total, value, onChange, simbolo }: MontoRecibidoInputProps) {
  const num = Number(value) || 0;
  const cambio = num > total ? num - total : 0;
  const saldo = num < total ? total - num : 0;
  const hayTotal = total > 0;
  const exacto = hayTotal && num === total;
  const completo = hayTotal && num >= total && num > 0;
  const vacio = hayTotal && (!value || num === 0);
  const parcial = hayTotal && num > 0 && num < total;

  const sugerencias = [
    { label: 'Pendiente', accion: () => onChange('') },
    { label: '50%', accion: () => onChange((total * 0.5).toFixed(2)) },
    { label: '75%', accion: () => onChange((total * 0.75).toFixed(2)) },
    { label: 'Exacto', accion: () => onChange(total.toFixed(2)) },
    { label: 'Total + 10', accion: () => onChange((total + 10).toFixed(2)) },
  ];

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Icon name="account_balance_wallet" size={12} /> Monto recibido
        </p>
        <span className="text-[10px] text-muted-foreground">Total: <span className="font-mono text-[#2e9e9b] font-bold">{simbolo}{total.toFixed(2)}</span></span>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">{simbolo}</span>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="pl-9 bg-background border-border text-xl font-mono font-bold focus-visible:ring-[#2e9e9b]"
        />
      </div>

      {/* Botones rápidos */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] text-muted-foreground self-center">Rápido:</span>
        {sugerencias.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={s.accion}
            className="text-[10px] px-2 py-1 bg-background border border-border rounded hover:border-[#2e9e9b] hover:text-[#2e9e9b] transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Visualización cambio / saldo */}
      <AnimatePresence mode="wait">
        {vacio && (
          <m.div
            key="vacio"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 200 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded p-2 flex items-center gap-1.5">
              <Icon name="error" size={12} />
              <span>La venta se registrará como <b>PENDIENTE DE COBRO</b></span>
            </div>
          </m.div>
        )}

        {exacto && (
          <m.div
            key="exacto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/30 rounded p-2 flex items-center gap-1.5"
          >
            <Icon name="check" size={12} />
            <span>Pago exacto · Venta será marcada como <b>PAGADA</b></span>
          </m.div>
        )}

        {completo && !exacto && (
          <m.div
            key="cambio"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 200 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="rounded-md p-2.5 bg-[#2e9e9b]/10 border border-[#2e9e9b]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Su cambio:</span>
                <m.span
                  key={cambio}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="font-mono font-bold text-2xl text-[#2e9e9b]"
                >
                  {simbolo}{cambio.toFixed(2)}
                </m.span>
              </div>
            </div>
          </m.div>
        )}

        {parcial && (
          <m.div
            key="saldo"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 200 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="rounded-md p-2.5 bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-orange-400 flex items-center gap-1">
                  <Icon name="error" size={11} /> Quedará pendiente:
                </span>
                <m.span
                  key={saldo}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="font-mono font-bold text-xl text-orange-400"
                >
                  {simbolo}{saldo.toFixed(2)}
                </m.span>
              </div>
              <div className="text-[10px] text-orange-300/70 mt-1">
                Venta como <b>PAGO PARCIAL</b> · Se podrán registrar abonos después
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

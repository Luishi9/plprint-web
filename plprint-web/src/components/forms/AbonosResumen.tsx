import { m, AnimatePresence } from 'framer-motion';

interface AbonosResumenProps {
  simbolo: string;
  ventaTotal: number;
  totalAbonado: number;
  nuevoSaldo: number;
  porcentajeActual: number;
  porcentajeNuevoPago: number;
  mostrarNuevoPago: boolean;
  formOpen: boolean;
  montoNum: number;
}

export function AbonosResumen({
  simbolo, ventaTotal, totalAbonado, nuevoSaldo,
  porcentajeActual, porcentajeNuevoPago,
  mostrarNuevoPago, formOpen, montoNum,
}: AbonosResumenProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background/50 border border-border rounded-md p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="text-lg font-bold font-mono">{simbolo}{ventaTotal.toFixed(2)}</div>
        </div>
        <div className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 rounded-md p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Abonado</div>
          <m.div
            key={totalAbonado}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-lg font-bold font-mono text-[#2e9e9b]"
          >
            {simbolo}{totalAbonado.toFixed(2)}
          </m.div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Saldo</div>
          <m.div
            key={nuevoSaldo}
            animate={{ scale: formOpen && montoNum > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.4 }}
            className={`text-lg font-bold font-mono ${formOpen && montoNum > 0 ? 'text-orange-300' : 'text-red-400'}`}
          >
            {simbolo}{nuevoSaldo.toFixed(2)}
          </m.div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Progreso de pago</span>
          <m.span
            key={Math.round(porcentajeActual)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono font-semibold text-[#2e9e9b]"
          >
            {Math.round(porcentajeActual)}%
          </m.span>
        </div>
        <div className="bg-background/30 h-2.5 rounded-full overflow-hidden relative" style={{ transformOrigin: 'left' }}>
          <m.div
            className="h-full bg-[#2e9e9b]"
            initial={false}
            animate={{ scaleX: Math.min(1, porcentajeActual / 100) }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{ transformOrigin: 'left' }}
          />
          <AnimatePresence>
            {mostrarNuevoPago && (
              <m.div
                initial={{ opacity: 0, scaleX: Math.min(1, porcentajeActual / 100) }}
                animate={{ opacity: 0.5, scaleX: Math.min(1, porcentajeNuevoPago / 100) }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="h-full bg-[#48b9b4] absolute top-0 left-0 pointer-events-none"
                style={{ transformOrigin: 'left' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { useMoney } from '@/hooks/useMoney';
import type { MovimientoCaja } from '@/api/caja.api';

interface Props {
  movimientos: MovimientoCaja[];
  isLoading: boolean;
}

const TIPO_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  venta:   { label: 'Venta',   color: 'text-green-400',  icon: 'shopping_cart' },
  ingreso: { label: 'Ingreso', color: 'text-emerald-400', icon: 'arrow_outward' },
  gasto:   { label: 'Gasto',   color: 'text-red-400',    icon: 'south_east' },
  retiro:  { label: 'Retiro',  color: 'text-orange-400',  icon: 'account_balance_wallet' },
  abono:   { label: 'Abono',   color: 'text-blue-400',    icon: 'payments' },
};

export default function MovimientosTable({ movimientos, isLoading }: Props) {
  const { format: money } = useMoney();

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto">
      <table className="w-full text-sm text-left text-foreground">
        <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-semibold">Hora</th>
            <th className="px-6 py-4 font-semibold">Usuario</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
            <th className="px-6 py-4 font-semibold">Concepto</th>
            <th className="px-6 py-4 font-semibold text-right">Monto</th>
            <th className="px-6 py-4 font-semibold">Método de pago</th>
            <th className="px-6 py-4 font-semibold">Sucursal</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center">
                <Icon name="progress_activity" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
              </td>
            </tr>
          ) : movimientos.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                <Icon name="shopping_cart" size={32} className="mx-auto mb-2 opacity-20" />
                <p>No hay movimientos en este periodo.</p>
              </td>
            </tr>
          ) : (
            <AnimatePresence>
              {movimientos.map((m, i) => {
                const cfg = TIPO_CONFIG[m.tipo] || TIPO_CONFIG.gasto;
                return (
                  <motion.tr
                    key={`${m.referencia_tipo}-${m.referencia_id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      {new Date(m.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-foreground text-xs">{m.usuario}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                        <Icon name={cfg.icon} size={12} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground text-xs">{m.concepto || '—'}</td>
                    <td className={`px-6 py-4 text-right font-mono font-semibold text-xs ${
                      m.signo > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {m.signo > 0 ? '+' : '-'}{money(m.monto)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{m.metodo_pago}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{m.sucursal_id || '—'}</td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );
}

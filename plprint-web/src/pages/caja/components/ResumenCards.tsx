import { Icon } from '@/components/ui/Icon';
import { useMoney } from '@/hooks/useMoney';
import type { ResumenCaja } from '@/api/caja.api';

interface Props {
  resumen: ResumenCaja;
  montoInicial: number;
  montoFinalReal?: number;
}

export default function ResumenCards({ resumen, montoInicial, montoFinalReal }: Props) {
  const { format: money } = useMoney();
  const efectivoEsperado = montoInicial + resumen.total_efectivo_ventas + resumen.total_ingresos + resumen.total_abonos_efectivo - resumen.total_gastos - resumen.total_retiros;
  const diferencia = montoFinalReal !== undefined ? montoFinalReal - efectivoEsperado : undefined;

  const cards = [
    { label: 'Ventas', value: resumen.total_ventas, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'account_balance_wallet' },
    { label: 'Ingresos', value: resumen.total_ingresos, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'arrow_outward' },
    { label: 'Gastos', value: resumen.total_gastos, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'south_east' },
    { label: 'Retiros', value: resumen.total_retiros, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'account_balance' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`${c.bg} ${c.border} border rounded-xl px-4 py-3 flex flex-col gap-1`}>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name={c.icon} size={13} className={c.color} /> {c.label}
          </span>
          <span className={`text-lg font-bold font-mono ${c.color}`}>
            {money(c.value)}
          </span>
        </div>
      ))}
      <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl px-4 py-3 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon name="account_balance_wallet" size={13} className="text-blue-400" /> Efectivo esperado
        </span>
        <span className="text-lg font-bold font-mono text-blue-400">
          {money(efectivoEsperado)}
        </span>
      </div>
      <div className={`border rounded-xl px-4 py-3 flex flex-col gap-1 ${
        diferencia !== undefined ? (diferencia >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30') : 'bg-muted/30 border-border'
      }`}>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon name="account_balance_wallet" size={13} className={diferencia !== undefined ? (diferencia >= 0 ? 'text-green-400' : 'text-red-400') : 'text-muted-foreground'} /> Diferencia
        </span>
        <span className={`text-lg font-bold font-mono ${
          diferencia !== undefined ? (diferencia >= 0 ? 'text-green-400' : 'text-red-400') : 'text-muted-foreground'
        }`}>
          {diferencia !== undefined ? money(diferencia) : '—'}
        </span>
      </div>
    </div>
  );
}

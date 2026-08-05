import { m } from "framer-motion";
import type { Venta } from '@/types/venta.types';

interface VentasStatsProps {
  ventas: Venta[];
  money: (v: number | string) => string;
}

export function VentasStats({ ventas, money }: VentasStatsProps) {
  const stats = [
    { label: 'Total ventas', value: ventas.length, prefix: '' },
    { label: 'Ingresos cobrados', value: money(ventas.reduce((acc, v) => acc + Number(v.total) - Number(v.saldo_pendiente || 0), 0)) },
    { label: 'Pendiente de cobro', value: money(ventas.reduce((acc, v) => acc + Number(v.saldo_pendiente || 0), 0)), color: 'text-orange-400' },
    {
      label: 'CxC abiertas',
      value: ventas.filter((v) => v.estado_pago && v.estado_pago !== 'pagada').length,
      prefix: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <m.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-1"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</span>
          <span className={`text-2xl font-bold ${stat.color || 'text-[#2e9e9b]'}`}>{stat.prefix}{stat.value}</span>
        </m.div>
      ))}
    </div>
  );
}

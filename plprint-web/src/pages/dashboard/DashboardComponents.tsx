import { Icon } from '@/components/ui/Icon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMoney } from '@/hooks/useMoney';

export interface KPI {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const fmt = (simbolo: string, n: number) =>
  `${simbolo}${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;

export const fmtTime = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '--:--'; }
};

export function KpiCard({ kpi }: { kpi: KPI }) {
  return (
    <Card className="relative overflow-hidden group hover:border-[#2e9e9b]/30 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2e9e9b]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{kpi.label}</span>
          <div className="p-2 rounded-lg bg-[#2e9e9b]/10 text-[#2e9e9b] flex items-center justify-center">{kpi.icon}</div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Orbitron, sans-serif' }}>{kpi.value}</span>
          {kpi.trend === 'up' && (
            <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold mb-1">
              <Icon name="arrow_outward" size={13} /> Live
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
      </CardContent>
    </Card>
  );
}

export function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

const ESTADO_MAP: Record<string, 'success' | 'danger' | 'warning'> = {
  completada: 'success', cancelada: 'danger', pendiente: 'warning',
};

export function EstadoBadge({ estado }: { estado: string }) {
  return <Badge variant={ESTADO_MAP[estado] ?? 'outline'}>{estado}</Badge>;
}

export function ChartTooltip({ active, payload, label }: any) {
  const { simbolo } = useMoney();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs space-y-1 shadow-xl">
      <p className="text-[#2e9e9b] font-semibold">{label}</p>
      <p className="text-foreground">Ventas: <span className="font-bold">{payload[0]?.value ?? 0}</span></p>
      <p className="text-muted-foreground">Monto: <span className="font-bold text-foreground">{fmt(simbolo, payload[1]?.value ?? 0)}</span></p>
    </div>
  );
}

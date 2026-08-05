import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { VentaReciente } from './useDashboard';
import { EstadoBadge } from './DashboardComponents';

interface VentasRecientesCardProps {
  loading: boolean;
  ventas: VentaReciente[];
  esHoy: boolean;
  labelDia: string;
  money: (v: number | string) => string;
  formatTime: (iso: string) => string;
}

export function VentasRecientesCard({
  loading, ventas, esHoy, labelDia, money, formatTime,
}: VentasRecientesCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="shopping_cart" size={18} className="text-[#2e9e9b]" /> Ventas Recientes
          </CardTitle>
          <Button size="sm" variant="ghost" className="text-xs text-muted-foreground h-7 px-2" onClick={() => navigate('/ventas')}>
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="shopping_cart" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Sin ventas registradas{esHoy ? ' hoy' : ` el ${labelDia}`}</p>
            <p className="text-sm text-muted-foreground">Las ventas que realices hoy aparecerán en esta lista</p>
            <Button size="sm" variant="lime" className="mt-3 gap-1.5" onClick={() => navigate('/ventas')}>
              <Icon name="bolt" size={13} /> Nueva Venta
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 text-xs text-muted-foreground uppercase tracking-wide pb-1 border-b border-border">
              <span>Venta #</span>
              <span className="text-right">Items</span>
              <span className="text-right">Total</span>
              <span className="text-right">Estado</span>
            </div>
            {ventas.map((v) => (
              <div key={v.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-[#2e9e9b]">#{v.id}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatTime(v.fecha)}</span>
                </div>
                <span className="text-sm text-right text-muted-foreground">{v.items}</span>
                <span className="text-sm font-semibold text-right">{money(v.total)}</span>
                <div className="flex justify-end"><EstadoBadge estado={v.estado} /></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

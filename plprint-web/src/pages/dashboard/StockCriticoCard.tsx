import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { StockAlerta } from './useDashboard';

interface StockCriticoCardProps {
  loading: boolean;
  hasSucursal: boolean;
  sucursalNombre?: string;
  stockAlertas: StockAlerta[];
}

export function StockCriticoCard({
  loading, hasSucursal, sucursalNombre, stockAlertas,
}: StockCriticoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="warning" size={16} className="text-amber-400" /> Stock Crítico
        </CardTitle>
        <CardDescription>
          {hasSucursal ? `Sucursal: ${sucursalNombre}` : 'Selecciona una sucursal'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !hasSucursal ? (
          <div className="text-center py-6">
            <Icon name="apartment" size={28} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Sin sucursal activa</p>
          </div>
        ) : stockAlertas.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="inventory_2" size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm text-muted-foreground">Sin alertas de stock</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stockAlertas.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.nombre}</p>
                  <p className="text-xs text-muted-foreground">Mín: {item.stock_minimo}</p>
                </div>
                <Badge variant={item.stock === 0 ? 'danger' : 'warning'} className="ml-2 shrink-0">
                  {item.stock === 0 ? 'Agotado' : `${item.stock} uds`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

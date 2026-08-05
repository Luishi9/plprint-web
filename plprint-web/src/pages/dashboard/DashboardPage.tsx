import { useState, lazy, Suspense } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { useSucursalStore } from '@/store/sucursalStore';
import { useMoney } from '@/hooks/useMoney';
import { useDashboard } from './useDashboard';
import {
  KpiCard, KpiSkeleton, KPI, fmt, fmtTime,
} from './DashboardComponents';
import { StockCriticoCard } from './StockCriticoCard';
import { VentasRecientesCard } from './VentasRecientesCard';
import { AccionesRapidasCard } from './AccionesRapidasCard';

const Graphs = lazy(() => import('./DashboardCharts'));

export default function DashboardPage() {
  const { usuario } = useAuthStore();
  const { sucursalActiva } = useSucursalStore();
  const [fechaVer, setFechaVer] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const { data, loading, error, refresh } = useDashboard(fechaVer);
  const [chartTab, setChartTab] = useState('area');
  const { simbolo } = useMoney();

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const esHoy = fechaVer === todayStr;
  const labelDia = esHoy
    ? 'Hoy'
    : new Date(fechaVer + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  const moverDia = (delta: number) => {
    const [y, m, d] = fechaVer.split('-').map(Number);
    const nueva = new Date(y, m - 1, d + delta);
    const str = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, '0')}-${String(nueva.getDate()).padStart(2, '0')}`;
    if (str <= todayStr) setFechaVer(str);
  };

  const kpis: KPI[] = data ? [
    { label: `Ventas · ${labelDia}`, value: String(data.ventasHoy), sub: 'Transacciones completadas', icon: <Icon name="shopping_cart" size={24} />, trend: esHoy ? 'up' : undefined },
    { label: `Ingresos · ${labelDia}`, value: fmt(simbolo, data.totalHoy), sub: 'Total facturado', icon: <Icon name="attach_money" size={24} />, trend: data.totalHoy > 0 ? 'up' : 'neutral' },
    { label: 'Ticket Promedio', value: fmt(simbolo, data.ticketPromedio), sub: 'Promedio por venta', icon: <Icon name="trending_up" size={24} /> },
    { label: 'Productos', value: String(data.productosCount), sub: 'En catálogo', icon: <Icon name="inventory_2" size={24} /> },
  ] : [];

  return (
    <div className="min-h-full space-y-6" style={{ fontFamily: 'Rajdhani, system-ui, sans-serif' }}>

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Control Central
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {sucursalActiva && (
            <Badge variant="lime" className="gap-1.5">
              <Icon name="apartment" size={12} /> {sucursalActiva.nombre}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
            <Icon name="group" size={12} /> {usuario?.nombre}
          </Badge>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-1 py-1">
            <button type="button"
              onClick={() => moverDia(-1)}
              className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              title="Día anterior"
            >
              <Icon name="chevron_left" size={14} />
            </button>
            <div className="relative flex items-center">
              <Icon name="calendar_month" size={13} className="absolute left-2 text-[#2e9e9b] pointer-events-none" />
              <input
                type="date"
                aria-label="Fecha a visualizar"
                value={fechaVer}
                max={todayStr}
                onChange={(e) => e.target.value && setFechaVer(e.target.value)}
                className="pl-7 pr-2 py-0.5 text-xs bg-transparent text-white border-none outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
            <button type="button"
              onClick={() => moverDia(1)}
              disabled={esHoy}
              className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Día siguiente"
            >
              <Icon name="chevron_right" size={14} />
            </button>
          </div>

          <Button size="icon" variant="ghost" onClick={refresh} disabled={loading}
            className="text-muted-foreground hover:text-[#2e9e9b]" title="Actualizar"
          >
            <Icon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* ─── Gráfica + Stock crítico ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="bar_chart" size={16} className="text-[#2e9e9b]" /> Actividad · {labelDia}
                </CardTitle>
                <CardDescription>Ventas por hora</CardDescription>
              </div>
              <Tabs value={chartTab} onValueChange={setChartTab}>
                <TabsList className="h-7">
                  <TabsTrigger value="area" className="text-xs px-2 h-6">Área</TabsTrigger>
                  <TabsTrigger value="bar" className="text-xs px-2 h-6">Barras</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? <Skeleton className="h-44 w-full" /> : (
              <Suspense fallback={<Skeleton className="h-44 w-full" />}>
                <Graphs chartTab={chartTab} data={data?.grafica ?? []} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        <StockCriticoCard
          loading={loading}
          hasSucursal={!!sucursalActiva}
          sucursalNombre={sucursalActiva?.nombre}
          stockAlertas={data?.stockAlertas ?? []}
        />
      </div>

      {/* ─── Ventas recientes + Acciones ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VentasRecientesCard
          loading={loading}
          ventas={data?.ventasRecientes ?? []}
          esHoy={esHoy}
          labelDia={labelDia}
          money={fmt.bind(null, simbolo) as never}
          formatTime={fmtTime as never}
        />
        <AccionesRapidasCard usuarioRol={usuario?.rol} />
      </div>
    </div>
  );
}

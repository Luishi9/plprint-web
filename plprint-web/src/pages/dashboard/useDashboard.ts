import { useCallback, useEffect, useState } from 'react';
import { useSucursalStore } from '@/store/sucursalStore';
import { ventasApi } from '@/api/ventas.api';
import { inventarioApi } from '@/api/inventario.api';
import { productosApi } from '@/api/productos.api';

export interface VentaReciente {
  id: number;
  total: number;
  items: number;
  estado: string;
  fecha: string;
}

export interface StockAlerta {
  id: number;
  nombre: string;
  stock: number;
  stock_minimo: number;
}

export interface DashboardData {
  ventasHoy: number;
  totalHoy: number;
  ticketPromedio: number;
  productosCount: number;
  ventasRecientes: VentaReciente[];
  stockAlertas: StockAlerta[];
  grafica: { hora: string; ventas: number; monto: number }[];
}

export function useDashboard(fecha: string) {
  const { sucursalActiva } = useSucursalStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [y, m, d] = fecha.split('-').map(Number);
      const desde = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
      const hasta = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();

      const [ventasRes, productosRes] = await Promise.allSettled([
        ventasApi.getAll({ desde, hasta, limit: 100, ...(sucursalActiva?.id && { sucursalId: sucursalActiva.id }) }),
        productosApi.getAll({ limit: 1, sucursalId: sucursalActiva?.id }),
      ]);

      let ventasList: VentaReciente[] = [];
      let totalHoy = 0;
      if (ventasRes.status === 'fulfilled') {
        const vd = ventasRes.value.data?.data;
        const items = Array.isArray(vd) ? vd : (vd?.ventas ?? []);
        ventasList = items.map((v: any) => ({
          id: v.id,
          total: parseFloat(v.total ?? v.monto_total ?? 0),
          items: v.items_count ?? v.venta_detalle?.length ?? 1,
          estado: v.estado ?? 'completada',
          fecha: v.fecha_venta ?? v.created_at ?? v.createdAt ?? new Date().toISOString(),
        }));
        totalHoy = ventasList
          .filter((v) => v.estado !== 'cancelada')
          .reduce((s, v) => s + v.total, 0);
      }

      const completadas = ventasList.filter((v) => v.estado !== 'cancelada');
      const ticketPromedio = completadas.length > 0 ? totalHoy / completadas.length : 0;

      let productosCount = 0;
      if (productosRes.status === 'fulfilled') {
        const meta = productosRes.value.data?.meta;
        const pd = productosRes.value.data?.data;
        productosCount = meta?.total ?? (Array.isArray(pd) ? pd.length : (pd?.total ?? 0));
      }

      let stockAlertas: StockAlerta[] = [];
      if (sucursalActiva) {
        try {
          const invRes = await inventarioApi.getBySucursal(sucursalActiva.id, { soloStockBajo: true });
          const inv = invRes.data?.data;
          const invList = Array.isArray(inv) ? inv : [];
          stockAlertas = invList.slice(0, 6).map((i: any) => ({
            id: i.id ?? i.producto_id,
            nombre: i.producto?.nombre ?? i.nombre ?? 'Producto',
            stock: i.cantidad ?? 0,
            stock_minimo: i.stock_minimo ?? 0,
          }));
        } catch { /* sin stock crítico */ }
      }

      const conteo: Record<string, { ventas: number; monto: number }> = {};
      for (let h = 8; h <= 20; h++) conteo[`${h}:00`] = { ventas: 0, monto: 0 };
      ventasList.forEach((v) => {
        const h = new Date(v.fecha).getHours();
        const key = `${h}:00`;
        if (conteo[key]) { conteo[key].ventas += 1; conteo[key].monto += v.total; }
      });

      setData({
        ventasHoy: completadas.length,
        totalHoy,
        ticketPromedio,
        productosCount,
        ventasRecientes: ventasList.slice(0, 8),
        stockAlertas,
        grafica: Object.entries(conteo).map(([hora, d]) => ({ hora, ...d })),
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [sucursalActiva, fecha]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refresh: fetchData };
}

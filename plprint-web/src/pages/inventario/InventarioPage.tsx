import { useEffect, useRef, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';

import { inventarioApi } from '@/api/inventario.api';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AjusteModal } from './components/AjusteModal';
import { KardexModal } from './components/KardexModal';
import { useMoney } from '@/hooks/useMoney';
import { InventarioTable, InventarioItem } from './InventarioTable';

export default function InventarioPage() {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const { format: money } = useMoney();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;

  const [ajusteItem, setAjusteItem] = useState<InventarioItem | null>(null);
  const [ajusteOpen, setAjusteOpen] = useState(false);

  const [kardexItem, setKardexItem] = useState<InventarioItem | null>(null);
  const [kardexOpen, setKardexOpen] = useState(false);

  const fetchInventario = async (isInitial = false) => {
    if (!sucursalEfectiva) { setIsLoading(false); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    if (isInitial) setIsLoading(true); else setIsSearching(true);
    try {
      const res = await inventarioApi.getBySucursal(sucursalEfectiva.id, {
        search: searchQuery || undefined,
        soloStockBajo: soloStockBajo || undefined,
      });
      setItems(res.data?.data || []);
    } catch (e: any) {
      if (e?.code !== 'ERR_CANCELED') console.error(e);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!sucursalEfectiva) { setIsLoading(false); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const res = await inventarioApi.getBySucursal(sucursalEfectiva.id, {
            search: searchQuery || undefined,
            soloStockBajo: soloStockBajo || undefined,
          });
          if (cancelled) return;
          setItems(res.data?.data || []);
        } catch (e: any) {
          if (e?.code !== 'ERR_CANCELED' && !cancelled) console.error(e);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [sucursalEfectiva, searchQuery, soloStockBajo]);

  const stats = {
    total: items.length,
    sinStock: items.filter((i) => i.cantidad === 0).length,
    stockBajo: items.filter((i) => i.cantidad > 0 && i.cantidad <= i.stock_minimo).length,
  };

  const abrirAjuste = (item: InventarioItem) => {
    setAjusteItem(item);
    setAjusteOpen(true);
  };

  const abrirKardex = (item: InventarioItem) => {
    setKardexItem(item);
    setKardexOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Icon name="inventory_2" size={32} className="text-[#2e9e9b]" />
            Inventario
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sucursalEfectiva ? `Sucursal: ${sucursalEfectiva.nombre}` : 'Sin sucursal activa'}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          <div className="relative w-full sm:w-64">
            {isSearching
              ? <Icon name="hourglass_top" size={16} className="absolute left-2.5 top-2.5 text-[#2e9e9b] animate-spin" />
              : <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />}
            <Input
              placeholder="Buscar producto..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={soloStockBajo ? 'default' : 'outline'}
            onClick={() => setSoloStockBajo((p) => !p)}
            className={`h-10 whitespace-nowrap border-border ${soloStockBajo ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40 hover:bg-yellow-400/30' : 'text-muted-foreground hover:text-white'}`}
          >
            <Icon name="warning" size={14} className="mr-2" />
            Stock bajo
          </Button>
        </m.div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total productos', value: stats.total, color: 'text-white' },
          { label: 'Stock bajo', value: stats.stockBajo, color: 'text-yellow-400' },
          { label: 'Sin stock', value: stats.sinStock, color: 'text-red-400' },
        ].map((stat, i) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-1"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          </m.div>
        ))}
      </div>

      <InventarioTable
        isLoading={isLoading}
        isSearching={isSearching}
        items={items}
        hasSucursal={!!sucursalEfectiva}
        money={money as never}
        onAjustar={abrirAjuste}
        onVerKardex={abrirKardex}
      />

      <AjusteModal
        item={ajusteItem}
        open={ajusteOpen}
        onOpenChange={setAjusteOpen}
        onSuccess={() => fetchInventario()}
      />
      <KardexModal
        productoId={kardexItem?.producto_id ?? null}
        sucursalId={kardexItem?.sucursal_id ?? null}
        nombreProducto={kardexItem?.productos.nombre ?? ''}
        open={kardexOpen}
        onOpenChange={setKardexOpen}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';

import { ordenesProduccionApi, OrdenProduccion, EstatusOrden } from '@/api/ordenesProduccion.api';
import { useSucursalStore } from '@/store/sucursalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { TablaOrdenes, ESTATUS_META_EXPORT as ESTATUS_META } from './TablaOrdenes';
import { OrdenProduccionModal } from './OrdenProduccionModal';
import { DetalleOrdenModal } from './DetalleOrdenModal';
import { CambiarEstatusModal } from './CambiarEstatusModal';

export default function ProduccionPage() {
  const { sucursalActiva } = useSucursalStore();

  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<EstatusOrden | 'todas'>('pendiente');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<OrdenProduccion | null>(null);
  const [detalleOpen, setDetalleOpen] = useState<OrdenProduccion | null>(null);
  const [estatusOpen, setEstatusOpen] = useState<OrdenProduccion | null>(null);
  const [eliminarItem, setEliminarItem] = useState<OrdenProduccion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrdenes = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, unknown> = {
        ...(sucursalActiva?.id && { sucursalId: sucursalActiva.id }),
        ...(tab !== 'todas' && { estatus: tab }),
        ...(search.trim() && { search: search.trim() }),
      };
      const res = await ordenesProduccionApi.getAll(params);
      setOrdenes((res.data as { data: OrdenProduccion[] }).data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const params: Record<string, unknown> = {
            ...(sucursalActiva?.id && { sucursalId: sucursalActiva.id }),
            ...(tab !== 'todas' && { estatus: tab }),
            ...(search.trim() && { search: search.trim() }),
          };
          const res = await ordenesProduccionApi.getAll(params);
          if (cancelled) return;
          setOrdenes((res.data as { data: OrdenProduccion[] }).data || []);
        } catch (e) { if (!cancelled) console.error(e); }
        finally { if (!cancelled) setIsLoading(false); }
      })();
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [tab, search, sucursalActiva?.id]);

  const counts = ordenes.reduce<Record<string, number>>((acc, o) => {
    acc[o.estatus] = (acc[o.estatus] ?? 0) + 1;
    return acc;
  }, {});

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await ordenesProduccionApi.remove(eliminarItem.id);
      sileo.success({ title: 'Orden eliminada' });
      setEliminarItem(null);
      fetchOrdenes();
    } catch (e: any) {
      sileo.error({ title: e?.response?.data?.message ?? 'Error al eliminar' });
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="factory" size={32} className="text-[#2e9e9b]" />
            Producción
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Órdenes de fabricación y control de avance
            {sucursalActiva && ` — ${sucursalActiva.nombre}`}
          </p>
        </m.div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por producto, código..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <RequirePermission modulo="produccion" accion="crear">
            <Button
              onClick={() => { setEditando(null); setModalOpen(true); }}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold whitespace-nowrap"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nueva orden
            </Button>
          </RequirePermission>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as EstatusOrden | 'todas')}>
        <TabsList className="bg-card/50 border border-border h-auto p-1 flex flex-wrap gap-1">
          <TabsTrigger value="pendiente" className={ESTATUS_META.pendiente.ringCls}>
            <Icon name="schedule" size={13} className="mr-1.5" /> Pendientes
            <span className="ml-1.5 text-[10px] opacity-70">({counts.pendiente ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="en_proceso" className={ESTATUS_META.en_proceso.ringCls}>
            <Icon name="play_arrow" size={13} className="mr-1.5" /> En proceso
            <span className="ml-1.5 text-[10px] opacity-70">({counts.en_proceso ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="terminado" className={ESTATUS_META.terminado.ringCls}>
            <Icon name="inventory" size={13} className="mr-1.5" /> Terminadas
            <span className="ml-1.5 text-[10px] opacity-70">({counts.terminado ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="entregado" className={ESTATUS_META.entregado.ringCls}>
            <Icon name="check_circle" size={13} className="mr-1.5" /> Entregadas
            <span className="ml-1.5 text-[10px] opacity-70">({counts.entregado ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelado" className={ESTATUS_META.cancelado.ringCls}>
            <Icon name="cancel" size={13} className="mr-1.5" /> Canceladas
            <span className="ml-1.5 text-[10px] opacity-70">({counts.cancelado ?? 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <TablaOrdenes
            ordenes={ordenes}
            isLoading={isLoading}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onVerDetalle={setDetalleOpen}
            onEditar={(o) => { setEditando(o); setModalOpen(true); }}
            onEstatus={setEstatusOpen}
            onEliminar={setEliminarItem}
            onRefresh={fetchOrdenes}
          />
        </TabsContent>
      </Tabs>

      <OrdenProduccionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        editando={editando}
        onSaved={fetchOrdenes}
      />

      <DetalleOrdenModal
        orden={detalleOpen}
        onClose={() => setDetalleOpen(null)}
      />

      {estatusOpen && (
        <CambiarEstatusModal
          key={estatusOpen.id}
          orden={estatusOpen}
          onClose={() => setEstatusOpen(null)}
          onSaved={fetchOrdenes}
        />
      )}

      <Dialog open={!!eliminarItem} onOpenChange={() => setEliminarItem(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Icon name="delete" size={18} className="text-red-400" />
              Eliminar orden #{eliminarItem?.id}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La orden debe estar en estatus pendiente o cancelado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEliminarItem(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-500/90 hover:bg-red-500"
            >
              {isDeleting ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

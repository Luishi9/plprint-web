import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

import { insumosApi } from '@/api/insumos.api';
import { Insumo } from '@/types/insumo.types';

import { Button } from '@/components/ui/button';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { InsumoFormModal } from './components/InsumoFormModal';
import { AjusteInsumoModal } from './components/AjusteInsumoModal';
import CompraInsumoModal from '@/components/forms/CompraInsumoModal';
import AgregarComprasModal from '@/components/forms/AgregarComprasModal';
import { ImportarInsumosModal } from './components/ImportarInsumosModal';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { usePermisos } from '@/hooks/usePermisos';
import { InsumosToolbar } from './InsumosToolbar';
import { InsumosTable } from './InsumosTable';

const PAGE_SIZE = 50;

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // última página cargada
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [inventarioMap, setInventarioMap] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insumoAEditar, setInsumoAEditar] = useState<Insumo | null>(null);
  const [insumoAEliminar, setInsumoAEliminar] = useState<Insumo | null>(null);
  const [insumoAAjustar, setInsumoAAjustar] = useState<Insumo | null>(null);
  const [insumoACompra, setInsumoACompra] = useState<Insumo | null>(null);
  const [agregarComprasOpen, setAgregarComprasOpen] = useState(false);
  const [importarOpen, setImportarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = usePermisos();
  const abortRef = useRef<AbortController | null>(null);

  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;

  const fetchInsumos = async (query: string, isInitial = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (isInitial) setIsLoading(true);
    else setIsSearching(true);

    // Recargas (post crear/editar/eliminar) mantienen lo ya mostrado
    const limit = isInitial ? PAGE_SIZE : Math.max(PAGE_SIZE, page * PAGE_SIZE);
    try {
      const res = await insumosApi.getAll({
        search: query || undefined,
        sucursalId: sucursalEfectiva?.id,
        page: 1,
        limit,
      });
      const items = (res.data?.data || []) as Insumo[];
      setTotal(res.data?.meta?.total ?? 0);
      setPage(limit / PAGE_SIZE);
      setInsumos(items);
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Error al cargar insumos:', error);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleCargarMas = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoadingMore(true);
    try {
      const res = await insumosApi.getAll({
        search: searchQuery || undefined,
        sucursalId: sucursalEfectiva?.id,
        page: page + 1,
        limit: PAGE_SIZE,
      });
      const items = (res.data?.data || []) as Insumo[];
      setTotal(res.data?.meta?.total ?? 0);
      setPage((p) => p + 1);
      setInsumos((prev) => [...prev, ...items]);
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Error al cargar insumos:', error);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchInventario = async (sucursalId?: number) => {
    const id = sucursalId ?? sucursalEfectiva?.id;
    if (!id) return;
    try {
      const res = await insumosApi.getInventarioBySucursal(id);
      const map: Record<number, number> = {};
      (res.data?.data || []).forEach((inv: any) => {
        map[inv.insumo_id] = parseFloat(inv.cantidad);
      });
      setInventarioMap(map);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    }
  };

  useEffect(() => { fetchInsumos('', true); }, [sucursalEfectiva?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = sucursalEfectiva?.id ?? usuario?.sucursalesDetalle?.[0]?.id;
      if (!id) return;
      try {
        const res = await insumosApi.getInventarioBySucursal(id);
        if (cancelled) return;
        const map: Record<number, number> = {};
        (res.data?.data || []).forEach((inv: any) => {
          map[inv.insumo_id] = parseFloat(inv.cantidad);
        });
        setInventarioMap(map);
      } catch (error) {
        if (!cancelled) console.error('Error al cargar inventario:', error);
      }
    })();
    return () => { cancelled = true; };
  }, [sucursalEfectiva, usuario?.sucursalesDetalle]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchInsumos(searchQuery); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleEditar = (insumo: Insumo) => {
    setInsumoAEditar(insumo);
    setIsModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!insumoAEliminar) return;
    try {
      setIsDeleting(true);
      await insumosApi.remove(insumoAEliminar.id);
      setInsumoAEliminar(null);
      fetchInsumos(searchQuery);
      fetchInventario();
    } catch (error) {
      console.error('Error al eliminar insumo:', error);
      sileo.error({ title: 'No se pudo eliminar el insumo.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const abrirNuevo = () => {
    setInsumoAEditar(null);
    setIsModalOpen(true);
  };

  const handleExportarCatalogo = async () => {
    try {
      const res = await insumosApi.exportCatalog(sucursalEfectiva?.id);
      const blob = new Blob([res.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'catalogo_insumos.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      sileo.error({ title: 'Error al exportar catálogo' });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <InsumosToolbar
        searchQuery={searchQuery}
        isSearching={isSearching}
        onSearchChange={setSearchQuery}
        onNuevo={abrirNuevo}
        onAgregarCompra={() => setAgregarComprasOpen(true)}
        {...(isAdmin && {
          onImportar: () => setImportarOpen(true),
          onExportar: handleExportarCatalogo,
        })}
      />

      <InsumosTable
        isLoading={isLoading}
        insumos={insumos}
        inventarioMap={inventarioMap}
        searchQuery={searchQuery}
        onCompra={setInsumoACompra}
        onAjustar={setInsumoAAjustar}
        onEditar={handleEditar}
        onEliminar={setInsumoAEliminar}
      />

      {insumos.length < total && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleCargarMas}
            disabled={isLoadingMore}
            className="border-[#2e9e9b]/30 text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
          >
            {isLoadingMore
              ? <Icon name="progress_activity" className="animate-spin mr-2" size={16} />
              : <Icon name="add_circle" className="mr-2" size={16} />}
            Cargar más ({insumos.length} de {total})
          </Button>
        </div>
      )}

      <InsumoFormModal
        open={isModalOpen}
        insumo={insumoAEditar}
        onClose={() => { setIsModalOpen(false); setInsumoAEditar(null); }}
        onSaved={() => {
          setIsModalOpen(false);
          setInsumoAEditar(null);
          fetchInsumos(searchQuery);
          fetchInventario();
        }}
      />

      <AjusteInsumoModal
        open={!!insumoAAjustar}
        insumo={insumoAAjustar}
        onClose={() => setInsumoAAjustar(null)}
        onSaved={() => {
          setInsumoAAjustar(null);
          fetchInventario();
        }}
      />

      <CompraInsumoModal
        open={!!insumoACompra}
        insumoPreseleccionado={insumoACompra ? {
          id: insumoACompra.id,
          nombre: insumoACompra.nombre,
          precio_compra: insumoACompra.precio_compra,
        } : undefined}
        onOpenChange={(v) => { if (!v) setInsumoACompra(null); }}
        onSuccess={() => {
          setInsumoACompra(null);
          fetchInventario();
          fetchInsumos(searchQuery);
        }}
      />

      <Dialog open={!!insumoAEliminar} onOpenChange={() => setInsumoAEliminar(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">¿Eliminar insumo?</DialogTitle>
            <DialogDescription>
              El insumo <strong>{insumoAEliminar?.nombre}</strong> se desactivará. Los datos históricos se conservarán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" className="border-border" onClick={() => setInsumoAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isDeleting && <Icon name="progress_activity" size={14} className="animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AgregarComprasModal
        open={agregarComprasOpen}
        onOpenChange={(v) => { if (!v) setAgregarComprasOpen(false); }}
        onSuccess={() => {
          setAgregarComprasOpen(false);
          fetchInventario();
          fetchInsumos(searchQuery);
        }}
      />

      <ImportarInsumosModal
        open={importarOpen}
        onOpenChange={setImportarOpen}
        onSuccess={() => {
          fetchInsumos(searchQuery);
          fetchInventario();
        }}
      />
    </div>
  );
}

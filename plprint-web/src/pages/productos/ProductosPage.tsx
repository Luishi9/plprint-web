import { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { productosApi } from '@/api/productos.api';
import { Producto } from '@/types/producto.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { usePermisos } from '@/hooks/usePermisos';
import { useSucursalStore } from '@/store/sucursalStore';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { ProductoFormModal } from './components/ProductoFormModal';
import { ImportarProductosModal } from './components/ImportarProductosModal';
import { useMoney } from '@/hooks/useMoney';
import { ProductosTable } from './ProductosTable';

export default function ProductosPage() {
  const { sucursalActiva } = useSucursalStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);   // solo carga inicial
  const [isSearching, setIsSearching] = useState(false); // búsqueda sin borrar tabla
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { format: money } = useMoney();

  const fetchProductos = async (query: string, isInitial = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (isInitial) setIsLoading(true);
    else setIsSearching(true);

    try {
      const res = await productosApi.getAll({ search: query || undefined, sucursalId: sucursalActiva?.id });
      setProductos(res.data?.data || []);
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Error al cargar productos:', error);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const res = await productosApi.getAll({ search: searchQuery || undefined, sucursalId: sucursalActiva?.id });
          if (cancelled) return;
          setProductos(res.data?.data || []);
        } catch (error: any) {
          if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED' && !cancelled) {
            console.error('Error al cargar productos:', error);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [sucursalActiva?.id, searchQuery]);

  const handleEditar = async (producto: Producto) => {
    try {
      const res = await productosApi.getById(producto.id);
      const full = (res.data as { data?: Producto }).data ?? producto;
      setProductoAEditar(full);
      setIsModalOpen(true);
    } catch {
      setProductoAEditar(producto);
      setIsModalOpen(true);
    }
  };

  const handleEliminar = async () => {
    if (!productoAEliminar) return;
    try {
      setIsDeleting(true);
      await productosApi.remove(productoAEliminar.id);
      setProductoAEliminar(null);
      fetchProductos(searchQuery);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      sileo.error({ title: 'No se pudo eliminar el producto.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Icon name="inventory_2" className="text-[#2e9e9b]" size={32} />
            Catálogo Estelar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión global de productos e inventario.
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
              ? <Icon name="progress_activity" className="absolute left-2.5 top-2.5 text-[#2e9e9b] animate-spin" size={16} />
              : <Icon name="search" className="absolute left-2.5 top-2.5 text-muted-foreground" size={16} />
            }
            <Input
              type="text"
              placeholder="Buscar producto..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <RequirePermission modulo="productos" accion="crear">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
            >
              <Icon name="add" className="mr-2" size={16} />
              Nuevo Producto
            </Button>
          </RequirePermission>

          {(usePermisos().isAdmin) && (
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="h-10 px-4 border-[#2e9e9b]/30 text-[#2e9e9b] hover:bg-[#2e9e9b]/10 whitespace-nowrap"
            >
              <Icon name="upload_file" className="mr-2" size={16} />
              Importar Excel
            </Button>
          )}

          {(usePermisos().isAdmin) && (
            <Button
              onClick={async () => {
                try {
                  const res = await productosApi.exportCatalog(sucursalActiva?.id);
                  const blob = new Blob([res.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'catalogo_productos.xlsx';
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch {
                  sileo.error({ title: 'Error al descargar catalogo' });
                }
              }}
              variant="outline"
              className="h-10 px-4 border-[#2e9e9b]/30 text-[#2e9e9b] hover:bg-[#2e9e9b]/10 whitespace-nowrap"
            >
              <Icon name="download" className="mr-2" size={16} />
              Descargar catalogo
            </Button>
          )}
        </m.div>
      </div>

      <ProductoFormModal
        key={productoAEditar?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={(v) => { setIsModalOpen(v); if (!v) setProductoAEditar(null); }}
        onSuccess={() => fetchProductos(searchQuery)}
        producto={productoAEditar}
      />

      <ImportarProductosModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => fetchProductos(searchQuery)}
      />

      {/* DATA TABLE SECTION */}
      <ProductosTable
        isLoading={isLoading}
        isSearching={isSearching}
        productos={productos as never}
        money={money as never}
        onEditar={handleEditar as never}
        onEliminar={setProductoAEliminar as never}
      />

      {/* DIÁLOGO CONFIRMAR ELIMINACIÓN */}
      <Dialog open={!!productoAEliminar} onOpenChange={(v) => { if (!v) setProductoAEliminar(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar producto?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se eliminará <span className="text-white font-semibold">{productoAEliminar?.nombre}</span> de forma permanente. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setProductoAEliminar(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isDeleting ? <Icon name="progress_activity" className="animate-spin" size={16} /> : <Icon name="delete" className="mr-1" size={16} />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

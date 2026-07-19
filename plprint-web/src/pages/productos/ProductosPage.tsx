import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getImageUrl } from '@/utils/format';
import { useMoney } from '@/hooks/useMoney';

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
    // Cancelar request anterior si sigue en vuelo
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

  // Carga inicial
  useEffect(() => {
    fetchProductos('', true);
  }, []);

  // Refrescar al cambiar sucursal
  useEffect(() => {
    fetchProductos(searchQuery, true);
  }, [sucursalActiva?.id]);

  // Búsqueda con debounce — mantiene la tabla visible mientras busca
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleEditar = (producto: Producto) => {
    setProductoAEditar(producto);
    setIsModalOpen(true);
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="inventory_2" className="text-[#2e9e9b]" size={32} />
            Catálogo Estelar
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión global de productos e inventario.
          </p>
        </motion.div>

        <motion.div
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
        </motion.div>
      </div>

      <ProductoFormModal
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 overflow-y-auto overflow-x-auto shadow-2xl transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}
      >
        <div className="relative">
          <table className="w-full text-sm text-left rtl:text-right text-foreground">
            <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4">
                  <span className="sr-only">Imagen</span>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Código
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  Precio Venta
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  Precio Compra
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  Stock
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <Icon name="progress_activity" className="mx-auto animate-spin text-[#2e9e9b]" size={24} />
                    <p className="mt-2 text-xs text-muted-foreground">Cargando catálogo...</p>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {productos.map((producto, i) => (
                    <motion.tr
                      key={producto.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="p-4">
                        {producto.imagen_url ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-background/50 border border-border shadow-inner">
                            <img
                              src={getImageUrl(producto.imagen_url)}
                              alt={producto.nombre}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-background/80 border border-border flex items-center justify-center text-muted-foreground/30 shadow-inner">
                            <Icon name="image" size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground tracking-wide">
                        {producto.nombre}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                        {producto.codigo || '—'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-right text-[#2e9e9b] tracking-wide">
                        {money(Number(producto.precio_venta))}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground font-mono text-sm">
                        {producto.precio_compra ? money(Number(producto.precio_compra)) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {producto.inventario && producto.inventario.length > 0 ? (
                          <span className="font-mono text-sm font-semibold text-[#2e9e9b]">
                            {producto.inventario.reduce((sum, inv) => sum + inv.cantidad, 0)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${producto.activo ? 'bg-[#2e9e9b]/10 text-[#2e9e9b] border border-[#2e9e9b]/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <RequirePermission modulo="productos" accion="editar">
                            <button
                              onClick={() => handleEditar(producto)}
                              title="Editar"
                              className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            >
                              <Icon name="edit" size={16} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="productos" accion="eliminar">
                            <button
                              onClick={() => setProductoAEliminar(producto)}
                              title="Eliminar"
                              className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Icon name="delete" size={16} />
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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

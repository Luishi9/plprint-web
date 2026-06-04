import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Loader2, Boxes, Pencil, Trash2, SlidersHorizontal } from 'lucide-react';

import { insumosApi } from '@/api/insumos.api';
import { Insumo } from '@/types/insumo.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { useMoney } from '@/hooks/useMoney';

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [inventarioMap, setInventarioMap] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insumoAEditar, setInsumoAEditar] = useState<Insumo | null>(null);
  const [insumoAEliminar, setInsumoAEliminar] = useState<Insumo | null>(null);
  const [insumoAAjustar, setInsumoAAjustar] = useState<Insumo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const { format: money } = useMoney();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;

  const fetchInsumos = async (query: string, isInitial = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (isInitial) setIsLoading(true);
    else setIsSearching(true);

    try {
      const res = await insumosApi.getAll({ search: query || undefined });
      setInsumos(res.data?.data || []);
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Error al cargar insumos:', error);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const fetchInventario = async () => {
    if (!sucursalEfectiva) return;
    try {
      const res = await insumosApi.getInventarioBySucursal(sucursalEfectiva.id);
      const map: Record<number, number> = {};
      (res.data?.data || []).forEach((inv: any) => {
        map[inv.insumo_id] = parseFloat(inv.cantidad);
      });
      setInventarioMap(map);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    }
  };

  useEffect(() => {
    fetchInsumos('', true);
  }, []);

  useEffect(() => {
    fetchInventario();
  }, [sucursalEfectiva]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsumos(searchQuery);
    }, 300);
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
      alert('No se pudo eliminar el insumo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStockBadge = (cantidad: number) => {
    if (cantidad === 0) return { label: 'Sin stock', cls: 'bg-red-500/15 text-red-400 border-red-500/30' };
    if (cantidad <= 10) return { label: 'Stock bajo', cls: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' };
    return { label: 'En stock', cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30' };
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
            <Boxes className="text-[#2e9e9b]" size={32} />
            Insumos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de materias primas y materiales
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar insumo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border h-10 w-full sm:w-64 focus-visible:ring-[#2e9e9b]"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e9b] animate-spin" />
            )}
          </div>
          <Button
            onClick={() => { setInsumoAEditar(null); setIsModalOpen(true); }}
            className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo insumo
          </Button>
        </motion.div>
      </div>

      {/* TABLE */}
      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#2e9e9b]" />
          </div>
        ) : insumos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <Boxes size={48} className="opacity-20" />
            <p>{searchQuery ? 'No se encontraron insumos.' : 'No hay insumos registrados.'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 text-left font-semibold">Código</th>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Unidad</th>
                <th className="px-6 py-4 text-right font-semibold">Precio Compra</th>
                <th className="px-6 py-4 text-right font-semibold">Stock</th>
                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {insumos.map((insumo, i) => {
                  const stock = inventarioMap[insumo.id] ?? 0;
                  const badge = getStockBadge(stock);
                  return (
                    <motion.tr
                      key={insumo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {insumo.codigo || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{insumo.nombre}</div>
                        {insumo.descripcion && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {insumo.descripcion}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {insumo.unidad_medida}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-[#2e9e9b]">
                        {insumo.precio_compra ? money(parseFloat(insumo.precio_compra)) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.cls}`}>
                          {stock.toFixed(2)} {insumo.unidad_medida}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setInsumoAAjustar(insumo)}
                            className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            title="Ajustar stock"
                          >
                            <SlidersHorizontal size={16} />
                          </button>
                          <button
                            onClick={() => handleEditar(insumo)}
                            className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setInsumoAEliminar(insumo)}
                            className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
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

      <Dialog open={!!insumoAEliminar} onOpenChange={() => setInsumoAEliminar(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar insumo?</DialogTitle>
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
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

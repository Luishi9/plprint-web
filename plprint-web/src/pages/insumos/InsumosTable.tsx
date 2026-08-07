import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { useMoney } from '@/hooks/useMoney';
import type { Insumo } from '@/types/insumo.types';

interface InsumosTableProps {
  isLoading: boolean;
  insumos: Insumo[];
  inventarioMap: Record<number, number>;
  searchQuery: string;
  onCompra: (insumo: Insumo) => void;
  onAjustar: (insumo: Insumo) => void;
  onEditar: (insumo: Insumo) => void;
  onEliminar: (insumo: Insumo) => void;
}

const getStockBadge = (stock: number) => {
  if (stock <= 0) return { cls: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'Agotado' };
  if (stock < 5) return { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', label: 'Bajo' };
  return { cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30', label: 'OK' };
};

export function InsumosTable({
  isLoading, insumos, inventarioMap, searchQuery,
  onCompra, onAjustar, onEditar, onEliminar,
}: InsumosTableProps) {
  const { format: money } = useMoney();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="progress_activity" className="animate-spin text-[#2e9e9b]" size={32} />
      </div>
    );
  }

  if (insumos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Icon name="inventory" size={48} className="opacity-20" />
        <p>{searchQuery ? 'No se encontraron insumos.' : 'No hay insumos registrados.'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
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
                <m.tr
                  key={insumo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-[#2e9e9b]/10 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                    {insumo.codigo ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{insumo.nombre}</div>
                    {insumo.descripcion && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {insumo.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{insumo.unidad_medida}</td>
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
                      <button type="button" onClick={() => onCompra(insumo)} title="Registrar compra"
                        className="p-2 rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10">
                        <Icon name="shopping_cart" size={16} />
                      </button>
                      <button type="button" onClick={() => onAjustar(insumo)} title="Ajustar stock"
                        className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10">
                        <Icon name="tune" size={16} />
                      </button>
                      <button type="button" onClick={() => onEditar(insumo)} title="Editar"
                        className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10">
                        <Icon name="edit" size={16} />
                      </button>
                      <button type="button" onClick={() => onEliminar(insumo)} title="Eliminar"
                        className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </td>
                </m.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { Categoria } from '@/api/categorias.api';

interface CategoriasTableProps {
  isLoading: boolean;
  categorias: Categoria[];
  filtroTipo: 'todas' | 'venta' | 'produccion' | 'impresion';
  onEditar: (cat: Categoria) => void;
  onEliminar: (cat: Categoria) => void;
}

export function CategoriasTable({ isLoading, categorias, filtroTipo, onEditar, onEliminar }: CategoriasTableProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto overflow-x-auto"
    >
      <div className="relative">
        <table className="w-full text-sm text-left rtl:text-right text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">#</th>
              <th scope="col" className="px-6 py-4 font-semibold">Nombre</th>
              <th scope="col" className="px-6 py-4 font-semibold">Tipo</th>
              <th scope="col" className="px-6 py-4 font-semibold">Descripción</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Productos</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <Icon name="progress_activity" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                  <p className="mt-2 text-xs text-muted-foreground">Cargando categorías...</p>
                </td>
              </tr>
            ) : categorias.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  <Icon name="sell" size={32} className="mx-auto mb-2 opacity-20" />
                  <p>{filtroTipo === 'todas' ? 'No hay categorías aún. ¡Crea la primera!' : 'No hay categorías de este tipo.'}</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {categorias.map((cat, i) => {
                  const isProduccion = cat.tipo === 'produccion';
                  const isImpresion = cat.tipo === 'impresion';
                  return (
                    <m.tr
                      key={cat.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{cat.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{cat.nombre}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isProduccion
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : isImpresion
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30'
                        }`}>
                          {isProduccion ? <Icon name="factory" size={11} /> : isImpresion ? <Icon name="print" size={11} /> : <Icon name="shopping_bag" size={11} />}
                          {isProduccion ? 'Producción' : isImpresion ? 'Impresión' : 'Venta'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {cat.descripcion || <span className="text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-[#2e9e9b]">
                          {cat._count?.productos ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <RequirePermission modulo="categorias" accion="editar">
                            <button type="button"
                              onClick={() => onEditar(cat)}
                              title="Editar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="categorias" accion="eliminar">
                            <button type="button"
                              onClick={() => onEliminar(cat)}
                              title="Eliminar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Icon name="delete" size={14} />
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </m.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </m.div>
  );
}

import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { Maquina } from '@/api/maquinas.api';

interface MaquinasTableProps {
  isLoading: boolean;
  maquinas: Maquina[];
  search: string;
  onVerStats: (m: Maquina) => void;
  onEditar: (m: Maquina) => void;
  onEliminar: (m: Maquina) => void;
}

export function MaquinasTable({ isLoading, maquinas, search, onVerStats, onEditar, onEliminar }: MaquinasTableProps) {
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
              <th scope="col" className="px-6 py-4 font-semibold">Marca / Modelo</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Contador Inicial</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Contador Total</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Productos</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                  <p className="mt-2 text-xs text-muted-foreground">Cargando máquinas...</p>
                </td>
              </tr>
            ) : maquinas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  <Icon name="precision_manufacturing" size={32} className="mx-auto mb-2 opacity-20" />
                  <p>{search ? 'Sin resultados para la búsqueda.' : 'No hay máquinas aún. ¡Crea la primera!'}</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {maquinas.map((e, i) => (
                  <m.tr
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{e.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{e.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        <Icon name="print" size={11} />
                        {e.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground text-xs">
                      <div className="flex flex-col gap-0.5">
                        {e.marca && <span>{e.marca}</span>}
                        {e.modelo && <span className="text-muted-foreground">{e.modelo}</span>}
                        {!e.marca && !e.modelo && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-mono text-muted-foreground">
                        {(e.contador_inicial ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-mono font-bold text-[#2e9e9b]">
                        {(e.contador_total ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-mono text-[#2e9e9b]">
                        {e._count?.productos ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="maquinas" accion="ver_contador">
                          <button
                            type="button"
                            onClick={() => onVerStats(e)}
                            title="Ver estadísticas"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="analytics" size={14} />
                          </button>
                        </RequirePermission>
                        <RequirePermission modulo="maquinas" accion="editar">
                          <button
                            type="button"
                            onClick={() => onEditar(e)}
                            title="Editar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                        </RequirePermission>
                        <RequirePermission modulo="maquinas" accion="eliminar">
                          <button
                            type="button"
                            onClick={() => onEliminar(e)}
                            title="Eliminar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Icon name="delete" size={14} />
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </m.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </m.div>
  );
}

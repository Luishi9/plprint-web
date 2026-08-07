import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { UnidadMedida } from '@/api/unidadesMedida.api';

interface UnidadesTableProps {
  isLoading: boolean;
  unidades: UnidadMedida[];
  onEditar: (u: UnidadMedida) => void;
  onEliminar: (u: UnidadMedida) => void;
}

export function UnidadesTable({ isLoading, unidades, onEditar, onEliminar }: UnidadesTableProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto"
    >
      <table className="w-full text-sm text-left text-foreground">
        <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-semibold w-16">#</th>
            <th className="px-6 py-4 font-semibold">Nombre</th>
            <th className="px-6 py-4 font-semibold">Abreviatura</th>
            <th className="px-6 py-4 font-semibold text-center">Por medidas</th>
            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center">
                <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
              </td>
            </tr>
          ) : unidades.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                <Icon name="straighten" size={32} className="mx-auto mb-2 opacity-20" />
                <p>No hay unidades de medida registradas.</p>
              </td>
            </tr>
          ) : (
            <AnimatePresence>
              {unidades.map((u, i) => (
                <m.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
                >
                  <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{u.id}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{u.nombre}</td>
                  <td className="px-6 py-4 font-mono text-[#2e9e9b]">{u.abreviatura}</td>
                  <td className="px-6 py-4 text-center">
                    {u.es_medida && u.tipo_medida ? (
                      <span className="inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                        {u.tipo_medida === 'm2' ? 'm²' : 'ml'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <RequirePermission modulo="unidades_medida" accion="gestionar">
                        <button type="button"
                          onClick={() => onEditar(u)}
                          title="Editar"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button type="button"
                          onClick={() => onEliminar(u)}
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
    </m.div>
  );
}

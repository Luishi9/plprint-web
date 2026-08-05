import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { Proveedor } from '@/api/proveedores.api';

interface ProveedoresTableProps {
  isLoading: boolean;
  proveedores: Proveedor[];
  search: string;
  onEditar: (p: Proveedor) => void;
  onEliminar: (p: Proveedor) => void;
}

export function ProveedoresTable({ isLoading, proveedores, search, onEditar, onEliminar }: ProveedoresTableProps) {
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
              <th scope="col" className="px-6 py-4 font-semibold">Contacto</th>
              <th scope="col" className="px-6 py-4 font-semibold">Tel / Email</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Productos</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Insumos</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                  <p className="mt-2 text-xs text-muted-foreground">Cargando proveedores...</p>
                </td>
              </tr>
            ) : proveedores.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  <Icon name="local_shipping" size={32} className="mx-auto mb-2 opacity-20" />
                  <p>{search ? 'Sin resultados para la búsqueda.' : 'No hay proveedores aún. ¡Crea el primero!'}</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {proveedores.map((p, i) => (
                  <m.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{p.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{p.nombre}</span>
                        {p.rfc && <span className="text-[10px] text-muted-foreground font-mono">RFC: {p.rfc}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {p.contacto ? <span>{p.contacto}</span> : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-foreground text-xs">
                      <div className="flex flex-col gap-1">
                        {p.telefono && (
                          <span className="flex items-center gap-1.5">
                            <Icon name="phone" size={11} className="text-[#2e9e9b]" /> {p.telefono}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1.5">
                            <Icon name="mail" size={11} className="text-[#2e9e9b]" /> {p.email}
                          </span>
                        )}
                        {!p.telefono && !p.email && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-mono text-[#2e9e9b]">
                        {p._count?.productos ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-mono text-[#2e9e9b]">
                        {p._count?.insumos ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="proveedores" accion="editar">
                          <button type="button"
                            onClick={() => onEditar(p)}
                            title="Editar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                        </RequirePermission>
                        <RequirePermission modulo="proveedores" accion="eliminar">
                          <button type="button"
                            onClick={() => onEliminar(p)}
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

import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import { getImageUrl } from '@/utils/format';

interface Producto {
  id: number;
  codigo?: string | null;
  nombre: string;
  precio_venta: number | string;
  precio_compra?: number | string | null;
  activo: boolean;
  imagen_url?: string | null;
  inventario?: Array<{ cantidad: number }>;
}

interface ProductosTableProps {
  isLoading: boolean;
  isSearching: boolean;
  productos: Producto[];
  money: (v: number | string) => string;
  onEditar: (p: Producto) => void;
  onEliminar: (p: Producto) => void;
}

export function ProductosTable({ isLoading, isSearching, productos, money, onEditar, onEliminar }: ProductosTableProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={`rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 overflow-y-auto overflow-x-auto shadow-2xl transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="relative">
        <table className="w-full text-sm text-left rtl:text-right text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th scope="col" className="px-6 py-4"><span className="sr-only">Imagen</span></th>
              <th scope="col" className="px-6 py-4 font-semibold">Nombre</th>
              <th scope="col" className="px-6 py-4 font-semibold">Código</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Precio Venta</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Precio Compra</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Stock</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Estado</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
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
            ) : null}
            <AnimatePresence>
              {productos.length > 0 && productos.map((producto, i) => (
                  <m.tr
                    key={producto.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
                  >
                    <td className="p-4">
                      {producto.imagen_url ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-background/50 border border-border shadow-inner">
                          <img
                            src={getImageUrl(producto.imagen_url) ?? ''}
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
                          <button type="button"
                            onClick={() => onEditar(producto)}
                            title="Editar"
                            className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                        </RequirePermission>
                        <RequirePermission modulo="productos" accion="eliminar">
                          <button type="button"
                            onClick={() => onEliminar(producto)}
                            title="Eliminar"
                            className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </m.tr>
                ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </m.div>
  );
}

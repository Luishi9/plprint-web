import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { getImageUrl } from '@/utils/format';

export interface InventarioItem {
  id: number;
  cantidad: number;
  stock_minimo: number;
  stock_maximo: number | null;
  producto_id: number;
  sucursal_id: number;
  productos: {
    id: number;
    codigo: string | null;
    nombre: string;
    imagen_url: string | null;
    precio_venta: string;
    unidad_medida: string | null;
  };
}

const getStockBadge = (cantidad: number, minimo: number) => {
  if (cantidad === 0) return { label: 'Sin stock', cls: 'bg-red-500/15 text-red-400 border-red-500/30' };
  if (cantidad <= minimo) return { label: 'Stock bajo', cls: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' };
  return { label: 'En stock', cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30' };
};

interface InventarioTableProps {
  isLoading: boolean;
  isSearching: boolean;
  items: InventarioItem[];
  hasSucursal: boolean;
  money: (v: number | string) => string;
  onAjustar: (item: InventarioItem) => void;
  onVerKardex: (item: InventarioItem) => void;
}

export function InventarioTable({
  isLoading, isSearching, items, hasSucursal, money,
  onAjustar, onVerKardex,
}: InventarioTableProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
              <th scope="col" className="px-6 py-4 font-semibold">Producto</th>
              <th scope="col" className="px-6 py-4 font-semibold">Código</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Cantidad</th>
              <th scope="col" className="px-6 py-4 font-semibold">Unidad</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Precio Venta</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Estado</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                  <p className="mt-2 text-xs text-muted-foreground">Cargando inventario...</p>
                </td>
              </tr>
            ) : !hasSucursal ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  <Icon name="inventory" size={36} className="mx-auto mb-3 opacity-20" />
                  <p>No hay sucursal activa. Inicia sesión nuevamente.</p>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  <Icon name="inventory_2" size={36} className="mx-auto mb-3 opacity-20" />
                  <p>No se encontraron productos en el inventario.</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {items.map((item, i) => {
                  const badge = getStockBadge(item.cantidad, item.stock_minimo ?? 0);
                  return (
                    <m.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
                    >
                      <td className="p-4">
                        {item.productos.imagen_url ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-background/50 border border-border">
                            <img
                              src={getImageUrl(item.productos.imagen_url)}
                              alt={item.productos.nombre}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-background/80 border border-border flex items-center justify-center text-muted-foreground/30">
                            <Icon name="image" size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">{item.productos.nombre}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {item.productos.codigo || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-xl font-bold font-mono ${
                          item.cantidad === 0 ? 'text-red-400' :
                          item.cantidad <= (item.stock_minimo ?? 0) ? 'text-yellow-400' :
                          'text-white'
                        }`}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.productos.unidad_medida ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-[#2e9e9b]">
                        {money(Number(item.productos.precio_venta))}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button"
                            onClick={() => onAjustar(item)}
                            title="Ajustar stock"
                            className="p-2 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="tune" size={16} />
                          </button>
                          <button type="button"
                            onClick={() => onVerKardex(item)}
                            title="Ver kardex"
                            className="p-2 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Icon name="history" size={16} />
                          </button>
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

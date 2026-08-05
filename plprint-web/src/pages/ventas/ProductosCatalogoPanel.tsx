import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { getImageUrl } from '@/utils/format';

interface ProductoCatalogoItem {
  id: number;
  nombre: string;
  codigo: string | null;
  imagen_url: string | null;
  precio_venta: string;
  unidad_info?: { es_medida: boolean; tipo_medida: 'm2' | 'ml' | null };
  producto_precios?: Array<{ activo: boolean }>;
  ancho_rollo?: number | null;
  cobrar_minimo_1?: boolean;
}

interface ProductosCatalogoPanelProps {
  isSearching: boolean;
  productSearch: string;
  setProductSearch: (v: string) => void;
  productos: ProductoCatalogoItem[];
  money: (v: number | string) => string;
  onAddToCart: (p: ProductoCatalogoItem) => void;
}

export function ProductosCatalogoPanel({
  isSearching, productSearch, setProductSearch, productos, money, onAddToCart,
}: ProductosCatalogoPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
          {isSearching
            ? <Icon name="progress_activity" className="h-4 w-4 text-[#2e9e9b] animate-spin" />
            : <Icon name="search" className="h-4 w-4 text-muted-foreground" />}
        </div>
        <Input
          placeholder="Buscar producto por nombre o código..."
          className="pl-9 bg-card border-border focus-visible:ring-[#2e9e9b]"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        {productSearch && productos.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-card border border-border rounded-lg shadow-xl z-10">
            {productos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onAddToCart(p);
                  setProductSearch('');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#2e9e9b]/10 transition-colors text-left border-b border-border/50 last:border-0"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-background/50 flex-shrink-0 flex items-center justify-center">
                  {p.imagen_url ? (
                    <img src={getImageUrl(p.imagen_url)} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="inventory_2" size={16} className="text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.nombre}</p>
                  <p className="text-xs text-muted-foreground">{p.codigo ? `#${p.codigo}` : 'Sin código'}</p>
                </div>
                <span className="text-sm font-bold text-[#2e9e9b]">{money(Number(p.precio_venta))}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 min-h-0">
          <AnimatePresence>
            {productos.map((p, i) => (
              <m.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onAddToCart(p)}
                className="group relative flex flex-col items-stretch rounded-xl border border-border bg-card/60 hover:border-[#2e9e9b]/50 hover:bg-card transition-colors text-left overflow-hidden p-3"
              >
                <div className="flex-1 min-h-0 mb-2 text-center">
                  <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{p.nombre}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-background/50 flex-shrink-0 flex items-center justify-center">
                    {p.imagen_url ? (
                      <img src={getImageUrl(p.imagen_url)} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Icon name="inventory_2" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-lg font-extrabold text-[#2e9e9b]">{money(Number(p.precio_venta))}</span>
                    <span className="text-xs text-muted-foreground">{p.codigo ? `#${p.codigo}` : ''}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.unidad_info?.es_medida && p.unidad_info.tipo_medida && (
                      <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                        {p.unidad_info.tipo_medida === 'm2' ? 'm²' : 'ml'}
                      </span>
                    )}
                    {p.producto_precios && p.producto_precios.filter((n) => n.activo).length > 0 && (
                      <span className="text-[10px] text-muted-foreground">Precios por volumen disponibles</span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 bg-[#2e9e9b] text-black rounded px-2 py-1 text-sm font-semibold shadow-sm">
                    <Icon name="add" size={14} />
                  </span>
                </div>
              </m.button>
            ))}
          </AnimatePresence>
          {!isSearching && productos.length === 0 && (
            <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground text-sm">
              No se encontraron productos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

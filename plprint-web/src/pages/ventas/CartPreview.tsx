import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { NIVELES_LABEL, NivelPrecio } from '@/api/preciosProducto.api';
import type { TipoMedida } from '@/api/unidadesMedida.api';

interface CartItem {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  precioBase: number;
  cantidad: number;
  nivelAplicado: NivelPrecio | null;
  esMedida: boolean;
  tipoMedida: TipoMedida | null;
  ancho_m: number;
  alto_m: number;
  labelUnidad: string;
  anchoRollo: number | null;
}

interface CartPreviewProps {
  cart: CartItem[];
  qtyInputs: Record<number, string>;
  money: (v: number | string) => string;
  onUpdateQty: (productoId: number, delta: number) => void;
  onQtyInputChange: (productoId: number, value: string) => void;
  onQtyInputBlur: (productoId: number) => void;
  onSetMedidas: (productoId: number, medidas: { ancho_m: number; alto_m: number }) => void;
  onRemoveItem: (productoId: number) => void;
}

const INPUT_CLASS = "w-14 text-center bg-transparent border border-border rounded-md px-1 py-0.5 focus:outline-none focus:border-[#2e9e9b] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

export function CartPreview({
  cart, qtyInputs, money,
  onUpdateQty, onQtyInputChange, onQtyInputBlur, onSetMedidas, onRemoveItem,
}: CartPreviewProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 flex flex-col overflow-hidden h-[320px]">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <Icon name="shopping_cart" size={14} className="text-[#2e9e9b]" />
          Carrito
        </span>
        <span className="text-xs text-muted-foreground">{cart.length} ítem(s)</span>
      </div>
      <div className="flex-1 flex flex-col divide-y divide-border overflow-y-auto">
        <AnimatePresence>
          {cart.length === 0 && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center text-sm text-muted-foreground">
              Agrega productos del catálogo
            </m.div>
          )}
          {cart.map((item) => (
            <m.div
              key={item.productoId}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-foreground">{item.nombre}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.esMedida && item.labelUnidad
                    ? `${item.labelUnidad} × ${money(item.precioBase)} c/u`
                    : `${money(item.precioUnitario)} c/u`}
                </p>
                {item.nivelAplicado && (
                  <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                    {NIVELES_LABEL[item.nivelAplicado]}
                  </span>
                )}
              </div>
              {item.esMedida && (
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                    {item.tipoMedida === 'm2' ? 'm²' : 'ml'}
                  </span>
                  {item.anchoRollo || item.tipoMedida === 'ml' ? (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.alto_m || ''}
                        aria-label="Largo"
                        placeholder="largo"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const v = raw ? Number(raw) : 0;
                          onSetMedidas(item.productoId, { ancho_m: item.anchoRollo || 0, alto_m: isNaN(v) ? 0 : v });
                        }}
                        className={INPUT_CLASS}
                      />
                    ) : (
                      <>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.ancho_m || ''}
                          aria-label="Ancho"
                          placeholder="ancho"
                          onChange={(e) => {
                            const raw = e.target.value;
                            const v = raw ? Number(raw) : 0;
                            onSetMedidas(item.productoId, { ancho_m: isNaN(v) ? 0 : v, alto_m: item.alto_m });
                          }}
                          className={INPUT_CLASS}
                        />
                        <span className="text-muted-foreground">×</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.alto_m || ''}
                          aria-label="Alto"
                          placeholder="alto"
                          onChange={(e) => {
                            const raw = e.target.value;
                            const v = raw ? Number(raw) : 0;
                            onSetMedidas(item.productoId, { ancho_m: item.ancho_m, alto_m: isNaN(v) ? 0 : v });
                        }}
                        className={INPUT_CLASS}
                      />
                    </>
                  )}
                  <span className="text-muted-foreground">m</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onUpdateQty(item.productoId, -1)} aria-label="Disminuir cantidad" className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-white/5 text-muted-foreground">
                  <Icon name="remove" size={10} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Cantidad"
                  value={qtyInputs[item.productoId] ?? item.cantidad}
                  onChange={(e) => onQtyInputChange(item.productoId, e.target.value)}
                  onBlur={() => onQtyInputBlur(item.productoId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  className={INPUT_CLASS.replace('w-14', 'w-10')}
                />
                <button type="button" onClick={() => onUpdateQty(item.productoId, 1)} aria-label="Aumentar cantidad" className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-white/5 text-muted-foreground">
                  <Icon name="add" size={10} />
                </button>
              </div>
              <span className="text-sm font-bold text-[#2e9e9b] w-20 text-right font-mono">
                {money(item.precioUnitario * item.cantidad)}
              </span>
              <button type="button" onClick={() => onRemoveItem(item.productoId)} aria-label="Eliminar producto" className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                <Icon name="delete" size={14} />
              </button>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

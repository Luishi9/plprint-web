import { Icon } from '@/components/ui/Icon';

interface ItemCompra {
  insumo_id: number;
  insumo_nombre: string;
  insumo_unidad: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  proveedor_nombre: string;
  notas: string;
}

interface ComprasTableProps {
  items: ItemCompra[];
  granTotal: number;
  simbolo: string;
  money: (v: string | number) => string;
  onRemoveItem: (idx: number) => void;
}

export function ComprasTable({ items, granTotal, money, onRemoveItem }: ComprasTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <Icon name="shopping_cart" size={40} className="opacity-20" />
        <p className="text-sm">No hay insumos agregados. Usa el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="sticky top-0 bg-card z-10">
        <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <th className="py-2 pr-2 text-left font-semibold w-8">#</th>
          <th className="py-2 px-2 text-left font-semibold">Insumo</th>
          <th className="py-2 px-2 text-right font-semibold">Cantidad</th>
          <th className="py-2 px-2 text-right font-semibold">P/U</th>
          <th className="py-2 px-2 text-right font-semibold">Total</th>
          <th className="py-2 px-2 text-left font-semibold">Proveedor</th>
          <th className="py-2 px-2 text-left font-semibold">Notas</th>
          <th className="py-2 pl-2 text-center font-semibold w-10"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {items.map((it, idx) => (
          <tr key={`${it.insumo_nombre}-${idx}`} className="hover:bg-white/5 transition-colors text-sm">
            <td className="py-2.5 pr-2 text-muted-foreground font-mono">{idx + 1}</td>
            <td className="py-2.5 px-2 font-medium text-white">{it.insumo_nombre}</td>
            <td className="py-2.5 px-2 text-right font-mono">
              {it.cantidad.toFixed(2)} <span className="text-muted-foreground text-[11px]">{it.insumo_unidad}</span>
            </td>
            <td className="py-2.5 px-2 text-right font-mono">{money(it.precio_unitario)}</td>
            <td className="py-2.5 px-2 text-right font-mono text-[#2e9e9b] font-semibold">{money(it.total)}</td>
            <td className="py-2.5 px-2 text-muted-foreground">{it.proveedor_nombre || '—'}</td>
            <td className="py-2.5 px-2 text-muted-foreground max-w-[120px] truncate">{it.notas || '—'}</td>
            <td className="py-2.5 pl-2 text-center">
              <button type="button"
                onClick={() => onRemoveItem(idx)}
                className="p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Eliminar"
              >
                <Icon name="close" size={14} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="text-sm font-semibold border-t border-border">
          <td colSpan={6} className="py-3 pr-2 text-right text-muted-foreground text-lg">Total general:</td>
          <td colSpan={1} className="py-3 px-2 text-right font-mono text-lg text-[#2e9e9b]">{money(granTotal)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import type { ItemForm } from './CotizacionFormModal';

interface ProductoLite {
  id: number;
  nombre: string;
}

interface CotizacionItemRowProps {
  item: ItemForm;
  index: number;
  productos: ProductoLite[];
  money: (v: number | string) => string;
  subtotal: number;
  onUpdate: (index: number, field: keyof ItemForm, value: number) => void;
  onRemove: (index: number) => void;
  onSetMedidas: (index: number, medidas: { ancho_m: number; alto_m: number }) => void;
}

export function CotizacionItemRow({
  item, index, productos, money, subtotal,
  onUpdate, onRemove, onSetMedidas,
}: CotizacionItemRowProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-background/40 border border-border rounded-md p-2">
      <div className="flex items-center gap-2">
        <select
          aria-label={`Producto de la fila ${index + 1}`}
          value={item.producto_id}
          onChange={(e) => onUpdate(index, 'producto_id', Number(e.target.value))}
          className="flex-1 bg-background border border-border rounded text-sm px-2 py-1 min-w-0"
        >
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <Input
          type="number" min="1" value={item.cantidad}
          onChange={(e) => onUpdate(index, 'cantidad', Number(e.target.value))}
          aria-label={`Cantidad de la fila ${index + 1}`}
          className="w-16 bg-background"
          title="Cantidad (piezas)"
        />
        <span className="text-xs text-muted-foreground w-6 text-center">×</span>
        <Input
          type="number" step="0.01" min="0" value={item.precio_unitario}
          onChange={(e) => onUpdate(index, 'precio_unitario', Number(e.target.value))}
          aria-label={`Precio unitario de la fila ${index + 1}`}
          className="w-24 bg-background"
          title="Precio unitario base"
        />
        <span className="font-mono text-sm text-[#2e9e9b] w-24 text-right">
          {money(subtotal)}
        </span>
        <button
          type="button"
          aria-label={`Eliminar fila ${index + 1}`}
          onClick={() => onRemove(index)}
          className="p-1 text-muted-foreground hover:text-red-400"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      {item.esMedida && (
        <div className="flex items-center gap-2 pl-1 text-xs">
          <span className="text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
            {item.tipoMedida === 'm2' ? 'm²' : 'ml'}
          </span>
          {item.anchoRollo || item.tipoMedida === 'ml' ? (
            <>
              <span className="text-muted-foreground">largo</span>
              <Input
                type="number" step="0.01" min="0" value={item.alto_m || ''}
                onChange={(e) => onSetMedidas(index, { ancho_m: item.anchoRollo || 0, alto_m: parseFloat(e.target.value) || 0 })}
                className="w-20 h-7 bg-background"
                placeholder="0"
              />
            </>
          ) : (
            <>
              <span className="text-muted-foreground">ancho</span>
              <Input
                type="number" step="0.01" min="0" value={item.ancho_m || ''}
                onChange={(e) => onSetMedidas(index, { ancho_m: parseFloat(e.target.value) || 0, alto_m: item.alto_m })}
                className="w-20 h-7 bg-background"
                placeholder="0"
              />
              <span className="text-muted-foreground">alto</span>
              <Input
                type="number" step="0.01" min="0" value={item.alto_m || ''}
                onChange={(e) => onSetMedidas(index, { ancho_m: item.ancho_m, alto_m: parseFloat(e.target.value) || 0 })}
                className="w-20 h-7 bg-background"
                placeholder="0"
              />
            </>
          )}
          <span className="text-muted-foreground">m</span>
        </div>
      )}
    </div>
  );
}

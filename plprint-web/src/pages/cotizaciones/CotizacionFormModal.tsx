import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useMoney } from '@/hooks/useMoney';
import { calcularPrecioItem } from '@/api/unidadesMedida.api';
import type { Cotizacion } from '@/api/cotizaciones.api';
import { CotizacionItemRow } from './CotizacionItemRow';

type TipoMedida = 'm2' | 'ml';

interface ProductoLite {
  id: number;
  nombre: string;
  precio_venta: number | string;
  unidad_info?: { es_medida: boolean; tipo_medida: TipoMedida | null };
  ancho_rollo?: number | null;
}

interface ClienteLite {
  id: number;
  nombre: string;
}

export interface ItemForm {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  ancho_m: number;
  alto_m: number;
  esMedida: boolean;
  tipoMedida: TipoMedida | null;
  anchoRollo: number | null;
}

interface CotizacionFormModalProps {
  open: boolean;
  editando: Cotizacion | null;
  clientes: ClienteLite[];
  productos: ProductoLite[];
  clienteId: number | null;
  setClienteId: (v: number | null) => void;
  descuento: string;
  setDescuento: (v: string) => void;
  descuentoMotivo: string;
  setDescuentoMotivo: (v: string) => void;
  notas: string;
  setNotas: (v: string) => void;
  items: ItemForm[];
  setItems: (items: ItemForm[]) => void;
  isSaving: boolean;
  formError: string;
  onClose: () => void;
  onGuardar: () => void;
}

export function CotizacionFormModal({
  open, editando, clientes, productos,
  clienteId, setClienteId,
  descuento, setDescuento, descuentoMotivo, setDescuentoMotivo,
  notas, setNotas,
  items, setItems,
  isSaving, formError,
  onClose, onGuardar,
}: CotizacionFormModalProps) {
  const { simbolo, format: money } = useMoney();

  const agregarItem = () => {
    if (productos.length === 0) return;
    const p0 = productos[0];
    const esMedida = !!p0.unidad_info?.es_medida;
    const anchoRollo = p0.ancho_rollo ?? null;
    setItems([...items, {
      producto_id: p0.id,
      cantidad: 1,
      precio_unitario: Number(p0.precio_venta),
      descuento: 0,
      ancho_m: anchoRollo || 0,
      alto_m: 0,
      esMedida,
      tipoMedida: p0.unidad_info?.tipo_medida ?? null,
      anchoRollo,
    }]);
  };

  const actualizarItem = (idx: number, field: keyof ItemForm, value: number) => {
    const nuevos = [...items];
    nuevos[idx] = { ...nuevos[idx], [field]: value };
    if (field === 'producto_id') {
      const p = productos.find((pp) => pp.id === value);
      if (p) {
        nuevos[idx].precio_unitario = Number(p.precio_venta);
        nuevos[idx].esMedida = !!p.unidad_info?.es_medida;
        nuevos[idx].tipoMedida = p.unidad_info?.tipo_medida ?? null;
        nuevos[idx].anchoRollo = p.ancho_rollo ?? null;
        nuevos[idx].ancho_m = p.ancho_rollo || 0;
        nuevos[idx].alto_m = 0;
      }
    }
    setItems(nuevos);
  };

  const eliminarItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((acc, i) => acc + (i.cantidad * i.precio_unitario - (i.descuento || 0)), 0);
  const totalCalc = Math.max(0, subtotal - Number(descuento || 0));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? `Editar ${editando.folio}` : 'Nueva cotización'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cot-cliente" className="text-sm font-medium block mb-1.5">Cliente</label>
              <select
                id="cot-cliente"
                value={clienteId || ''}
                onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
              >
                <option value="">Público General</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cot-descuento" className="text-sm font-medium block mb-1.5">Descuento ({simbolo})</label>
              <Input
                id="cot-descuento"
                type="number" step="0.01" min="0"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          {Number(descuento) > 0 && (
            <div>
              <label htmlFor="cot-motivo-descuento" className="text-sm font-medium block mb-1.5">Motivo del descuento *</label>
              <Input
                id="cot-motivo-descuento"
                value={descuentoMotivo}
                onChange={(e) => setDescuentoMotivo(e.target.value)}
                placeholder="Mínimo 3 caracteres..."
                className="bg-background"
                minLength={3}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" id="cot-productos-heading">Productos</span>
              <Button size="sm" variant="outline" onClick={agregarItem} type="button">
                <Icon name="add" size={14} className="mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto" role="group" aria-labelledby="cot-productos-heading">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin productos.</p>
              ) : items.map((it, idx) => {
                const medidasCalc = it.anchoRollo
                  ? { ancho_m: 0, alto_m: it.alto_m }
                  : { ancho_m: it.ancho_m, alto_m: it.alto_m };
                const calcMedida = it.esMedida
                  ? calcularPrecioItem(it.precio_unitario, it.cantidad, { es_medida: true, tipo_medida: it.tipoMedida }, medidasCalc)
                  : { precioUnitario: 0, labelUnidad: '' };
                const subtotalItem = it.esMedida
                  ? calcMedida.precioUnitario * it.cantidad - (it.descuento || 0)
                  : it.cantidad * it.precio_unitario - (it.descuento || 0);
                return (
                  <CotizacionItemRow
                    key={`${it.producto_id}-${idx}`}
                    item={it}
                    index={idx}
                    productos={productos}
                    money={money as never}
                    subtotal={subtotalItem}
                    onUpdate={actualizarItem}
                    onRemove={eliminarItem}
                    onSetMedidas={(i, m) => {
                      const nuevos = [...items];
                      nuevos[i] = { ...nuevos[i], ...m };
                      setItems(nuevos);
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="cot-notas" className="text-sm font-medium block mb-1.5">Notas</label>
            <Textarea
              id="cot-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales..."
              className="bg-background min-h-[50px]"
            />
          </div>

          <div className="bg-background/50 border border-border rounded-md p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold text-[#2e9e9b] font-mono">{money(totalCalc)}</span>
          </div>

          {formError && <p className="text-red-400 text-xs">{formError}</p>}
        </div>

        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={onGuardar}
            disabled={isSaving || items.length === 0}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            {isSaving ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" /> : <Icon name="check" size={14} className="mr-1" />}
            {editando ? 'Guardar' : 'Crear cotización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InsumoLite {
  id: number;
  nombre: string;
  unidad_medida?: string;
}

interface CompraItemFormProps {
  insumoSearch: string;
  setInsumoSearch: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement>;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  filteredInsumos: InsumoLite[];
  selectInsumo: (id: number) => void;
  insumoId: number;
  cantidad: string;
  setCantidad: (v: string) => void;
  precioUnitario: string;
  setPrecioUnitario: (v: string) => void;
  simbolo: string;
  proveedorId: number;
  setProveedorId: (v: number) => void;
  proveedores: Array<{ id: number; nombre: string }>;
  isSaving: boolean;
  onAdd: () => void;
}

export function CompraItemForm({
  insumoSearch, setInsumoSearch, searchRef, showDropdown, setShowDropdown,
  filteredInsumos, selectInsumo, insumoId,
  cantidad, setCantidad, precioUnitario, setPrecioUnitario, simbolo,
  proveedorId, setProveedorId, proveedores, isSaving, onAdd,
}: CompraItemFormProps) {
  return (
    <div className="px-6 py-3 border-b border-border bg-black/20">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Agregar insumo al lote
      </p>
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-5 relative">
          <label htmlFor="compra-item-insumo" className="text-[14px] font-medium block mb-1 text-muted-foreground">Insumo *</label>
          <div className="relative">
            <input
              id="compra-item-insumo"
              ref={searchRef}
              type="text"
              placeholder="Buscar insumo..."
              value={insumoSearch}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onChange={(e) => {
                setInsumoSearch(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full bg-background border border-border rounded-md text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
            />
            <Icon
              name="unfold_more"
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          {showDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md max-h-48 overflow-y-auto shadow-lg">
              {filteredInsumos.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {insumoSearch ? 'Sin resultados' : 'Escribe para buscar...'}
                </div>
              ) : (
                filteredInsumos.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onMouseDown={() => selectInsumo(i.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between ${i.id === insumoId ? 'bg-accent text-[#2e9e9b]' : 'text-popover-foreground'}`}
                  >
                    <span>{i.nombre}</span>
                    <span className="text-muted-foreground text-[11px]">({i.unidad_medida})</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label htmlFor="compra-item-cantidad" className="text-[14px] font-medium block mb-1 text-muted-foreground">Cantidad *</label>
          <Input
            id="compra-item-cantidad"
            type="number"
            step="0.01"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="bg-background h-9"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="compra-item-precio" className="text-[14px] font-medium block mb-1 text-muted-foreground">P/U ({simbolo}) *</label>
          <Input
            id="compra-item-precio"
            type="number"
            step="0.01"
            min="0"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            className="bg-background h-9"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="compra-item-proveedor" className="text-[14px] font-medium block mb-1 text-muted-foreground">Proveedor</label>
          <select
            id="compra-item-proveedor"
            value={proveedorId}
            onChange={(e) => setProveedorId(Number(e.target.value))}
            className="w-full bg-background border border-border rounded-md text-sm px-3 py-2 h-9"
          >
            <option value={0}>—</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-span-1 flex items-end">
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold h-9 w-full rounded-md"
            disabled={isSaving}
          >
            <Icon name="add" size={16} /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

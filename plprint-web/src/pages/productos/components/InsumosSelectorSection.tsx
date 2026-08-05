import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import type { Insumo } from '@/types/insumo.types';

export interface InsumoSeleccionado {
  insumoId: number;
  cantidadRequerida: number;
  insumo: Insumo;
}

interface InsumosSelectorSectionProps {
  insumosDisponibles: Insumo[];
  insumosSeleccionados: InsumoSeleccionado[];
  insumoBusqueda: string;
  showInsumosDropdown: boolean;
  onSearchChange: (v: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onAddInsumo: (insumoId: number) => void;
  onCantidadChange: (insumoId: number, value: number) => void;
  onRemove: (insumoId: number) => void;
}

export function InsumosSelectorSection({
  insumosDisponibles,
  insumosSeleccionados,
  insumoBusqueda,
  showInsumosDropdown,
  onSearchChange, onSearchFocus, onSearchBlur,
  onAddInsumo, onCantidadChange, onRemove,
}: InsumosSelectorSectionProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center gap-2">
        <Icon name="inventory" size={14} className="text-[#2e9e9b]" />
        <span className="text-sm font-medium text-foreground">
          Insumos requeridos
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Insumos que se descuentan automáticamente al vender este producto
      </p>

      {insumosSeleccionados.length > 0 && (
        <div className="space-y-2">
          {insumosSeleccionados.map(({ insumoId, cantidadRequerida, insumo }) => (
            <div
              key={insumoId}
              className="flex items-center gap-2 bg-background rounded-md p-2 border border-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{insumo.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {insumo.codigo || 'Sin código'} • {insumo.unidad_medida}
                  {insumo.ancho_rollo && (
                    <span className="ml-1 text-[#2e9e9b]">• rollo {insumo.ancho_rollo}m</span>
                  )}
                </p>
              </div>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={cantidadRequerida}
                onChange={(e) => onCantidadChange(insumoId, parseFloat(e.target.value) || 0)}
                className="w-20 bg-background font-mono text-sm"
                aria-label={`Cantidad requerida de ${insumo.nombre}`}
              />
              <span className="text-xs text-muted-foreground w-12">{insumo.unidad_medida}</span>
              <button
                type="button"
                onClick={() => onRemove(insumoId)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                aria-label={`Eliminar ${insumo.nombre}`}
              >
                <Icon name="delete" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <label htmlFor="insumo-busqueda" className="text-sm font-medium block mb-1.5 text-muted-foreground">
          Agregar insumo
        </label>
        <div className="relative">
          <input
            id="insumo-busqueda"
            type="text"
            placeholder="Buscar insumo..."
            value={insumoBusqueda}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-background border border-border rounded-md text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
          />
          <Icon
            name="unfold_more"
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
        {showInsumosDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md max-h-48 overflow-y-auto shadow-lg">
            {(() => {
              const seleccionadosSet = new Set(insumosSeleccionados.map(s => s.insumoId));
              const busq = insumoBusqueda.toLowerCase();
              const filtrados = insumosDisponibles.reduce<typeof insumosDisponibles>((acc, i) => {
                if (seleccionadosSet.has(i.id)) return acc;
                if (insumoBusqueda && !(i.nombre.toLowerCase().includes(busq) || i.codigo?.toLowerCase().includes(busq))) return acc;
                acc.push(i);
                return acc;
              }, []);
              if (filtrados.length === 0) {
                return (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {insumoBusqueda ? 'Sin resultados' : 'No hay insumos disponibles'}
                  </div>
                );
              }
              return filtrados.map((insumo) => (
                <button
                  key={insumo.id}
                  type="button"
                  onMouseDown={() => {
                    onAddInsumo(insumo.id);
                    onSearchChange('');
                    onSearchBlur();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between text-popover-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="add" size={12} />
                    <span>{insumo.nombre}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {insumo.codigo || 'Sin código'}
                  </span>
                </button>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';

type FiltroEstado = 'todas' | 'pendiente' | 'convertida' | 'cancelada';

const FILTROS: { v: FiltroEstado; label: string }[] = [
  { v: 'pendiente', label: 'Pendientes' },
  { v: 'convertida', label: 'Convertidas' },
  { v: 'cancelada', label: 'Canceladas' },
  { v: 'todas', label: 'Todas' },
];

interface CotizacionesToolbarProps {
  search: string;
  filtroEstado: FiltroEstado;
  onSearchChange: (v: string) => void;
  onFiltroChange: (v: FiltroEstado) => void;
  onNueva: () => void;
}

export function CotizacionesToolbar({
  search, filtroEstado, onSearchChange, onFiltroChange, onNueva,
}: CotizacionesToolbarProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Icon name="description" size={32} className="text-[#2e9e9b]" />
            Cotizaciones
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crea cotizaciones y conviértelas en venta cuando el cliente acepte.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar folio o cliente..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-64 bg-background"
            />
          </div>
          <RequirePermission modulo="cotizaciones" accion="crear">
            <Button
              onClick={onNueva}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              <Icon name="add" size={16} className="mr-2" /> Nueva
            </Button>
          </RequirePermission>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Icon name="filter_list" size={14} className="text-muted-foreground" />
        {FILTROS.map((opt) => (
          <button type="button"
            key={opt.v}
            onClick={() => onFiltroChange(opt.v)}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              filtroEstado === opt.v
                ? 'bg-[#2e9e9b] text-black font-semibold'
                : 'bg-background border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}

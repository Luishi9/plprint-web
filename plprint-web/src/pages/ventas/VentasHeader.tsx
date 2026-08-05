import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';
import VentasDateFilter from './components/VentasDateFilter';
import ExportarVentasButton from './components/ExportarVentasButton';

type FiltroEstado = 'todas' | 'completada' | 'pendiente_pago' | 'cancelada';

interface VentasHeaderProps {
  sucursalNombre?: string;
  isSearching: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filtroEstado: FiltroEstado;
  onFiltroEstadoChange: (v: FiltroEstado) => void;
  desde: string;
  hasta: string;
  onDateChange: (d: string, h: string) => void;
  isAdmin: boolean;
  usuarios: Array<{ id: number; nombre: string }>;
  usuarioId?: number;
  onUsuarioChange: (id: number | undefined) => void;
  ventas: unknown[];
  onNueva: () => void;
}

export function VentasHeader({
  sucursalNombre, isSearching, searchQuery, onSearchChange,
  filtroEstado, onFiltroEstadoChange,
  desde, hasta, onDateChange,
  isAdmin, usuarios, usuarioId, onUsuarioChange,
  ventas, onNueva,
}: VentasHeaderProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="shopping_cart" size={32} className="text-[#2e9e9b]" />
            Historial de Ventas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sucursalNombre ? `Sucursal: ${sucursalNombre}` : 'Todas las sucursales'}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          <div className="relative w-full sm:w-64">
            {isSearching
              ? <Icon name="progress_activity" size={16} className="absolute left-2.5 top-2.5 text-[#2e9e9b] animate-spin" />
              : <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />}
            <Input
              placeholder="Buscar por folio, #, cliente, producto..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <ExportarVentasButton ventas={ventas as never} desde={desde} hasta={hasta} />
          <RequirePermission modulo="ventas" accion="crear">
            <Button
              onClick={onNueva}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nueva Venta
            </Button>
          </RequirePermission>
        </m.div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="ventas-header-filtro" className="text-muted-foreground text-xs">Mostrar:</label>
          <div className="relative">
            <select
              id="ventas-header-filtro"
              value={filtroEstado}
              onChange={(e) => onFiltroEstadoChange(e.target.value as FiltroEstado)}
              className="appearance-none bg-card border border-border rounded-md px-3 py-1.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
              aria-label="Filtrar estado de ventas"
            >
              <option value="completada">Completadas</option>
              <option value="pendiente_pago">Pend. de pago</option>
              <option value="cancelada">Canceladas</option>
              <option value="todas">Todas</option>
            </select>
            <Icon name="expand_more" size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <VentasDateFilter desde={desde} hasta={hasta} onChange={onDateChange} />

        {isAdmin && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs">Vendedor:</span>
            <div className="relative">
              <select
                aria-label="Filtrar por vendedor"
                value={usuarioId ?? ''}
                onChange={(e) => onUsuarioChange(e.target.value ? Number(e.target.value) : undefined)}
                className="appearance-none bg-card border border-border rounded-md px-3 py-1.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
              >
                <option value="">Todos los vendedores</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
              <Icon name="expand_more" size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import { Icon } from '@/components/ui/Icon';

interface Props {
  cortes: Array<{ id: number; fecha_apertura: string; estado: string }>;
  usuarios: Array<{ id: number; nombre: string }>;
  sucursales: Array<{ id: number; nombre: string }>;
  filtroCorte: string;
  filtroUsuario: string;
  filtroSucursal: string | number;
  onChangeCorte: (v: string) => void;
  onChangeUsuario: (v: string) => void;
  onChangeSucursal: (v: string | number) => void;
  cajaAbierta: boolean;
}

export default function FiltrosBar({
  cortes, usuarios, sucursales,
  filtroCorte, filtroUsuario, filtroSucursal,
  onChangeCorte, onChangeUsuario, onChangeSucursal,
  cajaAbierta,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Icon name="filter_list" size={14} className="text-muted-foreground" />
      <div className="flex items-center gap-2">
        <label htmlFor="filtro-corte" className="text-muted-foreground">Corte:</label>
        <select
          id="filtro-corte"
          aria-label="Filtrar por corte"
          value={filtroCorte}
          onChange={(e) => onChangeCorte(e.target.value)}
          className="bg-background border border-border rounded-md text-sm px-2 py-1.5 min-w-[160px]"
        >
          <option value="">{cajaAbierta ? 'Caja actual' : 'Cortes anteriores'}</option>
          {cortes.map((c) => (
            <option key={c.id} value={c.id}>
              Corte #{c.id} — {new Date(c.fecha_apertura).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="filtro-usuario" className="text-muted-foreground">Usuario:</label>
        <select
          id="filtro-usuario"
          aria-label="Filtrar por usuario"
          value={filtroUsuario}
          onChange={(e) => onChangeUsuario(e.target.value)}
          className="bg-background border border-border rounded-md text-sm px-2 py-1.5 min-w-[140px]"
        >
          <option value="">Todos</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>{u.nombre}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="filtro-sucursal" className="text-muted-foreground">Sucursal:</label>
        <select
          id="filtro-sucursal"
          aria-label="Filtrar por sucursal"
          value={filtroSucursal}
          onChange={(e) => onChangeSucursal(e.target.value)}
          className="bg-background border border-border rounded-md text-sm px-2 py-1.5 min-w-[140px]"
        >
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

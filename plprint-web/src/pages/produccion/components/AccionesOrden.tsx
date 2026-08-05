import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { OrdenProduccion } from '@/api/ordenesProduccion.api';

interface AccionesOrdenProps {
  orden: OrdenProduccion;
  onVerDetalle: (o: OrdenProduccion) => void;
  onEditar: (o: OrdenProduccion) => void;
  onEstatus: (o: OrdenProduccion) => void;
  onEliminar: (o: OrdenProduccion) => void;
}

export function AccionesOrden({ orden, onVerDetalle, onEditar, onEstatus, onEliminar }: AccionesOrdenProps) {
  const puedeEditar = orden.estatus !== 'cancelado' && orden.estatus !== 'entregado';
  const puedeEliminar = orden.estatus === 'pendiente' || orden.estatus === 'cancelado';

  return (
    <div className="flex items-center justify-center gap-1">
      <button type="button"
        onClick={() => onVerDetalle(orden)}
        className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-[#2e9e9b]"
        title="Ver detalle"
      >
        <Icon name="history" size={14} />
      </button>
      <RequirePermission modulo="produccion" accion="cambiar_estatus">
        {orden.estatus !== 'entregado' && orden.estatus !== 'cancelado' && (
          <button type="button"
            onClick={() => onEstatus(orden)}
            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-blue-400"
            title="Cambiar estatus"
          >
            <Icon name="play_arrow" size={14} />
          </button>
        )}
      </RequirePermission>
      <RequirePermission modulo="produccion" accion="editar">
        {puedeEditar && (
          <button type="button"
            onClick={() => onEditar(orden)}
            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-amber-400"
            title="Editar"
          >
            <Icon name="edit" size={14} />
          </button>
        )}
      </RequirePermission>
      <RequirePermission modulo="produccion" accion="cancelar">
        {puedeEliminar && (
          <button type="button"
            onClick={() => onEliminar(orden)}
            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400"
            title="Eliminar"
          >
            <Icon name="delete" size={14} />
          </button>
        )}
      </RequirePermission>
    </div>
  );
}

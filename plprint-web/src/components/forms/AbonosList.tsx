import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';
import type { Abono } from '@/api/abonos.api';
import { useMoney } from '@/hooks/useMoney';

interface AbonosListProps {
  abonos: Abono[];
  onEliminar: (id: number) => void;
  getMetodoLabel: (nombre: string) => string;
}

export function AbonosList({ abonos, onEliminar, getMetodoLabel }: AbonosListProps) {
  const { simbolo } = useMoney();
  if (abonos.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-4">
        No hay abonos registrados para esta venta.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {abonos.map((a, i) => (
          <m.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between bg-background/40 border border-border rounded-md p-2 text-sm"
          >
            <div className="flex-1">
              <div className="font-mono text-[#2e9e9b] font-semibold">+{simbolo}{Number(a.monto).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(a.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                {' · '}{getMetodoLabel(a.metodo_pago)}
                {a.usuarios?.nombre && ` · ${a.usuarios.nombre}`}
              </div>
              {a.notas && <div className="text-xs text-muted-foreground italic mt-0.5">"{a.notas}"</div>}
            </div>
            <RequirePermission modulo="abonos" accion="registrar">
              <button type="button"
                onClick={() => onEliminar(a.id)}
                title="Eliminar"
                className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded"
              >
                <Icon name="delete" size={13} />
              </button>
            </RequirePermission>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

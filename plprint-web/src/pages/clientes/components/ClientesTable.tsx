import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { Cliente } from '../ClientesPage';

interface ClientesTableProps {
  isLoading: boolean;
  isSearching: boolean;
  clientes: Cliente[];
  search: string;
  onVerHistorial: (c: Cliente) => void;
  onEditar: (c: Cliente) => void;
  onEliminar: (c: Cliente) => void;
}

export function ClientesTable({
  isLoading, isSearching, clientes, search,
  onVerHistorial, onEditar, onEliminar,
}: ClientesTableProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`rounded-xl border border-border bg-card/50 backdrop-blur-md overflow-hidden flex-1 shadow-2xl transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            {['#', 'Nombre', 'Teléfono', 'Correo', 'Dirección', 'Registrado', ''].map((h) => (
              <TableHead key={h} className="bg-background/50 text-xs uppercase tracking-wider">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center">
                <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                <p className="mt-2 text-xs text-muted-foreground">Cargando clientes…</p>
              </TableCell>
            </TableRow>
          ) : clientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                <Icon name="group" size={36} className="mx-auto mb-3 opacity-20" />
                <p>{search ? 'Sin resultados.' : 'Aún no hay clientes registrados.'}</p>
              </TableCell>
            </TableRow>
          ) : (
            <AnimatePresence>
              {clientes.map((c, i) => (
                <m.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="border-b border-border hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-white">{c.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.telefono ? (
                      <span className="flex items-center gap-1.5">
                        <Icon name="phone" size={11} className="text-muted-foreground/50" />
                        {c.telefono}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.email ? (
                      <span className="flex items-center gap-1.5">
                        <Icon name="mail" size={11} className="text-muted-foreground/50" />
                        {c.email}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                    {c.direccion ? (
                      <span className="flex items-center gap-1.5 truncate">
                        <Icon name="location_on" size={11} className="text-muted-foreground/50 shrink-0" />
                        <span className="truncate">{c.direccion}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onVerHistorial(c)}
                        className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-blue-400 transition-colors"
                        title="Ver historial de compras"
                      >
                        <Icon name="history" size={13} />
                      </button>
                      <button type="button"
                        onClick={() => onEditar(c)}
                        className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                        title="Editar"
                      >
                        <Icon name="edit" size={13} />
                      </button>
                      <button type="button"
                        onClick={() => onEliminar(c)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Icon name="delete" size={13} />
                      </button>
                    </div>
                  </TableCell>
                </m.tr>
              ))}
            </AnimatePresence>
          )}
        </TableBody>
      </Table>
    </m.div>
  );
}

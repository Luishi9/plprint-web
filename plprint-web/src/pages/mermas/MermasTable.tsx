import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';

interface Merma {
  id: number;
  fecha: string;
  tipo: 'producto' | 'insumo';
  cantidad: number | string;
  motivo: string;
  costo_estimado?: number | string | null;
  venta_id?: number | null;
  productos?: { nombre: string } | null;
  insumos?: { nombre: string } | null;
  maquinas?: { nombre: string } | null;
  sucursales?: { nombre: string } | null;
}

interface MermasTableProps {
  isLoading: boolean;
  mermas: Merma[];
  showMaquina: boolean;
  money: (v: number | string) => string;
  onEditar: (m: Merma) => void;
  onEliminar: (m: Merma) => void;
}

export function MermasTable({ isLoading, mermas, showMaquina, money, onEditar, onEliminar }: MermasTableProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto"
    >
      <table className="w-full text-sm text-left text-foreground">
        <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-semibold">Fecha</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
            <th className="px-6 py-4 font-semibold">Item</th>
            {showMaquina && <th className="px-6 py-4 font-semibold">Máquina</th>}
            <th className="px-6 py-4 font-semibold text-center">Cantidad</th>
            <th className="px-6 py-4 font-semibold">Motivo</th>
            <th className="px-6 py-4 font-semibold text-right">Costo Est.</th>
            <th className="px-6 py-4 font-semibold">Sucursal</th>
            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={showMaquina ? 9 : 8} className="px-6 py-8 text-center">
              <Icon name="progress_activity" className="mx-auto animate-spin text-[#2e9e9b]" size={24} />
            </td></tr>
          ) : mermas.length === 0 ? (
            <tr><td colSpan={showMaquina ? 9 : 8} className="px-6 py-8 text-center text-muted-foreground">
              <Icon name="delete" size={32} className="mx-auto mb-2 opacity-20" />
              <p>No hay mermas registradas.</p>
            </td></tr>
          ) : (
            <AnimatePresence>
              {mermas.map((e, i) => (
                <m.tr
                  key={e.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                >
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                      e.tipo === 'producto'
                        ? 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    }`}>
                      {e.tipo === 'producto' ? <Icon name="inventory_2" size={11} /> : <Icon name="inventory" size={11} />}
                      {e.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {e.productos?.nombre || e.insumos?.nombre || '—'}
                    {e.venta_id && <span className="text-[10px] text-muted-foreground ml-1">(venta #{e.venta_id})</span>}
                  </td>
                  {showMaquina && (
                    <td className="px-6 py-4">
                      {e.maquinas ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          <Icon name="print" size={11} />
                          {e.maquinas.nombre}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center font-mono text-red-400">{Number(e.cantidad).toFixed(2)}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{e.motivo}</td>
                  <td className="px-6 py-4 text-right font-mono">
                    {e.costo_estimado ? money(Number(e.costo_estimado)) : '—'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{e.sucursales?.nombre || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <RequirePermission modulo="mermas" accion="editar">
                        <button
                          type="button"
                          onClick={() => onEditar(e)}
                          title="Editar"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </RequirePermission>
                      <RequirePermission modulo="mermas" accion="eliminar">
                        <button
                          type="button"
                          onClick={() => onEliminar(e)}
                          title="Eliminar"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Icon name="delete" size={14} />
                        </button>
                      </RequirePermission>
                    </div>
                  </td>
                </m.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </m.div>
  );
}

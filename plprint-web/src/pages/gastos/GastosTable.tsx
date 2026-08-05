import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { RequirePermission } from '@/components/RequirePermission';

type TipoOperacion = 'gasto' | 'ingreso' | 'retiro';

const TIPO_LABELS: Record<TipoOperacion, { label: string; color: string; icon: string }> = {
  gasto: { label: 'Gasto', color: 'text-red-400', icon: 'arrow_downward' },
  ingreso: { label: 'Ingreso', color: 'text-green-400', icon: 'arrow_upward' },
  retiro: { label: 'Retiro', color: 'text-orange-400', icon: 'account_balance_wallet' },
};

interface Gasto {
  id: number;
  tipo: TipoOperacion;
  fecha: string;
  concepto: string;
  monto: number | string;
  autorizado_por?: string | null;
  categoria?: { nombre: string } | null;
  sucursales?: { nombre: string } | null;
}

interface GastosTableProps {
  isLoading: boolean;
  gastos: Gasto[];
  search: string;
  filterTipo: string;
  filterCategoria: string;
  money: (v: number | string) => string;
  onEditar: (g: Gasto) => void;
  onEliminar: (g: Gasto) => void;
}

export function GastosTable({ isLoading, gastos, search, filterTipo, filterCategoria, money, onEditar, onEliminar }: GastosTableProps) {
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
            <th className="px-6 py-4 font-semibold">Categoría</th>
            <th className="px-6 py-4 font-semibold">Concepto</th>
            <th className="px-6 py-4 font-semibold text-right">Monto</th>
            <th className="px-6 py-4 font-semibold">Sucursal</th>
            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={7} className="px-6 py-8 text-center">
              <Icon name="progress_activity" className="mx-auto animate-spin text-[#2e9e9b]" size={24} />
            </td></tr>
          ) : gastos.length === 0 ? (
            <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
              <Icon name="receipt" size={32} className="mx-auto mb-2 opacity-20" />
              <p>{search || filterTipo || filterCategoria ? 'Sin resultados.' : 'No hay registros aún.'}</p>
            </td></tr>
          ) : (
            <AnimatePresence>
              {gastos.map((g, i) => {
                const T = TIPO_LABELS[g.tipo] || TIPO_LABELS.gasto;
                return (
                  <m.tr
                    key={g.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      {new Date(g.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${T.color}`}>
                        <Icon name={T.icon} size={12} /> {T.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground">{g.categoria?.nombre || '—'}</td>
                    <td className="px-6 py-4 text-foreground">
                      {g.concepto}
                      {g.autorizado_por && <span className="ml-2 text-[10px] text-orange-400">(autorizado)</span>}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-semibold ${
                      g.tipo === 'ingreso' ? 'text-green-400' : g.tipo === 'retiro' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {g.tipo === 'ingreso' ? '+' : '-'}{money(Number(g.monto))}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{g.sucursales?.nombre || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="gastos" accion="editar">
                          <button type="button"
                            onClick={() => onEditar(g)}
                            title="Editar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                        </RequirePermission>
                        <RequirePermission modulo="gastos" accion="eliminar">
                          <button type="button"
                            onClick={() => onEliminar(g)}
                            title="Eliminar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Icon name="delete" size={14} />
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </m.tr>
                );
              })}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </m.div>
  );
}

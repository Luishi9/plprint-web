import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { MaquinaReporteItem, CategoriaImpresionReporteItem } from '@/api/caja.api';

interface MaquinasCorteModalProps {
  open: boolean;
  maquinas: MaquinaReporteItem[];
  categorias: CategoriaImpresionReporteItem[];
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (payload: { maquinasContadores: Array<{ maquinaId: number; contadorFinal: number }> }) => void;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

export function MaquinasCorteModal({
  open, maquinas, categorias, isSaving, onClose, onConfirm,
}: MaquinasCorteModalProps) {
  const [valores, setValores] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      const inicial: Record<number, number> = {};
      for (const m of maquinas) inicial[m.maquina_id] = m.contador_actual;
      setValores(inicial);
      setErrors({});
    }
  }, [open, maquinas]);

  if (!open) return null;

  const handleChange = (maquinaId: number, raw: string) => {
    const num = raw === '' ? NaN : parseFloat(raw);
    setValores((prev) => ({ ...prev, [maquinaId]: Number.isNaN(num) ? 0 : num }));
    const maquina = maquinas.find((m) => m.maquina_id === maquinaId);
    if (raw === '' || Number.isNaN(num)) {
      setErrors((prev) => ({
        ...prev,
        [maquinaId]: 'Ingresa un número válido.',
      }));
    } else if (maquina && num < maquina.contador_actual) {
      setErrors((prev) => ({
        ...prev,
        [maquinaId]: `No puede ser menor al contador actual (${fmt(maquina.contador_actual)}).`,
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[maquinaId];
        return next;
      });
    }
  };

  const handleConfirm = () => {
    const nuevosErrores: Record<number, string> = {};
    for (const m of maquinas) {
      const v = valores[m.maquina_id];
      if (v == null || Number.isNaN(v)) {
        nuevosErrores[m.maquina_id] = 'Ingresa un número válido.';
      } else if (v < m.contador_actual) {
        nuevosErrores[m.maquina_id] = `No puede ser menor al contador actual (${fmt(m.contador_actual)}).`;
      }
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      return;
    }
    onConfirm({
      maquinasContadores: maquinas.map((m) => ({
        maquinaId: m.maquina_id,
        contadorFinal: valores[m.maquina_id],
      })),
    });
  };

  const tieneErrores = Object.keys(errors).length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="precision_manufacturing" size={22} /> Reporte de Máquinas y Categorías
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirma el contador final de cada máquina. Si no hubo ajustes manuales, dejá el mismo valor que el actual.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2 flex flex-col gap-4">
          {maquinas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay máquinas activas en esta sucursal.
            </p>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2 sticky top-0 bg-card py-1 z-10">
                <Icon name="memory" size={14} className="text-purple-400" /> Máquinas ({maquinas.length})
              </h3>
              <div className="space-y-2">
                {maquinas.map((m) => {
                  const error = errors[m.maquina_id];
                  return (
                    <div key={m.maquina_id} className="bg-background/50 rounded-lg p-3 border border-border">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{m.nombre}</p>
                          <p className="text-xs text-muted-foreground">{m.tipo}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Contador inicio</label>
                          <div className="font-mono text-sm text-white bg-card border border-border rounded-md px-3 py-2">
                            {fmt(m.contador_inicial)}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Contador actual</label>
                          <div className="font-mono text-sm text-white bg-card border border-border rounded-md px-3 py-2">
                            {fmt(m.contador_actual)}
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`contador-final-${m.maquina_id}`} className="text-xs text-muted-foreground block mb-1">
                            Contador final *
                          </label>
                          <Input
                            id={`contador-final-${m.maquina_id}`}
                            type="number"
                            step="0.01"
                            min={m.contador_actual}
                            value={valores[m.maquina_id] ?? m.contador_actual}
                            onChange={(e) => handleChange(m.maquina_id, e.target.value)}
                            className={`bg-background font-mono text-sm ${error ? 'border-red-500' : ''}`}
                          />
                        </div>
                      </div>
                      {error && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                          <Icon name="error" size={12} /> {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {categorias.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Icon name="category" size={14} className="text-emerald-400" /> Categorías de Impresión ({categorias.length})
              </h3>
              <div className="bg-background/50 rounded-lg border border-border overflow-hidden">
                <div className="max-h-[260px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background/95 backdrop-blur z-10">
                      <tr className="bg-[#2e9e9b]/10 text-[#2e9e9b]">
                        <th className="text-left px-3 py-2 font-medium">Categoría</th>
                        <th className="text-right px-3 py-2 font-medium">Conteo inicial</th>
                        <th className="text-right px-3 py-2 font-medium">Conteo final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map((c) => (
                        <tr key={c.categoria_id} className="border-t border-border/50">
                          <td className="px-3 py-2 text-white">{c.nombre}</td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmt(c.conteo_inicial)}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-400 font-semibold">{fmt(c.conteo_final)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex justify-end px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving || tieneErrores || maquinas.length === 0}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            {isSaving ? (
              <Icon name="progress_activity" size={14} className="animate-spin mr-1" />
            ) : (
              <Icon name="check" size={14} className="mr-1" />
            )}
            Confirmar y abrir PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

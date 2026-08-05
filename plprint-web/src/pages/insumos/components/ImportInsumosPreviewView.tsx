import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import type { ImportInsumoPreviewData } from '@/types/insumo.types';

interface ImportPreviewViewProps {
  preview: ImportInsumoPreviewData;
  decisiones: Record<string, string>;
  setDecisiones: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onVolver: () => void;
  onConfirm: () => void;
}

export function ImportInsumosPreviewView({
  preview, decisiones, setDecisiones, onVolver, onConfirm,
}: ImportPreviewViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
          <p className="text-2xl font-bold text-[#2e9e9b]">{preview.total}</p>
          <p className="text-xs text-muted-foreground">Total filas</p>
        </div>
        <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
          <p className="text-2xl font-bold text-green-400">{preview.nuevos - preview.duplicados.length}</p>
          <p className="text-xs text-muted-foreground">Nuevos</p>
        </div>
        <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
          <p className="text-2xl font-bold text-yellow-400">{preview.duplicados.length}</p>
          <p className="text-xs text-muted-foreground">Duplicados</p>
        </div>
      </div>

      {preview.errores.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-400 mb-2">
            <Icon name="error" size={16} className="inline mr-1" />
            Errores de validacion ({preview.errores.length})
          </p>
          <ul className="space-y-1">
            {preview.errores.map((e) => (
              <li key={e.fila} className="text-xs text-red-300">Fila {e.fila}: {e.razon}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-400 mb-2">
            <Icon name="warning" size={16} className="inline mr-1" />
            Advertencias ({preview.warnings.length})
          </p>
          <ul className="space-y-1">
            {preview.warnings.map((w) => (
              <li key={w.fila} className="text-xs text-yellow-300">Fila {w.fila}: {w.mensaje}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.duplicados.length > 0 && (
        <div className="bg-background/50 border border-border rounded-lg p-4">
          <p className="text-sm font-semibold text-foreground mb-3">
            Insumos duplicados — selecciona Acción para cada uno
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-2">Código</th>
                <th className="text-left py-2 px-2">Nombre en sistema</th>
                <th className="text-left py-2 px-2">Nombre en archivo</th>
                <th className="text-left py-2 px-2">Cambios</th>
                <th className="text-center py-2 pl-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {preview.duplicados.map((d) => (
                <tr key={d.codigo} className="border-b border-border/50">
                  <td className="py-2 pr-2 font-mono text-xs text-foreground">{d.codigo}</td>
                  <td className="py-2 px-2 text-foreground">{d.nombreExistente}</td>
                  <td className="py-2 px-2 text-foreground">{d.nombreNuevo}</td>
                  <td className="py-2 px-2">
                    {d.cambios && d.cambios.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {d.cambios.map((c) => (
                          <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 pl-2">
                    <RadioGroup value={decisiones[d.codigo]} onValueChange={(v) => setDecisiones(prev => ({ ...prev, [d.codigo]: v }))}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="omitir" id={`omitir-${d.codigo}`} />
                          <label htmlFor={`omitir-${d.codigo}`} className="text-muted-foreground cursor-pointer">
                            Omitir
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="actualizar" id={`actualizar-${d.codigo}`} />
                          <label htmlFor={`actualizar-${d.codigo}`} className="text-muted-foreground cursor-pointer">
                            Actualizar
                          </label>
                        </div>
                      </div>
                    </RadioGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onVolver}>
          <Icon name="arrow_back" size={16} className="mr-1" />
          Volver
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
        >
          Confirmar importacion
        </Button>
      </div>
    </div>
  );
}

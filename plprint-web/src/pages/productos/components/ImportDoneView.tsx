import { Button } from '@/components/ui/button';

export interface ImportResultData {
  importados: number;
  actualizados: number;
  omitidos: number;
  errores: Array<{ codigo?: string; razon: string }>;
}

interface ImportDoneViewProps {
  result: ImportResultData;
  onClose: () => void;
}

export function ImportDoneView({ result, onClose }: ImportDoneViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-500/10 rounded-lg p-4 text-center border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">{result.importados}</p>
          <p className="text-xs text-muted-foreground">Importados</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4 text-center border border-blue-500/20">
          <p className="text-2xl font-bold text-blue-400">{result.actualizados}</p>
          <p className="text-xs text-muted-foreground">Actualizados</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4 text-center border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-400">{result.omitidos}</p>
          <p className="text-xs text-muted-foreground">Omitidos</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4 text-center border border-red-500/20">
          <p className="text-2xl font-bold text-red-400">{result.errores.length}</p>
          <p className="text-xs text-muted-foreground">Errores</p>
        </div>
      </div>

      {result.errores.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-400 mb-2">Errores durante la importacion</p>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {result.errores.map((e, i) => (
              <li key={e.codigo || `error-${i}`} className="text-xs text-red-300">Código {e.codigo || '(sin codigo)'}: {e.razon}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
          Cerrar
        </Button>
      </div>
    </div>
  );
}

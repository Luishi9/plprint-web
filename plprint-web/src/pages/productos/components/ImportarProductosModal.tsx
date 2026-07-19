import { useState, useRef } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icon } from '@/components/ui/Icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { sileo } from 'sileo';
import { productosApi } from '@/api/productos.api';
import { sucursalesApi } from '@/api/sucursales.api';
import { useEffect } from 'react';

interface ImportarProductosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'idle' | 'previewing' | 'preview' | 'confirming' | 'done';

interface Duplicado {
  fila: number;
  codigo: string;
  nombreExistente: string;
  nombreNuevo: string;
}

interface PreviewResult {
  token: string;
  total: number;
  nuevos: number;
  duplicados: Duplicado[];
  errores: Array<{ fila: number; codigo: string; razon: string }>;
  warnings: Array<{ fila: number; codigo: string; mensaje: string }>;
}

interface ConfirmResult {
  importados: number;
  actualizados: number;
  omitidos: number;
  errores: Array<{ fila: number; codigo: string; razon: string }>;
}

export function ImportarProductosModal({ open, onOpenChange, onSuccess }: ImportarProductosModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [sucursales, setSucursales] = useState<Array<{ id: number; nombre: string }>>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [decisiones, setDecisiones] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ConfirmResult | null>(null);

  useEffect(() => {
    if (open) {
      setStep('idle');
      setSucursalId(null);
      setFile(null);
      setPreview(null);
      setDecisiones({});
      setResult(null);
      sucursalesApi.getAll().then(res => {
        const list = res.data?.data || [];
        setSucursales(list);
        if (list.length === 1) setSucursalId(list[0].id);
      }).catch(() => {
        sileo.error({ title: 'Error al cargar sucursales' });
      });
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f);
    } else {
      sileo.warning({ title: 'Solo archivos Excel (.xlsx, .xls)' });
    }
  };

  const handlePreview = async () => {
    if (!sucursalId) {
      sileo.warning({ title: 'Selecciona una sucursal' });
      return;
    }
    if (!file) {
      sileo.warning({ title: 'Selecciona un archivo Excel' });
      return;
    }
    setStep('previewing');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sucursalId', String(sucursalId));
    try {
      const res = await productosApi.previewImport(formData);
      const data = res.data?.data as PreviewResult;
      setPreview(data);
      const initialDec: Record<string, string> = {};
      for (const d of data.duplicados) {
        initialDec[d.codigo] = 'omitir';
      }
      setDecisiones(initialDec);
      setStep('preview');
    } catch (err: any) {
      sileo.error({ title: 'Error al procesar el archivo', description: err?.response?.data?.message || err.message });
      setStep('idle');
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setStep('confirming');
    try {
      const res = await productosApi.confirmImport({ token: preview.token, decisiones, sucursalId: sucursalId! });
      const data = res.data?.data as ConfirmResult;
      setResult(data);
      setStep('done');
      onSuccess();
    } catch (err: any) {
      sileo.error({ title: 'Error al importar', description: err?.response?.data?.message || err.message });
      setStep('preview');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await productosApi.descargarPlantilla();
      const blob = new Blob([res.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_productos.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      sileo.error({ title: 'Error al descargar plantilla' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon name="upload_file" size={20} className="text-[#2e9e9b]" />
            Importar productos desde Excel
          </DialogTitle>
        </DialogHeader>

        {step === 'idle' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sucursal</label>
              <Select
                value={sucursalId ? String(sucursalId) : ''}
                onValueChange={(v) => setSucursalId(Number(v))}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {sucursales.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Los productos con inventario se crearan en esta sucursal</p>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                <Icon name="download" size={16} />
                Descargar plantilla Excel
              </Button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-[#2e9e9b]/50 transition-colors bg-background/30"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="space-y-2">
                  <Icon name="description" size={40} className="text-[#2e9e9b] mx-auto" />
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-red-400 hover:text-red-300">
                    Quitar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Icon name="cloud_upload" size={40} className="text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra tu archivo Excel aquí o <span className="text-[#2e9e9b] font-medium">selecciona uno</span>
                  </p>
                  <p className="text-xs text-muted-foreground">.xlsx o .xls</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button
                onClick={handlePreview}
                disabled={!sucursalId || !file}
                className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
              >
                Vista previa
              </Button>
            </div>
          </div>
        )}

        {step === 'previewing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Icon name="progress_activity" size={32} className="animate-spin text-[#2e9e9b]" />
            <p className="text-sm text-muted-foreground">Procesando archivo...</p>
          </div>
        )}

        {step === 'preview' && preview && (
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
                  {preview.errores.map((e, i) => (
                    <li key={i} className="text-xs text-red-300">Fila {e.fila}: {e.razon}</li>
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
                  {preview.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-yellow-300">Fila {w.fila}: {w.mensaje}</li>
                  ))}
                </ul>
              </div>
            )}

            {preview.duplicados.length > 0 && (
              <div className="bg-background/50 border border-border rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Productos duplicados — selecciona Acción para cada uno
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left py-2 pr-2">Código</th>
                      <th className="text-left py-2 px-2">Nombre en sistema</th>
                      <th className="text-left py-2 px-2">Nombre en archivo</th>
                      <th className="text-center py-2 pl-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.duplicados.map((d) => (
                      <tr key={d.codigo} className="border-b border-border/50">
                        <td className="py-2 pr-2 font-mono text-xs text-foreground">{d.codigo}</td>
                        <td className="py-2 px-2 text-foreground">{d.nombreExistente}</td>
                        <td className="py-2 px-2 text-foreground">{d.nombreNuevo}</td>
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
              <Button variant="outline" onClick={() => { setStep('idle'); setPreview(null); }}>
                <Icon name="arrow_back" size={16} className="mr-1" />
                Volver
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
              >
                Confirmar importacion
              </Button>
            </div>
          </div>
        )}

        {step === 'confirming' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Icon name="progress_activity" size={32} className="animate-spin text-[#2e9e9b]" />
            <p className="text-sm text-muted-foreground">Importando productos...</p>
          </div>
        )}

        {step === 'done' && result && (
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
                    <li key={i} className="text-xs text-red-300">Código {e.codigo || '(sin codigo)'}: {e.razon}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

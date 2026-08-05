import { useState, useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sileo } from 'sileo';
import { productosApi } from '@/api/productos.api';
import { sucursalesApi } from '@/api/sucursales.api';
import { useEffect } from 'react';
import { UploadStep } from './UploadStep';
import { ImportPreviewView, PreviewData } from './ImportPreviewView';
import { ImportDoneView, ImportResultData } from './ImportDoneView';
import { LoadingView } from './LoadingView';

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
  cambios?: string[];
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

  const handleDownloadTemplate = useCallback(async () => {
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
  }, []);

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
          <UploadStep
            sucursales={sucursales}
            sucursalId={sucursalId}
            setSucursalId={setSucursalId}
            file={file}
            onDownloadTemplate={handleDownloadTemplate}
            onDropFile={handleDrop}
            onFileChange={handleFileChange}
            onRemoveFile={(e) => { e.stopPropagation(); setFile(null); }}
            onCancel={() => onOpenChange(false)}
            onPreview={handlePreview}
            inputRef={inputRef}
          />
        )}

        {step === 'previewing' && (
          <LoadingView message="Procesando archivo..." />
        )}

        {step === 'preview' && preview && (
          <ImportPreviewView
            preview={preview as PreviewData}
            decisiones={decisiones}
            setDecisiones={setDecisiones}
            onVolver={() => { setStep('idle'); setPreview(null); }}
            onConfirm={handleConfirm}
          />
        )}

        {step === 'confirming' && (
          <LoadingView message="Importando productos..." />
        )}

        {step === 'done' && result && (
          <ImportDoneView
            result={result as ImportResultData}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sileo } from 'sileo';
import { insumosApi } from '@/api/insumos.api';
import type { ImportInsumoPreviewData, ImportInsumoConfirmResult } from '@/types/insumo.types';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { usePermisos } from '@/hooks/usePermisos';
import { ImportInsumosUploadStep } from './ImportInsumosUploadStep';
import { ImportInsumosPreviewView } from './ImportInsumosPreviewView';
import { ImportInsumosDoneView } from './ImportInsumosDoneView';

interface ImportarInsumosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'idle' | 'previewing' | 'preview' | 'confirming' | 'done';

export function ImportarInsumosModal({ open, onOpenChange, onSuccess }: ImportarInsumosModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportInsumoPreviewData | null>(null);
  const [decisiones, setDecisiones] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportInsumoConfirmResult | null>(null);

  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const { isAdmin } = usePermisos();
  const sucursalDefault = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setStep('idle');
      setFile(null);
      setPreview(null);
      setDecisiones({});
      setResult(null);
      setSucursalSeleccionada(sucursalDefault?.id ?? null);
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
    if (!file) {
      sileo.warning({ title: 'Selecciona un archivo Excel' });
      return;
    }
    const sucursalId = sucursalSeleccionada ?? sucursalDefault?.id;
    if (!sucursalId) {
      sileo.warning({ title: 'Selecciona una sucursal destino' });
      return;
    }
    setStep('previewing');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sucursalId', String(sucursalId));
    try {
      const res = await insumosApi.previewImport(formData);
      const data = res.data?.data as ImportInsumoPreviewData;
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
    const sucursalId = sucursalSeleccionada ?? sucursalDefault?.id;
    if (!sucursalId) {
      sileo.warning({ title: 'Selecciona una sucursal destino' });
      return;
    }
    setStep('confirming');
    try {
      const res = await insumosApi.confirmImport({ token: preview.token, decisiones, sucursalId });
      const data = res.data?.data as ImportInsumoConfirmResult;
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
      const res = await insumosApi.descargarPlantilla();
      const blob = new Blob([res.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_insumos.xlsx';
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
            Importar insumos desde Excel
          </DialogTitle>
        </DialogHeader>

        {step === 'idle' && (
          <ImportInsumosUploadStep
            file={file}
            onDownloadTemplate={handleDownloadTemplate}
            onDropFile={handleDrop}
            onFileChange={handleFileChange}
            onRemoveFile={(e) => { e.stopPropagation(); setFile(null); }}
            onCancel={() => onOpenChange(false)}
            onPreview={handlePreview}
            inputRef={inputRef}
            mostrarSelectorSucursal={isAdmin}
            sucursales={usuario?.sucursalesDetalle ?? []}
            sucursalSeleccionada={sucursalSeleccionada}
            onSucursalChange={setSucursalSeleccionada}
          />
        )}

        {step === 'previewing' && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Procesando archivo...</p>
          </div>
        )}

        {step === 'preview' && preview && (
          <ImportInsumosPreviewView
            preview={preview}
            decisiones={decisiones}
            setDecisiones={setDecisiones}
            onVolver={() => { setStep('idle'); setPreview(null); }}
            onConfirm={handleConfirm}
          />
        )}

        {step === 'confirming' && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Importando insumos...</p>
          </div>
        )}

        {step === 'done' && result && (
          <ImportInsumosDoneView
            result={result}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

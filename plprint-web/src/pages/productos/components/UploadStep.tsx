import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface SucursalOption {
  id: number;
  nombre: string;
}

interface UploadStepProps {
  sucursales: SucursalOption[];
  sucursalId: number | null;
  setSucursalId: (id: number | null) => void;
  file: File | null;
  onDownloadTemplate: () => void;
  onDropFile: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (e: React.MouseEvent) => void;
  onCancel: () => void;
  onPreview: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function UploadStep({
  sucursales, sucursalId, setSucursalId,
  file, onDownloadTemplate, onDropFile, onFileChange, onRemoveFile,
  onCancel, onPreview, inputRef,
}: UploadStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="upload-sucursal" className="text-sm font-medium text-foreground">Sucursal</label>
        <Select
          value={sucursalId ? String(sucursalId) : ''}
          onValueChange={(v) => setSucursalId(Number(v))}
        >
          <SelectTrigger id="upload-sucursal" className="w-full bg-background">
            <SelectValue placeholder="Seleccionar sucursal" />
          </SelectTrigger>
          <SelectContent>
            {sucursales.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Los productos con inventario se crearan en esta sucursal
        </p>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onDownloadTemplate} className="gap-2">
          <Icon name="download" size={16} />
          Descargar plantilla Excel
        </Button>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropFile}
        onClick={() => inputRef.current && inputRef.current.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current && inputRef.current.click(); }}
        role="button"
        tabIndex={0}
        aria-label="Zona para arrastrar o seleccionar archivo"
        className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-[#2e9e9b]/50 transition-colors bg-background/30"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={onFileChange}
        />
        {file ? (
          <div className="space-y-2">
            <Icon name="description" size={40} className="text-[#2e9e9b] mx-auto" />
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={onRemoveFile}
              className="text-red-400 hover:text-red-300"
            >
              Quitar archivo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Icon name="cloud_upload" size={40} className="text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Arrastra tu archivo Excel aquí o{' '}
              <span className="text-[#2e9e9b] font-medium">selecciona uno</span>
            </p>
            <p className="text-xs text-muted-foreground">.xlsx o .xls</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} type="button">Cancelar</Button>
        <Button
          onClick={onPreview}
          disabled={!sucursalId || !file}
          className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
        >
          Vista previa
        </Button>
      </div>
    </div>
  );
}

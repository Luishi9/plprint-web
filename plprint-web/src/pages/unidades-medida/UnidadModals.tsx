import { Checkbox, Label } from "flowbite-react";
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { UnidadMedida, TipoMedida } from '@/api/unidadesMedida.api';

export interface UnidadFormData {
  nombre: string;
  abreviatura: string;
  es_medida: boolean;
  tipo_medida: '' | TipoMedida;
}

interface UnidadFormModalProps {
  open: boolean;
  editando: UnidadMedida | null;
  form: UnidadFormData;
  isSaving: boolean;
  formError: string;
  onClose: () => void;
  onChange: (form: UnidadFormData) => void;
  onGuardar: () => void;
}

export function UnidadFormModal({
  open, editando, form, isSaving, formError,
  onClose, onChange, onGuardar,
}: UnidadFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? 'Editar unidad' : 'Nueva unidad'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editando ? 'Modifica los datos de la unidad.' : 'Ingresa los datos de la nueva unidad.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="unidad-nombre" className="text-sm font-medium block mb-1.5">Nombre *</label>
            <Input
              id="unidad-nombre"
              autoFocus
              placeholder="Ej. Kilogramo"
              value={form.nombre}
              onChange={(e) => onChange({ ...form, nombre: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="unidad-abreviatura" className="text-sm font-medium block mb-1.5">Abreviatura *</label>
            <Input
              id="unidad-abreviatura"
              placeholder="kg"
              value={form.abreviatura}
              onChange={(e) => onChange({ ...form, abreviatura: e.target.value })}
              className="bg-background"
              maxLength={10}
            />
          </div>
          <div className="col-span-3 mt-1">
            <div className="flex gap-2">
              <div className="flex h-5 items-center">
                <Checkbox
                  id="es-medida"
                  checked={form.es_medida}
                  onChange={(e) => onChange({
                    ...form,
                    es_medida: e.target.checked,
                    tipo_medida: e.target.checked ? form.tipo_medida : '',
                  })}
                  color="cyan"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="es-medida" className="text-foreground">Esta unidad se vende por medidas</Label>
                <div className="text-gray-500 dark:text-gray-400">
                  <span className="text-xs font-normal">
                    El precio del producto se interpretará como precio por m² o por metro lineal.
                  </span>
                </div>
              </div>
            </div>
          </div>
          {form.es_medida && (
            <div className="col-span-3" role="radiogroup" aria-label="Tipo de medida">
              <legend className="text-sm font-medium block mb-1.5">Tipo de medida *</legend>
              <div className="grid grid-cols-2 gap-2">
                {(['m2', 'ml'] as TipoMedida[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ ...form, tipo_medida: t })}
                    className={`h-9 rounded-md text-sm font-medium border transition-colors ${form.tipo_medida === t
                        ? 'bg-[#2e9e9b] text-black border-[#2e9e9b]'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    aria-pressed={form.tipo_medida === t}
                  >
                    {t === 'm2' ? 'm² (ancho × alto)' : 'ml (largo)'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {formError && <p className="col-span-3 text-red-400 text-xs">{formError}</p>}
        </div>
        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <Icon name="close" size={14} className="mr-1" /> Cancelar
          </Button>
          <Button
            onClick={onGuardar}
            disabled={isSaving}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            {isSaving
              ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" />
              : <Icon name="check" size={14} className="mr-1" />}
            {editando ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UnidadDeleteModalProps {
  item: UnidadMedida | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnidadDeleteModal({ item, isDeleting, onClose, onConfirm }: UnidadDeleteModalProps) {
  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">¿Eliminar unidad?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se eliminará <span className="text-white font-semibold">{item?.nombre}</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {isDeleting ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : <Icon name="delete" size={16} className="mr-1" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface CategoriaGasto {
  id: number;
  nombre: string;
}

type TipoOperacion = 'gasto' | 'ingreso' | 'retiro';

export interface GastoForm {
  tipo: TipoOperacion;
  categoria_id: number;
  concepto: string;
  monto: string;
  notas: string;
  sucursal_id?: number;
}

interface GastoFormModalProps {
  open: boolean;
  editando: { id: number; concepto: string } | null;
  form: GastoForm;
  categorias: CategoriaGasto[];
  simbolo: string;
  isSaving: boolean;
  formError: string;
  onClose: () => void;
  onTipoChange: (tipo: TipoOperacion) => void;
  onFormChange: (form: GastoForm) => void;
  onGuardar: () => void;
}

export function GastoFormModal({
  open, editando, form, categorias, simbolo, isSaving, formError,
  onClose, onTipoChange, onFormChange, onGuardar,
}: GastoFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? 'Editar registro' : 'Nuevo registro'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editando ? 'Modifica los datos.' : `Registra un nuevo ${form.tipo}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              onClick={() => onTipoChange('gasto')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                form.tipo === 'gasto' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-background border border-border text-muted-foreground'
              }`}
            >
              <Icon name="arrow_downward" className="inline mr-1" size={16} /> Gasto
            </button>
            <button type="button"
              onClick={() => onTipoChange('ingreso')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                form.tipo === 'ingreso' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-background border border-border text-muted-foreground'
              }`}
            >
              <Icon name="arrow_upward" className="inline mr-1" size={16} /> Ingreso
            </button>
          </div>
          <div>
            <label htmlFor="gasto-categoria" className="text-sm font-medium block mb-1.5">Categoría *</label>
            <select
              id="gasto-categoria"
              aria-label="Categoría"
              value={form.categoria_id}
              onChange={(e) => onFormChange({ ...form, categoria_id: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
            >
              <option value={0}>Seleccionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gasto-concepto" className="text-sm font-medium block mb-1.5">Concepto *</label>
            <Input
              id="gasto-concepto"
              autoFocus
              placeholder="Ej. Pago de luz, Reposición de caja..."
              value={form.concepto}
              onChange={(e) => onFormChange({ ...form, concepto: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="gasto-monto" className="text-sm font-medium block mb-1.5">Monto ({simbolo}) *</label>
            <Input
              id="gasto-monto"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.monto}
              onChange={(e) => onFormChange({ ...form, monto: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="gasto-notas" className="text-sm font-medium block mb-1.5">Notas</label>
            <Textarea
              id="gasto-notas"
              placeholder="Información adicional..."
              value={form.notas}
              onChange={(e) => onFormChange({ ...form, notas: e.target.value })}
              className="bg-background min-h-[50px]"
            />
          </div>
          {form.tipo === 'retiro' && (
            <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
              <strong>Retiro:</strong> Requiere autorización de administrador para proceder.
            </div>
          )}
          {formError && <p className="text-red-400 text-xs">{formError}</p>}
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
              ? <Icon name="progress_activity" size={14} className="mr-1 animate-spin" />
              : <Icon name="check" size={14} className="mr-1" />}
            {editando ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface GastoDeleteModalProps {
  item: { id: number; concepto: string } | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GastoDeleteModal({ item, isDeleting, onClose, onConfirm }: GastoDeleteModalProps) {
  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">¿Eliminar registro?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se eliminará <span className="text-white font-semibold">{item?.concepto}</span>.
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
            {isDeleting ? <Icon name="progress_activity" className="animate-spin" size={16} /> : <Icon name="delete" className="mr-1" size={16} />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

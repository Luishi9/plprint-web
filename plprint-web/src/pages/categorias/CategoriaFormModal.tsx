import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { Categoria } from '@/api/categorias.api';

type TipoCategoria = 'venta' | 'produccion' | 'impresion';

interface CategoriaFormModalProps {
  open: boolean;
  editando: Categoria | null;
  form: { nombre: string; tipo: TipoCategoria; descripcion: string };
  formError: string;
  isSaving: boolean;
  onClose: () => void;
  onChange: (form: { nombre: string; tipo: TipoCategoria; descripcion: string }) => void;
  onErrorChange: (error: string) => void;
  onGuardar: () => void;
}

export function CategoriaFormModal({
  open, editando, form, formError, isSaving,
  onClose, onChange, onErrorChange, onGuardar,
}: CategoriaFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editando ? 'Modifica los datos de la categoría.' : 'Ingresa los datos de la nueva categoría.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3">
          <div>
            <label htmlFor="categoria-nombre" className="text-sm font-medium text-foreground block mb-1.5">Nombre *</label>
            <Input
              id="categoria-nombre"
              autoFocus
              placeholder="Ej. Electrónica, Ropa, Impresos..."
              value={form.nombre}
              onChange={(e) => { onChange({ ...form, nombre: e.target.value }); onErrorChange(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') onGuardar(); }}
              className="bg-background"
            />
          </div>
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-foreground block mb-1.5">Tipo</legend>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de categoría">
                <button
                  type="button"
                  onClick={() => onChange({ ...form, tipo: 'venta' })}
                  aria-label="Tipo Venta"
                  aria-pressed={form.tipo === 'venta'}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    form.tipo === 'venta'
                      ? 'bg-[#2e9e9b]/20 text-[#2e9e9b] border border-[#2e9e9b]/50'
                      : 'bg-background border border-border text-muted-foreground'
                  }`}
                >
                  <Icon name="shopping_bag" size={14} /> Venta
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...form, tipo: 'produccion' })}
                  aria-label="Tipo Producción"
                  aria-pressed={form.tipo === 'produccion'}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    form.tipo === 'produccion'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                      : 'bg-background border border-border text-muted-foreground'
                  }`}
                >
                  <Icon name="factory" size={14} /> Producción
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...form, tipo: 'impresion' })}
                  aria-label="Tipo Impresión"
                  aria-pressed={form.tipo === 'impresion'}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    form.tipo === 'impresion'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-background border border-border text-muted-foreground'
                  }`}
                >
                  <Icon name="print" size={14} /> Impresión
                </button>
              </div>
            </fieldset>
          </div>
          <div>
            <label htmlFor="categoria-descripcion" className="text-sm font-medium text-foreground block mb-1.5">Descripción</label>
            <Textarea
              id="categoria-descripcion"
              placeholder="Descripción opcional..."
              value={form.descripcion}
              onChange={(e) => onChange({ ...form, descripcion: e.target.value })}
              className="bg-background min-h-[50px]"
            />
          </div>
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
            {editando ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

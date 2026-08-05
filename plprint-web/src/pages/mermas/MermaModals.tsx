import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ProductoLite {
  id: number;
  nombre: string;
  maquina_id?: number | null;
}

interface InsumoLite {
  id: number;
  nombre: string;
}

interface MaquinaLite {
  id: number;
  nombre: string;
  tipo: string;
}

type TipoMerma = 'producto' | 'insumo';

export interface MermaForm {
  tipo: TipoMerma;
  producto_id: number;
  insumo_id: number;
  maquina_id: number;
  cantidad: string;
  costo_estimado: string;
  motivo: string;
}

interface MermaFormModalProps {
  open: boolean;
  editando: { id: number } | null;
  form: MermaForm;
  simbolo: string;
  productos: ProductoLite[];
  insumos: InsumoLite[];
  maquinas: MaquinaLite[];
  esCentroImpresion: boolean;
  isSaving: boolean;
  formError: string;
  onClose: () => void;
  onChange: (form: MermaForm) => void;
  onGuardar: () => void;
}

export function MermaFormModal({
  open, editando, form, simbolo, productos, insumos, maquinas, esCentroImpresion,
  isSaving, formError, onClose, onChange, onGuardar,
}: MermaFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? 'Editar merma' : 'Nueva merma'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              onClick={() => onChange({ ...form, tipo: 'producto' })}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                form.tipo === 'producto' ? 'bg-[#2e9e9b]/20 text-[#2e9e9b] border border-[#2e9e9b]/50' : 'bg-background border border-border text-muted-foreground'
              }`}
            >
              <Icon name="inventory_2" size={14} /> Producto
            </button>
            <button type="button"
              onClick={() => onChange({ ...form, tipo: 'insumo' })}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                form.tipo === 'insumo' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-background border border-border text-muted-foreground'
              }`}
            >
              <Icon name="inventory" size={14} /> Insumo
            </button>
          </div>
          <div>
            <label htmlFor="merma-item" className="text-sm font-medium block mb-1.5">
              {form.tipo === 'producto' ? 'Producto *' : 'Insumo *'}
            </label>
            <select
              id="merma-item"
              aria-label="Producto o insumo"
              value={form.tipo === 'producto' ? form.producto_id : form.insumo_id}
              onChange={(e) => {
                const valor = Number(e.target.value);
                if (form.tipo === 'producto') {
                  const productoSeleccionado = productos.find(p => p.id === valor);
                  const maquinaIdAuto = productoSeleccionado?.maquina_id || 0;
                  onChange({ ...form, producto_id: valor, maquina_id: maquinaIdAuto });
                } else {
                  onChange({ ...form, insumo_id: valor });
                }
              }}
              className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
            >
              <option value={0}>Seleccionar...</option>
              {(form.tipo === 'producto' ? productos : insumos).map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>
          {esCentroImpresion && form.tipo === 'producto' && maquinas.length > 0 && (
            <div>
              <label htmlFor="merma-maquina" className="text-sm font-medium block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icon name="print" size={14} className="text-purple-400" />
                  Máquina (opcional)
                </span>
              </label>
              <select
                id="merma-maquina"
                aria-label="Máquina"
                value={form.maquina_id}
                onChange={(e) => onChange({ ...form, maquina_id: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
              >
                <option value={0}>Sin máquina (usar la del producto)</option>
                {maquinas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.tipo})</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Si el producto tiene una máquina vinculada, se usará automáticamente. Puedes overridearla aquí.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="merma-cantidad" className="text-sm font-medium block mb-1.5">Cantidad *</label>
              <Input
                id="merma-cantidad"
                type="number" step="0.01" min="0"
                value={form.cantidad}
                onChange={(e) => onChange({ ...form, cantidad: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label htmlFor="merma-costo-estimado" className="text-sm font-medium block mb-1.5">Costo est. ({simbolo})</label>
              <Input
                id="merma-costo-estimado"
                type="number" step="0.01" min="0"
                value={form.costo_estimado}
                onChange={(e) => onChange({ ...form, costo_estimado: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          <div>
            <label htmlFor="merma-motivo" className="text-sm font-medium block mb-1.5">Motivo *</label>
            <Input
              id="merma-motivo"
              value={form.motivo}
              onChange={(e) => onChange({ ...form, motivo: e.target.value })}
              placeholder="Ej. Error de impresión, daño físico..."
              className="bg-background"
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
            {isSaving ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" /> : <Icon name="check" size={14} className="mr-1" />}
            {editando ? 'Guardar' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MermaDeleteModalProps {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MermaDeleteModal({ open, isDeleting, onClose, onConfirm }: MermaDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">¿Eliminar merma?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se eliminará el registro. Esta acción no revierte el inventario descontado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white font-semibold">
            {isDeleting ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : <Icon name="delete" size={16} className="mr-1" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

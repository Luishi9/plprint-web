import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { Maquina } from '@/api/maquinas.api';

interface MaquinaFormModalProps {
  open: boolean;
  editando: Maquina | null;
  form: {
    nombre: string;
    tipo: string;
    marca: string;
    modelo: string;
    contador_inicial: number;
    contador_total: number;
  };
  formError: string;
  isSaving: boolean;
  onClose: () => void;
  onChange: (form: MaquinaFormModalProps['form']) => void;
  onErrorChange: (error: string) => void;
  onGuardar: () => void;
}

export function MaquinaFormModal({
  open, editando, form, formError, isSaving,
  onClose, onChange, onErrorChange, onGuardar,
}: MaquinaFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? 'Editar máquina' : 'Nueva máquina'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editando ? 'Modifica los datos de la máquina.' : 'Ingresa los datos de la nueva máquina.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3">
          <div>
            <label htmlFor="maquina-nombre" className="text-sm font-medium text-foreground block mb-1.5">Nombre *</label>
            <Input
              id="maquina-nombre"
              autoFocus
              placeholder="Ej. Impresora 1"
              value={form.nombre}
              onChange={(e) => onChange({ ...form, nombre: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="maquina-tipo" className="text-sm font-medium text-foreground block mb-1.5">Tipo *</label>
            <Input
              id="maquina-tipo"
              placeholder="Ej. Inyección, Láser, Plotter..."
              value={form.tipo}
              onChange={(e) => onChange({ ...form, tipo: e.target.value })}
              className="bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="maquina-marca" className="text-sm font-medium text-foreground block mb-1.5">Marca</label>
              <Input
                id="maquina-marca"
                placeholder="Ej. Epson, HP..."
                value={form.marca}
                onChange={(e) => onChange({ ...form, marca: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label htmlFor="maquina-modelo" className="text-sm font-medium text-foreground block mb-1.5">Modelo</label>
              <Input
                id="maquina-modelo"
                placeholder="Ej. L3250"
                value={form.modelo}
                onChange={(e) => onChange({ ...form, modelo: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          {editando && (
            <div className="grid grid-cols-2 gap-3 bg-background/30 rounded-lg p-3 border border-border">
              <p className="col-span-2 text-xs text-muted-foreground mb-1">
                Editar contadores (uso interno)
              </p>
              <div>
                <label htmlFor="maquina-contador-inicial" className="text-sm font-medium text-foreground block mb-1.5">Contador Inicial</label>
                <Input
                  id="maquina-contador-inicial"
                  type="number"
                  min={0}
                  placeholder="Valor inicial del día"
                  value={form.contador_inicial}
                  onChange={(e) => onChange({ ...form, contador_inicial: parseInt(e.target.value) || 0 })}
                  className="bg-background"
                />
              </div>
              <div>
                <label htmlFor="maquina-contador-total" className="text-sm font-medium text-foreground block mb-1.5">Contador Total</label>
                <Input
                  id="maquina-contador-total"
                  type="number"
                  min={0}
                  placeholder="Valor actual"
                  value={form.contador_total}
                  onChange={(e) => onChange({ ...form, contador_total: parseInt(e.target.value) || 0 })}
                  className="bg-background"
                />
              </div>
              {form.contador_total < form.contador_inicial && (
                <p className="col-span-2 text-xs text-red-400 mt-1">
                  El contador total no puede ser menor al inicial
                </p>
              )}
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
            onClickCapture={() => onErrorChange('')}
          >
            {isSaving
              ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" />
              : <Icon name="check" size={14} className="mr-1" />}
            {editando ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

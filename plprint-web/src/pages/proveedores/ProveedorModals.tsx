import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { Proveedor } from '@/api/proveedores.api';

export interface ProveedorForm {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  rfc: string;
  direccion: string;
  notas: string;
}

interface ProveedorFormModalProps {
  open: boolean;
  editando: Proveedor | null;
  form: ProveedorForm;
  isSaving: boolean;
  formError: string;
  onClose: () => void;
  onChange: (form: ProveedorForm) => void;
  onGuardar: () => void;
}

export function ProveedorFormModal({
  open, editando, form, isSaving, formError, onClose, onChange, onGuardar,
}: ProveedorFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
            {editando ? 'Editar proveedor' : 'Nuevo proveedor'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editando ? 'Modifica los datos del proveedor.' : 'Ingresa los datos del nuevo proveedor.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="prov-nombre" className="text-sm font-medium text-foreground block mb-1.5">Nombre *</label>
            <Input
              id="prov-nombre"
              autoFocus
              placeholder="Ej. Distribuidora XYZ"
              value={form.nombre}
              onChange={(e) => onChange({ ...form, nombre: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="prov-contacto" className="text-sm font-medium text-foreground block mb-1.5">Contacto</label>
            <Input
              id="prov-contacto"
              placeholder="Nombre del contacto"
              value={form.contacto}
              onChange={(e) => onChange({ ...form, contacto: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="prov-telefono" className="text-sm font-medium text-foreground block mb-1.5">Teléfono</label>
            <Input
              id="prov-telefono"
              placeholder="555-1234567"
              value={form.telefono}
              onChange={(e) => onChange({ ...form, telefono: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="prov-email" className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <Input
              id="prov-email"
              type="email"
              placeholder="contacto@empresa.com"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="prov-rfc" className="text-sm font-medium text-foreground block mb-1.5">RFC</label>
            <Input
              id="prov-rfc"
              placeholder="XAXX010101000"
              value={form.rfc}
              onChange={(e) => onChange({ ...form, rfc: e.target.value.toUpperCase() })}
              className="bg-background uppercase"
              maxLength={20}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="prov-direccion" className="text-sm font-medium text-foreground block mb-1.5">Dirección</label>
            <Input
              id="prov-direccion"
              placeholder="Calle, número, colonia, ciudad..."
              value={form.direccion}
              onChange={(e) => onChange({ ...form, direccion: e.target.value })}
              className="bg-background"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="prov-notas" className="text-sm font-medium text-foreground block mb-1.5">Notas</label>
            <Textarea
              id="prov-notas"
              placeholder="Información adicional..."
              value={form.notas}
              onChange={(e) => onChange({ ...form, notas: e.target.value })}
              className="bg-background min-h-[60px]"
            />
          </div>
          {formError && <p className="sm:col-span-2 text-red-400 text-xs">{formError}</p>}
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
            {editando ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProveedorDeleteModalProps {
  item: { id: number; nombre: string } | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProveedorDeleteModal({ item, isDeleting, onClose, onConfirm }: ProveedorDeleteModalProps) {
  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">¿Eliminar proveedor?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se eliminará <span className="text-white font-semibold">{item?.nombre}</span>.
            Los productos e insumos asignados quedarán sin proveedor.
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

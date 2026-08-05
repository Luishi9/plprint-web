import { useEffect, useReducer } from 'react';
import { Icon } from '@/components/ui/Icon';
import { clientesApi } from '@/api/clientes.api';
import { Cliente } from '../ClientesPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  isSaving: boolean;
  errors: Record<string, string>;
}

type FormAction =
  | { type: 'set'; field: keyof Omit<FormState, 'isSaving' | 'errors'>; value: string }
  | { type: 'setSaving'; value: boolean }
  | { type: 'setErrors'; value: Record<string, string> }
  | { type: 'reset'; payload: { nombre: string; telefono: string; email: string; direccion: string } };

const initialForm: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  isSaving: false,
  errors: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'setErrors':
      return { ...state, errors: action.value };
    case 'reset':
      return {
        ...state,
        nombre: action.payload.nombre,
        telefono: action.payload.telefono,
        email: action.payload.email,
        direccion: action.payload.direccion,
        errors: {},
      };
    default:
      return state;
  }
}

export default function ClienteFormModal({ open, cliente, onClose, onSaved }: Props) {
  const isEdit = !!cliente;
  const [state, dispatch] = useReducer(formReducer, initialForm);
  const errors = state.errors;
  const isSaving = state.isSaving;

  useEffect(() => {
    if (open) {
      dispatch({
        type: 'reset',
        payload: {
          nombre: cliente?.nombre ?? '',
          telefono: cliente?.telefono ?? '',
          email: cliente?.email ?? '',
          direccion: cliente?.direccion ?? '',
        },
      });
    }
  }, [open, cliente]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!state.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = 'Correo inválido';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { dispatch({ type: 'setErrors', value: errs }); return; }
    dispatch({ type: 'setSaving', value: true });
    try {
      const payload = {
        nombre: state.nombre.trim(),
        telefono: state.telefono.trim() || undefined,
        email: state.email.trim() || undefined,
        direccion: state.direccion.trim() || undefined,
      };
      if (isEdit) {
        await clientesApi.update(cliente!.id, payload);
      } else {
        await clientesApi.create(payload);
      }
      onSaved();
    } catch (err: any) {
      dispatch({ type: 'setErrors', value: { general: err?.response?.data?.message ?? 'Error al guardar' } });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="person" size={18} className="text-[#2e9e9b]" />
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          {errors.general && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {errors.general}
            </p>
          )}

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Nombre <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Icon name="person" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={state.nombre}
                onChange={(e) => dispatch({ type: 'set', field: 'nombre', value: e.target.value })}
                placeholder="Nombre completo del cliente"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {errors.nombre && <p className="text-xs text-red-400">{errors.nombre}</p>}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Teléfono</Label>
            <div className="relative">
              <Icon name="phone" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={state.telefono}
                onChange={(e) => dispatch({ type: 'set', field: 'telefono', value: e.target.value })}
                placeholder="Ej: 555-123-4567"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Correo electrónico</Label>
            <div className="relative">
              <Icon name="mail" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={state.email}
                onChange={(e) => dispatch({ type: 'set', field: 'email', value: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente-direccion" className="text-muted-foreground text-xs uppercase tracking-wider">Dirección</Label>
            <div className="relative">
              <Icon name="location_on" size={13} className="absolute left-3 top-3 text-muted-foreground" />
              <textarea
                id="cliente-direccion"
                value={state.direccion}
                onChange={(e) => dispatch({ type: 'set', field: 'direccion', value: e.target.value })}
                placeholder="Calle, colonia, ciudad…"
                rows={2}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2e9e9b]/30 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" className="border-border" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
            >
              {isSaving && <Icon name="progress_activity" size={14} className="animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useReducer } from 'react';
import { Icon } from '@/components/ui/Icon';

import { sucursalesApi, Sucursal, SucursalDTO } from '@/api/sucursales.api';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface Props {
  open: boolean;
  sucursal: Sucursal | null;
  matrizSucursal?: Sucursal | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nombre: string;
  direccion: string;
  telefono: string;
  activa: boolean;
  copiarProductos: boolean;
  copiarInsumos: boolean;
  isSaving: boolean;
  copyDone: boolean;
  error: string;
}

type FormAction =
  | { type: 'set'; field: 'nombre' | 'direccion' | 'telefono'; value: string }
  | { type: 'set'; field: 'activa' | 'copiarProductos' | 'copiarInsumos' | 'copyDone'; value: boolean }
  | { type: 'setSaving'; value: boolean }
  | { type: 'setError'; value: string }
  | { type: 'reset'; payload: { nombre: string; direccion: string; telefono: string; activa: boolean } };

const initialForm: FormState = {
  nombre: '',
  direccion: '',
  telefono: '',
  activa: true,
  copiarProductos: false,
  copiarInsumos: false,
  isSaving: false,
  copyDone: false,
  error: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'setError':
      return { ...state, error: action.value };
    case 'reset':
      return {
        ...state,
        nombre: action.payload.nombre,
        direccion: action.payload.direccion,
        telefono: action.payload.telefono,
        activa: action.payload.activa,
        copiarProductos: false,
        copiarInsumos: false,
        copyDone: false,
        error: '',
      };
    default:
      return state;
  }
}

export default function SucursalFormModal({ open, sucursal, matrizSucursal, onClose, onSaved }: Props) {
  const isEdit = !!sucursal;

  const [state, dispatch] = useReducer(formReducer, initialForm);
  const { isSaving, copyDone, error } = state;

  useEffect(() => {
    if (open) {
      dispatch({
        type: 'reset',
        payload: {
          nombre: sucursal?.nombre ?? '',
          direccion: sucursal?.direccion ?? '',
          telefono: sucursal?.telefono ?? '',
          activa: sucursal?.activa ?? true,
        },
      });
    }
  }, [open, sucursal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.nombre.trim()) { dispatch({ type: 'setError', value: 'El nombre es requerido.' }); return; }
    dispatch({ type: 'setSaving', value: true });
    dispatch({ type: 'setError', value: '' });
    try {
      const dto: SucursalDTO = {
        nombre: state.nombre.trim(),
        direccion: state.direccion.trim() || undefined,
        telefono: state.telefono.trim() || undefined,
        activa: state.activa,
        ...(matrizSucursal ? { copiarProductos: state.copiarProductos, copiarInsumos: state.copiarInsumos } : {}),
      };
      if (isEdit) {
        await sucursalesApi.update(sucursal!.id, dto);
      } else {
        await sucursalesApi.create(dto);
      }
      if (state.copiarProductos || state.copiarInsumos) {
        dispatch({ type: 'set', field: 'copyDone', value: true });
        await new Promise((r) => setTimeout(r, 1200));
      }
      onSaved();
    } catch (err: any) {
      dispatch({ type: 'setError', value: err?.response?.data?.message ?? 'Ocurrió un error al guardar.' });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? 'Editar sucursal' : 'Nueva sucursal'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Actualiza los datos de la sucursal.' : 'Completa la información para registrar la sucursal.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sucursal-nombre" className="text-sm text-white/80">
              Nombre <span className="text-red-400">*</span>
            </Label>
            <Input
              id="sucursal-nombre"
              value={state.nombre}
              onChange={(e) => dispatch({ type: 'set', field: 'nombre', value: e.target.value })}
              placeholder="Ej. Sucursal Centro"
              className="bg-white/5 border-border text-white placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sucursal-direccion" className="text-sm text-white/80">
              Dirección
            </Label>
            <Textarea
              id="sucursal-direccion"
              value={state.direccion}
              onChange={(e) => dispatch({ type: 'set', field: 'direccion', value: e.target.value })}
              placeholder="Calle, número, colonia..."
              rows={2}
              className="bg-white/5 border-border text-white placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sucursal-telefono" className="text-sm text-white/80">
              Teléfono
            </Label>
            <Input
              id="sucursal-telefono"
              value={state.telefono}
              onChange={(e) => dispatch({ type: 'set', field: 'telefono', value: e.target.value })}
              placeholder="000 000 0000"
              className="bg-white/5 border-border text-white placeholder:text-muted-foreground"
            />
          </div>

          {/* Activa (solo en edición) */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm text-white/80 font-medium">Sucursal activa</p>
                <p className="text-xs text-muted-foreground">Las sucursales inactivas no pueden usarse en ventas</p>
              </div>
              <Switch checked={state.activa} onCheckedChange={(v) => dispatch({ type: 'set', field: 'activa', value: v })} />
            </div>
          )}

          {/* Catálogo de productos (creación y edición si hay sucursal de referencia) */}
          {matrizSucursal && (
            <>
              <div className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                state.copiarProductos ? 'border-[#2e9e9b]/40 bg-[#2e9e9b]/5' : 'border-border bg-white/5'
              }`}>
                <div className="flex items-start gap-2.5">
                  <Icon name="package_2" size={16} className={`shrink-0 mt-0.5 transition-colors ${state.copiarProductos ? 'text-[#2e9e9b]' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm text-white/80 font-medium">
                      {isEdit ? 'Sincronizar catálogo de productos' : 'Heredar catálogo de productos'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isEdit
                        ? <>Agrega los productos de <span className="text-white/60 font-medium">{matrizSucursal.nombre}</span> que aún no tenga esta sucursal (stock en 0)</>
                        : <>Copia los productos de <span className="text-white/60 font-medium">{matrizSucursal.nombre}</span> a esta sucursal con stock en 0</>
                      }
                    </p>
                  </div>
                </div>
                <Switch checked={state.copiarProductos} onCheckedChange={(v) => dispatch({ type: 'set', field: 'copiarProductos', value: v })} disabled={isSaving} />
              </div>

              {/* Catálogo de insumos */}
              <div className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                state.copiarInsumos ? 'border-[#2e9e9b]/40 bg-[#2e9e9b]/5' : 'border-border bg-white/5'
              }`}>
                <div className="flex items-start gap-2.5">
                  <Icon name="inventory" size={16} className={`shrink-0 mt-0.5 transition-colors ${state.copiarInsumos ? 'text-[#2e9e9b]' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm text-white/80 font-medium">
                      {isEdit ? 'Sincronizar catálogo de insumos' : 'Heredar catálogo de insumos'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isEdit
                        ? <>Agrega los insumos de <span className="text-white/60 font-medium">{matrizSucursal.nombre}</span> que aún no tenga esta sucursal (stock en 0)</>
                        : <>Copia los insumos de <span className="text-white/60 font-medium">{matrizSucursal.nombre}</span> a esta sucursal con stock en 0</>
                      }
                    </p>
                  </div>
                </div>
                <Switch checked={state.copiarInsumos} onCheckedChange={(v) => dispatch({ type: 'set', field: 'copiarInsumos', value: v })} disabled={isSaving} />
              </div>
            </>
          )}

          {/* Overlay de progreso al copiar productos o insumos */}
          {isSaving && (state.copiarProductos || state.copiarInsumos) && (
            <div className="flex items-center gap-3 rounded-lg border border-[#2e9e9b]/30 bg-[#2e9e9b]/5 px-4 py-3">
              {copyDone
                ? <Icon name="check_circle" size={15} className="text-[#2e9e9b] shrink-0" />
                : <Icon name="progress_activity" size={15} className="animate-spin text-[#2e9e9b] shrink-0" />
              }
              <p className="text-xs text-[#2e9e9b]">
                {copyDone 
                  ? 'Catálogo copiado correctamente' 
                  : `Copiando catálogo de ${state.copiarProductos && state.copiarInsumos ? 'productos e insumos' : state.copiarProductos ? 'productos' : 'insumos'}...`
                }
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 mt-1">
            <Button type="button" variant="outline" className="border-border" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
            >
              {isSaving && <Icon name="progress_activity" size={14} className="animate-spin" />}
              {isSaving
                ? ((state.copiarProductos || state.copiarInsumos) ? 'Procesando...' : 'Guardando...')
                : (isEdit ? 'Guardar cambios' : 'Crear sucursal')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

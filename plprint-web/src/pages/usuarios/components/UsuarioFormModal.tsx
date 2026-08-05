import { useEffect, useState, useReducer } from 'react';
import { Icon } from '@/components/ui/Icon';
import { usuariosApi, sucursalesApi, Usuario } from '@/api/usuarios.api';
import { rolesApi, Rol } from '@/api/roles.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface FormState {
  nombre: string;
  email: string;
  password: string;
  rolId: string;
  isSaving: boolean;
  errors: Record<string, string>;
}

const initialForm: FormState = {
  nombre: '',
  email: '',
  password: '',
  rolId: '',
  isSaving: false,
  errors: {},
};

type FormAction =
  | { type: 'set'; field: 'nombre' | 'email' | 'password' | 'rolId'; value: string }
  | { type: 'setError'; field: string; value: string }
  | { type: 'setErrors'; value: Record<string, string> }
  | { type: 'setSaving'; value: boolean }
  | { type: 'reset' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setError':
      return { ...state, errors: { ...state.errors, [action.field]: action.value } };
    case 'setErrors':
      return { ...state, errors: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'reset':
      return initialForm;
    default:
      return state;
  }
}
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UsuarioFormModal({ open, usuario, onClose, onSaved }: Props) {
  const isEdit = !!usuario;

  const [form, dispatch] = useReducer(formReducer, initialForm);

  const [sucursales, setSucursales] = useState<{ id: number; nombre: string }[]>([]);
  const [sucursalesAsignadas, setSucursalesAsignadas] = useState<number[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingSucursales(true);
    setLoadingRoles(true);
    sucursalesApi.getAll()
      .then((res) => setSucursales(res.data?.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingSucursales(false));
    rolesApi.getAll()
      .then((res) => {
        const rolesActivos = (res.data?.data ?? []).filter((r: Rol) => r.activo);
        setRoles(rolesActivos);
      })
      .catch(console.error)
      .finally(() => setLoadingRoles(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      dispatch({ type: 'set', field: 'nombre', value: usuario?.nombre ?? '' });
      dispatch({ type: 'set', field: 'email', value: usuario?.email ?? '' });
      dispatch({ type: 'set', field: 'password', value: '' });
      dispatch({ type: 'set', field: 'rolId', value: String(usuario?.rol_id ?? '') });
      dispatch({ type: 'setErrors', value: {} });
      setSucursalesAsignadas(
        usuario?.usuarios_sucursales?.map((us) => us.sucursales.id) ?? [],
      );
    }
  }, [open, usuario]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email.trim()) e.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    if (!isEdit && !form.password) e.password = 'La contraseña es requerida';
    if (!isEdit && form.password && form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (isEdit && form.password && form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { dispatch({ type: 'setErrors', value: errs }); return; }
    dispatch({ type: 'setSaving', value: true });
    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rolId: Number(form.rolId),
      };
      if (form.password) payload.password = form.password;

      if (isEdit) {
        await usuariosApi.update(usuario!.id, payload);
        // Sincronizar sucursales
        const actuales = usuario!.usuarios_sucursales?.map((us) => us.sucursales.id) ?? [];
        const actualesSet = new Set(actuales);
        const asignadasSet = new Set(sucursalesAsignadas);
        const aAsignar = sucursalesAsignadas.filter((sid) => !actualesSet.has(sid));
        const aRemover = actuales.filter((sid) => !asignadasSet.has(sid));
        await Promise.all([
          ...aAsignar.map((sid) => usuariosApi.asignarSucursal(usuario!.id, sid)),
          ...aRemover.map((sid) => usuariosApi.removerSucursal(usuario!.id, sid)),
        ]);
      } else {
        const res = await usuariosApi.create(payload as any);
        const nuevoId = res.data?.data?.id ?? res.data?.id;
        if (nuevoId) {
          await Promise.all(sucursalesAsignadas.map((sid) => usuariosApi.asignarSucursal(nuevoId, sid)));
        }
      }
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      dispatch({ type: 'setErrors', value: { general: msg } });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  const toggleSucursal = (id: number) => {
    setSucursalesAsignadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="shield_person" size={18} className="text-[#2e9e9b]" />
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          {form.errors.general && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {form.errors.general}
            </p>
          )}

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nombre</Label>
            <div className="relative">
              <Icon name="person" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.nombre}
                onChange={(e) => dispatch({ type: 'set', field: 'nombre', value: e.target.value })}
                placeholder="Nombre completo"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {form.errors.nombre && <p className="text-xs text-red-400">{form.errors.nombre}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Correo electrónico</Label>
            <div className="relative">
              <Icon name="mail" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => dispatch({ type: 'set', field: 'email', value: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {form.errors.email && <p className="text-xs text-red-400">{form.errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            </Label>
            <div className="relative">
              <Icon name="lock" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={form.password}
                onChange={(e) => dispatch({ type: 'set', field: 'password', value: e.target.value })}
                placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {form.errors.password && <p className="text-xs text-red-400">{form.errors.password}</p>}
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Rol</Label>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="progress_activity" size={12} className="animate-spin" /> Cargando roles…
              </div>
            ) : (
              <Select value={form.rolId} onValueChange={(v) => dispatch({ type: 'set', field: 'rolId', value: v })}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground z-[200]">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Sucursales */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Sucursales asignadas</Label>
            {loadingSucursales ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="progress_activity" size={12} className="animate-spin" /> Cargando…
              </div>
            ) : sucursales.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay sucursales disponibles</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const asignadasSetLocal = new Set(sucursalesAsignadas);
                  return sucursales.map((s) => {
                    const activa = asignadasSetLocal.has(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSucursal(s.id)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        activa
                          ? 'bg-[#2e9e9b]/15 border-[#2e9e9b]/40 text-[#2e9e9b]'
                          : 'bg-white/5 border-border text-muted-foreground hover:border-[#2e9e9b]/30'
                      }`}
                    >
                      {s.nombre}
                    </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" className="border-border" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
            >
              {form.isSaving && <Icon name="progress_activity" size={14} className="animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

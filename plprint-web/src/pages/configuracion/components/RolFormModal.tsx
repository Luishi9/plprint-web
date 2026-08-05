import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  rolesApi, Rol, Permiso, CreateRolDTO, UpdateRolDTO,
} from '@/api/roles.api';

interface RolFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rol: Rol | null;
  permisosPorModulo: Record<string, Permiso[]>;
  onSaved: () => void;
}

export function RolFormModal({ open, onOpenChange, rol, permisosPorModulo, onSaved }: RolFormModalProps) {
  const [nombre, setNombre] = useState(rol?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '');
  const [seleccionados, setSeleccionados] = useState<Set<number>>(
    () => new Set((rol?.permisos ?? []).map((p) => p.id)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const togglePermiso = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModulo = (modulo: string) => {
    const ids = (permisosPorModulo[modulo] ?? []).map((p) => p.id);
    const todos = ids.every((id) => seleccionados.has(id));
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todos) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      if (rol) {
        const data: UpdateRolDTO = {
          nombre,
          descripcion,
          permisos: Array.from(seleccionados),
        };
        await rolesApi.update(rol.id, data);
      } else {
        const data: CreateRolDTO = {
          nombre,
          descripcion,
          permisos: Array.from(seleccionados),
        };
        await rolesApi.create(data);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const modulosFiltrados = Object.entries(permisosPorModulo).filter(([mod, perms]) =>
    mod.includes(search) || perms.some((p) => p.accion.includes(search)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{rol ? `Editar "${rol.nombre}"` : 'Nuevo rol'}</DialogTitle>
          <DialogDescription>Define nombre, descripción y permisos</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rol-nombre">Nombre</Label>
              <Input id="rol-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required disabled={rol?.es_sistema} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol-desc">Descripción</Label>
              <Input id="rol-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5 flex-1 overflow-hidden flex flex-col">
            <Label>Permisos ({seleccionados.size} seleccionados)</Label>
            <Input
              placeholder="Filtrar por módulo o acción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
            <div className="flex-1 overflow-y-auto border border-border rounded-lg p-2 space-y-2 bg-card/50">
              {modulosFiltrados.map(([modulo, perms]) => {
                const ids = perms.map((p) => p.id);
                const todos = ids.every((id) => seleccionados.has(id));
                const algunos = ids.some((id) => seleccionados.has(id)) && !todos;
                return (
                  <div key={modulo} className="border border-border/50 rounded-md p-2 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => toggleModulo(modulo)}
                      className="flex items-center gap-2 w-full text-left text-sm font-medium capitalize cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${todos ? 'bg-[#2e9e9b] border-[#2e9e9b]' : algunos ? 'border-[#2e9e9b]' : 'border-input'}`}>
                        {todos && <Icon name="check" size={11} className="text-white" />}
                        {algunos && <div className="w-1.5 h-1.5 bg-[#2e9e9b] rounded-sm" />}
                      </div>
                      {modulo}
                      <span className="text-xs text-muted-foreground ml-auto">{perms.length}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-1 mt-1.5 pl-6">
                      {perms.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                          <button
                            type="button"
                            onClick={() => togglePermiso(p.id)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${seleccionados.has(p.id) ? 'bg-[#2e9e9b] border-[#2e9e9b]' : 'border-input'}`}
                          >
                            {seleccionados.has(p.id) && <Icon name="check" size={9} className="text-white" />}
                          </button>
                          <span>{p.accion}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving} className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
              {isSaving ? <Icon name="progress_activity" className="animate-spin mr-2" size={16} /> : null}
              {rol ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Plus, Pencil, Trash2, Loader2, Search, Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { rolesApi, Rol, Permiso, CreateRolDTO, UpdateRolDTO } from '@/api/roles.api';

export default function RolesTab() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Rol | null>(null);
  const [eliminarItem, setEliminarItem] = useState<Rol | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [r, p] = await Promise.all([rolesApi.getAll(), rolesApi.getPermisos()]);
      setRoles(r.data.data);
      setPermisos(p.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaved = () => {
    setModalOpen(false);
    setEditando(null);
    fetchData();
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await rolesApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (rol: Rol) => {
    try {
      await rolesApi.update(rol.id, { activo: !rol.activo });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const permisosPorModulo = permisos.reduce<Record<string, Permiso[]>>((acc, p) => {
    (acc[p.modulo] ??= []).push(p);
    return acc;
  }, {});

  const filtrados = roles.filter((r) => r.nombre.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} /> Roles y permisos
            </CardTitle>
            <CardDescription>Gestiona los roles del sistema y sus permisos</CardDescription>
          </div>
          <Button onClick={() => { setEditando(null); setModalOpen(true); }} className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
            <Plus className="mr-2" size={16} /> Nuevo rol
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input
              placeholder="Buscar rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="space-y-2">
            {filtrados.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{r.nombre}</span>
                    {r.es_sistema && <Badge variant="outline" className="text-xs">Sistema</Badge>}
                    {!r.activo && <Badge variant="destructive" className="text-xs">Inactivo</Badge>}
                    {r._count && (
                      <span className="text-xs text-muted-foreground">
                        {r._count.usuarios} usuario(s) · {r._count.rol_permisos} permiso(s)
                      </span>
                    )}
                  </div>
                  {r.descripcion && (
                    <p className="text-xs text-muted-foreground truncate">{r.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={r.activo} onCheckedChange={() => handleToggle(r)} />
                  <Button variant="ghost" size="icon" onClick={() => { setEditando(r); setModalOpen(true); }}>
                    <Pencil size={15} />
                  </Button>
                  {!r.es_sistema && (
                    <Button variant="ghost" size="icon" onClick={() => setEliminarItem(r)}>
                      <Trash2 size={15} className="text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filtrados.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No hay roles</p>
            )}
          </div>
        </CardContent>
      </Card>

      <RolFormModal
        open={modalOpen}
        onOpenChange={(v) => { if (!v) setEditando(null); setModalOpen(v); }}
        rol={editando}
        permisosPorModulo={permisosPorModulo}
        onSaved={handleSaved}
      />

      <Dialog open={!!eliminarItem} onOpenChange={(v) => !v && setEliminarItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar rol "{eliminarItem?.nombre}"</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEliminarItem(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleEliminar} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

interface RolFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rol: Rol | null;
  permisosPorModulo: Record<string, Permiso[]>;
  onSaved: () => void;
}

function RolFormModal({ open, onOpenChange, rol, permisosPorModulo, onSaved }: RolFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setNombre(rol?.nombre ?? '');
      setDescripcion(rol?.descripcion ?? '');
      setError(null);
      if (rol?.permisos) {
        setSeleccionados(new Set(rol.permisos.map((p) => p.id)));
      } else {
        setSeleccionados(new Set());
      }
      setSearch('');
    }
  }, [open, rol]);

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
                        {todos && <Check size={11} className="text-white" />}
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
                            {seleccionados.has(p.id) && <Check size={9} className="text-white" />}
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
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {rol ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

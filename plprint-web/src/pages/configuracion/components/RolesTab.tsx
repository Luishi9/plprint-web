import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { rolesApi, Rol, Permiso } from '@/api/roles.api';
import { RolFormModal } from './RolFormModal';

export default function RolesTab() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Rol | null>(null);
  const [eliminarItem, setEliminarItem] = useState<Rol | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

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
    setTogglingId(rol.id);
    setToggleError(null);
    try {
      await rolesApi.update(rol.id, { activo: !rol.activo });
      await fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al actualizar el estado del rol';
      setToggleError(msg);
      console.error(err);
    } finally {
      setTogglingId(null);
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
        <Icon name="progress_activity" className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="shield" size={16} /> Roles y permisos
            </CardTitle>
            <CardDescription>Gestiona los roles del sistema y sus permisos</CardDescription>
          </div>
          <Button onClick={() => { setEditando(null); setModalOpen(true); }} className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
            <Icon name="add" className="mr-2" size={16} /> Nuevo rol
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input
              placeholder="Buscar rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="space-y-2">
            {toggleError && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                <Icon name="error" size={14} />
                {toggleError}
              </div>
            )}
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
                  {togglingId === r.id ? (
                    <Icon name="progress_activity" size={16} className="animate-spin text-[#2e9e9b]" />
                  ) : (
                    <Switch
                      checked={r.activo}
                      onCheckedChange={() => handleToggle(r)}
                      disabled={togglingId !== null}
                    />
                  )}
                  <Button variant="ghost" size="icon" onClick={() => { setEditando(r); setModalOpen(true); }}>
                    <Icon name="edit" size={15} />
                  </Button>
                  {!r.es_sistema && (
                    <Button variant="ghost" size="icon" onClick={() => setEliminarItem(r)}>
                      <Icon name="delete" size={15} className="text-red-500" />
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
        key={editando?.id ?? 'new'}
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
              {isDeleting ? <Icon name="progress_activity" className="animate-spin mr-2" size={16} /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </m.div>
  );
}

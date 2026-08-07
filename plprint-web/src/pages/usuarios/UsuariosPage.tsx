import { useEffect, useState } from 'react';
import { m, AnimatePresence } from "framer-motion";
import { Icon } from '@/components/ui/Icon';

import { usuariosApi, Usuario } from '@/api/usuarios.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import UsuarioFormModal from './components/UsuarioFormModal';

const ROL_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  admin: {
    label: 'Admin',
    icon: <Icon name="verified" size={11} />,
    cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30',
  },
  vendedor: {
    label: 'Vendedor',
    icon: <Icon name="shopping_bag" size={11} />,
    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  operador: {
    label: 'Operador',
    icon: <Icon name="settings" size={11} />,
    cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  const [eliminarItem, setEliminarItem] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const res = await usuariosApi.getAll();
      setUsuarios(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleSaved = () => {
    setModalOpen(false);
    setEditando(null);
    fetchUsuarios();
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await usuariosApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtrados = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles?.nombre?.toLowerCase().includes(q)
    );
  });

  const porRol = (rol: string) => usuarios.filter((u) => u.roles?.nombre === rol).length;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* HEADER */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Icon name="group" size={24} className="text-[#2e9e9b]" />
            Usuarios
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestión de cuentas y permisos del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-8 w-48 bg-background/50 border-border text-sm"
              placeholder="Buscar usuario…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => { setEditando(null); setModalOpen(true); }}
            className="h-9 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
          >
            <Icon name="add" size={16} className="mr-1.5" />
            Nuevo usuario
          </Button>
        </div>
      </m.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: usuarios.length, cls: 'text-white' },
          { label: 'Admins', value: porRol('admin'), cls: 'text-[#2e9e9b]' },
          { label: 'Vendedores', value: porRol('vendedor'), cls: 'text-blue-400' },
          { label: 'Operadores', value: porRol('operador'), cls: 'text-purple-400' },
        ].map((stat, i) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-1"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</span>
          </m.div>
        ))}
      </div>

      {/* TABLE */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 overflow-y-auto overflow-x-auto shadow-2xl"
      >
        <div className="relative">
          <table className="w-full text-sm text-left rtl:text-right text-foreground">
            <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">#</th>
                <th scope="col" className="px-6 py-4 font-semibold">Nombre</th>
                <th scope="col" className="px-6 py-4 font-semibold">Correo</th>
                <th scope="col" className="px-6 py-4 font-semibold">Rol</th>
                <th scope="col" className="px-6 py-4 font-semibold">Sucursales</th>
                <th scope="col" className="px-6 py-4 font-semibold">Creado</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                    <p className="mt-2 text-xs text-muted-foreground">Cargando usuarios…</p>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    <Icon name="group" size={36} className="mx-auto mb-3 opacity-20" />
                    <p>{search ? 'Sin resultados.' : 'Aún no hay usuarios registrados.'}</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtrados.map((u, i) => {
                    const rol = ROL_CONFIG[u.roles?.nombre] ?? ROL_CONFIG.operador;
                    const sucursales = u.usuarios_sucursales?.map((us) => us.sucursales.nombre) ?? [];
                    return (
                      <m.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{u.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2e9e9b]/20 to-[#2e9e9b]/5 border border-[#2e9e9b]/20 flex items-center justify-center text-[#2e9e9b] font-bold text-xs shrink-0">
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-white">{u.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 w-fit text-[11px] border px-2.5 py-0.5 rounded-full font-medium ${rol.cls}`}>
                            {rol.icon}
                            {rol.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {sucursales.length === 0 ? (
                            <span className="text-xs text-muted-foreground/50">Sin asignar</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {sucursales.map((s) => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-border text-muted-foreground">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button"
                              onClick={() => { setEditando(u); setModalOpen(true); }}
                              className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                              title="Editar"
                            >
                              <Icon name="edit" size={13} />
                            </button>
                            <button type="button"
                              onClick={() => setEliminarItem(u)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Icon name="delete" size={13} />
                            </button>
                          </div>
                        </td>
                      </m.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </m.div>

      {/* FORM MODAL */}
      <UsuarioFormModal
        open={modalOpen}
        usuario={editando}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        onSaved={handleSaved}
      />

      {/* CONFIRM DELETE */}
      <Dialog open={!!eliminarItem} onOpenChange={() => setEliminarItem(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              El usuario <strong>{eliminarItem?.nombre}</strong> será desactivado y no podrá acceder al sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" className="border-border" onClick={() => setEliminarItem(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isDeleting && <Icon name="hourglass_top" size={14} className="animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

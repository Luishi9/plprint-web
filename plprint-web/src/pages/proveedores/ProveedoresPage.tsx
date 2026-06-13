import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { proveedoresApi, Proveedor } from '@/api/proveedores.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = {
  nombre: '',
  contacto: '',
  telefono: '',
  email: '',
  rfc: '',
  direccion: '',
  notas: '',
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Confirmar eliminar
  const [eliminarItem, setEliminarItem] = useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const res = await proveedoresApi.getAll({ page, limit, search: search || undefined });
      setProveedores((res.data as { data: Proveedor[] }).data || []);
      setTotal((res.data as { total: number }).total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProveedores(); }, [page]);

  // Buscar con debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProveedores(); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (p: Proveedor) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      email: p.email || '',
      rfc: p.rfc || '',
      direccion: p.direccion || '',
      notas: p.notas || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError('El nombre es requerido.'); return; }
    try {
      setIsSaving(true);
      const payload = {
        nombre: form.nombre.trim(),
        contacto: form.contacto.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,
        rfc: form.rfc.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        notas: form.notas.trim() || undefined,
      };
      if (editando) {
        await proveedoresApi.update(editando.id, payload);
      } else {
        await proveedoresApi.create(payload);
      }
      setModalOpen(false);
      fetchProveedores();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al guardar el proveedor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    try {
      setIsDeleting(true);
      await proveedoresApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchProveedores();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar el proveedor.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="local_shipping" size={32} className="text-[#2e9e9b]" />
            Proveedores
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los proveedores de productos e insumos.
          </p>
        </motion.div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64 bg-background"
            />
          </div>
          <RequirePermission modulo="proveedores" accion="crear">
            <Button
              onClick={abrirCrear}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)]"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nuevo
            </Button>
          </RequirePermission>
        </div>
      </div>

      {/* TABLA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto overflow-x-auto"
      >
        <div className="relative">
          <table className="w-full text-sm text-left rtl:text-right text-foreground">
            <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">#</th>
                <th scope="col" className="px-6 py-4 font-semibold">Nombre</th>
                <th scope="col" className="px-6 py-4 font-semibold">Contacto</th>
                <th scope="col" className="px-6 py-4 font-semibold">Tel / Email</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Productos</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Insumos</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                    <p className="mt-2 text-xs text-muted-foreground">Cargando proveedores...</p>
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    <Icon name="local_shipping" size={32} className="mx-auto mb-2 opacity-20" />
                    <p>{search ? 'Sin resultados para la búsqueda.' : 'No hay proveedores aún. ¡Crea el primero!'}</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {proveedores.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{p.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{p.nombre}</span>
                          {p.rfc && <span className="text-[10px] text-muted-foreground font-mono">RFC: {p.rfc}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {p.contacto ? <span>{p.contacto}</span> : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-foreground text-xs">
                        <div className="flex flex-col gap-1">
                          {p.telefono && (
                            <span className="flex items-center gap-1.5">
                              <Icon name="phone" size={11} className="text-[#2e9e9b]" /> {p.telefono}
                            </span>
                          )}
                          {p.email && (
                            <span className="flex items-center gap-1.5">
                              <Icon name="mail" size={11} className="text-[#2e9e9b]" /> {p.email}
                            </span>
                          )}
                          {!p.telefono && !p.email && <span className="text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-[#2e9e9b]">
                          {p._count?.productos ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-[#2e9e9b]">
                          {p._count?.insumos ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <RequirePermission modulo="proveedores" accion="editar">
                            <button
                              onClick={() => abrirEditar(p)}
                              title="Editar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="proveedores" accion="eliminar">
                            <button
                              onClick={() => setEliminarItem(p)}
                              title="Eliminar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Icon name="delete" size={14} />
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Paginación */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {proveedores.length} de {total}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="font-mono">Página {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
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
              <label className="text-sm font-medium text-foreground block mb-1.5">Nombre *</label>
              <Input
                autoFocus
                placeholder="Ej. Distribuidora XYZ"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Contacto</label>
              <Input
                placeholder="Nombre del contacto"
                value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Teléfono</label>
              <Input
                placeholder="555-1234567"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="contacto@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">RFC</label>
              <Input
                placeholder="XAXX010101000"
                value={form.rfc}
                onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
                className="bg-background uppercase"
                maxLength={20}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5">Dirección</label>
              <Input
                placeholder="Calle, número, colonia, ciudad..."
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5">Notas</label>
              <Textarea
                placeholder="Información adicional..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="bg-background min-h-[60px]"
              />
            </div>
            {formError && <p className="sm:col-span-2 text-red-400 text-xs">{formError}</p>}
          </div>

          <DialogFooter className="gap-2 flex justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>
              <Icon name="close" size={14} className="mr-1" /> Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
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

      {/* MODAL CONFIRMAR ELIMINAR */}
      <Dialog open={!!eliminarItem} onOpenChange={(v) => { if (!v) setEliminarItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar proveedor?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se eliminará <span className="text-white font-semibold">{eliminarItem?.nombre}</span>.
              Los productos e insumos asignados quedarán sin proveedor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={() => setEliminarItem(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isDeleting ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : <Icon name="delete" size={16} className="mr-1" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

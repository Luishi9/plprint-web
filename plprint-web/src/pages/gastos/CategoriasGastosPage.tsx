import { useEffect, useState } from 'react';
import { m, AnimatePresence } from "framer-motion";
import { Icon } from '@/components/ui/Icon';

import { categoriasGastosApi, CategoriaGasto } from '@/api/gastos.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = { nombre: '', descripcion: '' };

export default function CategoriasGastosPage() {
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<CategoriaGasto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [eliminarItem, setEliminarItem] = useState<CategoriaGasto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategorias = async () => {
    try {
      setIsLoading(true);
      const res = await categoriasGastosApi.getAll();
      setCategorias(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (c: CategoriaGasto) => {
    setEditando(c);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError('El nombre es requerido.'); return; }
    try {
      setIsSaving(true);
      const payload = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || undefined };
      if (editando) {
        await categoriasGastosApi.update(editando.id, payload);
      } else {
        await categoriasGastosApi.create(payload);
      }
      setModalOpen(false);
      fetchCategorias();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    try {
      setIsDeleting(true);
      await categoriasGastosApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchCategorias();
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'No se pudo eliminar la categoría.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Icon name="account_tree" className="text-[#2e9e9b]" size={32} />
            Categorías de Gastos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Clasifica los gastos para reportes y análisis.
          </p>
        </m.div>

        <RequirePermission modulo="gastos" accion="categoria_gestionar">
          <Button
            onClick={abrirCrear}
            className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            <Icon name="add" className="mr-2" size={16} />
            Nueva Categoría
          </Button>
        </RequirePermission>
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto"
      >
        <table className="w-full text-sm text-left text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold w-16">#</th>
              <th className="px-6 py-4 font-semibold">Nombre</th>
              <th className="px-6 py-4 font-semibold">Descripción</th>
              <th className="px-6 py-4 font-semibold text-center">Gastos</th>
              <th className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center">
                <Icon name="progress_activity" className="mx-auto animate-spin text-[#2e9e9b]" size={24} />
              </td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                <Icon name="account_tree" size={32} className="mx-auto mb-2 opacity-20" />
                <p>No hay categorías de gastos.</p>
              </td></tr>
            ) : (
              <AnimatePresence>
                {categorias.map((c, i) => (
                  <m.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-background/30 border-b border-border hover:bg-[#2e9e9b]/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{c.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{c.nombre}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {c.descripcion || <span className="text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-mono text-[#2e9e9b]">{c._count?.gastos ?? 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="gastos" accion="categoria_gestionar">
                          <button type="button"
                            onClick={() => abrirEditar(c)}
                            title="Editar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                          <button type="button"
                            onClick={() => setEliminarItem(c)}
                            title="Eliminar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Icon name="delete" size={14} />
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </m.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </m.div>

      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
              {editando ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-3">
            <div>
              <label htmlFor="cat-nombre" className="text-sm font-medium block mb-1.5">Nombre *</label>
              <Input
                id="cat-nombre"
                autoFocus
                placeholder="Ej. Servicios, Sueldos, Material..."
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label htmlFor="cat-descripcion" className="text-sm font-medium block mb-1.5">Descripción</label>
              <Textarea
                id="cat-descripcion"
                placeholder="Descripción opcional..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="bg-background min-h-[60px]"
              />
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
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
                ? <Icon name="progress_activity" size={14} className="mr-1 animate-spin" />
                : <Icon name="check" size={14} className="mr-1" />}
              {editando ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!eliminarItem} onOpenChange={(v) => { if (!v) setEliminarItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar categoría?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se eliminará <span className="text-white font-semibold">{eliminarItem?.nombre}</span>.
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
              {isDeleting ? <Icon name="progress_activity" className="animate-spin" size={16} /> : <Icon name="delete" className="mr-1" size={16} />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

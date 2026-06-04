import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react';

import { unidadesMedidaApi, UnidadMedida } from '@/api/unidadesMedida.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = { nombre: '', abreviatura: '' };

export default function UnidadesMedidaPage() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UnidadMedida | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [eliminarItem, setEliminarItem] = useState<UnidadMedida | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUnidades = async () => {
    try {
      setIsLoading(true);
      const res = await unidadesMedidaApi.getAll();
      setUnidades(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUnidades(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (u: UnidadMedida) => {
    setEditando(u);
    setForm({ nombre: u.nombre, abreviatura: u.abreviatura });
    setFormError('');
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.abreviatura.trim()) {
      setFormError('Nombre y abreviatura son requeridos.');
      return;
    }
    try {
      setIsSaving(true);
      const payload = { nombre: form.nombre.trim(), abreviatura: form.abreviatura.trim() };
      if (editando) {
        await unidadesMedidaApi.update(editando.id, payload);
      } else {
        await unidadesMedidaApi.create(payload);
      }
      setModalOpen(false);
      fetchUnidades();
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
      await unidadesMedidaApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchUnidades();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar la unidad de medida.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Ruler className="text-[#2e9e9b]" size={32} />
            Unidades de Medida
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo de unidades para productos e insumos.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <RequirePermission modulo="unidades_medida" accion="gestionar">
            <Button
              onClick={abrirCrear}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Unidad
            </Button>
          </RequirePermission>
        </motion.div>
      </div>

      <motion.div
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
              <th className="px-6 py-4 font-semibold">Abreviatura</th>
              <th className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2e9e9b]" />
                </td>
              </tr>
            ) : unidades.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  <Ruler size={32} className="mx-auto mb-2 opacity-20" />
                  <p>No hay unidades de medida registradas.</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {unidades.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{u.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{u.nombre}</td>
                    <td className="px-6 py-4 font-mono text-[#2e9e9b]">{u.abreviatura}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="unidades_medida" accion="gestionar">
                          <button
                            onClick={() => abrirEditar(u)}
                            title="Editar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setEliminarItem(u)}
                            title="Eliminar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 size={14} />
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
      </motion.div>

      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
              {editando ? 'Editar unidad' : 'Nueva unidad'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editando ? 'Modifica los datos de la unidad.' : 'Ingresa los datos de la nueva unidad.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1.5">Nombre *</label>
              <Input
                autoFocus
                placeholder="Ej. Kilogramo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Abreviatura *</label>
              <Input
                placeholder="kg"
                value={form.abreviatura}
                onChange={(e) => setForm({ ...form, abreviatura: e.target.value })}
                className="bg-background"
                maxLength={10}
              />
            </div>
            {formError && <p className="col-span-3 text-red-400 text-xs">{formError}</p>}
          </div>
          <DialogFooter className="gap-2 flex justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>
              <X size={14} className="mr-1" /> Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isSaving
                ? <Loader2 size={14} className="mr-1 animate-spin" />
                : <Check size={14} className="mr-1" />}
              {editando ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!eliminarItem} onOpenChange={(v) => { if (!v) setEliminarItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar unidad?</DialogTitle>
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
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

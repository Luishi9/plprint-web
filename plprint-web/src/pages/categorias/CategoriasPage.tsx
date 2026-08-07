import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { categoriasApi, Categoria } from '@/api/categorias.api';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import { CategoriasTable } from './CategoriasTable';
import { CategoriaFormModal } from './CategoriaFormModal';
import { CategoriaDeleteModal } from './CategoriaDeleteModal';

type TipoCategoria = 'venta' | 'produccion' | 'impresion';
type FiltroTipo = 'todas' | TipoCategoria;

const emptyForm = { nombre: '', tipo: 'venta' as TipoCategoria, descripcion: '' };

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todas');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [eliminarItem, setEliminarItem] = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategorias = async () => {
    try {
      setIsLoading(true);
      const res = await categoriasApi.getAll();
      setCategorias(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, []);

  const categoriasFiltradas = filtroTipo === 'todas'
    ? categorias
    : categorias.filter((c) => c.tipo === filtroTipo);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setEditando(cat);
    setForm({ nombre: cat.nombre, tipo: cat.tipo, descripcion: cat.descripcion || '' });
    setFormError('');
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError('El nombre es requerido.'); return; }
    try {
      setIsSaving(true);
      const payload = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        descripcion: form.descripcion.trim() || undefined,
      };
      if (editando) {
        await categoriasApi.update(editando.id, payload);
      } else {
        await categoriasApi.create(payload);
      }
      setModalOpen(false);
      fetchCategorias();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al guardar la categoría.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    try {
      setIsDeleting(true);
      await categoriasApi.remove(eliminarItem.id);
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
            <Icon name="sell" size={32} className="text-[#2e9e9b]" />
            Categorías
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organiza tus productos por categoría de venta o producción.
          </p>
        </m.div>

        <RequirePermission modulo="categorias" accion="crear">
          <Button
            onClick={abrirCrear}
            className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)]"
          >
            <Icon name="add" size={16} className="mr-2" />
            Nueva Categoría
          </Button>
        </RequirePermission>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground text-xs">Tipo:</span>
        {[
          { v: 'todas' as FiltroTipo,      label: 'Todas',     icon: 'sell' },
          { v: 'venta' as FiltroTipo,      label: 'Venta',     icon: 'shopping_bag' },
          { v: 'produccion' as FiltroTipo, label: 'Producción', icon: 'factory' },
          { v: 'impresion' as FiltroTipo,  label: 'Impresión', icon: 'print' },
        ].map((opt) => {
          const iconName = opt.icon;
          return (
            <button type="button"
              key={opt.v}
              onClick={() => setFiltroTipo(opt.v)}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                filtroTipo === opt.v
                  ? 'bg-[#2e9e9b] text-black'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={iconName} size={12} /> {opt.label}
            </button>
          );
        })}
      </div>

      <CategoriasTable
        isLoading={isLoading}
        categorias={categoriasFiltradas}
        filtroTipo={filtroTipo}
        onEditar={abrirEditar}
        onEliminar={setEliminarItem}
      />

      <CategoriaFormModal
        open={modalOpen}
        editando={editando}
        form={form}
        formError={formError}
        isSaving={isSaving}
        onClose={cerrarModal}
        onChange={setForm}
        onErrorChange={setFormError}
        onGuardar={handleGuardar}
      />

      <CategoriaDeleteModal
        item={eliminarItem}
        isDeleting={isDeleting}
        onClose={() => setEliminarItem(null)}
        onConfirm={handleEliminar}
      />
    </div>
  );
}

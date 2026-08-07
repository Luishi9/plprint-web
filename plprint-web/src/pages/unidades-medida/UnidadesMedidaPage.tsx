import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';

import { unidadesMedidaApi, UnidadMedida, TipoMedida } from '@/api/unidadesMedida.api';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import { UnidadesTable } from './UnidadesTable';
import { UnidadFormModal, UnidadDeleteModal, UnidadFormData } from './UnidadModals';

const emptyForm: UnidadFormData = {
  nombre: '',
  abreviatura: '',
  es_medida: false,
  tipo_medida: '',
};

export default function UnidadesMedidaPage() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UnidadMedida | null>(null);
  const [form, setForm] = useState<UnidadFormData>(emptyForm);
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
    setForm({
      nombre: u.nombre,
      abreviatura: u.abreviatura,
      es_medida: u.es_medida,
      tipo_medida: u.tipo_medida ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.abreviatura.trim()) {
      setFormError('Nombre y abreviatura son requeridos.');
      return;
    }
    if (form.es_medida && !form.tipo_medida) {
      setFormError('Si la unidad se vende por medidas, selecciona el tipo (m² o ml).');
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        nombre: form.nombre.trim(),
        abreviatura: form.abreviatura.trim(),
        es_medida: form.es_medida,
        tipo_medida: form.es_medida ? (form.tipo_medida as TipoMedida) : null,
      };
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
      sileo.error({ title: 'No se pudo eliminar la unidad de medida.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Icon name="straighten" size={32} className="text-[#2e9e9b]" />
            Unidades de Medida
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo de unidades para productos e insumos.
          </p>
        </m.div>

        <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <RequirePermission modulo="unidades_medida" accion="gestionar">
            <Button
              onClick={abrirCrear}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)]"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nueva Unidad
            </Button>
          </RequirePermission>
        </m.div>
      </div>

      <UnidadesTable
        isLoading={isLoading}
        unidades={unidades}
        onEditar={abrirEditar}
        onEliminar={setEliminarItem}
      />

      <UnidadFormModal
        open={modalOpen}
        editando={editando}
        form={form}
        isSaving={isSaving}
        formError={formError}
        onClose={() => setModalOpen(false)}
        onChange={setForm}
        onGuardar={handleGuardar}
      />

      <UnidadDeleteModal
        item={eliminarItem}
        isDeleting={isDeleting}
        onClose={() => setEliminarItem(null)}
        onConfirm={handleEliminar}
      />
    </div>
  );
}

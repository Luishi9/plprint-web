import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { proveedoresApi, Proveedor } from '@/api/proveedores.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import { ProveedoresTable } from './ProveedoresTable';
import {
  ProveedorFormModal, ProveedorDeleteModal,
} from './ProveedorModals';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const res = await proveedoresApi.getAll({ page, limit, search: search || undefined });
          if (cancelled) return;
          setProveedores((res.data as { data: Proveedor[] }).data || []);
          setTotal((res.data as { total: number }).total || 0);
        } catch (e) {
          if (!cancelled) console.error(e);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [page, search]);

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
      sileo.error({ title: 'No se pudo eliminar el proveedor.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="local_shipping" size={32} className="text-[#2e9e9b]" />
            Proveedores
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los proveedores de productos e insumos.
          </p>
        </m.div>

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

      <ProveedoresTable
        isLoading={isLoading}
        proveedores={proveedores}
        search={search}
        onEditar={abrirEditar}
        onEliminar={setEliminarItem}
      />

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {proveedores.length} de {total}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="font-mono">Página {page}</span>
            <Button variant="outline" size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <ProveedorFormModal
        open={modalOpen}
        editando={editando}
        form={form as never}
        isSaving={isSaving}
        formError={formError}
        onClose={() => setModalOpen(false)}
        onChange={(f) => setForm(f)}
        onGuardar={handleGuardar}
      />

      <ProveedorDeleteModal
        item={eliminarItem as never}
        isDeleting={isDeleting}
        onClose={() => setEliminarItem(null)}
        onConfirm={handleEliminar}
      />
    </div>
  );
}

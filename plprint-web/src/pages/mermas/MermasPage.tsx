import { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { mermasApi, Merma } from '@/api/mermas.api';
import { productosApi } from '@/api/productos.api';
import { insumosApi } from '@/api/insumos.api';
import { maquinasApi, Maquina } from '@/api/maquinas.api';
import { useMoney } from '@/hooks/useMoney';
import { useSucursalStore } from '@/store/sucursalStore';
import { useCentroImpresion } from '@/hooks/useCentroImpresion';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { MermasTable } from './MermasTable';
import { MermaFormModal, MermaDeleteModal } from './MermaModals';

const emptyForm = {
  tipo: 'producto' as 'producto' | 'insumo',
  producto_id: 0,
  insumo_id: 0,
  maquina_id: 0,
  cantidad: '1',
  motivo: '',
  costo_estimado: '',
};

export default function MermasPage() {
  const { simbolo, format: money } = useMoney();
  const sucursalActual = useSucursalStore((s) => s.sucursalActiva);
  const { esCentroImpresion } = useCentroImpresion();
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'producto' | 'insumo'>('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalCosto, setTotalCosto] = useState(0);
  const limit = 20;

  const [productos, setProductos] = useState<Array<{ id: number; nombre: string; unidad_medida: string; maquina_id?: number | null }>>([]);
  const [insumos, setInsumos] = useState<Array<{ id: number; nombre: string; unidad_medida: string }>>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Merma | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [eliminarItem, setEliminarItem] = useState<Merma | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMermas = async () => {
    try {
      setIsLoading(true);
      const res = await mermasApi.getAll({
        page, limit, search: search || undefined,
        tipo: filtroTipo === 'todos' ? undefined : filtroTipo,
        ...(sucursalActual?.id && { sucursalId: sucursalActual.id }),
      });
      const data = (res.data as { data: Merma[]; meta: { total: number; totalCosto?: number } });
      setMermas(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalCosto(data.meta?.totalCosto || 0);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const cargarCatalogos = async () => {
    try {
      const [p, i, m] = await Promise.all([
        productosApi.getAll({ page: 1, limit: 100, ...(sucursalActual?.id && { sucursalId: sucursalActual.id }) }),
        insumosApi.getAll({ page: 1, limit: 100, ...(sucursalActual?.id && { sucursalId: sucursalActual.id }) }),
        maquinasApi.getAll({ activo: true, ...(sucursalActual?.id && { sucursalId: sucursalActual.id }) }),
      ]);
      setProductos((p.data as { data: typeof productos }).data || []);
      setInsumos((i.data as { data: typeof insumos }).data || []);
      setMaquinas((m.data as { data: Maquina[] }).data || []);
    } catch (e) { console.error(e); }
  };

  const prevSucursalIdRef = useRef<number | undefined>(sucursalActual?.id);
  useEffect(() => {
    if (prevSucursalIdRef.current !== sucursalActual?.id) {
      prevSucursalIdRef.current = sucursalActual?.id;
      setPage(1);
    }
  }, [sucursalActual?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await mermasApi.getAll({
          page, limit, search: search || undefined,
          tipo: filtroTipo === 'todos' ? undefined : filtroTipo,
          ...(sucursalActual?.id && { sucursalId: sucursalActual.id }),
        });
        if (cancelled) return;
        const data = (res.data as { data: Merma[]; meta: { total: number; totalCosto?: number } });
        setMermas(data.data || []);
        setTotal(data.meta?.total || 0);
        setTotalCosto(data.meta?.totalCosto || 0);
      } catch (e) { if (!cancelled) console.error(e); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [page, search, filtroTipo, sucursalActual?.id]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setFormError('');
    cargarCatalogos();
    setModalOpen(true);
  };

  const abrirEditar = (m: Merma) => {
    setEditando(m);
    setForm({
      tipo: m.tipo,
      producto_id: m.producto_id || 0,
      insumo_id: m.insumo_id || 0,
      maquina_id: m.maquina_id || 0,
      cantidad: m.cantidad,
      motivo: m.motivo,
      costo_estimado: m.costo_estimado || '',
    });
    setFormError('');
    cargarCatalogos();
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.motivo.trim()) { setFormError('El motivo es requerido.'); return; }
    if (form.tipo === 'producto' && !form.producto_id) { setFormError('Selecciona un producto.'); return; }
    if (form.tipo === 'insumo' && !form.insumo_id) { setFormError('Selecciona un insumo.'); return; }
    if (!form.cantidad || Number(form.cantidad) <= 0) { setFormError('La cantidad debe ser mayor a 0.'); return; }
    try {
      setIsSaving(true);
      const payload: Record<string, unknown> = {
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
        motivo: form.motivo.trim(),
        ...(form.costo_estimado && { costo_estimado: Number(form.costo_estimado) }),
        ...(sucursalActual?.id && { sucursal_id: sucursalActual.id }),
      };
      if (form.tipo === 'producto') {
        payload.producto_id = Number(form.producto_id);
        if (form.maquina_id) payload.maquina_id = Number(form.maquina_id);
      } else {
        payload.insumo_id = Number(form.insumo_id);
      }

      if (editando) {
        await mermasApi.update(editando.id, payload);
      } else {
        await mermasApi.create(payload);
      }
      setModalOpen(false);
      fetchMermas();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al guardar.');
    } finally { setIsSaving(false); }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    try {
      setIsDeleting(true);
      await mermasApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchMermas();
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'No se pudo eliminar la merma.' });
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="delete" className="text-[#2e9e9b]" size={32} />
            Mermas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registra desperdicios y productos dañados. Se descuenta automáticamente del inventario.
          </p>
        </m.div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-48 bg-background"
            />
          </div>
          <RequirePermission modulo="mermas" accion="crear">
            <Button onClick={abrirCrear} className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
              <Icon name="add" className="mr-2" size={16} /> Nueva Merma
            </Button>
          </RequirePermission>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Icon name="filter_list" size={14} className="text-muted-foreground" />
        <div className="flex items-center gap-2">
          {[
            { v: 'todos' as const,    label: 'Todas' },
            { v: 'producto' as const, label: 'Productos' },
            { v: 'insumo' as const,   label: 'Insumos' },
          ].map((opt) => (
            <button type="button"
              key={opt.v}
              onClick={() => { setFiltroTipo(opt.v); setPage(1); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filtroTipo === opt.v
                  ? 'bg-[#2e9e9b] text-black'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ml-auto font-mono text-sm">
          <span className="text-muted-foreground">Costo total: </span>
          <span className="font-bold text-red-400">{money(Number(totalCosto))}</span>
        </div>
      </div>

      <MermasTable
        isLoading={isLoading}
        mermas={mermas as never}
        showMaquina={esCentroImpresion}
        money={money as never}
        onEditar={abrirEditar as never}
        onEliminar={setEliminarItem as never}
      />

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{mermas.length} de {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <span className="font-mono">Pág. {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>Siguiente</Button>
          </div>
        </div>
      )}

      <MermaFormModal
        open={modalOpen}
        editando={editando as never}
        form={form as never}
        simbolo={simbolo}
        productos={productos as never}
        insumos={insumos as never}
        maquinas={maquinas as never}
        esCentroImpresion={esCentroImpresion}
        isSaving={isSaving}
        formError={formError}
        onClose={() => setModalOpen(false)}
        onChange={(f) => setForm(f)}
        onGuardar={handleGuardar}
      />

      <MermaDeleteModal
        open={!!eliminarItem}
        isDeleting={isDeleting}
        onClose={() => setEliminarItem(null)}
        onConfirm={handleEliminar}
      />
    </div>
  );
}

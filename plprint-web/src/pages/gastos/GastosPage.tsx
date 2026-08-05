import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';

import { gastosApi, categoriasGastosApi, CategoriaGasto, Gasto } from '@/api/gastos.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMoney } from '@/hooks/useMoney';
import { useAuthStore } from '@/store/authStore';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import { GastosTable } from './GastosTable';
import { GastoFormModal, GastoDeleteModal } from './GastosModals';

const emptyForm = {
  categoria_id: 0,
  concepto: '',
  monto: '',
  tipo: 'gasto' as 'gasto' | 'ingreso' | 'retiro',
  sucursal_id: 1,
  notas: '',
};

export default function GastosPage() {
  const { simbolo, format: money } = useMoney();
  const usuario = useAuthStore((s) => s.usuario);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalMonto, setTotalMonto] = useState(0);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterCategoria, setFilterCategoria] = useState<string>('');
  const limit = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [eliminarItem, setEliminarItem] = useState<Gasto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGastos = async () => {
    try {
      setIsLoading(true);
      const res = await gastosApi.getAll({
        page, limit, search: search || undefined,
        tipo: filterTipo || undefined,
        categoriaId: filterCategoria ? Number(filterCategoria) : undefined,
      });
      const data = (res.data as { data: Gasto[]; meta: { total: number; totalMonto?: number } });
      setGastos(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalMonto(data.meta?.totalMonto || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    categoriasGastosApi.getAll()
      .then((res) => {
        if (cancelled) return;
        setCategorias(res.data?.data || []);
      })
      .catch((e) => { if (!cancelled) console.error(e); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const res = await gastosApi.getAll({
            page, limit, search: search || undefined,
            tipo: filterTipo || undefined,
            categoriaId: filterCategoria ? Number(filterCategoria) : undefined,
          });
          if (cancelled) return;
          const data = (res.data as { data: Gasto[]; meta: { total: number; totalMonto?: number } });
          setGastos(data.data || []);
          setTotal(data.meta?.total || 0);
          setTotalMonto(data.meta?.totalMonto || 0);
        } catch (e) {
          if (!cancelled) console.error(e);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, search ? 300 : 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, [page, search, filterTipo, filterCategoria]);

  const abrirCrear = (tipo: 'gasto' | 'ingreso' | 'retiro' = 'gasto') => {
    setEditando(null);
    setForm({ ...emptyForm, tipo, categoria_id: categorias[0]?.id || 0 });
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (g: Gasto) => {
    setEditando(g);
    setForm({
      categoria_id: g.categoria_id,
      concepto: g.concepto,
      monto: g.monto,
      tipo: g.tipo,
      sucursal_id: g.sucursal_id || 1,
      notas: g.notas || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.categoria_id) { setFormError('Selecciona una categoría.'); return; }
    if (!form.concepto.trim()) { setFormError('El concepto es requerido.'); return; }
    if (!form.monto || Number(form.monto) <= 0) { setFormError('El monto debe ser mayor a 0.'); return; }
    try {
      setIsSaving(true);
      const payload: Record<string, unknown> = {
        categoria_id: Number(form.categoria_id),
        concepto: form.concepto.trim(),
        monto: Number(form.monto),
        tipo: form.tipo,
        sucursal_id: Number(form.sucursal_id),
        notas: form.notas.trim() || undefined,
      };
      if (form.tipo === 'retiro' && usuario?.rol === 'admin') {
        payload.autorizado_por = usuario.id;
      }
      if (editando) {
        await gastosApi.update(editando.id, payload);
      } else {
        await gastosApi.create(payload);
      }
      setModalOpen(false);
      fetchGastos();
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
      await gastosApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchGastos();
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'No se pudo eliminar el registro.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="receipt" className="text-[#2e9e9b]" size={32} />
            Gastos e Ingresos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registra gastos, ingresos y retiros de caja.
          </p>
        </m.div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-48 bg-background"
            />
          </div>
          <RequirePermission modulo="gastos" accion="crear">
            <Button onClick={() => abrirCrear('gasto')} variant="outline" className="h-10 border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Icon name="arrow_downward" className="mr-1" size={16} /> Gasto
            </Button>
            <Button onClick={() => abrirCrear('ingreso')} variant="outline" className="h-10 border-green-500/30 text-green-400 hover:bg-green-500/10">
              <Icon name="arrow_upward" className="mr-1" size={16} /> Ingreso
            </Button>
            <RequirePermission modulo="gastos" accion="eliminar">
              <Button onClick={() => abrirCrear('retiro')} variant="outline" className="h-10 border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                <Icon name="account_balance_wallet" className="mr-1" size={16} /> Retiro
              </Button>
            </RequirePermission>
          </RequirePermission>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Icon name="filter_list" size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">Tipo:</span>
          {[
            { v: '', label: 'Todos' },
            { v: 'gasto', label: 'Gastos' },
            { v: 'ingreso', label: 'Ingresos' },
            { v: 'retiro', label: 'Retiros' },
          ].map((opt) => (
            <button type="button"
              key={opt.v}
              onClick={() => { setFilterTipo(opt.v); setPage(1); }}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                filterTipo === opt.v
                  ? 'bg-[#2e9e9b] text-black font-semibold'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="gastos-filtro-categoria" className="text-muted-foreground">Categoría:</label>
          <select
            id="gastos-filtro-categoria"
            aria-label="Filtrar por categoría"
            value={filterCategoria}
            onChange={(e) => { setFilterCategoria(e.target.value); setPage(1); }}
            className="bg-background border border-border rounded-md text-sm px-2 py-1"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto font-mono text-sm">
          <span className="text-muted-foreground">Total: </span>
          <span className={`font-bold ${totalMonto > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {money(Number(totalMonto))}
          </span>
        </div>
      </div>

      {/* TABLA */}
      <GastosTable
        isLoading={isLoading}
        gastos={gastos as never}
        search={search}
        filterTipo={filterTipo}
        filterCategoria={filterCategoria}
        money={money as never}
        onEditar={abrirEditar as never}
        onEliminar={setEliminarItem as never}
      />

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {gastos.length} de {total}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <span className="font-mono">Página {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* MODALES */}
      <GastoFormModal
        open={modalOpen}
        editando={editando as never}
        form={form as never}
        categorias={categorias}
        simbolo={simbolo}
        isSaving={isSaving}
        formError={formError}
        onClose={() => setModalOpen(false)}
        onTipoChange={(tipo) => setForm({ ...form, tipo })}
        onFormChange={(f) => setForm(f as never)}
        onGuardar={handleGuardar}
      />

      <GastoDeleteModal
        item={eliminarItem as never}
        isDeleting={isDeleting}
        onClose={() => setEliminarItem(null)}
        onConfirm={handleEliminar}
      />
    </div>
  );
}

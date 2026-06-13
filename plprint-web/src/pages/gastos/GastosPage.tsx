import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { gastosApi, categoriasGastosApi, CategoriaGasto, Gasto } from '@/api/gastos.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMoney } from '@/hooks/useMoney';
import { useAuthStore } from '@/store/authStore';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const TIPO_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  gasto:   { label: 'Gasto',   color: 'text-red-400',    icon: 'arrow_downward' },
  ingreso: { label: 'Ingreso', color: 'text-green-400',  icon: 'arrow_upward' },
  retiro:  { label: 'Retiro',  color: 'text-orange-400', icon: 'account_balance_wallet' },
};

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

  const fetchCategorias = async () => {
    try {
      const res = await categoriasGastosApi.getAll();
      setCategorias(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchCategorias(); }, []);
  useEffect(() => { fetchGastos(); }, [page, filterTipo, filterCategoria]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchGastos(); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
      alert('No se pudo eliminar el registro.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="receipt" className="text-[#2e9e9b]" size={32} />
            Gastos e Ingresos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registra gastos, ingresos y retiros de caja.
          </p>
        </motion.div>

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
            <button
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
          <span className="text-muted-foreground">Categoría:</span>
          <select
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 shadow-2xl overflow-y-auto"
      >
        <table className="w-full text-sm text-left text-foreground">
          <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Tipo</th>
              <th className="px-6 py-4 font-semibold">Categoría</th>
              <th className="px-6 py-4 font-semibold">Concepto</th>
              <th className="px-6 py-4 font-semibold text-right">Monto</th>
              <th className="px-6 py-4 font-semibold">Sucursal</th>
              <th className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center">
                <Icon name="progress_activity" className="mx-auto animate-spin text-[#2e9e9b]" size={24} />
              </td></tr>
            ) : gastos.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                <Icon name="receipt" size={32} className="mx-auto mb-2 opacity-20" />
                <p>{search || filterTipo || filterCategoria ? 'Sin resultados.' : 'No hay registros aún.'}</p>
              </td></tr>
            ) : (
              <AnimatePresence>
                {gastos.map((g, i) => {
                  const T = TIPO_LABELS[g.tipo] || TIPO_LABELS.gasto;
                  return (
                    <motion.tr
                      key={g.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                        {new Date(g.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${T.color}`}>
                          <Icon name={T.icon} size={12} /> {T.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{g.categoria?.nombre || '—'}</td>
                      <td className="px-6 py-4 text-foreground">
                        {g.concepto}
                        {g.autorizado_por && <span className="ml-2 text-[10px] text-orange-400">(autorizado)</span>}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-semibold ${
                        g.tipo === 'ingreso' ? 'text-green-400' : g.tipo === 'retiro' ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {g.tipo === 'ingreso' ? '+' : '-'}{money(Number(g.monto))}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{g.sucursales?.nombre || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <RequirePermission modulo="gastos" accion="editar">
                            <button
                              onClick={() => abrirEditar(g)}
                              title="Editar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="gastos" accion="eliminar">
                            <button
                              onClick={() => setEliminarItem(g)}
                              title="Eliminar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Icon name="delete" size={14} />
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </motion.div>

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

      {/* MODAL CREAR / EDITAR */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
              {editando ? 'Editar registro' : 'Nuevo registro'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editando ? 'Modifica los datos.' : `Registra un nuevo ${form.tipo}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setForm({ ...form, tipo: 'gasto' })}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.tipo === 'gasto' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-background border border-border text-muted-foreground'
                }`}
              >
                <Icon name="arrow_downward" className="inline mr-1" size={16} /> Gasto
              </button>
              <button
                onClick={() => setForm({ ...form, tipo: 'ingreso' })}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.tipo === 'ingreso' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-background border border-border text-muted-foreground'
                }`}
              >
                <Icon name="arrow_upward" className="inline mr-1" size={16} /> Ingreso
              </button>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Categoría *</label>
              <select
                value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
              >
                <option value={0}>Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Concepto *</label>
              <Input
                autoFocus
                placeholder="Ej. Pago de luz, Reposición de caja..."
                value={form.concepto}
                onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Monto ({simbolo}) *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Notas</label>
              <Textarea
                placeholder="Información adicional..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="bg-background min-h-[50px]"
              />
            </div>
            {form.tipo === 'retiro' && (
              <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
                <strong>Retiro:</strong> Requiere autorización de administrador para proceder.
              </div>
            )}
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
            <DialogTitle className="text-white">¿Eliminar registro?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se eliminará <span className="text-white font-semibold">{eliminarItem?.concepto}</span>.
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

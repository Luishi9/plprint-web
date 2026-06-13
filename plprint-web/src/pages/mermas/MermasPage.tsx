import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { mermasApi, Merma } from '@/api/mermas.api';
import { productosApi } from '@/api/productos.api';
import { insumosApi } from '@/api/insumos.api';
import { useMoney } from '@/hooks/useMoney';
import { useSucursalStore } from '@/store/sucursalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = {
  tipo: 'producto' as 'producto' | 'insumo',
  producto_id: 0,
  insumo_id: 0,
  cantidad: '1',
  motivo: '',
  costo_estimado: '',
};

export default function MermasPage() {
  const { simbolo, format: money } = useMoney();
  const sucursalActual = useSucursalStore((s) => s.sucursalActiva);
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'producto' | 'insumo'>('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalCosto, setTotalCosto] = useState(0);
  const limit = 20;

  const [productos, setProductos] = useState<Array<{ id: number; nombre: string; unidad_medida: string }>>([]);
  const [insumos, setInsumos] = useState<Array<{ id: number; nombre: string; unidad_medida: string }>>([]);

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
      const [p, i] = await Promise.all([
        productosApi.getAll({ page: 1, limit: 100 }),
        insumosApi.getAll({ page: 1, limit: 100 }),
      ]);
      setProductos((p.data as { data: typeof productos }).data || []);
      setInsumos((i.data as { data: typeof insumos }).data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchMermas(); }, [page, filtroTipo]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchMermas(); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
      if (form.tipo === 'producto') payload.producto_id = Number(form.producto_id);
      else payload.insumo_id = Number(form.insumo_id);

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
      alert('No se pudo eliminar la merma.');
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="delete" className="text-[#2e9e9b]" size={32} />
            Mermas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registra desperdicios y productos dañados. Se descuenta automáticamente del inventario.
          </p>
        </motion.div>
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
            <button
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
              <th className="px-6 py-4 font-semibold">Item</th>
              <th className="px-6 py-4 font-semibold text-center">Cantidad</th>
              <th className="px-6 py-4 font-semibold">Motivo</th>
              <th className="px-6 py-4 font-semibold text-right">Costo Est.</th>
              <th className="px-6 py-4 font-semibold">Sucursal</th>
              <th className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center">
                <Icon name="progress_activity" className="mx-auto animate-spin text-[#2e9e9b]" size={24} />
              </td></tr>
            ) : mermas.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                <Icon name="delete" size={32} className="mx-auto mb-2 opacity-20" />
                <p>No hay mermas registradas.</p>
              </td></tr>
            ) : (
              <AnimatePresence>
                {mermas.map((m, i) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(m.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                        m.tipo === 'producto'
                          ? 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      }`}>
                        {m.tipo === 'producto' ? <Icon name="inventory_2" size={11} /> : <Icon name="inventory" size={11} />}
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {m.productos?.nombre || m.insumos?.nombre || '—'}
                      {m.venta_id && <span className="text-[10px] text-muted-foreground ml-1">(venta #{m.venta_id})</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-red-400">{Number(m.cantidad).toFixed(2)}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{m.motivo}</td>
                    <td className="px-6 py-4 text-right font-mono">
                      {m.costo_estimado ? money(Number(m.costo_estimado)) : '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{m.sucursales?.nombre || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <RequirePermission modulo="mermas" accion="editar">
                          <button
                            onClick={() => abrirEditar(m)}
                            title="Editar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                        </RequirePermission>
                        <RequirePermission modulo="mermas" accion="eliminar">
                          <button
                            onClick={() => setEliminarItem(m)}
                            title="Eliminar"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
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
      </motion.div>

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

      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
              {editando ? 'Editar merma' : 'Nueva merma'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setForm({ ...form, tipo: 'producto' })}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  form.tipo === 'producto' ? 'bg-[#2e9e9b]/20 text-[#2e9e9b] border border-[#2e9e9b]/50' : 'bg-background border border-border text-muted-foreground'
                }`}
              >
                <Icon name="inventory_2" size={14} /> Producto
              </button>
              <button
                onClick={() => setForm({ ...form, tipo: 'insumo' })}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  form.tipo === 'insumo' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-background border border-border text-muted-foreground'
                }`}
              >
                <Icon name="inventory" size={14} /> Insumo
              </button>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                {form.tipo === 'producto' ? 'Producto *' : 'Insumo *'}
              </label>
              <select
                value={form.tipo === 'producto' ? form.producto_id : form.insumo_id}
                onChange={(e) => form.tipo === 'producto'
                  ? setForm({ ...form, producto_id: Number(e.target.value) })
                  : setForm({ ...form, insumo_id: Number(e.target.value) })
                }
                className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
              >
                <option value={0}>Seleccionar...</option>
                {(form.tipo === 'producto' ? productos : insumos).map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium block mb-1.5">Cantidad *</label>
                <Input
                  type="number" step="0.01" min="0"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Costo est. ({simbolo})</label>
                <Input
                  type="number" step="0.01" min="0"
                  value={form.costo_estimado}
                  onChange={(e) => setForm({ ...form, costo_estimado: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Motivo *</label>
              <Input
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Ej. Error de impresión, daño físico..."
                className="bg-background"
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
              {isSaving ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" /> : <Icon name="check" size={14} className="mr-1" />}
              {editando ? 'Guardar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!eliminarItem} onOpenChange={(v) => { if (!v) setEliminarItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar merma?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se eliminará el registro. Esta acción no revierte el inventario descontado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={() => setEliminarItem(null)} disabled={isDeleting}>Cancelar</Button>
            <Button onClick={handleEliminar} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white font-semibold">
              {isDeleting ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : <Icon name="delete" size={16} className="mr-1" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

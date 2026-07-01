import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { maquinasApi, Maquina, MaquinaStats } from '@/api/maquinas.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import { useSucursalStore } from '@/store/sucursalStore';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = {
  nombre: '',
  tipo: '',
  marca: '',
  modelo: '',
  contador_inicial: 0,
  contador_total: 0,
};

export default function MaquinasPage() {
  const { sucursalActiva } = useSucursalStore();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Maquina | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Confirmar eliminar
  const [eliminarItem, setEliminarItem] = useState<Maquina | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal de estadísticas
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsMaquina, setStatsMaquina] = useState<Maquina | null>(null);
  const [stats, setStats] = useState<MaquinaStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchMaquinas = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number | boolean> = { limit: 100 };
      if (sucursalActiva) params.sucursalId = sucursalActiva.id;
      if (search) params.search = search;
      const res = await maquinasApi.getAll(params);
      setMaquinas(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMaquinas(); }, [sucursalActiva]);

  // Buscar con debounce
  useEffect(() => {
    const t = setTimeout(() => { fetchMaquinas(); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (m: Maquina) => {
    setEditando(m);
    setForm({
      nombre: m.nombre,
      tipo: m.tipo,
      marca: m.marca || '',
      modelo: m.modelo || '',
      contador_inicial: m.contador_inicial,
      contador_total: m.contador_total,
    });
    setFormError('');
    setModalOpen(true);
  };

  const abrirStats = async (m: Maquina) => {
    setStatsMaquina(m);
    setStatsModalOpen(true);
    setIsLoadingStats(true);
    try {
      const res = await maquinasApi.getStats(m.id);
      setStats(res.data?.data || null);
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'Error al cargar estadísticas' });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError('El nombre es requerido.'); return; }
    if (!form.tipo.trim()) { setFormError('El tipo es requerido.'); return; }
    if (editando && form.contador_total < form.contador_inicial) {
      setFormError('El contador total no puede ser menor al inicial.');
      return;
    }
    try {
      setIsSaving(true);
      const payload: Record<string, unknown> = {
        nombre: form.nombre.trim(),
        tipo: form.tipo.trim(),
        marca: form.marca.trim() || undefined,
        modelo: form.modelo.trim() || undefined,
        sucursal_id: sucursalActiva?.id || 1,
      };
      if (editando) {
        payload.contador_inicial = form.contador_inicial;
        payload.contador_total = form.contador_total;
        await maquinasApi.update(editando.id, payload);
      } else {
        if (form.contador_inicial > 0) payload.contador_inicial = form.contador_inicial;
        if (form.contador_total > 0) payload.contador_total = form.contador_total;
        await maquinasApi.create(payload as Parameters<typeof maquinasApi.create>[0]);
      }
      setModalOpen(false);
      fetchMaquinas();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al guardar la máquina.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    try {
      setIsDeleting(true);
      await maquinasApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchMaquinas();
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'No se pudo eliminar la máquina.' });
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
            <Icon name="precision_manufacturing" size={32} className="text-[#2e9e9b]" />
            Máquinas de Impresión
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus máquinas y monitorea el contador de impresiones.
          </p>
        </motion.div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar máquina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64 bg-background"
            />
          </div>
          <RequirePermission modulo="maquinas" accion="crear">
            <Button
              onClick={abrirCrear}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)]"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nueva
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
                <th scope="col" className="px-6 py-4 font-semibold">Tipo</th>
                <th scope="col" className="px-6 py-4 font-semibold">Marca / Modelo</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Contador Inicial</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Contador Total</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Productos</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                  <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <Icon name="hourglass_top" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                    <p className="mt-2 text-xs text-muted-foreground">Cargando máquinas...</p>
                  </td>
                </tr>
              ) : maquinas.length === 0 ? (
                  <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <Icon name="precision_manufacturing" size={32} className="mx-auto mb-2 opacity-20" />
                    <p>{search ? 'Sin resultados para la búsqueda.' : 'No hay máquinas aún. ¡Crea la primera!'}</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {maquinas.map((m, i) => (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{m.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{m.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          <Icon name="print" size={11} />
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground text-xs">
                        <div className="flex flex-col gap-0.5">
                          {m.marca && <span>{m.marca}</span>}
                          {m.modelo && <span className="text-muted-foreground">{m.modelo}</span>}
                          {!m.marca && !m.modelo && <span className="text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-muted-foreground">
                          {(m.contador_inicial ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-mono font-bold text-[#2e9e9b]">
                          {(m.contador_total ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-[#2e9e9b]">
                          {m._count?.productos ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <RequirePermission modulo="maquinas" accion="ver_contador">
                            <button
                              onClick={() => abrirStats(m)}
                              title="Ver estadísticas"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            >
                              <Icon name="analytics" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="maquinas" accion="editar">
                            <button
                              onClick={() => abrirEditar(m)}
                              title="Editar"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#2e9e9b] hover:bg-[#2e9e9b]/10 transition-colors"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                          </RequirePermission>
                          <RequirePermission modulo="maquinas" accion="eliminar">
                            <button
                              onClick={() => setEliminarItem(m)}
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

      {/* MODAL CREAR / EDITAR */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold">
              {editando ? 'Editar máquina' : 'Nueva máquina'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editando ? 'Modifica los datos de la máquina.' : 'Ingresa los datos de la nueva máquina.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Nombre *</label>
              <Input
                autoFocus
                placeholder="Ej. Impresora 1"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Tipo *</label>
              <Input
                placeholder="Ej. Inyección, Láser, Plotter..."
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Marca</label>
                <Input
                  placeholder="Ej. Epson, HP..."
                  value={form.marca}
                  onChange={(e) => setForm({ ...form, marca: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Modelo</label>
                <Input
                  placeholder="Ej. L3250"
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            {editando && (
              <div className="grid grid-cols-2 gap-3 bg-background/30 rounded-lg p-3 border border-border">
                <p className="col-span-2 text-xs text-muted-foreground mb-1">
                  Editar contadores (uso interno)
                </p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Contador Inicial</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Valor inicial del día"
                    value={form.contador_inicial}
                    onChange={(e) => setForm({ ...form, contador_inicial: parseInt(e.target.value) || 0 })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Contador Total</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Valor actual"
                    value={form.contador_total}
                    onChange={(e) => setForm({ ...form, contador_total: parseInt(e.target.value) || 0 })}
                    className="bg-background"
                  />
                </div>
                {form.contador_total < form.contador_inicial && (
                  <p className="col-span-2 text-xs text-red-400 mt-1">
                    El contador total no puede ser menor al inicial
                  </p>
                )}
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
                ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" />
                : <Icon name="check" size={14} className="mr-1" />}
              {editando ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ESTADÍSTICAS */}
      <Dialog open={statsModalOpen} onOpenChange={(v) => { if (!v) { setStatsModalOpen(false); setStats(null); } }}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
              <Icon name="analytics" size={20} />
              Estadísticas: {statsMaquina?.nombre}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Contador de impresiones por período
            </DialogDescription>
          </DialogHeader>

          {isLoadingStats ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Icon name="hourglass_top" size={32} className="animate-spin text-[#2e9e9b]" />
              <p className="mt-2 text-sm text-muted-foreground">Cargando estadísticas...</p>
            </div>
          ) : stats ? (
            <div className="py-4 space-y-6">
              {/* Contadores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Hoy</p>
                  <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.hoy.toLocaleString()}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Esta semana</p>
                  <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.semana.toLocaleString()}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Este mes</p>
                  <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.mes.toLocaleString()}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold font-mono text-[#2e9e9b]">{stats.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Historial reciente */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Icon name="history" size={16} className="text-[#2e9e9b]" />
                  Impresiones recientes
                </h3>
                {stats.recientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay impresiones registradas aún.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.recientes.map((imp) => (
                      <div
                        key={imp.id}
                        className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${imp.fue_merma ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                            <Icon
                              name={imp.fue_merma ? 'error' : 'check_circle'}
                              size={16}
                              className={imp.fue_merma ? 'text-red-400' : 'text-green-400'}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {imp.productos?.nombre || 'Producto eliminado'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {imp.fue_merma ? 'Merma' : 'Venta'}
                              {imp.usuarios?.nombre && ` • ${imp.usuarios.nombre}`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(imp.fecha).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* MODAL CONFIRMAR ELIMINAR */}
      <Dialog open={!!eliminarItem} onOpenChange={(v) => { if (!v) setEliminarItem(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar máquina?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se eliminará <span className="text-white font-semibold">{eliminarItem?.nombre}</span>.
              Los productos vinculados quedarán sin máquina asignada.
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

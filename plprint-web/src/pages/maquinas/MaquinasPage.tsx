import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
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
import { MaquinasTable } from './MaquinasTable';
import { MaquinaFormModal } from './MaquinaFormModal';
import { MaquinaStatsModal } from './MaquinaStatsModal';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Maquina | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [eliminarItem, setEliminarItem] = useState<Maquina | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const params: Record<string, string | number | boolean> = { limit: 100 };
          if (sucursalActiva) params.sucursalId = sucursalActiva.id;
          if (search) params.search = search;
          const res = await maquinasApi.getAll(params);
          if (cancelled) return;
          setMaquinas(res.data?.data || []);
        } catch (e) { if (!cancelled) console.error(e); }
        finally { if (!cancelled) setIsLoading(false); }
      })();
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [sucursalActiva, search]);

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
      setIsLoadingStats(false); }
  };

  const cerrarStats = () => {
    setStatsModalOpen(false);
    setStats(null);
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
    } finally { setIsSaving(false); }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="precision_manufacturing" size={32} className="text-[#2e9e9b]" />
            Máquinas de Impresión
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus máquinas y monitorea el contador de impresiones.
          </p>
        </m.div>

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

      <MaquinasTable
        isLoading={isLoading}
        maquinas={maquinas}
        search={search}
        onVerStats={abrirStats}
        onEditar={abrirEditar}
        onEliminar={setEliminarItem}
      />

      <MaquinaFormModal
        open={modalOpen}
        editando={editando}
        form={form}
        formError={formError}
        isSaving={isSaving}
        onClose={() => setModalOpen(false)}
        onChange={setForm}
        onErrorChange={setFormError}
        onGuardar={handleGuardar}
      />

      <MaquinaStatsModal
        open={statsModalOpen}
        maquina={statsMaquina}
        stats={stats}
        isLoading={isLoadingStats}
        onClose={cerrarStats}
      />

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

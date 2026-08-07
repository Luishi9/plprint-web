import { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { clientesApi } from '@/api/clientes.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import ClienteFormModal from './components/ClienteFormModal';
import ClienteHistorialModal from './components/ClienteHistorialModal';
import { ClientesTable } from './components/ClientesTable';

export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [historialCliente, setHistorialCliente] = useState<Cliente | null>(null);
  const [eliminarItem, setEliminarItem] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchClientes = async (isInitial = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    if (isInitial) setIsLoading(true);
    else setIsSearching(true);
    try {
      const res = await clientesApi.getAll({ search: search.trim() || undefined, page, limit: LIMIT });
      const body = res.data?.data ?? res.data;
      setClientes(Array.isArray(body) ? body : body.data ?? []);
      setTotal(body.total ?? (Array.isArray(body) ? body.length : 0));
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') console.error(err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    abortRef.current = abort;
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const res = await clientesApi.getAll({ search: search || '', page, limit: LIMIT });
          if (cancelled) return;
          const body = res.data?.data ?? res.data;
          setClientes(Array.isArray(body) ? body : body.data ?? []);
          setTotal(body.total ?? (Array.isArray(body) ? body.length : 0));
        } catch (err: any) {
          if (err?.code !== 'ERR_CANCELED' && err?.name !== 'AbortError' && !cancelled) console.error(err);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 350);
    return () => { cancelled = true; clearTimeout(t); abort.abort(); };
  }, [search, page]);

  const handleSaved = () => {
    setModalOpen(false);
    setEditando(null);
    fetchClientes(true);
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await clientesApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchClientes(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const abrirCrear = () => { setEditando(null); setModalOpen(true); };
  const abrirEditar = (c: Cliente) => { setEditando(c); setModalOpen(true); };

  const stats = [
    { label: 'Total clientes', value: total, cls: 'text-[#2e9e9b]' },
    { label: 'Con teléfono', value: clientes.filter((c) => c.telefono).length, cls: 'text-blue-400' },
    { label: 'Con correo', value: clientes.filter((c) => c.email).length, cls: 'text-purple-400' },
  ];

  return (
    <div className="flex flex-col gap-5 h-full min-h-0">
      <m.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Icon name="group" size={24} className="text-[#2e9e9b]" />
            Clientes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Directorio de clientes e historial de compras
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-8 w-52 bg-background/50 border-border text-sm"
              placeholder="Buscar cliente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={abrirCrear}
            className="h-9 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
          >
            <Icon name="add" size={16} className="mr-1.5" />
            Nuevo cliente
          </Button>
        </div>
      </m.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-1"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</span>
          </m.div>
        ))}
      </div>

      <ClientesTable
        isLoading={isLoading}
        isSearching={isSearching}
        clientes={clientes}
        search={search}
        onVerHistorial={setHistorialCliente}
        onEditar={abrirEditar}
        onEliminar={setEliminarItem}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{total} clientes en total</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              className="h-7 border-border"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span>Pág. {page} / {totalPages}</span>
            <Button
              variant="outline" size="sm"
              className="h-7 border-border"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <ClienteFormModal
        open={modalOpen}
        cliente={editando}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        onSaved={handleSaved}
      />

      <ClienteHistorialModal
        cliente={historialCliente}
        onClose={() => setHistorialCliente(null)}
      />

      <Dialog open={!!eliminarItem} onOpenChange={() => setEliminarItem(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar cliente?</DialogTitle>
            <DialogDescription>
              Se eliminará a <strong>{eliminarItem?.nombre}</strong> del sistema. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" className="border-border" onClick={() => setEliminarItem(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEliminar}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isDeleting && <Icon name="hourglass_top" size={14} className="animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

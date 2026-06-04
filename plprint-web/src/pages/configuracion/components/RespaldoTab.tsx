import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Download, Trash2, Loader2, RefreshCw, FileDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { respaldoApi, Backup, DbStats } from '@/api/respaldo.api';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
}

export default function RespaldoTab() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [eliminarItem, setEliminarItem] = useState<Backup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [b, s] = await Promise.all([respaldoApi.list(), respaldoApi.getStats()]);
      setBackups(b.data.data);
      setStats(s.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const res = await respaldoApi.generate();
      setMessage({ type: 'ok', text: `Respaldo ${res.data.data.filename} creado` });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? 'Error al generar' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await apiClient.get(`/respaldo/download/${filename}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await respaldoApi.remove(eliminarItem.filename);
      setEliminarItem(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Database size={16} /> Respaldo de base de datos
            </CardTitle>
            <CardDescription>Genera, descarga y administra respaldos SQL</CardDescription>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
            {isGenerating ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileDown className="mr-2" size={16} />}
            Generar respaldo
          </Button>
        </CardHeader>
        {message && (
          <div className="px-6 pb-2">
            <p className={`text-sm ${message.type === 'ok' ? 'text-[#2e9e9b]' : 'text-red-500'}`}>
              {message.text}
            </p>
          </div>
        )}
        <CardContent>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">Tablas</p>
                <p className="text-2xl font-bold">{stats.totalTablas}</p>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">Respaldos</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
              <div className="p-3 border border-border rounded-lg col-span-2">
                <p className="text-xs text-muted-foreground mb-1.5">Top tablas por registros</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...stats.tablas].sort((a, b) => b.registros - a.registros).slice(0, 5).map((t) => (
                    <span key={t.nombre} className="text-xs px-2 py-0.5 rounded-md bg-muted">
                      {t.nombre}: <span className="font-semibold">{t.registros}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de respaldos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Respaldos disponibles</h3>
              <Button variant="ghost" size="sm" onClick={fetchData}>
                <RefreshCw size={13} className="mr-1" /> Actualizar
              </Button>
            </div>
            {backups.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No hay respaldos aún</p>
            ) : (
              backups.map((b) => (
                <div key={b.filename} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Database size={18} className="text-[#2e9e9b] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm truncate">{b.filename}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.created_at)} · {b.size_mb} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(b.filename)} title="Descargar">
                      <Download size={15} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEliminarItem(b)} title="Eliminar">
                      <Trash2 size={15} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!eliminarItem} onOpenChange={(v) => !v && setEliminarItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar respaldo</DialogTitle>
            <DialogDescription>
              ¿Eliminar el archivo <span className="font-mono text-xs">{eliminarItem?.filename}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEliminarItem(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleEliminar} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

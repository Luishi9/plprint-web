import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auditLogApi, AuditLog, AuditStats } from '@/api/auditLog.api';

const ACCION_COLOR: Record<string, string> = {
  CREATE: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30',
  UPDATE: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  DELETE: 'bg-red-500/10 text-red-500 border-red-500/30',
  LOGIN: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  LOGOUT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  EXPORT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export default function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [modulo, setModulo] = useState('all');
  const [accion, setAccion] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 25 };
      if (modulo && modulo !== 'all') params.modulo = modulo;
      if (accion && accion !== 'all') params.accion = accion;
      const [logsRes, statsRes] = await Promise.all([auditLogApi.getAll(params), auditLogApi.getStats()]);
      setLogs(logsRes.data.data);
      setMeta(logsRes.data.meta);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [modulo, accion]);

  const filtrados = search
    ? logs.filter((l) =>
        l.usuarios?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        l.modulo.toLowerCase().includes(search.toLowerCase()) ||
        l.accion.toLowerCase().includes(search.toLowerCase()) ||
        l.detalle?.toLowerCase().includes(search.toLowerCase()),
      )
    : logs;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Total eventos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              <p className="text-2xl font-bold">{stats.ultimos_7_dias}</p>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1.5">Por módulo</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.por_modulo.slice(0, 6).map((m) => (
                  <span key={m.modulo} className="text-xs px-2 py-0.5 rounded-md bg-muted">
                    {m.modulo}: <span className="font-semibold">{m.total}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="article" size={16} /> Bitácora de auditoría
            </CardTitle>
            <CardDescription>Registro de todas las acciones del sistema</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => fetchData(meta.page)}>
            <Icon name="refresh" size={15} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="relative">
              <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Filtrar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Módulo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                {stats?.por_modulo.map((m) => (
                  <SelectItem key={m.modulo} value={m.modulo}>{m.modulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={accion} onValueChange={setAccion}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Acción" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {stats?.por_accion.map((a) => (
                  <SelectItem key={a.accion} value={a.accion}>{a.accion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="progress_activity" className="animate-spin" size={20} />
              </div>
            ) : filtrados.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">Sin registros</p>
            ) : (
              filtrados.map((l) => {
                const colorClass = ACCION_COLOR[l.accion] ?? 'bg-muted text-muted-foreground border-border';
                return (
                  <div key={l.id} className="flex items-start gap-3 p-2.5 border border-border rounded-md text-sm">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorClass} shrink-0`}>
                      {l.accion}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs">{l.modulo}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {l.usuarios?.nombre ?? 'Sistema'}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString('es')}</span>
                        {l.ip && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground font-mono">{l.ip}</span>
                          </>
                        )}
                      </div>
                      {l.detalle && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate" title={l.detalle}>
                          {l.detalle}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginación */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {meta.total} registros · página {meta.page} de {meta.totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={meta.page === 1} onClick={() => fetchData(meta.page - 1)}>
                  <Icon name="chevron_left" size={14} />
                </Button>
                <Button variant="ghost" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => fetchData(meta.page + 1)}>
                  <Icon name="chevron_right" size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

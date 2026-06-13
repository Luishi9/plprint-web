import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { cotizacionesApi, Cotizacion } from '@/api/cotizaciones.api';
import { useMoney } from '@/hooks/useMoney';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface CotizacionSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeleccionar: (cot: Cotizacion) => void;
}

export default function CotizacionSelectorModal({ open, onOpenChange, onSeleccionar }: CotizacionSelectorModalProps) {
  const { simbolo } = useMoney();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [folio, setFolio] = useState('');
  const [cliente, setCliente] = useState('');
  const [usuario, setUsuario] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const fetchCotizaciones = async () => {
    try {
      setIsLoading(true);
      const res = await cotizacionesApi.getAll({
        estado: 'pendiente',
        limit: 100,
      });
      setCotizaciones((res.data as { data: Cotizacion[] }).data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (open) {
      fetchCotizaciones();
      setFolio(''); setCliente(''); setUsuario(''); setFechaDesde(''); setFechaHasta('');
    }
  }, [open]);

  const filtradas = cotizaciones.filter((c) => {
    if (folio && !c.folio.toLowerCase().includes(folio.toLowerCase())) return false;
    if (cliente) {
      const term = cliente.toLowerCase();
      const nombreCliente = c.clientes?.nombre?.toLowerCase() || '';
      if (!nombreCliente.includes(term)) return false;
    }
    if (usuario) {
      const term = usuario.toLowerCase();
      const nombreUsuario = c.usuarios?.nombre?.toLowerCase() || '';
      if (!nombreUsuario.includes(term)) return false;
    }
    if (fechaDesde) {
      const d = new Date(c.created_at);
      const desde = new Date(fechaDesde);
      if (d < desde) return false;
    }
    if (fechaHasta) {
      const d = new Date(c.created_at);
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59);
      if (d > hasta) return false;
    }
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="description" size={20} /> Seleccionar Cotización
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Busca y selecciona una cotización pendiente para convertirla en venta.
          </DialogDescription>
        </DialogHeader>

        {/* Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-2">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Folio</label>
            <Input
              placeholder="COT-..."
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              className="bg-background text-sm h-9"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Cliente</label>
            <Input
              placeholder="Nombre..."
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="bg-background text-sm h-9"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Vendedor</label>
            <Input
              placeholder="Nombre..."
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="bg-background text-sm h-9"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Desde</label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="bg-background text-sm h-9"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Hasta</label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="bg-background text-sm h-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Icon name="hourglass_top" size={24} className="animate-spin text-[#2e9e9b]" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <Icon name="description" size={28} className="opacity-20 mb-2" />
              {cotizaciones.length === 0
                ? 'No hay cotizaciones pendientes.'
                : 'Ninguna cotización coincide con los filtros.'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-background/50 border-b border-border sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Folio</th>
                    <th className="px-3 py-2 text-left font-medium">Cliente</th>
                    <th className="px-3 py-2 text-left font-medium">Vendedor</th>
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-right font-medium">Items</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtradas.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/50 hover:bg-background/40"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-[#2e9e9b]">{c.folio}</td>
                        <td className="px-3 py-2 text-sm">{c.clientes?.nombre || 'Público General'}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{c.usuarios?.nombre || '—'}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2 text-xs text-center text-muted-foreground">
                          {c._count?.cotizacion_detalle ?? c.cotizacion_detalle?.length ?? 0}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">
                          {simbolo}{Number(c.total).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="sm"
                            onClick={() => { onSeleccionar(c); onOpenChange(false); }}
                            className="h-7 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black text-xs px-2"
                          >
                            <Icon name="arrow_forward" size={12} className="mr-1" /> Cargar
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

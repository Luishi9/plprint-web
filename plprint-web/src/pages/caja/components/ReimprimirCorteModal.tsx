import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cajaApi, CorteCaja, MovimientoCaja, ResumenCaja } from '@/api/caja.api';
import CorteTicketImpresion from './CorteTicketImpresion';
import { useCortePdfBuilder } from './CortePdfBuilder';
import { sileo } from 'sileo';

interface Props {
  open: boolean;
  onClose: () => void;
  sucursalId: number;
}

export default function ReimprimirCorteModal({ open, onClose, sucursalId }: Props) {
  const [cortes, setCortes] = useState<CorteCaja[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [corteData, setCorteData] = useState<{ corte: CorteCaja; movimientos: MovimientoCaja[]; resumen: ResumenCaja } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { descargarPdf } = useCortePdfBuilder();

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setCorteData(null);
      cajaApi.getCortes({ sucursalId, page: 1, limit: 50 }).then((res) => {
        setCortes(res.data?.data || []);
      });
    }
  }, [open, sucursalId]);

  const handleSelect = async (id: number) => {
    try {
      setLoading(true);
      setSelectedId(id);
      const res = await cajaApi.getCorteReimprimir(id);
      setCorteData(res.data.data);
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'Error al cargar datos del corte.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !printRef.current) return;
    win.document.write(`
      <html><head><title>Corte de Caja #${selectedId}</title>
      <style>
        body { margin: 0; padding: 16px; font-family: monospace; font-size: 12px; }
        @media print { body { margin: 0; padding: 0; } }
      </style></head><body>
    `);
    win.document.write(printRef.current.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const handleDescargarPdf = () => {
    if (!corteData) return;
    descargarPdf({ corte: corteData.corte, movimientos: corteData.movimientos, resumen: corteData.resumen });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="print" size={22} /> Reimprimir Corte
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona un corte cerrado para reimprimir.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-4">
          {cortes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay cortes cerrados.</p>
          ) : (
            <select
              value={selectedId || ''}
              onChange={(e) => handleSelect(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
            >
              <option value="">Seleccionar corte...</option>
              {cortes.filter((c) => c.estado === 'cerrada').map((c) => (
                <option key={c.id} value={c.id}>
                  Corte #{c.id} — {new Date(c.fecha_apertura).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {c.diferencia ? ` | Dif: ${Number(c.diferencia) >= 0 ? '+' : ''}$${Number(c.diferencia).toFixed(2)}` : ''}
                </option>
              ))}
            </select>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Icon name="progress_activity" size={24} className="animate-spin text-[#2e9e9b]" />
            </div>
          )}

          {corteData && !loading && (
            <>
              <div className="border border-border rounded-lg bg-background p-4 overflow-auto max-h-[400px]" ref={printRef}>
                <CorteTicketImpresion {...corteData} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="outline" className="h-10 px-4 whitespace-nowrap">
                  <Icon name="print" size={14} className="mr-2" /> Imprimir Ticket
                </Button>
                <Button onClick={handleDescargarPdf} className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap">
                  <Icon name="file_download" size={14} className="mr-2" /> Descargar PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

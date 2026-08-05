import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { ProductoConInsumos } from '@/api/ventas.api';

interface VentaCancelarInsumosModalProps {
  open: boolean;
  venta: { id: number; total: number; folio?: string | null; clientes?: { nombre: string } | null } | null;
  productos: ProductoConInsumos[];
  isCanceling: boolean;
  money: (v: number | string) => string;
  onClose: () => void;
  onConfirm: (payload: {
    insumosDecision: Array<{ productoId: number; accion: 'revertir' | 'merma' }>;
    motivoMerma: string;
  }) => void;
}

type Accion = 'revertir' | 'merma';

export function VentaCancelarInsumosModal({
  open, venta, productos, isCanceling, money, onClose, onConfirm,
}: VentaCancelarInsumosModalProps) {
  const [decision, setDecision] = useState<Record<number, Accion>>({});
  const [motivoMerma, setMotivoMerma] = useState('');

  useEffect(() => {
    if (open) {
      const inicial: Record<number, Accion> = {};
      for (const p of productos) inicial[p.productoId] = 'revertir';
      setDecision(inicial);
      setMotivoMerma(venta ? `Cancelación venta ${venta.folio || '#' + venta.id}` : '');
    }
  }, [open, productos, venta]);

  if (!venta) return null;

  const setAll = (accion: Accion) => {
    const next: Record<number, Accion> = {};
    for (const p of productos) next[p.productoId] = accion;
    setDecision(next);
  };

  const setOne = (productoId: number, accion: Accion) => {
    setDecision((prev) => ({ ...prev, [productoId]: accion }));
  };

  const handleConfirm = () => {
    const insumosDecision = productos.map((p) => ({
      productoId: p.productoId,
      accion: decision[p.productoId] ?? 'revertir',
    }));
    onConfirm({ insumosDecision, motivoMerma });
  };

  const hasMerma = Object.values(decision).some((a) => a === 'merma');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon name="block" size={20} className="text-red-400" /> Cancelar venta — Tratamiento de insumos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            La venta <span className="text-white font-semibold">#{venta.id}</span> de{' '}
            <span className="text-white font-semibold">{venta.clientes?.nombre || 'Público General'}</span>{' '}
            por <span className="text-[#2e9e9b] font-mono">{money(Number(venta.total))}</span> tiene{' '}
            {productos.length === 1 ? '1 producto con insumos' : `${productos.length} productos con insumos`}.
            Elige qué hacer con cada insumo.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-background rounded-md border border-border px-3 py-2">
            <span className="text-sm text-muted-foreground">Aplicar a todos:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAll('revertir')}
                className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors bg-[#2e9e9b]/20 text-[#2e9e9b] border border-[#2e9e9b]/50 hover:bg-[#2e9e9b]/30"
              >
                <Icon name="undo" size={12} /> Revertir
              </button>
              <button
                type="button"
                onClick={() => setAll('merma')}
                className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
              >
                <Icon name="delete" size={12} /> Merma
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
            {productos.map((p) => {
              const accion = decision[p.productoId] ?? 'revertir';
              return (
                <div key={p.productoId} className="bg-background rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.insumos.length} {p.insumos.length === 1 ? 'insumo' : 'insumos'}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setOne(p.productoId, 'revertir')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                          accion === 'revertir'
                            ? 'bg-[#2e9e9b]/20 text-[#2e9e9b] border border-[#2e9e9b]/50'
                            : 'bg-background border border-border text-muted-foreground hover:text-white'
                        }`}
                      >
                        <Icon name="undo" size={12} /> Revertir
                      </button>
                      <button
                        type="button"
                        onClick={() => setOne(p.productoId, 'merma')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                          accion === 'merma'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-background border border-border text-muted-foreground hover:text-white'
                        }`}
                      >
                        <Icon name="delete" size={12} /> Merma
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {p.insumos.map((ins) => (
                      <li key={ins.insumoId} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate flex items-center gap-1.5">
                          <Icon name="inventory" size={12} /> {ins.nombre}
                        </span>
                        <span className="font-mono text-white">{Number(ins.cantidad).toFixed(2)} {ins.unidad}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {hasMerma && (
            <div>
              <label htmlFor="motivo-merma" className="text-sm font-medium block mb-1.5">
                Motivo de la merma
              </label>
              <Input
                id="motivo-merma"
                value={motivoMerma}
                onChange={(e) => setMotivoMerma(e.target.value)}
                maxLength={255}
                placeholder="Describe brevemente el motivo..."
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se registrará como motivo en la fila de merma correspondiente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isCanceling}>
            Volver
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCanceling || (hasMerma && motivoMerma.trim().length === 0)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {isCanceling ? (
              <Icon name="progress_activity" size={16} className="animate-spin mr-1" />
            ) : (
              <Icon name="check" size={16} className="mr-1" />
            )}
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

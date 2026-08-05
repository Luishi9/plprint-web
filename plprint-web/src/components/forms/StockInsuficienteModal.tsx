import { m, AnimatePresence } from "framer-motion";
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export interface Faltante {
  insumo: string;
  requerido: number;
  disponible: number;
  deficit: number;
}

interface StockInsuficienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoNombre: string;
  cantidadSolicitada: number;
  faltantes: Faltante[];
  onContinuar?: () => void;
  onCancelar?: () => void;
}

export default function StockInsuficienteModal({
  open, onOpenChange, productoNombre, cantidadSolicitada, faltantes, onContinuar, onCancelar,
}: StockInsuficienteModalProps) {
  const handleCancelar = () => {
    onCancelar?.();
    onOpenChange(false);
  };

  const handleContinuar = () => {
    onContinuar?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancelar(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/40 flex items-center justify-center shrink-0">
              <Icon name="warning" size={20} className="text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">Stock insuficiente</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                No hay insumos suficientes para producir este producto.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3">
          <div className="bg-background/50 border border-border rounded-md p-3 flex items-center gap-2">
            <Icon name="inventory" size={16} className="text-[#2e9e9b] shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{productoNombre}</div>
              <div className="text-xs text-muted-foreground">Cantidad solicitada: <span className="font-mono font-bold text-foreground">{cantidadSolicitada}</span></div>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Faltantes</p>
            <div className="space-y-1.5">
              <AnimatePresence>
                {faltantes.map((f, i) => (
                  <m.div
                    key={`${f.insumo}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{f.insumo}</span>
                      <span className="text-[10px] text-orange-400 font-mono font-bold">
                        -{f.deficit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                      <span>Requerido: <span className="text-foreground">{f.requerido.toFixed(2)}</span></span>
                      <span>Disponible: <span className="text-orange-400 font-bold">{f.disponible.toFixed(2)}</span></span>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground bg-background/30 border border-border rounded p-2">
            <strong className="text-foreground">Sugerencia:</strong> registra una compra de los insumos faltantes para reponer el stock, o revisa las cantidades requeridas en la receta del producto.
          </div>
        </div>

        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={handleCancelar}>
            <Icon name="close" size={14} className="mr-1" /> Cancelar
          </Button>
          {onContinuar && (
            <Button
              onClick={handleContinuar}
              variant="outline"
              className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
            >
              <Icon name="check" size={14} className="mr-1" /> Agregar de todos modos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

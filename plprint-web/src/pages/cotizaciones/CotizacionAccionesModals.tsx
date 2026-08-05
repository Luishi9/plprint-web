import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface CotizacionAccionesModalsProps {
  convertirItem: { id: number; folio?: string } | null;
  isConverting: boolean;
  onCloseConvertir: () => void;
  onConfirmConvertir: () => void;

  cancelarItem: { id: number; folio?: string } | null;
  isCanceling: boolean;
  onCloseCancelar: () => void;
  onConfirmCancelar: () => void;
}

export function CotizacionAccionesModals({
  convertirItem, isConverting, onCloseConvertir, onConfirmConvertir,
  cancelarItem, isCanceling, onCloseCancelar, onConfirmCancelar,
}: CotizacionAccionesModalsProps) {
  return (
    <>
      <Dialog open={!!convertirItem} onOpenChange={(v) => { if (!v) onCloseConvertir(); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="send" size={20} className="text-[#2e9e9b]" /> ¿Convertir a venta?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se convertirá la cotización <span className="text-white font-semibold">{convertirItem?.folio}</span>{' '}
              en una venta. Se respetarán los precios originales y se descontará el inventario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={onCloseConvertir} disabled={isConverting}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirmConvertir}
              disabled={isConverting}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isConverting ? <Icon name="hourglass_top" size={16} className="animate-spin mr-1" /> : <Icon name="check" size={16} className="mr-1" />}
              Convertir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelarItem} onOpenChange={(v) => { if (!v) onCloseCancelar(); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="block" size={20} className="text-red-400" /> ¿Cancelar cotización?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se cancelará <span className="text-white font-semibold">{cancelarItem?.folio}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={onCloseCancelar} disabled={isCanceling}>
              Volver
            </Button>
            <Button
              onClick={onConfirmCancelar}
              disabled={isCanceling}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isCanceling ? <Icon name="hourglass_top" size={16} className="animate-spin mr-1" /> : <Icon name="check" size={16} className="mr-1" />}
              Sí, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

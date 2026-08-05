import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface VentaCancelarModalProps {
  open: boolean;
  venta: { id: number; total: number; clientes?: { nombre: string } | null } | null;
  isCanceling: boolean;
  money: (v: number | string) => string;
  onClose: () => void;
  onConfirm: () => void;
}

export function VentaCancelarModal({ open, venta, isCanceling, money, onClose, onConfirm }: VentaCancelarModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon name="block" size={20} className="text-red-400" /> ¿Cancelar venta?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se cancelará la venta <span className="text-white font-semibold">#{venta?.id}</span> de{' '}
            <span className="text-white font-semibold">{venta?.clientes?.nombre || 'Público General'}</span>{' '}
            por <span className="text-[#2e9e9b] font-mono">{venta ? money(Number(venta.total)) : ''}</span>.
            Esta acción se registrará en la bitácora.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isCanceling}>
            Volver
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isCanceling}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {isCanceling ? <Icon name="progress_activity" size={16} className="animate-spin mr-1" /> : <Icon name="check" size={16} className="mr-1" />}
            Sí, cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

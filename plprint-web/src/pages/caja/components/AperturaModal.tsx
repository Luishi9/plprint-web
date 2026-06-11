import { useState } from 'react';
import { Loader2, Check, X, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMoney } from '@/hooks/useMoney';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (montoInicial: number) => Promise<void>;
}

export default function AperturaModal({ open, onClose, onConfirm }: Props) {
  const { simbolo } = useMoney();
  const [monto, setMonto] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const val = Number(monto);
    if (val < 0) { setError('El monto no puede ser negativo.'); return; }
    try {
      setIsSaving(true);
      setError('');
      await onConfirm(val);
      setMonto('0');
      onClose();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al aperturar caja.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Wallet size={22} /> Apertura de Caja
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ingresa el monto de efectivo con el que se apertura la caja.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium block mb-1.5">Monto inicial ({simbolo})</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="bg-background text-lg font-bold"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X size={14} className="mr-1" /> Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
            {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
            Iniciar Caja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

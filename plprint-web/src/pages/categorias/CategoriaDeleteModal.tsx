import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { Categoria } from '@/api/categorias.api';

interface CategoriaDeleteModalProps {
  item: Categoria | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CategoriaDeleteModal({ item, isDeleting, onClose, onConfirm }: CategoriaDeleteModalProps) {
  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">¿Eliminar categoría?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se eliminará <span className="text-white font-semibold">{item?.nombre}</span>.
            Los productos asignados quedarán sin categoría.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {isDeleting ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="delete" size={16} className="mr-1" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

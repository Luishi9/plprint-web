import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';

interface FormFooterProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function FormFooter({ isEditing, isSubmitting, onCancel }: FormFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-border">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)]">
        {isSubmitting ? (
          <>
            <Icon name="progress_activity" className="mr-2 animate-spin" size={16} />
            Guardando...
          </>
        ) : (
          isEditing ? 'Guardar Cambios' : 'Guardar Producto'
        )}
      </Button>
    </div>
  );
}

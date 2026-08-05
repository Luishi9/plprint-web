import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import type { UseFormReturn } from 'react-hook-form';
import { ImageUploader } from './ImageUploader';

interface ImageExtrasSectionProps {
  form: UseFormReturn<any>;
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export function ImageExtrasSection({
  form, imagePreview, fileInputRef, onImageChange, onRemoveImage,
}: ImageExtrasSectionProps) {
  return (
    <div className="space-y-4 flex flex-col">
      <div className="space-y-3">
        <FormLabel>Caracteristicas</FormLabel>
        <p className="text-sm text-muted-foreground">
          Sección para agregar otras características del producto.
        </p>
      </div>

      <FormField
        control={form.control}
        name="descripcion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detalles sobre el producto..."
                className="resize-none bg-background h-24"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageUploader
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        onImageChange={onImageChange}
        onRemove={onRemoveImage}
      />
    </div>
  );
}

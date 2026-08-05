import { Icon } from '@/components/ui/Icon';

interface ImageUploaderProps {
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function ImageUploader({ imagePreview, fileInputRef, onImageChange, onRemove }: ImageUploaderProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-sm font-medium mb-2">Fotografía (Opcional)</div>
      <div className="flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-background/50 hover:bg-background transition-colors min-h-[160px]">
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              aria-label="Quitar imagen"
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
            >
              <Icon name="close" size={16} />
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-white transition-colors">
            <Icon name="upload" size={28} className="mb-2 opacity-50" />
            <span className="text-sm font-medium">Subir imagen</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

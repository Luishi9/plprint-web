import { Checkbox, Label } from 'flowbite-react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';

interface ExistenciasSectionProps {
  tieneExistencias: boolean;
  setTieneExistencias: (v: boolean) => void;
  form: any;
  isEditing: boolean;
}

export function ExistenciasSection({
  tieneExistencias, setTieneExistencias, form, isEditing,
}: ExistenciasSectionProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="tiene_existencias"
          checked={tieneExistencias}
          onChange={(e) => {
            setTieneExistencias(e.target.checked);
            if (!e.target.checked) {
              form.setValue('cantidadInicial', undefined);
              form.setValue('stockMinimo', undefined);
            }
          }}
          className="w-4 h-4 accent-[#2e9e9b] cursor-pointer"
        />
        <Label
          htmlFor="tiene_existencias"
          className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-pointer select-none"
        >
          <Icon name="inventory_2" size={14} className="text-[#2e9e9b]" />
          {isEditing ? 'Registrar movimiento de stock' : 'Este producto tiene existencias (inventario)'}
        </Label>
      </div>

      {tieneExistencias && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <FormField
            control={form.control}
            name="cantidadInicial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEditing ? 'Cantidad a añadir *' : 'Cantidad inicial *'}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                    className="bg-background font-mono border-[#2e9e9b]/50 focus-visible:ring-[#2e9e9b]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockMinimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock mínimo *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ej. 5"
                    {...field}
                    value={field.value ?? ''}
                    className="bg-background font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}

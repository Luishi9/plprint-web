import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from 'flowbite-react';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import type { Categoria } from '@/api/categorias.api';
import type { Maquina } from '@/api/maquinas.api';
import type { UnidadMedida } from '@/api/unidadesMedida.api';
import { PreciosVolumenSection, PrecioNivelState } from './PreciosVolumenSection';
import type { NivelPrecio } from '@/api/preciosProducto.api';

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
  categorias: Categoria[];
  maquinas: Maquina[];
  unidadesMedida: UnidadMedida[];
  preciosVolumen: Record<NivelPrecio, PrecioNivelState>;
  esCentroImpresion: boolean;
  isEditing: boolean;
  onPreciosChange: (nivel: NivelPrecio, field: 'cantidad_minima' | 'precio', value: string) => void;
}

export function BasicInfoSection({
  form, categorias, maquinas, unidadesMedida, preciosVolumen,
  esCentroImpresion, isEditing,
  onPreciosChange,
}: BasicInfoSectionProps) {
  const categoriaSeleccionada = categorias.find((c) => c.id === form.watch('categoriaId'));

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del producto *</FormLabel>
            <FormControl>
              <Input placeholder="Ej. Zapatillas Galácticas" {...field} className="bg-background" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Código
                {!isEditing && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                    Autogenerado
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Autogenerado"
                  readOnly
                  className="bg-background text-muted-foreground cursor-not-allowed"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoriaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={(val) => {
                  const newCategoriaId = val === 'none' ? undefined : Number(val);
                  field.onChange(newCategoriaId);
                  const categoriaImp = categorias.find((c) => c.id === newCategoriaId);
                  if (categoriaImp?.tipo !== 'impresion') {
                    form.setValue('maquinaId', undefined);
                  }
                }}
                value={field.value ? String(field.value) : 'none'}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border border-border text-foreground z-[200]">
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {esCentroImpresion && categoriaSeleccionada?.tipo === 'impresion' && (
        <FormField
          control={form.control}
          name="maquinaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Icon name="print" size={14} className="text-purple-400" />
                Impresora vinculada
              </FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val === 'none' ? undefined : Number(val))}
                value={field.value ? String(field.value) : 'none'}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecciona una impresora" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border border-border text-foreground z-[200]">
                  <SelectItem value="none">Sin impresora</SelectItem>
                  {maquinas.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.nombre} ({m.tipo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Las impresiones de este producto se contabilizarán en esta máquina.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="precioVenta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Venta *</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} className="bg-background font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="precioCompra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Compra</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} value={field.value ?? ''} className="bg-background font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <PreciosVolumenSection
        preciosVolumen={preciosVolumen}
        onChange={onPreciosChange}
      />

      <FormField
        control={form.control}
        name="unidadMedida"
        render={({ field }) => {
          const unidadSeleccionada = unidadesMedida.find((u) => u.abreviatura === field.value);
          const esMedida = unidadSeleccionada?.es_medida;
          const tipoMedida = unidadSeleccionada?.tipo_medida;
          return (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Unidad de medida
                {esMedida && tipoMedida && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e9e9b]/15 text-[#48b9b4] font-semibold">
                    {tipoMedida === 'm2' ? 'por m²' : 'por ml'}
                  </span>
                )}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border border-border text-foreground z-[200]">
                  {unidadesMedida.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Sin unidades. Crea desde Configuración → Unidades de medida.
                    </div>
                  ) : (
                    unidadesMedida.map((u) => (
                      <SelectItem key={u.id} value={u.abreviatura}>
                        {u.nombre} ({u.abreviatura})
                        {u.es_medida && u.tipo_medida ? ` — ${u.tipo_medida === 'm2' ? 'm²' : 'ml'}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {esMedida && (
                <p className="text-muted-foreground text-sm font-medium text-foreground text-[#2e9e9b]">
                  El precio de venta se cobrará por {tipoMedida === 'm2' ? 'metro cuadrado' : 'metro lineal'}. El cliente indicará ancho/alto al vender.
                </p>
              )}
              {esMedida && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="cobrar_minimo_1"
                      checked={form.watch('cobrarMinimo1') ?? false}
                      onChange={(e) => form.setValue('cobrarMinimo1', e.target.checked)}
                    />
                    <Label htmlFor="cobrar_minimo_1" className="flex items-center gap-1.5 cursor-pointer">
                      <Icon name="straighten" size={14} className="text-[#2e9e9b]" />
                      Cobrar mínimo 1 metro de largo
                    </Label>
                  </div>
                  <span className="block text-[11px] text-muted-foreground pl-7">
                    Si el largo es menor a 1m, se cobrará como 1m
                  </span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}

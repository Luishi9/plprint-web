import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@/components/ui/Icon';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sileo } from 'sileo';

import { insumosApi } from '@/api/insumos.api';
import { unidadesMedidaApi, UnidadMedida } from '@/api/unidadesMedida.api';
import { Insumo } from '@/types/insumo.types';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  codigo: z.string().optional(),
  unidadMedida: z.string().default('unidad'),
  anchoRollo: z.coerce.number().optional(),
  precioCompra: z.preprocess((val) => val ? Number(val) : undefined, z.number().positive().optional()),
  descripcion: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InsumoFormModalProps {
  open: boolean;
  insumo: Insumo | null;
  onClose: () => void;
  onSaved: () => void;
}

export function InsumoFormModal({ open, insumo, onClose, onSaved }: InsumoFormModalProps) {
  const isEditing = !!insumo;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);

  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;

  useEffect(() => {
    unidadesMedidaApi.getAll()
      .then((res) => setUnidades((res.data?.data as UnidadMedida[]) || []))
      .catch(() => { });
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      unidadMedida: 'unidad',
      anchoRollo: undefined,
      precioCompra: undefined,
      descripcion: '',
    },
  });

  const selectedUnidad = unidades.find((u) => u.abreviatura === form.watch('unidadMedida'));
  const esM2 = selectedUnidad?.es_medida && selectedUnidad?.tipo_medida === 'm2';

  useEffect(() => {
    if (open && unidades.length > 0) {
      if (insumo) {
        form.reset({
          nombre: insumo.nombre,
          codigo: insumo.codigo || '',
          unidadMedida: insumo.unidad_medida,
          anchoRollo: insumo.ancho_rollo ? parseFloat(insumo.ancho_rollo) : undefined,
          precioCompra: insumo.precio_compra ? parseFloat(insumo.precio_compra) : undefined,
          descripcion: insumo.descripcion || '',
        });
      } else {
        form.reset({
          nombre: '',
          codigo: '',
          unidadMedida: 'unidad',
          anchoRollo: undefined,
          precioCompra: undefined,
          descripcion: '',
        });
      }
    }
  }, [open, insumo, form, unidades]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, sucursalId: insumo?.sucursal_id ?? sucursalEfectiva?.id };
      if (isEditing && insumo) {
        await insumosApi.update(insumo.id, data);
      } else {
        await insumosApi.create(payload);
      }
      onSaved();
    } catch (error) {
      console.error('Error al guardar insumo:', error);
      sileo.error({ title: 'No se pudo guardar el insumo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#2e9e9b] flex items-center gap-2">
            <Icon name="inventory" size={24} />
            {isEditing ? 'Editar insumo' : 'Nuevo insumo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza la información del insumo.' : 'Completa la información para registrar un nuevo insumo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Papel bond"
                      className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
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
                    <FormLabel className="text-foreground/80">Código</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Se genera automáticamente"
                        className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
                        readOnly
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Déjalo vacío para generar uno a partir del nombre (ej. PAPE-0001)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Unidad de medida *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-border text-foreground">
                          <SelectValue placeholder="Selecciona una unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border text-foreground z-[200]">
                        {unidades.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            Sin unidades. Crea desde Configuración → Unidades de medida.
                          </div>
                        ) : (
                          unidades.map((u) => (
                            <SelectItem key={u.id} value={u.abreviatura}>
                              {u.nombre} ({u.abreviatura})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="anchoRollo"
              render={({ field }) => (
                <FormItem className={!esM2 ? 'hidden' : ''}>
                  <FormLabel className="text-foreground/80">Ancho del rollo (m)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Ej: 1.20"
                      className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ancho fijo del rollo. Se usará para calcular el consumo: ancho × largo.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="precioCompra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Precio de compra</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción opcional del insumo..."
                      className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
              >
                {isSubmitting && <Icon name="progress_activity" size={14} className="animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear insumo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, SlidersHorizontal, TrendingUp, TrendingDown } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { insumosApi } from '@/api/insumos.api';
import { Insumo } from '@/types/insumo.types';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';

const formSchema = z.object({
  tipo: z.enum(['entrada', 'salida']),
  cantidad: z.preprocess((val) => Number(val), z.number().positive('Debe ser mayor a 0')),
});

type FormValues = z.infer<typeof formSchema>;

interface AjusteInsumoModalProps {
  open: boolean;
  insumo: Insumo | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AjusteInsumoModal({ open, insumo, onClose, onSaved }: AjusteInsumoModalProps) {
  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: 'entrada',
      cantidad: 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        tipo: 'entrada',
        cantidad: 0,
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FormValues) => {
    if (!insumo || !sucursalEfectiva) return;

    setIsSubmitting(true);
    try {
      await insumosApi.ajustarStock({
        insumoId: insumo.id,
        sucursalId: sucursalEfectiva.id,
        cantidad: data.cantidad,
        tipo: data.tipo,
      });
      onSaved();
    } catch (error: any) {
      console.error('Error al ajustar stock:', error);
      alert(error?.response?.data?.message || 'No se pudo ajustar el stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!insumo) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2e9e9b] flex items-center gap-2">
            <SlidersHorizontal size={20} />
            Ajuste de Inventario
          </DialogTitle>
          <DialogDescription>
            Ajustar stock de <strong className="text-white">{insumo.nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Tipo de movimiento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-border text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="entrada">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-[#2e9e9b]" />
                          Entrada (agregar stock)
                        </div>
                      </SelectItem>
                      <SelectItem value="salida">
                        <div className="flex items-center gap-2">
                          <TrendingDown size={14} className="text-red-400" />
                          Salida (retirar stock)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cantidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0"
                      className="bg-white/5 border-border text-white placeholder:text-muted-foreground"
                      {...field}
                      value={field.value || ''}
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
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Ajustar stock
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

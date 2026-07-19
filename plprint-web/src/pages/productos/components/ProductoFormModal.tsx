import { useState, useRef, useEffect } from 'react';
import { Checkbox, Label } from 'flowbite-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { productosApi } from '@/api/productos.api';
import { inventarioApi } from '@/api/inventario.api';
import { insumosApi } from '@/api/insumos.api';
import { preciosProductoApi, NIVELES_LABEL, NivelPrecio } from '@/api/preciosProducto.api';
import { unidadesMedidaApi, UnidadMedida } from '@/api/unidadesMedida.api';
import { maquinasApi, Maquina } from '@/api/maquinas.api';
import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { Producto } from '@/types/producto.types';
import { Insumo } from '@/types/insumo.types';
import { categoriasApi, Categoria } from '@/api/categorias.api';
import { useCentroImpresion } from '@/hooks/useCentroImpresion';
import { sileo } from 'sileo';
import { getImageUrl } from '@/utils/format';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  codigo: z.string().optional(),
  categoriaId: z.preprocess((val) => val ? Number(val) : undefined, z.number().int().positive().optional()),
  precioVenta: z.preprocess((val) => Number(val), z.number().positive('Debe ser mayor a 0')),
  precioCompra: z.preprocess((val) => val ? Number(val) : undefined, z.number().positive().optional()),
  unidadMedida: z.string().default('unidad'),
  descripcion: z.string().optional(),
  cantidadInicial: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(0).optional()),
  stockMinimo: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(0).optional()),
  cobrarMinimo1: z.boolean().optional(),
  maquinaId: z.preprocess((val) => val ? Number(val) : undefined, z.number().int().positive().optional().nullable()),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  producto?: Producto | null;
}

export function ProductoFormModal({ open, onOpenChange, onSuccess, producto }: ProductoFormModalProps) {
  const { sucursalActiva } = useSucursalStore();
  const { usuario } = useAuthStore();
  const { esCentroImpresion } = useCentroImpresion();
  const isEditing = !!producto;
  // Fallback: si no hay sucursal activa en el store, usar la primera del usuario
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [tieneExistencias, setTieneExistencias] = useState(false);
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<Array<{ insumoId: number; cantidadRequerida: number; insumo: Insumo }>>([]);
  const [insumoBusqueda, setInsumoBusqueda] = useState('');
  const [showInsumosDropdown, setShowInsumosDropdown] = useState(false);
  type PrecioNivelState = { id: number | null; cantidad_minima: string; precio: string };
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [preciosVolumen, setPreciosVolumen] = useState<Record<NivelPrecio, PrecioNivelState>>({
    medio_mayoreo: { id: null, cantidad_minima: '', precio: '' },
    mayoreo: { id: null, cantidad_minima: '', precio: '' },
    super_mayoreo: { id: null, cantidad_minima: '', precio: '' },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías y máquinas al montar
  useEffect(() => {
    categoriasApi.getAll().then((res) => setCategorias(res.data?.data || [])).catch(() => { });
    insumosApi.getAll({ limit: 1000 }).then((res) => setInsumosDisponibles(res.data?.data || [])).catch(() => { });
    maquinasApi.getAll({ activo: true }).then((res) => setMaquinas(res.data?.data || [])).catch(() => { });
  }, []);

  // Cargar insumos del producto cuando se edita
  useEffect(() => {
    if (open && producto) {
      productosApi.getInsumos(producto.id).then((res) => {
        const insumosData = res.data?.data || [];
        setInsumosSeleccionados(
          insumosData.map((pi: any) => ({
            insumoId: pi.insumo_id,
            cantidadRequerida: parseFloat(pi.cantidad_requerida),
            insumo: pi.insumos,
          }))
        );
      }).catch(() => { });
    } else if (open && !producto) {
      setInsumosSeleccionados([]);
    }
  }, [open, producto]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      categoriaId: undefined,
      precioVenta: 0,
      precioCompra: undefined,
      unidadMedida: 'unidad',
      descripcion: '',
      cantidadInicial: undefined,
      stockMinimo: undefined,
      cobrarMinimo1: false,
      maquinaId: undefined,
    },
  });

  // Cargar categorías al montar
  useEffect(() => {
    categoriasApi.getAll().then((res) => setCategorias(res.data?.data || [])).catch(() => { });
  }, []);

  // Cargar unidades de medida al montar
  useEffect(() => {
    unidadesMedidaApi.getAll()
      .then((res) => setUnidadesMedida((res.data?.data as UnidadMedida[]) || []))
      .catch(() => { });
  }, []);

  // Rellenar formulario cuando se edita
  useEffect(() => {
    if (open && producto) {
      form.reset({
        nombre: producto.nombre,
        codigo: producto.codigo ?? '',
        categoriaId: producto.categoria_id ?? undefined,
        precioVenta: Number(producto.precio_venta),
        precioCompra: producto.precio_compra ? Number(producto.precio_compra) : undefined,
        unidadMedida: producto.unidad_medida ?? 'unidad',
        descripcion: producto.descripcion ?? '',
        cantidadInicial: undefined,
        stockMinimo: undefined,
        cobrarMinimo1: producto.cobrar_minimo_1 ?? false,
        maquinaId: producto.maquina_id ?? undefined,
      });
      setTieneExistencias(false);
      setImagePreview(getImageUrl(producto.imagen_url) ?? null);
      setSelectedFile(null);
      cargarPreciosVolumen(producto.id);
    } else if (open && !producto) {
      form.reset({ nombre: '', codigo: '', categoriaId: undefined, precioVenta: 0, precioCompra: undefined, unidadMedida: 'unidad', descripcion: '', cantidadInicial: undefined, stockMinimo: undefined, cobrarMinimo1: false, maquinaId: undefined });
      setTieneExistencias(false);
      setImagePreview(null);
      setSelectedFile(null);
      setPreciosVolumen({
        medio_mayoreo: { id: null, cantidad_minima: '', precio: '' },
        mayoreo: { id: null, cantidad_minima: '', precio: '' },
        super_mayoreo: { id: null, cantidad_minima: '', precio: '' },
      });
    }
  }, [open, producto]);

  const cargarPreciosVolumen = async (productoId: number) => {
    try {
      const res = await preciosProductoApi.getByProducto(productoId);
      const items = (res.data?.data || []) as Array<{ id: number; nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
      const reset: Record<NivelPrecio, PrecioNivelState> = {
        medio_mayoreo: { id: null, cantidad_minima: '', precio: '' },
        mayoreo: { id: null, cantidad_minima: '', precio: '' },
        super_mayoreo: { id: null, cantidad_minima: '', precio: '' },
      };
      items.forEach((it) => {
        if (it.nivel in reset) {
          reset[it.nivel as NivelPrecio] = {
            id: it.id,
            cantidad_minima: String(it.cantidad_minima),
            precio: String(it.precio),
          };
        }
      });
      setPreciosVolumen(reset);
    } catch (e) {
      console.error('Error cargando precios por volumen', e);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const agregarInsumo = (insumoId: number) => {
    const insumo = insumosDisponibles.find(i => i.id === insumoId);
    if (!insumo) return;
    if (insumosSeleccionados.some(i => i.insumoId === insumoId)) return;

    setInsumosSeleccionados([
      ...insumosSeleccionados,
      { insumoId, cantidadRequerida: 1, insumo }
    ]);
    setInsumoBusqueda('');
  };

  const quitarInsumo = (insumoId: number) => {
    setInsumosSeleccionados(insumosSeleccionados.filter(i => i.insumoId !== insumoId));
  };

  const cambiarCantidadInsumo = (insumoId: number, cantidad: number) => {
    setInsumosSeleccionados(
      insumosSeleccionados.map(i =>
        i.insumoId === insumoId ? { ...i, cantidadRequerida: cantidad } : i
      )
    );
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append('nombre', values.nombre);
      formData.append('precioVenta', values.precioVenta.toString());
      if (isEditing && values.codigo) formData.append('codigo', values.codigo);
      if (values.categoriaId) formData.append('categoriaId', values.categoriaId.toString());
      if (values.precioCompra !== undefined && values.precioCompra !== null) {
        formData.append('precioCompra', values.precioCompra.toString());
      }
      if (values.unidadMedida) formData.append('unidadMedida', values.unidadMedida);
      formData.append('cobrarMinimo1', values.cobrarMinimo1 ? 'true' : 'false');
      if (values.descripcion) formData.append('descripcion', values.descripcion);

      // Incluir maquinaId si la categoría es de tipo impresión
      const categoriaSeleccionada = categorias.find(c => c.id === values.categoriaId);
      if (categoriaSeleccionada?.tipo === 'impresion' && values.maquinaId) {
        formData.append('maquinaId', values.maquinaId.toString());
      }

      // Siempre enviar sucursalId al crear para asignar el producto a la sucursal activa
      if (!isEditing && sucursalEfectiva) {
        formData.append('sucursalId', sucursalEfectiva.id.toString());
      }

      if (!isEditing && tieneExistencias && values.cantidadInicial && values.cantidadInicial > 0 && sucursalEfectiva) {
        formData.append('cantidadInicial', values.cantidadInicial.toString());
        if (values.stockMinimo !== undefined && values.stockMinimo >= 0) {
          formData.append('stockMinimo', values.stockMinimo.toString());
        }
      }

      if (isEditing && tieneExistencias && values.cantidadInicial && values.cantidadInicial > 0 && sucursalEfectiva && producto) {
        await inventarioApi.ajustar({
          productoId: producto.id,
          sucursalId: sucursalEfectiva.id,
          tipo: 'entrada',
          cantidad: values.cantidadInicial,
          notas: 'Entrada manual desde edición de producto',
        });
      }

      if (selectedFile) {
        formData.append('imagen', selectedFile);
      }

      // Agregar insumos si hay
      if (insumosSeleccionados.length > 0) {
        formData.append('insumos', JSON.stringify(
          insumosSeleccionados.map(i => ({
            insumoId: i.insumoId,
            cantidadRequerida: i.cantidadRequerida,
          }))
        ));
      }

      let productoId: number | null = producto?.id ?? null;
      if (isEditing && producto) {
        await productosApi.update(producto.id, formData as any);
      } else {
        const res = await productosApi.create(formData as any);
        productoId = (res.data as { data?: { id: number } })?.data?.id ?? null;
      }

      if (productoId) {
        await sincronizarPreciosVolumen(productoId);
      }

      // Cleanup & Close
      form.reset();
      removeImage();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el producto', error);
      sileo.error({ title: 'Hubo un error al guardar el producto.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sincronizarPreciosVolumen = async (productoId: number) => {
    const niveles: NivelPrecio[] = ['medio_mayoreo', 'mayoreo', 'super_mayoreo'];
    for (const nivel of niveles) {
      const actual = preciosVolumen[nivel];
      const tieneCantidad = actual.cantidad_minima.trim() !== '';
      const tienePrecio = actual.precio.trim() !== '';
      const completo = tieneCantidad && tienePrecio;
      try {
        if (completo && actual.id) {
          await preciosProductoApi.update(productoId, actual.id, {
            cantidad_minima: Number(actual.cantidad_minima),
            precio: Number(actual.precio),
          });
        } else if (completo && !actual.id) {
          await preciosProductoApi.create(productoId, {
            nivel,
            cantidad_minima: Number(actual.cantidad_minima),
            precio: Number(actual.precio),
          });
        } else if (!completo && actual.id) {
          await preciosProductoApi.remove(productoId, actual.id);
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        const msg = err.response?.data?.message || `Error al guardar precio ${nivel}`;
        console.error(msg, e);
        sileo.error({ title: msg });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        {/* <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border"> */}

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#2e9e9b]">
            {isEditing ? 'Editar Producto' : 'Registrar Producto'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? 'Modifica la información del producto.' : 'Añade un nuevo ítem a tu catálogo global.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Col 1 - Datos principales */}
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
                            const newCategoriaId = val === 'none' ? undefined : Number(val); // Si es 'none', asignar undefined 
                            field.onChange(newCategoriaId); // Actualizar el valor del campo
                            // Si la nueva categoría no es de impresión, limpiar maquinaId
                            const categoriaImp = categorias.find(c => c.id === newCategoriaId);
                            console.log('Categoría seleccionada:', categoriaImp);
                            console.log('Tipo de categoría:', categoriaImp?.tipo);
                            if (categoriaImp?.tipo !== 'impresion') { // Si la categoría seleccionada no es de tipo impresión, limpiar el campo maquinaId
                              form.setValue('maquinaId', undefined); // Limpiar el campo maquinaId
                            }
                          }}
                          value={field.value ? String(field.value) : 'none'} // Si es undefined, mostrar 'none' como valor
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

                {/* Selector de máquina - solo visible si la categoría es de tipo impresión Y somos centro de impresión */}
                {(() => {
                  const categoriaSeleccionada = categorias.find(c => c.id === form.watch('categoriaId'));
                  if (esCentroImpresion && categoriaSeleccionada?.tipo === 'impresion') {
                    return (
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
                                  <SelectItem key={m.id} value={String(m.id)}>
                                    {m.nombre} ({m.tipo})
                                  </SelectItem>
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
                    );
                  }
                  return null;
                })()}

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

                <div className="rounded-lg border border-border bg-card/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="sell" size={14} className="text-[#2e9e9b]" />
                    <p className="text-sm font-medium text-foreground">Precios por volumen</p>
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Define desde qué cantidad se aplica cada precio. Déjalo vacío para no usar ese nivel.</p>
                  <div className="space-y-2">
                    {(Object.keys(preciosVolumen) as NivelPrecio[]).map((nivel) => (
                      <div key={nivel} className="grid grid-cols-[140px_1fr_1fr] gap-2 items-center">
                        <span className="text-xs text-muted-foreground">{NIVELES_LABEL[nivel]}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Desde</span>
                          <Input
                            type="number"
                            min="1"
                            placeholder="N"
                            value={preciosVolumen[nivel].cantidad_minima}
                            onChange={(e) => setPreciosVolumen((prev) => ({ ...prev, [nivel]: { ...prev[nivel], cantidad_minima: e.target.value } }))}
                            className="bg-background font-mono h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">u.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={preciosVolumen[nivel].precio}
                            onChange={(e) => setPreciosVolumen((prev) => ({ ...prev, [nivel]: { ...prev[nivel], precio: e.target.value } }))}
                            className="bg-background font-mono h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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

                {/* ── Existencias ── */}



              </div>

              {/* Col 2 - Imagen y Extras */}
              <div className="space-y-4 flex flex-col">

                <div className='space-y-3 '>
                  <FormLabel>Caracteristicas</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Sección para agregar otras características del producto.
                  </p>

                </div>

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

                    <Label htmlFor="tiene_existencias" className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-pointer select-none">
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
                            <FormLabel>Stock mínimo</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
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

                {/* ── Insumos requeridos ── */}
                <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="inventory" size={14} className="text-[#2e9e9b]" />
                    <span className="text-sm font-medium text-foreground">
                      Insumos requeridos
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Insumos que se descuentan automáticamente al vender este producto
                  </p>

                  {/* Lista de insumos seleccionados */}
                  {insumosSeleccionados.length > 0 && (
                    <div className="space-y-2">
                      {insumosSeleccionados.map(({ insumoId, cantidadRequerida, insumo }) => (
                        <div
                          key={insumoId}
                          className="flex items-center gap-2 bg-background rounded-md p-2 border border-border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {insumo.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {insumo.codigo || 'Sin código'} • {insumo.unidad_medida}
                              {insumo.ancho_rollo && (
                                <span className="ml-1 text-[#2e9e9b]">• rollo {insumo.ancho_rollo}m</span>
                              )}
                            </p>
                          </div>
                          <Input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={cantidadRequerida}
                            onChange={(e) => cambiarCantidadInsumo(insumoId, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-background font-mono text-sm"
                          />
                          <span className="text-xs text-muted-foreground w-12">
                            {insumo.unidad_medida}
                          </span>
                          <button
                            type="button"
                            onClick={() => quitarInsumo(insumoId)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Icon name="delete" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selector de insumos */}
                  <div className="relative">
                    <label className="text-sm font-medium block mb-1.5 text-muted-foreground">
                      Agregar insumo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar insumo..."
                        value={insumoBusqueda}
                        onFocus={() => setShowInsumosDropdown(true)}
                        onBlur={() => setTimeout(() => setShowInsumosDropdown(false), 200)}
                        onChange={(e) => {
                          setInsumoBusqueda(e.target.value);
                          setShowInsumosDropdown(true);
                        }}
                        className="w-full bg-background border border-border rounded-md text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
                      />
                      <Icon
                        name="unfold_more"
                        size={16}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                    {showInsumosDropdown && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md max-h-48 overflow-y-auto shadow-lg">
                        {(() => {
                          const filtrados = insumosDisponibles
                            .filter(i => !insumosSeleccionados.some(s => s.insumoId === i.id))
                            .filter(i => !insumoBusqueda || i.nombre.toLowerCase().includes(insumoBusqueda.toLowerCase()) || i.codigo?.toLowerCase().includes(insumoBusqueda.toLowerCase()));
                          if (filtrados.length === 0) {
                            return (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                {insumoBusqueda ? 'Sin resultados' : 'No hay insumos disponibles'}
                              </div>
                            );
                          }
                          return filtrados.map((insumo) => (
                            <button
                              key={insumo.id}
                              type="button"
                              onMouseDown={() => {
                                agregarInsumo(insumo.id);
                                setInsumoBusqueda('');
                                setShowInsumosDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between text-popover-foreground"
                            >
                              <div className="flex items-center gap-2">
                                <Icon name="add" size={12} />
                                <span>{insumo.nombre}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {insumo.codigo || 'Sin código'}
                              </span>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
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

                <div className="flex-1 flex flex-col">
                  <FormLabel className="mb-2">Fotografía (Opcional)</FormLabel>
                  <div className="flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-background/50 hover:bg-background transition-colors min-h-[160px]">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeImage}
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
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Mensaje de Info Stock */}
            {tieneExistencias && form.watch('cantidadInicial') ? (
              <div className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/20 rounded-lg p-3 text-sm text-[#2e9e9b]">
                <p>
                  {isEditing
                    ? <>Se registrará una <strong>Entrada de {form.watch('cantidadInicial')}</strong> unidades en la sucursal <strong>{sucursalEfectiva?.nombre || 'actual'}</strong>.</>
                    : <>Se registrará una <strong>Entrada Inicial de {form.watch('cantidadInicial')}</strong> unidades en la sucursal <strong>{sucursalEfectiva?.nombre || 'actual'}</strong>.</>}
                  {form.watch('stockMinimo') ? ` Stock mínimo: ${form.watch('stockMinimo')} uds.` : ''}
                </p>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
          </form>
        </Form>

      </DialogContent>
    </Dialog >
  );
}
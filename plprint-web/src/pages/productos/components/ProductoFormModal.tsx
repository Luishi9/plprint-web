import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormLabel,
} from '@/components/ui/form';

import { productosApi } from '@/api/productos.api';
import { inventarioApi } from '@/api/inventario.api';
import { insumosApi } from '@/api/insumos.api';
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
import { ExistenciasSection } from './ExistenciasSection';
import { InsumosSelectorSection } from './InsumosSelectorSection';
import { BasicInfoSection } from './BasicInfoSection';
import { ImageExtrasSection } from './ImageExtrasSection';
import { StockInfoBanner } from './StockInfoBanner';
import { FormFooter } from './FormFooter';
import { usePreciosVolumen } from '../hooks/usePreciosVolumen';
import { useInsumos } from '../hooks/useInsumos';
import { useImageUpload } from '../hooks/useImageUpload';

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
  claveProdServ: z.string().max(20).optional().or(z.literal('')),
  claveUnidad: z.string().max(10).optional().or(z.literal('')),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [tieneExistencias, setTieneExistencias] = useState(false);
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);

  const {
    preciosVolumen, cargarPreciosVolumen, sincronizarPreciosVolumen,
    resetPreciosVolumen, handlePrecioChange,
  } = usePreciosVolumen();

  const {
    insumosSeleccionados, insumoBusqueda, showInsumosDropdown,
    setInsumoBusqueda, setShowInsumosDropdown, setInsumos,
    agregarInsumo, quitarInsumo, cambiarCantidadInsumo,
  } = useInsumos(insumosDisponibles);

  const {
    imagePreview, setImagePreview,
    selectedFile, setSelectedFile,
    fileInputRef,
    handleImageChange, removeImage,
  } = useImageUpload();

  // Cargar categorías y máquinas al montar
  useEffect(() => {
    categoriasApi.getAll().then((res) => setCategorias(res.data?.data || [])).catch(() => { });
    maquinasApi.getAll({ activo: true }).then((res) => setMaquinas(res.data?.data || [])).catch(() => { });
  }, []);

  // Cargar insumos del catálogo de la misma sucursal
  useEffect(() => {
    if (!sucursalEfectiva?.id) return;
    insumosApi.getAll({ limit: 1000, sucursalId: sucursalEfectiva.id })
      .then((res) => setInsumosDisponibles(res.data?.data || []))
      .catch(() => { });
  }, [sucursalEfectiva?.id]);

  useEffect(() => {
    if (!open) return;
    if (producto) {
      productosApi.getInsumos(producto.id).then((res) => {
        const insumosData = res.data?.data || [];
        setInsumos(
          insumosData.map((pi: any) => ({
            insumoId: pi.insumo_id,
            cantidadRequerida: parseFloat(pi.cantidad_requerida),
            insumo: pi.insumos,
          }))
        );
      }).catch(() => { });

      // Precargar inventario de la sucursal efectiva.
      const inv = producto.inventario?.find((i) => i.sucursal_id === sucursalEfectiva?.id)
        ?? producto.inventario?.[0];
      const cantidadInicial = inv ? Number(inv.cantidad) : undefined;
      const stockMinimo = inv ? Number(inv.stock_minimo) : undefined;
      const tieneInv = !!inv;
      setTieneExistencias(tieneInv);

      form.reset({
        nombre: producto.nombre,
        codigo: producto.codigo ?? '',
        categoriaId: producto.categoria_id ?? undefined,
        precioVenta: Number(producto.precio_venta),
        precioCompra: producto.precio_compra ? Number(producto.precio_compra) : undefined,
        unidadMedida: producto.unidad_medida ?? 'unidad',
        descripcion: producto.descripcion ?? '',
        cantidadInicial,
        stockMinimo,
        cobrarMinimo1: producto.cobrar_minimo_1 ?? false,
        maquinaId: producto.maquina_id ?? undefined,
        claveProdServ: producto.clave_prod_serv ?? '',
        claveUnidad: producto.clave_unidad ?? '',
      });
    } else {
      setInsumos([]);
      setTieneExistencias(false);
      form.reset({
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
        claveProdServ: '',
        claveUnidad: '',
      });
    }
  }, [open, producto?.id, sucursalEfectiva?.id]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: producto
      ? {
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
          claveProdServ: producto.clave_prod_serv ?? '',
          claveUnidad: producto.clave_unidad ?? '',
        }
      : {
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
          claveProdServ: '',
          claveUnidad: '',
        },
  });

  // Cargar unidades de medida al montar
  useEffect(() => {
    unidadesMedidaApi.getAll()
      .then((res) => setUnidadesMedida((res.data?.data as UnidadMedida[]) || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (producto) {
      setImagePreview(getImageUrl(producto.imagen_url) ?? null);
      setSelectedFile(null);
      cargarPreciosVolumen(producto.id);
    } else {
      setImagePreview(null);
      setSelectedFile(null);
      resetPreciosVolumen();
    }
  }, [producto?.id]);

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

      // Claves SAT (CFDI 4.0)
      if (values.claveProdServ) formData.append('claveProdServ', values.claveProdServ);
      if (values.claveUnidad) formData.append('claveUnidad', values.claveUnidad);

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
        if (values.stockMinimo !== undefined && values.stockMinimo >= 0) { // Permitir stockMinimo = 0 al crear
          formData.append('stockMinimo', values.stockMinimo.toString()); // stockMinimo es opcional al crear, pero si se proporciona, debe ser >= 0
        }
      }

      if (isEditing && tieneExistencias && sucursalEfectiva && producto) {
        const invActual = producto.inventario?.find((i) => i.sucursal_id === sucursalEfectiva.id)
          ?? producto.inventario?.[0];
        const cantidadActual = invActual ? Number(invActual.cantidad) : 0;
        const cantidadNueva = values.cantidadInicial ?? 0;
        const stockMinimoActual = invActual ? Number(invActual.stock_minimo) : 0;
        const stockMinimoNuevo = values.stockMinimo ?? 0;

        if (stockMinimoNuevo <= 0) {
          sileo.warning({ title: 'El stock mínimo no puede ser 0.' });
          setIsSubmitting(false);
          return;
        }

        const cantidadDelta = cantidadNueva - cantidadActual;
        const stockMinimoChanged = stockMinimoNuevo !== stockMinimoActual;

        if (cantidadDelta > 0 || stockMinimoChanged) {
          await inventarioApi.ajustar({
            productoId: producto.id,
            sucursalId: sucursalEfectiva.id,
            tipo: cantidadDelta > 0 ? 'entrada' : 'ajuste',
            cantidad: cantidadDelta > 0 ? cantidadDelta : 0,
            stockMinimo: stockMinimoNuevo,
            notas: cantidadDelta > 0
              ? 'Entrada manual desde edición de producto'
              : 'Actualización de stock mínimo desde edición de producto',
          });
        }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-card border-border">
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
              <BasicInfoSection
                form={form}
                categorias={categorias}
                maquinas={maquinas}
                unidadesMedida={unidadesMedida}
                preciosVolumen={preciosVolumen}
                esCentroImpresion={esCentroImpresion}
                isEditing={isEditing}
                onPreciosChange={handlePrecioChange}
              />

              {/* Col 2 - Imagen y Extras */}
              <div className="space-y-4 flex flex-col">

                <div className='space-y-3 '>
                  <FormLabel>Caracteristicas</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Sección para agregar otras características del producto.
                  </p>

                </div>

                <ExistenciasSection
                  tieneExistencias={tieneExistencias}
                  setTieneExistencias={setTieneExistencias}
                  form={form}
                  isEditing={isEditing}
                />

                <InsumosSelectorSection
                  insumosDisponibles={insumosDisponibles}
                  insumosSeleccionados={insumosSeleccionados}
                  insumoBusqueda={insumoBusqueda}
                  showInsumosDropdown={showInsumosDropdown}
                  onSearchChange={setInsumoBusqueda}
                  onSearchFocus={() => setShowInsumosDropdown(true)}
                  onSearchBlur={() => setTimeout(() => setShowInsumosDropdown(false), 200)}
                  onAddInsumo={agregarInsumo}
                  onCantidadChange={cambiarCantidadInsumo}
                  onRemove={quitarInsumo}
                />

                <ImageExtrasSection
                  form={form}
                  imagePreview={imagePreview}
                  fileInputRef={fileInputRef}
                  onImageChange={handleImageChange}
                  onRemoveImage={removeImage}
                />

              </div>

            </div>

            <StockInfoBanner
              isEditing={isEditing}
              tieneExistencias={tieneExistencias}
              sucursalNombre={sucursalEfectiva?.nombre}
              form={form}
            />

            <FormFooter
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              onCancel={() => onOpenChange(false)}
            />
          </form>
        </Form>

      </DialogContent>
    </Dialog >
  );
}
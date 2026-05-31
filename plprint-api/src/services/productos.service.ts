import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  categoriaId?: number;
}

interface CreateProductoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  precioCompra?: number;
  categoriaId?: number;
  proveedorId?: number;
  unidadMedida?: string;
  imagenUrl?: string;
  cantidadInicial?: number;
  stockMinimo?: number;
  sucursalId?: number;
  usuarioId?: number; // Para registrar quién hizo el movimiento si hay cantidadInicial
}

export class ProductosService {
  async findAll({ page, limit, search, categoriaId }: FindAllParams) {
    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { codigo: { contains: search } },
        ],
      }),
      ...(categoriaId && { categoria_id: categoriaId }),
    };

    const [data, total] = await Promise.all([
      prisma.productos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
        include: { categorias: { select: { nombre: true } } },
      }),
      prisma.productos.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    const producto = await prisma.productos.findFirst({
      where: { id, activo: true },
      include: {
        categorias: true,
        proveedores: { select: { id: true, nombre: true } },
        inventario: {
          include: { sucursales: { select: { id: true, nombre: true } } },
        },
      },
    });

    if (!producto) throw new NotFoundError('Producto');
    return producto;
  }

  async create(data: CreateProductoDTO) {

    return prisma.$transaction(async (tx) => {
      // 1. Crear el producto
      const producto = await tx.productos.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio_venta: data.precioVenta,
          precio_compra: data.precioCompra,
          categoria_id: data.categoriaId,
          proveedor_id: data.proveedorId,
          unidad_medida: data.unidadMedida,
          imagen_url: data.imagenUrl,
        },
      });

      // 2. Si hay cantidad inicial, registrar en inventario y tabla kardex
      if (data.cantidadInicial && data.cantidadInicial > 0 && data.sucursalId && data.usuarioId) {
        await tx.inventario.create({
          data: {
            producto_id: producto.id,
            sucursal_id: data.sucursalId,
            cantidad: data.cantidadInicial,
            stock_minimo: data.stockMinimo ?? 0,
          },
        });

        // Registrar en Kardex (movimiento)
        await tx.kardex_movimientos.create({
          data: {
            producto_id: producto.id,
            sucursal_id: data.sucursalId,
            usuario_id: data.usuarioId,
            tipo: 'entrada',
            cantidad: data.cantidadInicial,
            notas: 'Inventario inicial al crear el producto',
          }
        });
      }

      return producto;
    });
  }

  async update(id: number, data: Partial<CreateProductoDTO>) {
    await this.findById(id);
    return prisma.productos.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.precioVenta !== undefined && { precio_venta: data.precioVenta }),
        ...(data.precioCompra !== undefined && { precio_compra: data.precioCompra }),
        ...(data.categoriaId !== undefined && { categoria_id: data.categoriaId }),
        ...(data.proveedorId !== undefined && { proveedor_id: data.proveedorId }),
        ...(data.unidadMedida && { unidad_medida: data.unidadMedida }),
        ...(data.imagenUrl && { imagen_url: data.imagenUrl }),
        ...(data.codigo && { codigo: data.codigo }),
      },
    });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.productos.update({ where: { id }, data: { activo: false } });
  }
}

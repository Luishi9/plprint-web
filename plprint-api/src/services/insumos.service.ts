import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
}

interface CreateInsumoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  precioCompra?: number;
  proveedorId?: number;
}

export class InsumosService {
  async findAll({ page, limit, search }: FindAllParams) {
    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { codigo: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.insumos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
        include: {
          proveedores: { select: { id: true, nombre: true } },
        },
      }),
      prisma.insumos.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    const insumo = await prisma.insumos.findFirst({
      where: { id, activo: true },
      include: {
        proveedores: { select: { id: true, nombre: true } },
        inventario: {
          include: { sucursales: { select: { id: true, nombre: true } } },
        },
        producto_insumos: {
          include: {
            productos: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!insumo) throw new NotFoundError('Insumo');
    return insumo;
  }

  async create(data: CreateInsumoDTO) {
    const codigo = data.codigo && data.codigo.trim() !== '' ? data.codigo.trim() : null;
    if (codigo) {
      const existing = await prisma.insumos.findUnique({ where: { codigo } });
      if (existing) throw new ConflictError('Ya existe un insumo con ese código');
    }
    return prisma.insumos.create({
      data: {
        codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        unidad_medida: data.unidadMedida ?? 'unidad',
        precio_compra: data.precioCompra,
        proveedor_id: data.proveedorId,
      },
    });
  }

  async update(id: number, data: Partial<CreateInsumoDTO>) {
    await this.findById(id);
    let codigo: string | null | undefined;
    if (data.codigo !== undefined) {
      codigo = data.codigo && data.codigo.trim() !== '' ? data.codigo.trim() : null;
      if (codigo) {
        const existing = await prisma.insumos.findFirst({ where: { codigo, NOT: { id } } });
        if (existing) throw new ConflictError('Ya existe un insumo con ese código');
      }
    }
    return prisma.insumos.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.unidadMedida && { unidad_medida: data.unidadMedida }),
        ...(data.precioCompra !== undefined && { precio_compra: data.precioCompra }),
        ...(data.proveedorId !== undefined && { proveedor_id: data.proveedorId }),
        ...(codigo !== undefined && { codigo }),
      },
    });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.insumos.update({ where: { id }, data: { activo: false } });
  }

  async getInventarioBySucursal(sucursalId: number, search?: string) {
    const where = {
      sucursal_id: sucursalId,
      insumos: { activo: true },
      ...(search && {
        insumos: {
          OR: [
            { nombre: { contains: search } },
            { codigo: { contains: search } },
          ],
        },
      }),
    };

    return prisma.insumos_inventario.findMany({
      where,
      include: {
        insumos: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            unidad_medida: true,
            precio_compra: true,
          },
        },
      },
      orderBy: { insumos: { nombre: 'asc' } },
    });
  }

  async ajustarStock(insumoId: number, sucursalId: number, cantidad: number, tipo: 'entrada' | 'salida') {
    const insumo = await prisma.insumos.findFirst({
      where: { id: insumoId, activo: true },
    });
    if (!insumo) throw new NotFoundError('Insumo');

    const inventario = await prisma.insumos_inventario.findUnique({
      where: { insumo_id_sucursal_id: { insumo_id: insumoId, sucursal_id: sucursalId } },
    });

    if (!inventario) {
      if (tipo === 'entrada') {
        return prisma.insumos_inventario.create({
          data: {
            insumo_id: insumoId,
            sucursal_id: sucursalId,
            cantidad: cantidad,
          },
        });
      } else {
        throw new Error('No hay inventario para esta sucursal');
      }
    }

    const nuevaCantidad = tipo === 'entrada'
      ? Number(inventario.cantidad) + cantidad
      : Number(inventario.cantidad) - cantidad;

    if (nuevaCantidad < 0) {
      throw new Error('Stock insuficiente');
    }

    return prisma.insumos_inventario.update({
      where: { id: inventario.id },
      data: { cantidad: nuevaCantidad },
    });
  }
}

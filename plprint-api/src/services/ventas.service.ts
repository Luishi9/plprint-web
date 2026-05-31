import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

interface VentaItem {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
}

interface CreateVentaDTO {
  sucursalId: number;
  clienteId?: number;
  usuarioId: number;
  metodoPago: string;
  descuento?: number;
  notas?: string;
  items: VentaItem[];
}

interface FindAllParams {
  page: number;
  limit: number;
  sucursalId?: number;
  desde?: string;
  hasta?: string;
  usuarioId?: number;
  sucursalesPermitidas: number[];
}

export class VentasService {
  async findAll({ page, limit, sucursalId, desde, hasta, sucursalesPermitidas }: FindAllParams) {
    const skip = (page - 1) * limit;
    const where = {
      sucursal_id: {
        in: sucursalId ? [sucursalId] : sucursalesPermitidas,
      },
      ...(desde || hasta
        ? {
            created_at: {
              ...(desde && { gte: new Date(desde) }),
              ...(hasta && { lte: new Date(hasta) }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.ventas.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          clientes: { select: { nombre: true } },
          usuarios: { select: { nombre: true } },
          sucursales: { select: { nombre: true } },
          venta_detalle: { include: { productos: { select: { nombre: true } } } },
        },
      }),
      prisma.ventas.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    const venta = await prisma.ventas.findUnique({
      where: { id },
      include: {
        clientes: true,
        usuarios: { select: { nombre: true } },
        sucursales: { select: { nombre: true } },
        venta_detalle: {
          include: { productos: { select: { id: true, nombre: true, imagen_url: true } } },
        },
      },
    });
    if (!venta) throw new NotFoundError('Venta');
    return venta;
  }

  async create(dto: CreateVentaDTO) {
    // Validar stock antes de crear la venta
    for (const item of dto.items) {
      const inv = await prisma.inventario.findUnique({
        where: {
          producto_id_sucursal_id: {
            producto_id: item.productoId,
            sucursal_id: dto.sucursalId,
          },
        },
      });
      if (!inv || inv.cantidad < item.cantidad) {
        const prod = await prisma.productos.findUnique({ where: { id: item.productoId }, select: { nombre: true } });
        throw new ValidationError(`Stock insuficiente para "${prod?.nombre}"`);
      }
    }

    const subtotales = dto.items.map((i) => {
      const subtotal = i.cantidad * i.precioUnitario - (i.descuento ?? 0);
      return { ...i, subtotal };
    });
    const total = subtotales.reduce((acc, i) => acc + i.subtotal, 0) - (dto.descuento ?? 0);

    return prisma.$transaction(async (tx) => {
      const venta = await tx.ventas.create({
        data: {
          sucursal_id: dto.sucursalId,
          cliente_id: dto.clienteId ?? null,
          usuario_id: dto.usuarioId,
          total,
          descuento: dto.descuento ?? 0,
          metodo_pago: dto.metodoPago,
          notas: dto.notas,
          venta_detalle: {
            create: subtotales.map((i) => ({
              producto_id: i.productoId,
              cantidad: i.cantidad,
              precio_unitario: i.precioUnitario,
              descuento: i.descuento ?? 0,
              subtotal: i.subtotal,
            })),
          },
        },
        include: { venta_detalle: true },
      });

      // Descontar inventario y registrar kardex
      for (const item of subtotales) {
        await tx.inventario.update({
          where: {
            producto_id_sucursal_id: {
              producto_id: item.productoId,
              sucursal_id: dto.sucursalId,
            },
          },
          data: { cantidad: { decrement: item.cantidad } },
        });

        await tx.kardex_movimientos.create({
          data: {
            producto_id: item.productoId,
            sucursal_id: dto.sucursalId,
            tipo: 'salida',
            cantidad: item.cantidad,
            venta_id: venta.id,
            usuario_id: dto.usuarioId,
          },
        });
      }

      return venta;
    });
  }

  async cancel(id: number, usuarioId: number) {
    const venta = await this.findById(id);

    if (venta.estado !== 'completada') {
      throw new ValidationError('Solo se pueden cancelar ventas completadas');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ventas.update({
        where: { id },
        data: { estado: 'cancelada' },
      });

      // Revertir inventario
      for (const detalle of venta.venta_detalle) {
        await tx.inventario.update({
          where: {
            producto_id_sucursal_id: {
              producto_id: detalle.producto_id!,
              sucursal_id: venta.sucursal_id!,
            },
          },
          data: { cantidad: { increment: detalle.cantidad } },
        });

        await tx.kardex_movimientos.create({
          data: {
            producto_id: detalle.producto_id!,
            sucursal_id: venta.sucursal_id!,
            tipo: 'entrada',
            cantidad: detalle.cantidad,
            referencia: `cancelacion_venta_${id}`,
            usuario_id: usuarioId,
          },
        });
      }

      return updated;
    });
  }
}

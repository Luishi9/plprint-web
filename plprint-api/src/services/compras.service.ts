import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export interface CompraInsumoInput {
  insumo_id: number;
  cantidad: number;
  precio_unitario: number;
  proveedor_id?: number;
  sucursal_id?: number;
  usuario_id?: number;
  notas?: string;
  fecha?: string;
}

export class ComprasService {
  async findAll({ page, limit, search, fechaDesde, fechaHasta, proveedorId, insumoId, sucursalId }: {
    page: number; limit: number; search?: string;
    fechaDesde?: string; fechaHasta?: string;
    proveedorId?: number; insumoId?: number; sucursalId?: number;
  }) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { insumos: { nombre: { contains: search } } },
        { proveedores: { nombre: { contains: search } } },
        { notas: { contains: search } },
      ];
    }
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) (where.fecha as Record<string, Date>).gte = new Date(fechaDesde);
      if (fechaHasta) (where.fecha as Record<string, Date>).lte = new Date(fechaHasta);
    }
    if (proveedorId) where.proveedor_id = proveedorId;
    if (insumoId) where.insumo_id = insumoId;
    if (sucursalId) where.sucursal_id = sucursalId;

    const [data, total, totales] = await Promise.all([
      prisma.compras_insumos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha: 'desc' },
        include: {
          insumos: { select: { id: true, nombre: true, unidad_medida: true } },
          proveedores: { select: { id: true, nombre: true } },
          sucursales: { select: { id: true, nombre: true } },
          usuarios: { select: { id: true, nombre: true } },
        },
      }),
      prisma.compras_insumos.count({ where }),
      prisma.compras_insumos.aggregate({ where, _sum: { total: true, cantidad: true } }),
    ]);
    return {
      data,
      total,
      totalInvertido: totales._sum.total || 0,
      totalCantidad: totales._sum.cantidad || 0,
    };
  }

  async findById(id: number) {
    const c = await prisma.compras_insumos.findUnique({
      where: { id },
      include: {
        insumos: true,
        proveedores: true,
        sucursales: true,
        usuarios: { select: { id: true, nombre: true } },
      },
    });
    if (!c) throw new NotFoundError('Compra');
    return c;
  }

  /**
   * Crea una compra de insumo y actualiza el inventario (suma stock) y
   * actualiza el último precio de compra del insumo.
   * Todo en una transacción para garantizar atomicidad.
   */
  async create(dto: CompraInsumoInput) {
    if (!dto.sucursal_id) throw new ValidationError('sucursal_id es requerido');
    return prisma.$transaction(async (tx) => {
      const insumo = await tx.insumos.findUnique({ where: { id: dto.insumo_id } });
      if (!insumo) throw new NotFoundError('Insumo');
      if (insumo.sucursal_id !== dto.sucursal_id) {
        throw new ValidationError('El insumo no pertenece a la sucursal indicada');
      }

      const total = Number((dto.cantidad * dto.precio_unitario).toFixed(2));

      const compra = await tx.compras_insumos.create({
        data: {
          insumo_id: dto.insumo_id,
          cantidad: new Prisma.Decimal(dto.cantidad),
          precio_unitario: new Prisma.Decimal(dto.precio_unitario),
          total: new Prisma.Decimal(total),
          sucursal_id: dto.sucursal_id,
          ...(dto.proveedor_id && { proveedor_id: dto.proveedor_id }),
          ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
          ...(dto.notas && { notas: dto.notas }),
          ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        },
      });

      // Actualizar último precio de compra del insumo
      await tx.insumos.update({
        where: { id: dto.insumo_id },
        data: { precio_compra: new Prisma.Decimal(dto.precio_unitario) },
      });

      // Sumar al inventario por sucursal
      const inv = await tx.insumos_inventario.findUnique({
        where: { insumo_id_sucursal_id: { insumo_id: dto.insumo_id, sucursal_id: dto.sucursal_id } },
      });
      if (inv) {
        await tx.insumos_inventario.update({
          where: { id: inv.id },
          data: { cantidad: { increment: Number(dto.cantidad) } },
        });
      } else {
        await tx.insumos_inventario.create({
          data: {
            insumo_id: dto.insumo_id,
            sucursal_id: dto.sucursal_id!,
            cantidad: Number(dto.cantidad),
          },
        });
      }

      return compra;
    });
  }

  /**
   * Crea múltiples compras en un solo lote (batch).
   * Todas las compras comparten la misma sucursal, fecha, factura y usuario.
   * Cada item puede tener su propio proveedor y notas.
   */
  async createBatch(dto: {
    items: Array<{ insumo_id: number; cantidad: number; precio_unitario: number; proveedor_id?: number; notas?: string }>;
    sucursal_id: number;
    usuario_id?: number;
    factura?: string;
    fecha?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of dto.items) {
        const insumo = await tx.insumos.findUnique({ where: { id: item.insumo_id } });
        if (!insumo) throw new NotFoundError(`Insumo id ${item.insumo_id}`);
        if (insumo.sucursal_id !== dto.sucursal_id) {
          throw new ValidationError(`Insumo id ${item.insumo_id} no pertenece a la sucursal indicada`);
        }

        const total = Number((item.cantidad * item.precio_unitario).toFixed(2));

        const compra = await tx.compras_insumos.create({
          data: {
            insumo_id: item.insumo_id,
            cantidad: new Prisma.Decimal(item.cantidad),
            precio_unitario: new Prisma.Decimal(item.precio_unitario),
            total: new Prisma.Decimal(total),
            sucursal_id: dto.sucursal_id,
            factura: dto.factura || null,
            ...(item.proveedor_id && { proveedor_id: item.proveedor_id }),
            ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
            ...(item.notas && { notas: item.notas }),
            ...(dto.fecha && { fecha: new Date(dto.fecha) }),
          },
        });

        await tx.insumos.update({
          where: { id: item.insumo_id },
          data: { precio_compra: new Prisma.Decimal(item.precio_unitario) },
        });

        const inv = await tx.insumos_inventario.findUnique({
          where: { insumo_id_sucursal_id: { insumo_id: item.insumo_id, sucursal_id: dto.sucursal_id } },
        });
        if (inv) {
          await tx.insumos_inventario.update({
            where: { id: inv.id },
            data: { cantidad: { increment: Number(item.cantidad) } },
          });
        } else {
          await tx.insumos_inventario.create({
            data: {
              insumo_id: item.insumo_id,
              sucursal_id: dto.sucursal_id,
              cantidad: Number(item.cantidad),
            },
          });
        }

        results.push(compra);
      }
      return results;
    });
  }

  async remove(id: number) {
    await this.findById(id);
    // No se revierte el inventario al eliminar (es registro histórico).
    // Para reversar, crear una compra negativa o ajuste manual.
    return prisma.compras_insumos.delete({ where: { id } });
  }
}

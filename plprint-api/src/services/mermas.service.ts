import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export interface MermaInput {
  tipo: 'producto' | 'insumo';
  producto_id?: number;
  insumo_id?: number;
  sucursal_id?: number;
  usuario_id?: number;
  venta_id?: number;
  maquina_id?: number;
  cantidad: number;
  motivo: string;
  costo_estimado?: number;
  fecha?: string;
}

export class MermasService {
  async findAll({ page, limit, search, tipo, fechaDesde, fechaHasta, sucursalId }: {
    page: number; limit: number; search?: string; tipo?: string;
    fechaDesde?: string; fechaHasta?: string; sucursalId?: number;
  }) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { motivo: { contains: search } },
        { productos: { nombre: { contains: search } } },
        { insumos: { nombre: { contains: search } } },
      ];
    }
    if (tipo) where.tipo = tipo;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) (where.fecha as Record<string, Date>).gte = new Date(fechaDesde);
      if (fechaHasta) (where.fecha as Record<string, Date>).lte = new Date(fechaHasta);
    }
    if (sucursalId) where.sucursal_id = sucursalId;

    const [data, total, sum] = await Promise.all([
      prisma.mermas.findMany({
        where, skip, take: limit, orderBy: { fecha: 'desc' },
        include: {
          productos: { select: { id: true, nombre: true, unidad_medida: true } },
          insumos: { select: { id: true, nombre: true, unidad_medida: true } },
          sucursales: { select: { id: true, nombre: true } },
          usuarios: { select: { id: true, nombre: true } },
          ventas: { select: { id: true, cotizaciones: { select: { folio: true } } } },
          maquinas: { select: { id: true, nombre: true } },
        },
      }),
      prisma.mermas.count({ where }),
      prisma.mermas.aggregate({ where, _sum: { cantidad: true, costo_estimado: true } }),
    ]);
    return {
      data,
      total,
      totalCantidad: sum._sum.cantidad || 0,
      totalCosto: sum._sum.costo_estimado || 0,
    };
  }

  async findById(id: number) {
    const m = await prisma.mermas.findUnique({
      where: { id },
      include: {
        productos: true, insumos: true, sucursales: true,
        usuarios: { select: { id: true, nombre: true } },
        ventas: true,
        maquinas: { select: { id: true, nombre: true } },
      },
    });
    if (!m) throw new NotFoundError('Merma');
    return m;
  }

  /**
   * Registra merma + descuenta inventario atómicamente.
   * Si tipo='producto' descuenta de inventario.productos.
   * Si tipo='insumo' descuenta de insumos_inventario.
   */
  async create(dto: MermaInput) {
    if (dto.tipo === 'producto' && !dto.producto_id) throw new NotFoundError('Producto requerido');
    if (dto.tipo === 'insumo' && !dto.insumo_id) throw new NotFoundError('Insumo requerido');
    if (!dto.sucursal_id) throw new ValidationError('sucursal_id es requerido');

    // Validar consistencia insumo-sucursal
    if (dto.tipo === 'insumo' && dto.insumo_id) {
      const insumo = await prisma.insumos.findUnique({
        where: { id: dto.insumo_id },
        select: { sucursal_id: true },
      });
      if (!insumo) throw new NotFoundError('Insumo');
      if (insumo.sucursal_id !== dto.sucursal_id) {
        throw new ValidationError('El insumo no pertenece a la sucursal indicada');
      }
    }

    return prisma.$transaction(async (tx) => {
      let maquinaIdFinal: number | null = null;

      if (dto.tipo === 'producto' && dto.producto_id) {
        const producto = await tx.productos.findUnique({
          where: { id: dto.producto_id },
          select: { maquina_id: true },
        });
        maquinaIdFinal = dto.maquina_id ?? producto?.maquina_id ?? null;
      }

      const merma = await tx.mermas.create({
        data: {
          tipo: dto.tipo,
          ...(dto.producto_id && { producto_id: dto.producto_id }),
          ...(dto.insumo_id && { insumo_id: dto.insumo_id }),
          ...(dto.sucursal_id && { sucursal_id: dto.sucursal_id }),
          ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
          ...(dto.venta_id && { venta_id: dto.venta_id }),
          ...(maquinaIdFinal && { maquina_id: maquinaIdFinal }),
          cantidad: new Prisma.Decimal(dto.cantidad),
          motivo: dto.motivo,
          ...(dto.costo_estimado !== undefined && { costo_estimado: new Prisma.Decimal(dto.costo_estimado) }),
          ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        },
      });

      if (dto.sucursal_id) {
        if (dto.tipo === 'producto' && dto.producto_id) {
          const inv = await tx.inventario.findFirst({
            where: { producto_id: dto.producto_id, sucursal_id: dto.sucursal_id },
          });
          if (inv) {
            await tx.inventario.update({
              where: { id: inv.id },
              data: { cantidad: { decrement: Number(dto.cantidad) } },
            });
          }
          await tx.kardex_movimientos.create({
            data: {
              producto_id: dto.producto_id,
              sucursal_id: dto.sucursal_id,
              tipo: 'salida',
              cantidad: Number(dto.cantidad),
              referencia: `Merma #${merma.id}`,
              notas: dto.motivo,
              ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
            },
          });
          if (maquinaIdFinal) {
            await tx.impresiones.create({
              data: {
                maquina_id: maquinaIdFinal,
                producto_id: dto.producto_id,
                merma_id: merma.id,
                sucursal_id: dto.sucursal_id,
                fue_merma: true,
                ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
              },
            });
            await tx.maquinas.update({
              where: { id: maquinaIdFinal },
              data: { contador_total: { increment: Number(dto.cantidad) } },
            });
          }
        } else if (dto.tipo === 'insumo' && dto.insumo_id) {
          const inv = await tx.insumos_inventario.findUnique({
            where: { insumo_id_sucursal_id: { insumo_id: dto.insumo_id, sucursal_id: dto.sucursal_id } },
          });
          if (inv) {
            await tx.insumos_inventario.update({
              where: { id: inv.id },
              data: { cantidad: { decrement: Number(dto.cantidad) } },
            });
          }
        }
      }

      return merma;
    });
  }

  async update(id: number, dto: Partial<MermaInput>) {
    await this.findById(id);
    const data: Record<string, unknown> = {};
    if (dto.motivo !== undefined) data.motivo = dto.motivo;
    if (dto.cantidad !== undefined) data.cantidad = new Prisma.Decimal(dto.cantidad);
    if (dto.costo_estimado !== undefined) data.costo_estimado = new Prisma.Decimal(dto.costo_estimado);
    return prisma.mermas.update({ where: { id }, data: data as never });
  }

  async remove(id: number) {
    await this.findById(id);
    return prisma.mermas.delete({ where: { id } });
  }
}

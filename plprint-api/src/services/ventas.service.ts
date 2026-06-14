import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

interface VentaItem {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  ancho_m?: number;
  alto_m?: number;
  unidad_medida_detalle?: string;
}

interface CreateVentaDTO {
  sucursalId: number;
  clienteId?: number;
  usuarioId: number;
  metodoPago: string;
  descuento?: number;
  descuento_motivo?: string;
  notas?: string;
  estadoPago?: 'pagada' | 'pendiente' | 'parcial';
  saldoInicial?: number;
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
  estado?: 'completada' | 'cancelada';
  estadoPago?: 'pendiente' | 'parcial';
  search?: string;
  usuarioIdFiltro?: number;
}

export class VentasService {
  async findAll({ page, limit, sucursalId, desde, hasta, sucursalesPermitidas, estado, estadoPago, search, usuarioIdFiltro }: FindAllParams) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {
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
      ...(estado ? { estado } : {}),
      ...(estadoPago ? { estado_pago: { in: estadoPago.split(',') } } : {}),
      ...(usuarioIdFiltro ? { usuario_id: usuarioIdFiltro } : {}),
      ...(search
        ? {
            OR: [
              { id: { equals: parseInt(search) || 0 } },
              { folio: { contains: search } },
              { clientes: { nombre: { contains: search } } },
              { usuarios: { nombre: { contains: search } } },
              { venta_detalle: { some: { productos: { nombre: { contains: search } } } } },
            ],
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
          ventas_abonos: { orderBy: { fecha: 'desc' } },
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
        ventas_abonos: {
          orderBy: { fecha: 'desc' },
          include: { usuarios: { select: { id: true, nombre: true } } },
        },
      },
    });
    if (!venta) throw new NotFoundError('Venta');
    return venta;
  }

  private async generarFolio(): Promise<string> {
    const hoy = new Date();
    const yyyy = hoy.getFullYear().toString();
    const mm = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dd = hoy.getDate().toString().padStart(2, '0');
    const prefix = `VEN-${yyyy}${mm}${dd}-`;

    const ultimo = await prisma.ventas.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { folio: 'desc' },
      select: { folio: true },
    });

    let seq = 1;
    if (ultimo?.folio) {
      const partes = ultimo.folio.split('-');
      seq = parseInt(partes[3], 10) + 1;
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateVentaDTO) {
    // Validar stock antes de crear la venta
    for (const item of dto.items) {
      // Si el producto tiene insumos enlazados (producción), salta la validación
      // de stock de producto — el stock se valida a nivel de insumos
      const insumos = await prisma.producto_insumos.findMany({
        where: { producto_id: item.productoId },
      });
      if (insumos.length > 0) continue;

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
      const estadoPago = dto.estadoPago || 'pagada';
      const saldo = estadoPago === 'pagada' ? 0 : (dto.saldoInicial ?? total);

      const folio = await this.generarFolio();
      const venta = await tx.ventas.create({
        data: {
          folio,
          sucursal_id: dto.sucursalId,
          cliente_id: dto.clienteId ?? null,
          usuario_id: dto.usuarioId,
          total,
          descuento: dto.descuento ?? 0,
          descuento_motivo: dto.descuento && dto.descuento > 0 ? (dto.descuento_motivo ?? null) : null,
          metodo_pago: dto.metodoPago,
          notas: dto.notas,
          estado_pago: estadoPago,
          saldo_pendiente: saldo,
          venta_detalle: {
            create: subtotales.map((i) => ({
              producto_id: i.productoId,
              cantidad: i.cantidad,
              precio_unitario: i.precioUnitario,
              descuento: i.descuento ?? 0,
              subtotal: i.subtotal,
              ancho_m: i.ancho_m ?? null,
              alto_m: i.alto_m ?? null,
              unidad_medida_detalle: i.unidad_medida_detalle ?? null,
            })),
          },
        },
        include: { venta_detalle: true },
      });

      // Descontar inventario, registrar kardex e impresiones
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

        // Crear impresión automática si el producto tiene máquina asignada
        const producto = await tx.productos.findUnique({
          where: { id: item.productoId },
          select: { maquina_id: true },
        });
        if (producto?.maquina_id) {
          await tx.impresiones.create({
            data: {
              maquina_id: producto.maquina_id,
              producto_id: item.productoId,
              venta_id: venta.id,
              sucursal_id: dto.sucursalId,
              ...(dto.usuarioId && { usuario_id: dto.usuarioId }),
            },
          });
          await tx.maquinas.update({
            where: { id: producto.maquina_id },
            data: { contador_total: { increment: item.cantidad } },
          });
        }

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

        // Descontar insumos automáticamente (BOM)
        const productoInsumos = await tx.producto_insumos.findMany({
          where: { producto_id: item.productoId },
        });

        for (const pi of productoInsumos) {
          const cantidadDescontar = Number(pi.cantidad_requerida) * item.cantidad;

          // Descontar del inventario de insumos
          await tx.insumos_inventario.update({
            where: {
              insumo_id_sucursal_id: {
                insumo_id: pi.insumo_id,
                sucursal_id: dto.sucursalId,
              },
            },
            data: { cantidad: { decrement: cantidadDescontar } },
          });
        }
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

  async validarInsumos(sucursalId: number, items: Array<{ productoId: number; cantidad: number }>) {
    const faltantes: Array<{
      insumo: string;
      requerido: number;
      disponible: number;
      deficit: number;
    }> = [];

    for (const item of items) {
      const productoInsumos = await prisma.producto_insumos.findMany({
        where: { producto_id: item.productoId },
        include: { insumos: { select: { nombre: true } } },
      });

      for (const pi of productoInsumos) {
        const cantidadRequerida = Number(pi.cantidad_requerida) * item.cantidad;

        const inventario = await prisma.insumos_inventario.findUnique({
          where: {
            insumo_id_sucursal_id: {
              insumo_id: pi.insumo_id,
              sucursal_id: sucursalId,
            },
          },
        });

        const disponible = inventario ? Number(inventario.cantidad) : 0;

        if (disponible < cantidadRequerida) {
          faltantes.push({
            insumo: pi.insumos.nombre,
            requerido: cantidadRequerida,
            disponible,
            deficit: cantidadRequerida - disponible,
          });
        }
      }
    }

    return {
      suficiente: faltantes.length === 0,
      faltantes,
    };
  }
}

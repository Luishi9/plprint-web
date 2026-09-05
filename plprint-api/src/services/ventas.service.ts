import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';

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

const buildLocalDate = (dateStr: string, endOfDay: boolean): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date;
};

export class VentasService {
  async findAll({ page, limit, sucursalId, desde, hasta, sucursalesPermitidas, estado, estadoPago, search, usuarioIdFiltro }: FindAllParams) {
    const skip = (page - 1) * limit;

    const desdeDate = desde ? buildLocalDate(desde, false) : undefined;
    const hastaDate = hasta ? buildLocalDate(hasta, true) : undefined;

    const where: Record<string, unknown> = {
      sucursal_id: {
        in: sucursalId ? [sucursalId] : sucursalesPermitidas,
      },
      ...(desdeDate || hastaDate
        ? {
            created_at: {
              ...(desdeDate && { gte: desdeDate }),
              ...(hastaDate && { lte: hastaDate }),
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
              { folio: { contains: search, mode: 'insensitive' as const } },
              { clientes: { nombre: { contains: search, mode: 'insensitive' as const } } },
              { usuarios: { nombre: { contains: search, mode: 'insensitive' as const } } },
              { venta_detalle: { some: { productos: { nombre: { contains: search, mode: 'insensitive' as const } } } } },
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

  /**
   * Public ticket view - no auth required.
   * Returns only safe fields to display in the printed/shared QR ticket.
   * Excludes PII (cliente email/telefono/direccion), internal IDs (usuario_id, sucursal_id, cliente_id),
   * and internal data (notas internas, metodo_pago_id, costo fields).
   *
   * Sanitizes cliente to only `nombre` and `id` (identifier for matching).
   * Sanitizes usuarios to only `nombre` (the ticket shows "Cajero: X").
   * Excludes ventas_abonos (only the ticket front needs them; secure internal data).
   */
  async findByIdPublic(id: number) {
    const venta = await prisma.ventas.findUnique({
      where: { id },
      select: {
        id: true,
        folio: true,
        created_at: true,
        total: true,
        descuento: true,
        descuento_motivo: true,
        metodo_pago: true,
        estado: true,
        estado_pago: true,
        saldo_pendiente: true,
        iva_porcentaje: true,
        base_gravable: true,
        iva: true,
        sucursales: { select: { nombre: true } },
        clientes: {
          select: {
            id: true,
            nombre: true,
          },
        },
        usuarios: { select: { nombre: true } },
        venta_detalle: {
          select: {
            id: true,
            cantidad: true,
            precio_unitario: true,
            descuento: true,
            ancho_m: true,
            alto_m: true,
            productos: {
              select: {
                id: true,
                nombre: true,
                imagen_url: true,
              },
            },
          },
        },
      },
    });
    if (!venta) throw new NotFoundError('Venta');
    if (venta.estado === 'cancelada') {
      throw new NotFoundError('Venta');
    }
    return venta;
  }

  private async generarFolio(tx?: Prisma.TransactionClient): Promise<string> {
    const hoy = new Date();
    const yyyy = hoy.getFullYear().toString();
    const mm = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dd = hoy.getDate().toString().padStart(2, '0');
    const prefix = `VEN-${yyyy}${mm}${dd}-`;

    const fechaStr = `${yyyy}-${mm}-${dd}`;

    // Upsert atómico (Postgres): incrementa seq y lo retorna en una sola query.
    // Con tx, el folio se revierte si la venta falla (sin huecos de numeración).
    const client = tx ?? prisma;
    const row = await client.$queryRaw<[{ seq: number }]>`
      INSERT INTO folio_counter (fecha, seq)
      VALUES (CAST(${fechaStr} AS DATE), 1)
      ON CONFLICT (fecha) DO UPDATE SET seq = folio_counter.seq + 1, updated_at = NOW()
      RETURNING seq
    `;

    const seq = Number(row[0].seq);
    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateVentaDTO) {
    // Validar stock antes de crear la venta
    for (const item of dto.items) {
      const [insumos, inv] = await Promise.all([
        prisma.producto_insumos.findMany({ where: { producto_id: item.productoId } }),
        prisma.inventario.findUnique({
          where: {
            producto_id_sucursal_id: {
              producto_id: item.productoId,
              sucursal_id: dto.sucursalId,
            },
          },
        }),
      ]);

      if (insumos.length > 0) continue;
      if (!inv) continue;

      if (inv.cantidad < item.cantidad) {
        const prod = await prisma.productos.findUnique({ where: { id: item.productoId }, select: { nombre: true } });
        throw new ValidationError(`Stock insuficiente para "${prod?.nombre}"`);
      }
    }

    const subtotales = dto.items.map((i) => {
      const subtotal = i.cantidad * i.precioUnitario - (i.descuento ?? 0);
      return { ...i, subtotal };
    });
    const base = subtotales.reduce((acc, i) => acc + i.subtotal, 0) - (dto.descuento ?? 0);

    // Calcular IVA segun configuracion (fuente de verdad: tabla configuracion).
    // - iva_activo=false o pct<=0  -> sin IVA.
    // - iva_incluido_en_precios=false (default) -> IVA adicional: total = base + iva.
    // - iva_incluido_en_precios=true            -> IVA incluido: desglosa base, total = base original.
    const configIva = await prisma.configuracion.findMany({
      where: { clave: { in: ['iva_activo', 'iva_porcentaje', 'iva_incluido_en_precios'] } },
    });
    const ivaActivoCfg = configIva.find((c) => c.clave === 'iva_activo')?.valor === 'true';
    const ivaPorcentajeCfg = Number(configIva.find((c) => c.clave === 'iva_porcentaje')?.valor ?? 0);
    const ivaIncluidoCfg = configIva.find((c) => c.clave === 'iva_incluido_en_precios')?.valor === 'true';

    let iva = 0;
    let baseGrabable: number | null = null;
    let total = base;
    if (ivaActivoCfg && ivaPorcentajeCfg > 0) {
      if (ivaIncluidoCfg) {
        baseGrabable = base / (1 + ivaPorcentajeCfg / 100);
        iva = base - baseGrabable;
        total = base;
      } else {
        baseGrabable = base;
        iva = base * (ivaPorcentajeCfg / 100);
        total = base + iva;
      }
    }

    return prisma.$transaction(async (tx) => {
      const estadoPago = dto.estadoPago || 'pagada';
      const saldo = estadoPago === 'pagada' ? 0 : (dto.saldoInicial ?? total);

          const folio = await this.generarFolio(tx);
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
          iva_porcentaje: ivaActivoCfg ? ivaPorcentajeCfg : null,
          base_gravable: baseGrabable,
          iva,
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
      for (let idx = 0; idx < subtotales.length; idx++) {
        const item = subtotales[idx];
        const [productoInsumos, invRecord] = await Promise.all([
          tx.producto_insumos.findMany({ where: { producto_id: item.productoId } }),
          tx.inventario.findUnique({
            where: {
              producto_id_sucursal_id: {
                producto_id: item.productoId,
                sucursal_id: dto.sucursalId,
              },
            },
          }),
        ]);

        if (invRecord && productoInsumos.length === 0) {
          // Decremento condicional: si otro cajero vendio lo ultimo en esta
          // misma transaccion, count=0 y se aborta la venta completa.
          const descontado = await tx.inventario.updateMany({
            where: {
              producto_id: item.productoId,
              sucursal_id: dto.sucursalId,
              cantidad: { gte: item.cantidad },
            },
            data: { cantidad: { decrement: item.cantidad } },
          });
          if (descontado.count === 0) {
            const prod = await tx.productos.findUnique({ where: { id: item.productoId }, select: { nombre: true } });
            throw new ValidationError(`Stock insuficiente para "${prod?.nombre}"`);
          }
        }

        const producto = await tx.productos.findUnique({
          where: { id: item.productoId },
          select: { maquina_id: true, categoria_id: true, categorias: { select: { tipo: true } } },
        });
        if (producto?.maquina_id) {
          const ventaDetalleId = venta.venta_detalle[idx]?.id ?? null;
          await tx.impresiones.create({
            data: {
              maquina_id: producto.maquina_id,
              producto_id: item.productoId,
              venta_id: venta.id,
              venta_detalle_id: ventaDetalleId,
              sucursal_id: dto.sucursalId,
              ...(dto.usuarioId && { usuario_id: dto.usuarioId }),
            },
          });
          
          await tx.maquinas.update({
            where: { id: producto.maquina_id },
            data: { contador_total: { increment: item.cantidad } },
          });
        }

        if (producto?.categorias?.tipo === 'produccion') {
          await tx.ordenes_produccion.create({
            data: {
              sucursal_id: dto.sucursalId,
              producto_id: item.productoId,
              cantidad: item.cantidad,
              estatus: 'pendiente',
              usuario_creador_id: dto.usuarioId,
            },
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

        for (const pi of productoInsumos) {
          const factorConsumo = item.alto_m != null && item.alto_m > 0
            ? Number(item.alto_m)
            : item.cantidad;
          const cantidadDescontar = Number(pi.cantidad_requerida) * factorConsumo;
          const insumoDescontado = await tx.insumos_inventario.updateMany({
            where: {
              insumo_id: pi.insumo_id,
              sucursal_id: dto.sucursalId,
              cantidad: { gte: cantidadDescontar },
            },
            data: { cantidad: { decrement: cantidadDescontar } },
          });
          if (insumoDescontado.count === 0) {
            const insumo = await tx.insumos.findUnique({ where: { id: pi.insumo_id }, select: { nombre: true } });
            throw new ValidationError(`Stock insuficiente del insumo "${insumo?.nombre}"`);
          }
        }
      }

      return venta;
    });
  }

  async cancel(
    id: number,
    usuarioId: number,
    opts?: {
      insumosDecision?: Array<{ productoId: number; accion: 'revertir' | 'merma' }>;
    },
  ) {
    const venta = await this.findById(id);

    if (venta.estado !== 'completada') {
      throw new ValidationError('Solo se pueden cancelar ventas completadas');
    }

    const decisiones = new Map<number, 'revertir' | 'merma'>(
      (opts?.insumosDecision ?? []).map((d) => [d.productoId, d.accion]),
    );

    return prisma.$transaction(async (tx) => {
      // Update condicional: si otro usuario cancelo la misma venta en este
      // instante, count=0 y se aborta sin revertir el inventario dos veces.
      const cancelled = await tx.ventas.updateMany({
        where: { id, estado: 'completada' },
        data: { estado: 'cancelada' },
      });
      if (cancelled.count === 0) {
        throw new ValidationError('La venta ya fue cancelada');
      }
      const updated = await tx.ventas.findUniqueOrThrow({ where: { id } });

      // Revertir inventario
      for (const detalle of venta.venta_detalle) {
        const invRecord = await tx.inventario.findUnique({
          where: {
            producto_id_sucursal_id: {
              producto_id: detalle.producto_id!,
              sucursal_id: venta.sucursal_id!,
            },
          },
        });

        if (invRecord) {
          await tx.inventario.update({
            where: {
              producto_id_sucursal_id: {
                producto_id: detalle.producto_id!,
                sucursal_id: venta.sucursal_id!,
              },
            },
            data: { cantidad: { increment: detalle.cantidad } },
          });
        }

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

        // Tratamiento de insumos según decisión del usuario (default: revertir)
        const accion = decisiones.get(detalle.producto_id!) ?? 'revertir';
        const productoInsumos = await tx.producto_insumos.findMany({
          where: { producto_id: detalle.producto_id! },
        });
        for (const pi of productoInsumos) {
          const factorConsumo = detalle.alto_m != null && Number(detalle.alto_m) > 0
            ? Number(detalle.alto_m)
            : Number(detalle.cantidad);
          const cantidad = Number(pi.cantidad_requerida) * factorConsumo;

          if (accion === 'revertir') {
            const insumoInv = await tx.insumos_inventario.findUnique({
              where: {
                insumo_id_sucursal_id: {
                  insumo_id: pi.insumo_id,
                  sucursal_id: venta.sucursal_id!,
                },
              },
            });
            if (insumoInv) {
              await tx.insumos_inventario.update({
                where: {
                  insumo_id_sucursal_id: {
                    insumo_id: pi.insumo_id,
                    sucursal_id: venta.sucursal_id!,
                  },
                },
                data: { cantidad: { increment: cantidad } },
              });
            }
          } else {
            // Merma: no devuelve al inventario, registra fila
            await tx.mermas.create({
              data: {
                tipo: 'insumo',
                insumo_id: pi.insumo_id,
                sucursal_id: venta.sucursal_id!,
                venta_id: id,
                usuario_id: usuarioId,
                cantidad: new Prisma.Decimal(cantidad),
                motivo: `Cancelación venta ${venta.folio || '#' + id}`,
              },
            });
          }
        }
      }

      return updated;
    });
  }

  async getProductosConInsumosByVenta(id: number) {
    const venta = await this.findById(id);
    const productoIds = Array.from(
      new Set(venta.venta_detalle.map((d) => d.producto_id!).filter(Boolean)),
    );
    if (productoIds.length === 0) return [];

    const productoInsumos = await prisma.producto_insumos.findMany({
      where: { producto_id: { in: productoIds } },
      include: {
        insumos: {
          select: { id: true, nombre: true, unidad_medida: true },
        },
      },
    });

    const detallePorProducto = new Map<number, { cantidad: number; alto_m: number | null }>();
    for (const d of venta.venta_detalle) {
      const existente = detallePorProducto.get(d.producto_id!);
      if (existente) {
        existente.cantidad += Number(d.cantidad);
      } else {
        detallePorProducto.set(d.producto_id!, {
          cantidad: Number(d.cantidad),
          alto_m: d.alto_m != null ? Number(d.alto_m) : null,
        });
      }
    }

    const productosMap = new Map<number, { productoId: number; nombre: string; insumos: Array<{ insumoId: number; nombre: string; cantidad: number; unidad: string }> }>();
    for (const pi of productoInsumos) {
      const prod = venta.venta_detalle.find((d) => d.producto_id === pi.producto_id)?.productos;
      if (!prod) continue;
      if (!productosMap.has(pi.producto_id)) {
        productosMap.set(pi.producto_id, {
          productoId: pi.producto_id,
          nombre: prod.nombre,
          insumos: [],
        });
      }
      const info = detallePorProducto.get(pi.producto_id);
      const factorConsumo = info && info.alto_m != null && info.alto_m > 0 ? info.alto_m : info?.cantidad ?? 1;
      const cantidadConsumida = Number(pi.cantidad_requerida) * factorConsumo;
      productosMap.get(pi.producto_id)!.insumos.push({
        insumoId: pi.insumo_id,
        nombre: pi.insumos.nombre,
        cantidad: cantidadConsumida,
        unidad: pi.insumos.unidad_medida || 'unidad',
      });
    }

    return Array.from(productosMap.values());
  }

  async validarInsumos(sucursalId: number, items: Array<{ productoId: number; cantidad: number; alto_m?: number }>) {
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
        const factorConsumo = item.alto_m != null && item.alto_m > 0
          ? Number(item.alto_m)
          : item.cantidad;
        const cantidadRequerida = Number(pi.cantidad_requerida) * factorConsumo;

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

import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export interface CotizacionItemInput {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  ancho_m?: number;
  alto_m?: number;
  unidad_medida_detalle?: string;
}

export interface CotizacionInput {
  cliente_id?: number;
  sucursal_id?: number;
  usuario_id?: number;
  descuento?: number;
  descuento_motivo?: string;
  notas?: string;
  items: CotizacionItemInput[];
}

const generarFolio = () => `COT-${Date.now().toString(36).toUpperCase()}`;

export class CotizacionesService {
  async findAll({ page, limit, search, estado, clienteId }: {
    page: number; limit: number; search?: string; estado?: string; clienteId?: number;
  }) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { folio: { contains: search } },
        { clientes: { nombre: { contains: search } } },
        { notas: { contains: search } },
      ];
    }
    if (estado) where.estado = estado;
    if (clienteId) where.cliente_id = clienteId;

    const [data, total] = await Promise.all([
      prisma.cotizaciones.findMany({
        where, skip, take: limit, orderBy: { created_at: 'desc' },
        include: {
          clientes: { select: { id: true, nombre: true } },
          usuarios: { select: { id: true, nombre: true } },
          sucursales: { select: { id: true, nombre: true } },
          _count: { select: { cotizacion_detalle: true } },
        },
      }),
      prisma.cotizaciones.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: number) {
    const c = await prisma.cotizaciones.findUnique({
      where: { id },
      include: {
        clientes: true,
        usuarios: { select: { id: true, nombre: true } },
        sucursales: true,
        cotizacion_detalle: { include: { productos: true } },
      },
    });
    if (!c) throw new NotFoundError('Cotización');
    return c;
  }

  async create(dto: CotizacionInput) {
    if (!dto.items?.length) throw new ConflictError('La cotización debe tener al menos un item');
    return prisma.$transaction(async (tx) => {
      const total = dto.items.reduce(
        (acc, i) => acc + (i.cantidad * i.precio_unitario - (i.descuento || 0)), 0,
      ) - (dto.descuento || 0);
      const totalFinal = Math.max(0, Number(total.toFixed(2)));

      const cotizacion = await tx.cotizaciones.create({
        data: {
          folio: generarFolio(),
          ...(dto.cliente_id && { cliente_id: dto.cliente_id }),
          ...(dto.sucursal_id && { sucursal_id: dto.sucursal_id }),
          ...(dto.usuario_id && { usuario_id: dto.usuario_id }),
          descuento: new Prisma.Decimal(dto.descuento || 0),
          ...(dto.descuento_motivo && { descuento_motivo: dto.descuento_motivo }),
          ...(dto.notas && { notas: dto.notas }),
          total: new Prisma.Decimal(totalFinal),
          cotizacion_detalle: {
            create: dto.items.map((i) => ({
              producto_id: i.producto_id,
              cantidad: i.cantidad,
              precio_unitario: new Prisma.Decimal(i.precio_unitario),
              descuento: new Prisma.Decimal(i.descuento || 0),
              subtotal: new Prisma.Decimal(
                Number((i.cantidad * i.precio_unitario - (i.descuento || 0)).toFixed(2)),
              ),
              ancho_m: i.ancho_m != null ? new Prisma.Decimal(i.ancho_m) : null,
              alto_m: i.alto_m != null ? new Prisma.Decimal(i.alto_m) : null,
              unidad_medida_detalle: i.unidad_medida_detalle ?? null,
            })),
          },
        },
        include: { cotizacion_detalle: true },
      });
      return cotizacion;
    });
  }

  async update(id: number, dto: Partial<CotizacionInput>) {
    const existing = await this.findById(id);
    if (existing.estado !== 'pendiente') {
      throw new ConflictError('Solo se pueden editar cotizaciones pendientes');
    }
    return prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.cotizacion_detalle.deleteMany({ where: { cotizacion_id: id } });
        const total = dto.items.reduce(
          (acc, i) => acc + (i.cantidad * i.precio_unitario - (i.descuento || 0)), 0,
        ) - (dto.descuento || 0);
        const totalFinal = Math.max(0, Number(total.toFixed(2)));
        await tx.cotizaciones.update({
          where: { id },
          data: {
            ...(dto.cliente_id !== undefined && { cliente_id: dto.cliente_id }),
            ...(dto.descuento !== undefined && { descuento: new Prisma.Decimal(dto.descuento) }),
            ...(dto.descuento_motivo !== undefined && { descuento_motivo: dto.descuento_motivo }),
            ...(dto.notas !== undefined && { notas: dto.notas }),
            total: new Prisma.Decimal(totalFinal),
            cotizacion_detalle: {
              create: dto.items.map((i) => ({
                producto_id: i.producto_id,
                cantidad: i.cantidad,
                precio_unitario: new Prisma.Decimal(i.precio_unitario),
                descuento: new Prisma.Decimal(i.descuento || 0),
                subtotal: new Prisma.Decimal(
                  Number((i.cantidad * i.precio_unitario - (i.descuento || 0)).toFixed(2)),
                ),
                ancho_m: i.ancho_m != null ? new Prisma.Decimal(i.ancho_m) : null,
                alto_m: i.alto_m != null ? new Prisma.Decimal(i.alto_m) : null,
                unidad_medida_detalle: i.unidad_medida_detalle ?? null,
              })),
            },
          },
        });
      } else {
        await tx.cotizaciones.update({
          where: { id },
          data: {
            ...(dto.cliente_id !== undefined && { cliente_id: dto.cliente_id }),
            ...(dto.descuento !== undefined && { descuento: new Prisma.Decimal(dto.descuento) }),
            ...(dto.descuento_motivo !== undefined && { descuento_motivo: dto.descuento_motivo }),
            ...(dto.notas !== undefined && { notas: dto.notas }),
          },
        });
      }
      return this.findById(id);
    });
  }

  /**
   * Convierte una cotización en venta.
   * - Usa precios originales (no actualiza a precios actuales)
   * - El usuario puede editar antes de confirmar (items + descuento)
   * - Cambia estado de cotización a 'convertida'
   * - Crea venta con cotizacion_id, descuenta inventario
   */
  async convertirAVenta(id: number, ajustes?: {
    items?: CotizacionItemInput[];
    descuento?: number;
    descuento_motivo?: string;
    sucursal_id?: number;
    usuario_id?: number;
    metodo_pago?: string;
    metodo_pago_id?: number;
    notas?: string;
  }) {
    const cot = await this.findById(id);
    if (cot.estado === 'convertida') throw new ConflictError('La cotización ya fue convertida');
    if (cot.estado === 'cancelada') throw new ConflictError('La cotización está cancelada');

    const itemsFinales = ajustes?.items && ajustes.items.length > 0
      ? ajustes.items
      : cot.cotizacion_detalle.map((d) => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          precio_unitario: Number(d.precio_unitario),
          descuento: Number(d.descuento),
          alto_m: d.alto_m != null ? Number(d.alto_m) : undefined,
          ancho_m: d.ancho_m != null ? Number(d.ancho_m) : undefined,
        }));

    return prisma.$transaction(async (tx) => {
      const descuento = ajustes?.descuento ?? Number(cot.descuento);
      const descuentoMotivo = ajustes?.descuento_motivo ?? cot.descuento_motivo ?? undefined;
      const total = itemsFinales.reduce(
        (acc, i) => acc + (i.cantidad * i.precio_unitario - (i.descuento || 0)), 0,
      ) - descuento;
      const totalFinal = Math.max(0, Number(total.toFixed(2)));

      // Crear venta
      const venta = await tx.ventas.create({
        data: {
          ...(cot.cliente_id && { cliente_id: cot.cliente_id }),
          ...(ajustes?.sucursal_id && { sucursal_id: ajustes.sucursal_id }),
          ...(ajustes?.usuario_id && { usuario_id: ajustes.usuario_id }),
          total: new Prisma.Decimal(totalFinal),
          descuento: new Prisma.Decimal(descuento),
          ...(descuentoMotivo && { descuento_motivo: descuentoMotivo }),
          metodo_pago: ajustes?.metodo_pago || 'efectivo',
          ...(ajustes?.metodo_pago_id && { metodo_pago_id: ajustes.metodo_pago_id }),
          cotizacion_id: cot.id,
          ...(ajustes?.notas && { notas: ajustes.notas }),
          estado: 'completada',
          estado_pago: 'pagada',
          saldo_pendiente: new Prisma.Decimal(0),
          venta_detalle: {
            create: itemsFinales.map((i) => ({
              producto_id: i.producto_id,
              cantidad: i.cantidad,
              precio_unitario: new Prisma.Decimal(i.precio_unitario),
              descuento: new Prisma.Decimal(i.descuento || 0),
              subtotal: new Prisma.Decimal(
                Number((i.cantidad * i.precio_unitario - (i.descuento || 0)).toFixed(2)),
              ),
            })),
          },
        },
        include: { venta_detalle: true },
      });

      // Descontar inventario y registrar impresiones
      for (let idx = 0; idx < itemsFinales.length; idx++) {
        const item = itemsFinales[idx];
        const sucursalId = ajustes?.sucursal_id || cot.sucursal_id;
        if (sucursalId) {
          const inv = await tx.inventario.findFirst({
            where: { producto_id: item.producto_id, sucursal_id: sucursalId },
          });
          if (inv) {
            await tx.inventario.update({
              where: { id: inv.id },
              data: { cantidad: { decrement: item.cantidad } },
            });
          }
          await tx.kardex_movimientos.create({
            data: {
              producto_id: item.producto_id,
              sucursal_id: sucursalId,
              tipo: 'salida',
              cantidad: item.cantidad,
              venta_id: venta.id,
              referencia: `Cotización ${cot.folio}`,
              ...(ajustes?.usuario_id && { usuario_id: ajustes.usuario_id }),
            },
          });
          // Registrar impresión si producto tiene máquina
          const producto = await tx.productos.findUnique({
            where: { id: item.producto_id },
            select: { maquina_id: true },
          });
          if (producto?.maquina_id) {
            const ventaDetalleId = venta.venta_detalle[idx]?.id ?? null;
            await tx.impresiones.create({
              data: {
                maquina_id: producto.maquina_id,
                producto_id: item.producto_id,
                venta_id: venta.id,
                venta_detalle_id: ventaDetalleId,
                sucursal_id: sucursalId,
                ...(ajustes?.usuario_id && { usuario_id: ajustes.usuario_id }),
              },
            });
            await tx.maquinas.update({
              where: { id: producto.maquina_id },
              data: { contador_total: { increment: item.cantidad } },
            });
          }
          // Descontar insumos del BOM (mismo factor de consumo que ventas.create)
          const productoInsumos = await tx.producto_insumos.findMany({
            where: { producto_id: item.producto_id },
          });
          for (const pi of productoInsumos) {
            const factorConsumo = item.alto_m != null && Number(item.alto_m) > 0
              ? Number(item.alto_m)
              : Number(item.cantidad);
            const cantidadDescontar = Number(pi.cantidad_requerida) * factorConsumo;
            const insumoInv = await tx.insumos_inventario.findUnique({
              where: {
                insumo_id_sucursal_id: {
                  insumo_id: pi.insumo_id,
                  sucursal_id: sucursalId,
                },
              },
            });
            if (insumoInv) {
              await tx.insumos_inventario.update({
                where: {
                  insumo_id_sucursal_id: {
                    insumo_id: pi.insumo_id,
                    sucursal_id: sucursalId,
                  },
                },
                data: { cantidad: { decrement: cantidadDescontar } },
              });
            }
          }
        }
      }

      // Marcar cotización como convertida
      await tx.cotizaciones.update({
        where: { id },
        data: { estado: 'convertida', venta_id: venta.id },
      });

      return venta;
    });
  }

  async cancelar(id: number) {
    const cot = await this.findById(id);
    if (cot.estado === 'convertida') throw new ConflictError('No se puede cancelar una cotización convertida');
    return prisma.cotizaciones.update({ where: { id }, data: { estado: 'cancelada' } });
  }
}

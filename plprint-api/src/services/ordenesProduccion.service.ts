import { prisma } from '../config/database';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

const ESTATUS_VALIDOS = ['pendiente', 'en_proceso', 'terminado', 'entregado', 'cancelado'] as const;
type EstatusOrden = (typeof ESTATUS_VALIDOS)[number];

const PRIORIDADES_VALIDAS = ['baja', 'normal', 'alta', 'urgente'] as const;
type PrioridadOrden = (typeof PRIORIDADES_VALIDAS)[number];

const TRANSICIONES: Record<EstatusOrden, EstatusOrden[]> = {
  pendiente:   ['en_proceso', 'cancelado'],
  en_proceso:  ['terminado', 'cancelado'],
  terminado:   ['entregado', 'cancelado'],
  entregado:   [],
  cancelado:   [],
};

interface CreateOrdenDTO {
  sucursalId: number;
  productoId: number;
  cantidad: number;
  prioridad?: PrioridadOrden;
  fechaFinEstimada?: string | Date | null;
  usuarioAsignadoId?: number | null;
  maquinaId?: number | null;
  notas?: string | null;
  usuarioCreadorId: number;
}

interface UpdateOrdenDTO {
  cantidad?: number;
  prioridad?: PrioridadOrden;
  fechaFinEstimada?: string | Date | null;
  usuarioAsignadoId?: number | null;
  maquinaId?: number | null;
  notas?: string | null;
  cantidadProducida?: number;
}

interface CambiarEstatusDTO {
  nuevoEstatus: EstatusOrden;
  usuarioId: number;
  notas?: string | null;
  cantidadProducida?: number;
}

interface FindAllFilters {
  estatus?: EstatusOrden;
  sucursalId?: number;
  productoId?: number;
  usuarioAsignadoId?: number;
  prioridad?: PrioridadOrden;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
}

const ordenInclude = {
  sucursales: { select: { id: true, nombre: true } },
  productos: {
    select: {
      id: true,
      nombre: true,
      codigo: true,
      precio_venta: true,
      imagen_url: true,
    },
  },
  maquinas: { select: { id: true, nombre: true, tipo: true } },
  usuario_creador: { select: { id: true, nombre: true } },
  usuario_asignado: { select: { id: true, nombre: true } },
  historial: {
    orderBy: { created_at: 'desc' as const },
    include: { usuario: { select: { id: true, nombre: true } } },
  },
};

export class OrdenesProduccionService {
  async findAll(filters: FindAllFilters = {}) {
    const where: any = {};

    if (filters.estatus) where.estatus = filters.estatus;
    if (filters.sucursalId) where.sucursal_id = filters.sucursalId;
    if (filters.productoId) where.producto_id = filters.productoId;
    if (filters.usuarioAsignadoId) where.usuario_asignado_id = filters.usuarioAsignadoId;
    if (filters.prioridad) where.prioridad = filters.prioridad;

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fecha_creacion = {};
      if (filters.fechaDesde) where.fecha_creacion.gte = filters.fechaDesde;
      if (filters.fechaHasta) where.fecha_creacion.lte = filters.fechaHasta;
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { productos: { nombre: { contains: term, mode: 'insensitive' as const } } },
        { productos: { codigo: { contains: term, mode: 'insensitive' as const } } },
        { notas: { contains: term, mode: 'insensitive' as const } },
      ];
    }

    return prisma.ordenes_produccion.findMany({
      where,
      orderBy: [
        { estatus: 'asc' },
        { prioridad: 'desc' },
        { fecha_creacion: 'desc' },
      ],
      include: ordenInclude,
    });
  }

  async findById(id: number) {
    const orden = await prisma.ordenes_produccion.findUnique({
      where: { id },
      include: {
        ...ordenInclude,
        productos: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            precio_venta: true,
            imagen_url: true,
            producto_insumos: {
              include: {
                insumos: {
                  select: { id: true, nombre: true, unidad_medida: true, codigo: true },
                },
              },
            },
          },
        },
      },
    });
    if (!orden) throw new NotFoundError('Orden de producción');
    return orden;
  }

  async create(dto: CreateOrdenDTO) {
    const sucursal = await prisma.sucursales.findUnique({ where: { id: dto.sucursalId } });
    if (!sucursal) throw new NotFoundError('Sucursal');

    const producto = await prisma.productos.findUnique({ where: { id: dto.productoId } });
    if (!producto) throw new NotFoundError('Producto');
    if (!producto.activo) throw new ValidationError('El producto no está activo');

    if (dto.usuarioAsignadoId) {
      const u = await prisma.usuarios.findUnique({ where: { id: dto.usuarioAsignadoId } });
      if (!u) throw new NotFoundError('Usuario asignado');
    }

    if (dto.maquinaId) {
      const m = await prisma.maquinas.findUnique({ where: { id: dto.maquinaId } });
      if (!m) throw new NotFoundError('Máquina');
    }

    return prisma.$transaction(async (tx) => {
      const orden = await tx.ordenes_produccion.create({
        data: {
          sucursal_id: dto.sucursalId,
          producto_id: dto.productoId,
          cantidad: dto.cantidad,
          prioridad: dto.prioridad ?? 'normal',
          fecha_fin_estimada: dto.fechaFinEstimada ? new Date(dto.fechaFinEstimada) : null,
          usuario_asignado_id: dto.usuarioAsignadoId ?? null,
          maquina_id: dto.maquinaId ?? null,
          notas: dto.notas ?? null,
          usuario_creador_id: dto.usuarioCreadorId,
          estatus: 'pendiente',
        },
        include: ordenInclude,
      });

      await tx.ordenes_produccion_historial.create({
        data: {
          orden_id: orden.id,
          estatus_anterior: null,
          estatus_nuevo: 'pendiente',
          usuario_id: dto.usuarioCreadorId,
          notas: 'Orden creada',
        },
      });

      return orden;
    });
  }

  async update(id: number, dto: UpdateOrdenDTO) {
    const orden = await this.findById(id);

    if (orden.estatus === 'cancelado' || orden.estatus === 'entregado') {
      throw new ValidationError(`No se puede editar una orden en estatus "${orden.estatus}"`);
    }

    return prisma.ordenes_produccion.update({
      where: { id },
      data: {
        ...(dto.cantidad !== undefined && { cantidad: dto.cantidad }),
        ...(dto.prioridad !== undefined && { prioridad: dto.prioridad }),
        ...(dto.fechaFinEstimada !== undefined && {
          fecha_fin_estimada: dto.fechaFinEstimada ? new Date(dto.fechaFinEstimada) : null,
        }),
        ...(dto.usuarioAsignadoId !== undefined && { usuario_asignado_id: dto.usuarioAsignadoId }),
        ...(dto.maquinaId !== undefined && { maquina_id: dto.maquinaId }),
        ...(dto.notas !== undefined && { notas: dto.notas }),
        ...(dto.cantidadProducida !== undefined && { cantidad_producida: dto.cantidadProducida }),
      },
      include: ordenInclude,
    });
  }

  async cambiarEstatus(id: number, dto: CambiarEstatusDTO) {
    const orden = await this.findById(id);

    if (!ESTATUS_VALIDOS.includes(dto.nuevoEstatus)) {
      throw new ValidationError(`Estatus inválido: ${dto.nuevoEstatus}`);
    }

    const estatusActual = orden.estatus as EstatusOrden;
    const transicionesPermitidas = TRANSICIONES[estatusActual];

    if (estatusActual === dto.nuevoEstatus) {
      throw new ValidationError(`La orden ya está en estatus "${dto.nuevoEstatus}"`);
    }

    if (!transicionesPermitidas.includes(dto.nuevoEstatus)) {
      throw new ValidationError(
        `No se puede cambiar de "${estatusActual}" a "${dto.nuevoEstatus}". Transiciones permitidas: ${transicionesPermitidas.join(', ') || 'ninguna'}`,
      );
    }

    return prisma.$transaction(async (tx) => {
      const updateData: any = { estatus: dto.nuevoEstatus };
      const now = new Date();

      if (dto.nuevoEstatus === 'en_proceso' && !orden.fecha_inicio) {
        updateData.fecha_inicio = now;

        const insumosRequeridos = await tx.producto_insumos.findMany({
          where: { producto_id: orden.producto_id },
        });

        if (insumosRequeridos.length > 0) {
          for (const pi of insumosRequeridos) {
            const cantidadRequerida = Number(pi.cantidad_requerida) * orden.cantidad;
            const inv = await tx.insumos_inventario.findUnique({
              where: {
                insumo_id_sucursal_id: {
                  insumo_id: pi.insumo_id,
                  sucursal_id: orden.sucursal_id,
                },
              },
            });

            if (!inv || Number(inv.cantidad) < cantidadRequerida) {
              const insumo = await tx.insumos.findUnique({ where: { id: pi.insumo_id } });
              throw new ConflictError(
                `Stock insuficiente de insumo "${insumo?.nombre ?? pi.insumo_id}". Requerido: ${cantidadRequerida}, disponible: ${inv ? Number(inv.cantidad) : 0}`,
              );
            }
          }

          for (const pi of insumosRequeridos) {
            const cantidadRequerida = Number(pi.cantidad_requerida) * orden.cantidad;
            await tx.insumos_inventario.update({
              where: {
                insumo_id_sucursal_id: {
                  insumo_id: pi.insumo_id,
                  sucursal_id: orden.sucursal_id,
                },
              },
              data: { cantidad: { decrement: cantidadRequerida } },
            });

            await tx.kardex_movimientos.create({
              data: {
                tipo: 'salida',
                cantidad: cantidadRequerida,
                sucursal_id: orden.sucursal_id,
                usuario_id: dto.usuarioId,
                referencia: `Orden de producción #${orden.id}`,
                notas: `Consumo de insumo #${pi.insumo_id} para producción`,
              },
            });
          }
        }
      }

      if (dto.nuevoEstatus === 'terminado') {
        updateData.fecha_fin_real = now;
        if (dto.cantidadProducida !== undefined) {
          if (dto.cantidadProducida < 0) {
            throw new ValidationError('cantidadProducida no puede ser negativo');
          }
          updateData.cantidad_producida = dto.cantidadProducida;
        } else {
          updateData.cantidad_producida = orden.cantidad;
        }

        await tx.inventario.upsert({
          where: {
            producto_id_sucursal_id: {
              producto_id: orden.producto_id,
              sucursal_id: orden.sucursal_id,
            },
          },
          create: {
            producto_id: orden.producto_id,
            sucursal_id: orden.sucursal_id,
            cantidad: updateData.cantidad_producida,
          },
          update: {
            cantidad: { increment: updateData.cantidad_producida },
          },
        });

        await tx.kardex_movimientos.create({
          data: {
            producto_id: orden.producto_id,
            tipo: 'entrada',
            cantidad: updateData.cantidad_producida,
            sucursal_id: orden.sucursal_id,
            usuario_id: dto.usuarioId,
            referencia: `Orden de producción #${orden.id}`,
            notas: 'Producto terminado',
          },
        });
      }

      if (dto.nuevoEstatus === 'entregado') {
        updateData.fecha_fin_real = orden.fecha_fin_real ?? now;
      }

      if (dto.nuevoEstatus === 'cancelado') {
        updateData.fecha_fin_real = now;
        if (orden.estatus === 'en_proceso' && orden.fecha_inicio) {
          const insumosRequeridos = await tx.producto_insumos.findMany({
            where: { producto_id: orden.producto_id },
          });

          for (const pi of insumosRequeridos) {
            const cantidadADevolver = Number(pi.cantidad_requerida) * orden.cantidad_producida;
            if (cantidadADevolver <= 0) continue;
            await tx.insumos_inventario.update({
              where: {
                insumo_id_sucursal_id: {
                  insumo_id: pi.insumo_id,
                  sucursal_id: orden.sucursal_id,
                },
              },
              data: { cantidad: { increment: cantidadADevolver } },
            });
          }
        }
      }

      const ordenActualizada = await tx.ordenes_produccion.update({
        where: { id },
        data: updateData,
        include: ordenInclude,
      });

      await tx.ordenes_produccion_historial.create({
        data: {
          orden_id: id,
          estatus_anterior: estatusActual,
          estatus_nuevo: dto.nuevoEstatus,
          usuario_id: dto.usuarioId,
          notas: dto.notas ?? null,
        },
      });

      return ordenActualizada;
    });
  }

  async remove(id: number) {
    const orden = await this.findById(id);
    if (orden.estatus !== 'pendiente' && orden.estatus !== 'cancelado') {
      throw new ValidationError(
        `Solo se pueden eliminar órdenes en estatus "pendiente" o "cancelado" (actual: "${orden.estatus}")`,
      );
    }
    await prisma.ordenes_produccion.delete({ where: { id } });
  }

  async getEstadisticas(sucursalId?: number) {
    const where = sucursalId ? { sucursal_id: sucursalId } : {};

    const [porEstatus, porPrioridad, total] = await Promise.all([
      prisma.ordenes_produccion.groupBy({
        by: ['estatus'],
        where,
        _count: { id: true },
      }),
      prisma.ordenes_produccion.groupBy({
        by: ['prioridad'],
        where,
        _count: { id: true },
      }),
      prisma.ordenes_produccion.count({ where }),
    ]);

    return {
      total,
      porEstatus: porEstatus.reduce<Record<string, number>>(
        (acc, e) => ({ ...acc, [e.estatus]: e._count.id }),
        {},
      ),
      porPrioridad: porPrioridad.reduce<Record<string, number>>(
        (acc, e) => ({ ...acc, [e.prioridad]: e._count.id }),
        {},
      ),
    };
  }
}

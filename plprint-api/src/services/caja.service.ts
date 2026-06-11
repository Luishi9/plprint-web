import { prisma } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

interface MovimientoQuery {
  sucursalId: number;
  usuarioId?: number;
  corteId?: number;
  page: number;
  limit: number;
}

interface CorteResumen {
  total_ventas: number;
  total_ingresos: number;
  total_gastos: number;
  total_retiros: number;
  total_efectivo_ventas: number;
  total_abonos_efectivo: number;
  efectivo_esperado: number;
  monto_inicial: number;
  ventas_por_metodo_pago: Array<{ metodo: string; total: number }>;
}

export class CajaService {
  async findEstado(sucursalId: number) {
    const abierta = await prisma.cortes_caja.findFirst({
      where: { sucursal_id: sucursalId, estado: 'abierta' },
      include: {
        usuario_apertura: { select: { id: true, nombre: true } },
      },
    });
    if (!abierta) return null;
    return abierta;
  }

  async aperturar(dto: {
    sucursal_id: number;
    usuario_id: number;
    monto_inicial: number;
  }) {
    const abierta = await prisma.cortes_caja.findFirst({
      where: { sucursal_id: dto.sucursal_id, estado: 'abierta' },
    });
    if (abierta) {
      throw new ConflictError('Ya hay una caja abierta en esta sucursal. Debe cerrarla antes de abrir una nueva.');
    }
    if (dto.monto_inicial < 0) {
      throw new ValidationError('El monto inicial no puede ser negativo');
    }
    return prisma.cortes_caja.create({
      data: {
        sucursal_id: dto.sucursal_id,
        usuario_apertura_id: dto.usuario_id,
        monto_inicial: dto.monto_inicial,
      },
    });
  }

  async realizarCorte(dto: {
    corte_id: number;
    usuario_id: number;
    monto_final_real: number;
    observaciones?: string;
  }) {
    const corte = await prisma.cortes_caja.findUnique({ where: { id: dto.corte_id } });
    if (!corte) throw new NotFoundError('Corte de caja');
    if (corte.estado !== 'abierta') throw new ConflictError('La caja ya está cerrada');

    const [ventasEfectivo, ingresos, gastos, retiros, abonos] = await Promise.all([
      this._sumVentasEfectivo(corte.sucursal_id, corte.fecha_apertura),
      this._sumGastosByTipo(corte.sucursal_id, corte.fecha_apertura, 'ingreso'),
      this._sumGastosByTipo(corte.sucursal_id, corte.fecha_apertura, 'gasto'),
      this._sumGastosByTipo(corte.sucursal_id, corte.fecha_apertura, 'retiro'),
      this._sumAbonosEfectivo(corte.sucursal_id, corte.fecha_apertura),
    ]);

    const montoEsperado = Number(corte.monto_inicial) + ventasEfectivo + ingresos + abonos - gastos - retiros;
    const diferencia = dto.monto_final_real - montoEsperado;

    return prisma.cortes_caja.update({
      where: { id: dto.corte_id },
      data: {
        fecha_cierre: new Date(),
        usuario_cierre_id: dto.usuario_id,
        monto_final_esperado: montoEsperado,
        monto_final_real: dto.monto_final_real,
        diferencia,
        observaciones: dto.observaciones,
        estado: 'cerrada',
      },
    });
  }

  async findMovimientos(query: MovimientoQuery) {
    const { sucursalId, usuarioId, corteId, page, limit } = query;
    const skip = (page - 1) * limit;

    let fechaDesde: Date | null = null;
    let fechaHasta: Date = new Date();

    if (corteId) {
      const corte = await prisma.cortes_caja.findUnique({ where: { id: corteId } });
      if (!corte) throw new NotFoundError('Corte de caja');
      fechaDesde = corte.fecha_apertura;
      fechaHasta = corte.fecha_cierre || new Date();
    } else {
      const abierta = await prisma.cortes_caja.findFirst({
        where: { sucursal_id: sucursalId, estado: 'abierta' },
      });
      if (abierta) {
        fechaDesde = abierta.fecha_apertura;
      }
    }

    if (!fechaDesde) {
      return { data: [], total: 0, resumen: null };
    }

    const ventasWhere: Record<string, unknown> = {
      sucursal_id: sucursalId,
      estado: 'completada',
      created_at: { gte: fechaDesde, lte: fechaHasta },
    };
    if (usuarioId) ventasWhere.usuario_id = usuarioId;

    const gastosWhere: Record<string, unknown> = {
      sucursal_id: sucursalId,
      fecha: { gte: fechaDesde, lte: fechaHasta },
    };
    if (usuarioId) gastosWhere.usuario_id = usuarioId;

    const [ventas, gastos, abonos, resumenVentas, resumenGastos, resumenAbonos] = await Promise.all([
      prisma.ventas.findMany({
        where: ventasWhere,
        select: {
          id: true,
          total: true,
          metodo_pago: true,
          created_at: true,
          usuario_id: true,
          sucursal_id: true,
          usuarios: { select: { id: true, nombre: true } },
        },
      }),
      prisma.gastos.findMany({
        where: gastosWhere,
        select: {
          id: true,
          monto: true,
          tipo: true,
          concepto: true,
          fecha: true,
          usuario_id: true,
          sucursal_id: true,
          usuarios: { select: { id: true, nombre: true } },
        },
      }),
      prisma.ventas_abonos.findMany({
        where: {
          metodo_pago: 'Efectivo',
          fecha: { gte: fechaDesde, lte: fechaHasta },
        },
        select: {
          id: true,
          monto: true,
          fecha: true,
          usuario_id: true,
          usuarios: { select: { id: true, nombre: true } },
        },
      }),
      prisma.ventas.aggregate({
        where: ventasWhere,
        _sum: { total: true },
      }),
      prisma.gastos.aggregate({
        where: gastosWhere,
        _sum: { monto: true },
      }),
      prisma.ventas_abonos.aggregate({
        where: {
          metodo_pago: 'Efectivo',
          fecha: { gte: fechaDesde, lte: fechaHasta },
        },
        _sum: { monto: true },
      }),
    ]);

    const movimientos: Array<{
      fecha: Date;
      usuario: string;
      usuario_id: number | null;
      tipo: string;
      tipo_display: string;
      monto: number;
      signo: number;
      metodo_pago: string;
      sucursal_id: number | null;
      referencia_id: number;
      referencia_tipo: string;
      concepto?: string;
    }> = [
      ...ventas.map((v) => ({
        fecha: v.created_at,
        usuario: v.usuarios?.nombre || 'Sistema',
        usuario_id: v.usuario_id,
        tipo: 'venta',
        tipo_display: 'Venta',
        monto: Number(v.total),
        signo: 1,
        metodo_pago: v.metodo_pago,
        sucursal_id: v.sucursal_id,
        referencia_id: v.id,
        referencia_tipo: 'venta',
      })),
      ...gastos.map((g) => ({
        fecha: g.fecha,
        usuario: g.usuarios?.nombre || 'Sistema',
        usuario_id: g.usuario_id,
        tipo: g.tipo,
        tipo_display: g.tipo === 'ingreso' ? 'Ingreso' : g.tipo === 'gasto' ? 'Gasto' : 'Retiro',
        monto: Number(g.monto),
        signo: g.tipo === 'ingreso' ? 1 : -1,
        metodo_pago: 'Efectivo',
        sucursal_id: g.sucursal_id,
        referencia_id: g.id,
        referencia_tipo: 'gasto',
        concepto: g.concepto,
      })),
      ...abonos.map((a) => ({
        fecha: a.fecha,
        usuario: a.usuarios?.nombre || 'Sistema',
        usuario_id: a.usuario_id,
        tipo: 'abono',
        tipo_display: 'Abono',
        monto: Number(a.monto),
        signo: 1,
        metodo_pago: 'Efectivo',
        sucursal_id: sucursalId,
        referencia_id: a.id,
        referencia_tipo: 'abono',
      })),
    ];

    const ventasPorMetodoPago = await prisma.ventas.groupBy({
      by: ['metodo_pago'],
      where: ventasWhere,
      _sum: { total: true },
    });

    const totalVentas = Number(resumenVentas._sum.total || 0);
    const totalGastos = Number(resumenGastos._sum.monto || 0);
    const totalAbonos = Number(resumenAbonos._sum.monto || 0);

    const gastosIngresos = gastos.filter((g) => g.tipo === 'ingreso').reduce((s, g) => s + Number(g.monto), 0);
    const gastosEgresos = gastos.filter((g) => g.tipo === 'gasto').reduce((s, g) => s + Number(g.monto), 0);
    const gastosRetiros = gastos.filter((g) => g.tipo === 'retiro').reduce((s, g) => s + Number(g.monto), 0);

    const resumen: CorteResumen = {
      total_ventas: totalVentas,
      total_ingresos: gastosIngresos,
      total_gastos: gastosEgresos,
      total_retiros: gastosRetiros,
      total_efectivo_ventas: ventas
        .filter((v) => v.metodo_pago === 'Efectivo')
        .reduce((s, v) => s + Number(v.total), 0),
      total_abonos_efectivo: totalAbonos,
      efectivo_esperado: 0,
      monto_inicial: 0,
      ventas_por_metodo_pago: ventasPorMetodoPago.map((v) => ({
        metodo: v.metodo_pago,
        total: Number(v._sum.total || 0),
      })),
    };

    movimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    const total = movimientos.length;
    const paginated = movimientos.slice(skip, skip + limit);

    return { data: paginated, total, resumen };
  }

  async findAllCortes({ sucursalId, page, limit }: {
    sucursalId: number; page: number; limit: number;
  }) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (sucursalId) where.sucursal_id = sucursalId;

    const [data, total] = await Promise.all([
      prisma.cortes_caja.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha_apertura: 'desc' },
        include: {
          sucursales: { select: { id: true, nombre: true } },
          usuario_apertura: { select: { id: true, nombre: true } },
          usuario_cierre: { select: { id: true, nombre: true } },
        },
      }),
      prisma.cortes_caja.count({ where }),
    ]);
    return { data, total };
  }

  async findCorteById(id: number) {
    const corte = await prisma.cortes_caja.findUnique({
      where: { id },
      include: {
        sucursales: { select: { id: true, nombre: true } },
        usuario_apertura: { select: { id: true, nombre: true } },
        usuario_cierre: { select: { id: true, nombre: true } },
      },
    });
    if (!corte) throw new NotFoundError('Corte de caja');
    return corte;
  }

  async findMovimientosByCorteId(corteId: number) {
    const corte = await this.findCorteById(corteId);
    const result = await this.findMovimientos({
      sucursalId: corte.sucursal_id,
      corteId,
      page: 1,
      limit: 10000,
    });
    return { corte, movimientos: result.data, resumen: result.resumen };
  }

  async registarMovimientoCaja(dto: {
    sucursal_id: number;
    usuario_id: number;
    categoria_id: number;
    concepto: string;
    monto: number;
    tipo: 'ingreso' | 'gasto' | 'retiro';
    autorizado_por?: number;
    notas?: string;
  }) {
    return prisma.gastos.create({
      data: {
        sucursal_id: dto.sucursal_id,
        usuario_id: dto.usuario_id,
        categoria_id: dto.categoria_id,
        concepto: dto.concepto,
        monto: dto.monto,
        tipo: dto.tipo,
        autorizado_por: dto.autorizado_por,
        notas: dto.notas,
      },
    });
  }

  private async _sumVentasEfectivo(sucursalId: number, desde: Date) {
    const result = await prisma.ventas.aggregate({
      where: {
        sucursal_id: sucursalId,
        estado: 'completada',
        metodo_pago: 'Efectivo',
        created_at: { gte: desde },
      },
      _sum: { total: true },
    });
    return Number(result._sum.total || 0);
  }

  private async _sumGastosByTipo(sucursalId: number, desde: Date, tipo: string) {
    const result = await prisma.gastos.aggregate({
      where: {
        sucursal_id: sucursalId,
        tipo,
        fecha: { gte: desde },
      },
      _sum: { monto: true },
    });
    return Number(result._sum.monto || 0);
  }

  private async _sumAbonosEfectivo(sucursalId: number, desde: Date) {
    const result = await prisma.ventas_abonos.aggregate({
      where: {
        metodo_pago: 'Efectivo',
        fecha: { gte: desde },
      },
      _sum: { monto: true },
    });
    return Number(result._sum.monto || 0);
  }
}

import { prisma } from '../config/database';

export interface RangoFechas {
  desde?: Date;
  hasta?: Date;
  sucursalId?: number;
}

interface FiltroBase {
  desde?: Date;
  hasta?: Date;
  sucursalId?: number;
  metodoPagoId?: number;
  usuarioId?: number;
}

function buildWhereVentasCompletadas(f: FiltroBase) {
  return {
    estado: 'completada',
    ...(f.sucursalId && { sucursal_id: f.sucursalId }),
    ...(f.metodoPagoId && { metodo_pago_id: f.metodoPagoId }),
    ...(f.usuarioId && { usuario_id: f.usuarioId }),
    ...((f.desde || f.hasta) && {
      created_at: {
        ...(f.desde && { gte: f.desde }),
        ...(f.hasta && { lte: f.hasta }),
      },
    }),
  };
}

export class ReportesService {
  // ============== VENTAS POR RANGO ==============

  async ventasPorRango(f: RangoFechas) {
    const where = buildWhereVentasCompletadas(f);

    const [total, cantidad, ventasPorDia, ventasPorMetodo, ventasPorSucursal] = await Promise.all([
      prisma.ventas.aggregate({
        where,
        _sum: { total: true, descuento: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      prisma.ventas.count({ where }),
      this.ventasPorDia(f),
      this.ventasPorMetodoPago(f),
      this.ventasPorSucursal(f),
    ]);

    return {
      rango: { desde: f.desde, hasta: f.hasta, sucursal_id: f.sucursalId },
      resumen: {
        total_ventas: cantidad,
        ingresos_totales: Number(total._sum.total ?? 0),
        descuentos_totales: Number(total._sum.descuento ?? 0),
        ticket_promedio: Number(total._avg.total ?? 0),
      },
      por_dia: ventasPorDia,
      por_metodo_pago: ventasPorMetodo,
      por_sucursal: ventasPorSucursal,
    };
  }

  async ventasPorDia(f: RangoFechas) {
    const where = buildWhereVentasCompletadas(f);
    const ventas = await prisma.ventas.findMany({
      where,
      select: { created_at: true, total: true },
    });

    const mapa = new Map<string, { fecha: string; ventas: number; ingresos: number }>();
    for (const v of ventas) {
      const fecha = v.created_at.toISOString().slice(0, 10);
      const entry = mapa.get(fecha) ?? { fecha, ventas: 0, ingresos: 0 };
      entry.ventas += 1;
      entry.ingresos += Number(v.total);
      mapa.set(fecha, entry);
    }
    return Array.from(mapa.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  async ventasPorMetodoPago(f: FiltroBase) {
    const where = buildWhereVentasCompletadas(f);
    const rows = await prisma.ventas.groupBy({
      by: ['metodo_pago_id'],
      where,
      _count: { id: true },
      _sum: { total: true },
    });

    const metodos = await prisma.metodos_pago.findMany();
    const metodosMap = new Map(metodos.map((m) => [m.id, m]));

    return rows.map((r) => ({
      metodo_pago_id: r.metodo_pago_id,
      metodo_nombre: r.metodo_pago_id ? metodosMap.get(r.metodo_pago_id)?.nombre ?? 'Desconocido' : 'Sin método',
      ventas: r._count.id,
      ingresos: Number(r._sum.total ?? 0),
    })).sort((a, b) => b.ingresos - a.ingresos);
  }

  async ventasPorSucursal(f: FiltroBase) {
    const where = buildWhereVentasCompletadas(f);
    const rows = await prisma.ventas.groupBy({
      by: ['sucursal_id'],
      where,
      _count: { id: true },
      _sum: { total: true },
    });

    const sucursales = await prisma.sucursales.findMany();
    const sucursalesMap = new Map(sucursales.map((s) => [s.id, s]));

    return rows.map((r) => ({
      sucursal_id: r.sucursal_id,
      sucursal_nombre: r.sucursal_id ? sucursalesMap.get(r.sucursal_id)?.nombre ?? 'Desconocida' : 'Sin sucursal',
      ventas: r._count.id,
      ingresos: Number(r._sum.total ?? 0),
    })).sort((a, b) => b.ingresos - a.ingresos);
  }

  // ============== TOP ==============

  async topProductos(f: FiltroBase, limite = 10) {
    const where = buildWhereVentasCompletadas(f);
    const detalles = await prisma.venta_detalle.findMany({
      where: { ventas: where },
      include: { productos: { select: { id: true, nombre: true, codigo: true } } },
    });

    const mapa = new Map<number, { producto_id: number; nombre: string; codigo: string | null; cantidad: number; ingresos: number }>();
    for (const d of detalles) {
      if (!d.producto_id || !d.productos) continue;
      const entry = mapa.get(d.producto_id) ?? {
        producto_id: d.producto_id,
        nombre: d.productos.nombre,
        codigo: d.productos.codigo,
        cantidad: 0,
        ingresos: 0,
      };
      entry.cantidad += d.cantidad;
      entry.ingresos += Number(d.subtotal);
      mapa.set(d.producto_id, entry);
    }

    return Array.from(mapa.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limite);
  }

  async topClientes(f: FiltroBase, limite = 10) {
    const where = buildWhereVentasCompletadas(f);
    const rows = await prisma.ventas.groupBy({
      by: ['cliente_id'],
      where,
      _count: { id: true },
      _sum: { total: true },
    });

    const clientes = await prisma.clientes.findMany();
    const clientesMap = new Map(clientes.map((c) => [c.id, c]));

    return rows
      .filter((r) => r.cliente_id !== null)
      .map((r) => ({
        cliente_id: r.cliente_id!,
        nombre: clientesMap.get(r.cliente_id!)?.nombre ?? 'Desconocido',
        compras: r._count.id,
        total_gastado: Number(r._sum.total ?? 0),
      }))
      .sort((a, b) => b.total_gastado - a.total_gastado)
      .slice(0, limite);
  }

  // ============== KARDEX ==============

  async kardexGlobal(f: { desde?: Date; hasta?: Date; productoId?: number; sucursalId?: number; limit?: number }) {
    const where: Record<string, unknown> = {};
    if (f.productoId) where.producto_id = f.productoId;
    if (f.sucursalId) where.sucursal_id = f.sucursalId;
    if (f.desde || f.hasta) {
      where.created_at = {};
      if (f.desde) (where.created_at as Record<string, Date>).gte = f.desde;
      if (f.hasta) (where.created_at as Record<string, Date>).lte = f.hasta;
    }

    return prisma.kardex_movimientos.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: f.limit ?? 200,
      include: {
        productos: { select: { id: true, nombre: true, codigo: true } },
        sucursales: { select: { id: true, nombre: true } },
        usuarios: { select: { id: true, nombre: true } },
      },
    });
  }

  // ============== GANANCIAS ==============

  async ganancias(f: RangoFechas) {
    const where = buildWhereVentasCompletadas(f);

    const [ingresos, canceladas] = await Promise.all([
      prisma.ventas.aggregate({
        where,
        _sum: { total: true, descuento: true },
        _count: { id: true },
      }),
      prisma.ventas.aggregate({
        where: { ...where, estado: 'cancelada' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const detalles = await prisma.venta_detalle.findMany({
      where: { ventas: where },
      include: {
        productos: { select: { id: true, nombre: true, precio_compra: true } },
      },
    });

    const costosMap = new Map<number, number>();
    for (const d of detalles) {
      if (!d.producto_id || !d.productos) continue;
      const precioCompra = d.productos.precio_compra ? Number(d.productos.precio_compra) : 0;
      costosMap.set(d.producto_id, precioCompra);
    }

    let costoTotal = 0;
    for (const d of detalles) {
      if (!d.producto_id) continue;
      const costoUnit = costosMap.get(d.producto_id) ?? 0;
      costoTotal += costoUnit * d.cantidad;
    }

    const ingresosNetos = Number(ingresos._sum.total ?? 0);
    const utilidad = ingresosNetos - costoTotal;
    const margen = ingresosNetos > 0 ? (utilidad / ingresosNetos) * 100 : 0;

    return {
      rango: { desde: f.desde, hasta: f.hasta, sucursal_id: f.sucursalId },
      ventas_completadas: ingresos._count.id,
      ingresos_brutos: ingresosNetos,
      descuentos: Number(ingresos._sum.descuento ?? 0),
      costo_estimado: costoTotal,
      utilidad_bruta: utilidad,
      margen_porcentaje: Number(margen.toFixed(2)),
      ventas_canceladas: canceladas._count.id,
      perdida_por_cancelaciones: Number(canceladas._sum.total ?? 0),
    };
  }

  async dashboard(sucursalId?: number) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const baseWhere = { estado: 'completada', ...(sucursalId && { sucursal_id: sucursalId }) };

    const [hoyStats, ultimos30, topProds, ventasPorMetodo] = await Promise.all([
      prisma.ventas.aggregate({
        where: { ...baseWhere, created_at: { gte: hoy, lte: fin } },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.ventas.aggregate({
        where: { ...baseWhere, created_at: { gte: hace30 } },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.topProductos({ desde: hace30, hasta: new Date(), sucursalId }, 5),
      this.ventasPorMetodoPago({ desde: hace30, hasta: new Date(), sucursalId }),
    ]);

    return {
      hoy: {
        ventas: hoyStats._count.id,
        ingresos: Number(hoyStats._sum.total ?? 0),
      },
      ultimos_30_dias: {
        ventas: ultimos30._count.id,
        ingresos: Number(ultimos30._sum.total ?? 0),
      },
      top_productos: topProds,
      ventas_por_metodo_pago: ventasPorMetodo,
    };
  }
}

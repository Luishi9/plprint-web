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

    const corte = await prisma.cortes_caja.create({
      data: {
        sucursal_id: dto.sucursal_id,
        usuario_apertura_id: dto.usuario_id,
        monto_inicial: dto.monto_inicial,
      },
    });

    // Snapshot de maquinas activas: contador_inicial = contador_total al momento de apertura.
    const maquinas = await prisma.maquinas.findMany({
      where: { sucursal_id: dto.sucursal_id, activo: true },
      select: { id: true, nombre: true, tipo: true, contador_total: true },
      orderBy: { nombre: 'asc' },
    });

    if (maquinas.length > 0) {
      await prisma.cortes_maquinas.create({
        data: {
          corte_caja_id: corte.id,
          sucursal_id: dto.sucursal_id,
          fecha_apertura: corte.fecha_apertura,
          fecha_cierre: corte.fecha_apertura,
          detalle: {
            create: maquinas.map((m) => ({
              maquina_id: m.id,
              nombre: m.nombre,
              tipo: m.tipo,
              contador_inicial: m.contador_total,
              contador_actual: m.contador_total,
              contador_final: m.contador_total,
            })),
          },
        },
      });
    }

    return corte;
  }

  async realizarCorte(dto: {
    corte_id: number;
    usuario_id: number;
    monto_final_real: number;
    observaciones?: string;
    maquinasContadores?: Array<{ maquinaId: number; contadorFinal: number }>;
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

    // Si vienen maquinasContadores, validar y actualizar maquinas.contador_total.
    if (dto.maquinasContadores && dto.maquinasContadores.length > 0) {
      for (const mc of dto.maquinasContadores) {
        const maquina = await prisma.maquinas.findUnique({
          where: { id: mc.maquinaId },
          select: { id: true, contador_total: true },
        });
        if (!maquina) {
          throw new ValidationError(`Máquina ${mc.maquinaId} no existe.`);
        }
        const actualNum = Number(maquina.contador_total);
        if (mc.contadorFinal < actualNum) {
          throw new ValidationError(
            `El contador final de la máquina ${mc.maquinaId} (${mc.contadorFinal}) no puede ser menor al contador actual (${actualNum}).`,
          );
        }
      }
    }

    const result = await prisma.cortes_caja.update({
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

    // Persistir reporte de maquinas: actualizar contador_actual, contador_final y maquinas.contador_total.
    if (dto.maquinasContadores && dto.maquinasContadores.length > 0) {
      const fechaCierre = result.fecha_cierre || new Date();

      const reporte = await prisma.cortes_maquinas.findUnique({
        where: { corte_caja_id: dto.corte_id },
        include: { detalle: true },
      });

      if (reporte) {
        const detalleMap = new Map(reporte.detalle.map((d) => [d.maquina_id, d]));
        for (const mc of dto.maquinasContadores) {
          const det = detalleMap.get(mc.maquinaId);
          if (!det) continue;
          const maquinaActual = await prisma.maquinas.findUnique({
            where: { id: mc.maquinaId },
            select: { contador_total: true },
          });
          const contadorActualNum = maquinaActual ? Number(maquinaActual.contador_total) : Number(det.contador_inicial);
          const contadorFinalNum = Number(mc.contadorFinal);
          await prisma.cortes_maquinas_detalle.update({
            where: { id: det.id },
            data: {
              contador_actual: contadorActualNum,
              contador_final: contadorFinalNum,
            },
          });
          await prisma.maquinas.update({
            where: { id: mc.maquinaId },
            data: { contador_total: contadorFinalNum },
          });
        }
        await prisma.cortes_maquinas.update({
          where: { id: reporte.id },
          data: { fecha_cierre: fechaCierre },
        });
      }
    }

    return result;
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
      } else {
        // Sin caja abierta: tomar la fecha más reciente entre el último cierre
        // y el último movimiento registrado, para mostrar ventas/gastos/abonos
        // que aún no pertenecen a ningún corte cerrado.
        const ultimoCorte = await prisma.cortes_caja.findFirst({
          where: { sucursal_id: sucursalId, estado: 'cerrada' },
          orderBy: { fecha_cierre: 'desc' },
        });
        const candidatos: Date[] = [];
        if (ultimoCorte?.fecha_cierre) candidatos.push(ultimoCorte.fecha_cierre);
        const [ultimaVenta, ultimoGasto, ultimoAbono] = await Promise.all([
          prisma.ventas.findFirst({
            where: { sucursal_id: sucursalId },
            orderBy: { created_at: 'desc' },
          }),
          prisma.gastos.findFirst({
            where: { sucursal_id: sucursalId },
            orderBy: { fecha: 'desc' },
          }),
          prisma.ventas_abonos.findFirst({
            where: { ventas: { sucursal_id: sucursalId } },
            orderBy: { fecha: 'desc' },
          }),
        ]);
        if (ultimaVenta) candidatos.push(ultimaVenta.created_at);
        if (ultimoGasto) candidatos.push(ultimoGasto.fecha);
        if (ultimoAbono) candidatos.push(ultimoAbono.fecha);
        if (candidatos.length > 0) {
          fechaDesde = new Date(Math.max(...candidatos.map((d) => d.getTime())));
        } else {
          // Sin historial: mostrar las últimas 24h para no devolver lista vacía.
          fechaDesde = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }
      }
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
        .filter((v) => v.metodo_pago?.toLowerCase() === 'efectivo')
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
        metodo_pago: 'efectivo',
        created_at: { gte: desde },
      },
      _sum: { total: true },
    });
    return Number(result?._sum?.total || 0);
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

  async getReporteMaquinasByCorte(corteCajaId: number) {
    const reporte = await prisma.cortes_maquinas.findUnique({
      where: { corte_caja_id: corteCajaId },
      include: {
        detalle: {
          orderBy: { nombre: 'asc' },
        },
      },
    });

    if (!reporte) {
      // Fallback: si no hay snapshot, calcular desde los contadores actuales.
      const corte = await this.findCorteById(corteCajaId);
      const maquinas = await prisma.maquinas.findMany({
        where: { sucursal_id: corte.sucursal_id, activo: true },
        select: { id: true, nombre: true, tipo: true, contador_total: true },
        orderBy: { nombre: 'asc' },
      });
      const desde = corte.fecha_apertura;
      const hasta = corte.fecha_cierre || new Date();
      const maquinaIds = maquinas.map((m) => m.id);
      const impresiones = maquinaIds.length
        ? await prisma.impresiones.groupBy({
            by: ['maquina_id'],
            where: { maquina_id: { in: maquinaIds }, fecha: { gte: desde, lte: hasta } },
            _count: { id: true },
          })
        : [];
      const map = new Map(impresiones.map((i) => [i.maquina_id, i._count.id]));
      return {
        maquinas: maquinas.map((m) => {
          const imp = map.get(m.id) ?? 0;
          const totalNum = Number(m.contador_total);
          return {
            maquina_id: m.id,
            nombre: m.nombre,
            tipo: m.tipo,
            contador_inicial: Math.max(0, totalNum - imp),
            contador_actual: totalNum,
            contador_final: totalNum,
          };
        }),
      };
    }

    return {
      maquinas: reporte.detalle.map((d) => ({
        maquina_id: d.maquina_id,
        nombre: d.nombre,
        tipo: d.tipo,
        contador_inicial: Number(d.contador_inicial),
        contador_actual: Number(d.contador_actual),
        contador_final: Number(d.contador_final),
      })),
    };
  }

  async getReporteCategoriasImpresionByCorte(corteCajaId: number) {
    const corte = await this.findCorteById(corteCajaId);
    const reporte = await prisma.cortes_maquinas.findUnique({
      where: { corte_caja_id: corteCajaId },
      include: { detalle: true },
    });
    const fechaDesde = corte.fecha_apertura;
    const fechaHasta = corte.fecha_cierre || new Date();

    const categorias = await prisma.categorias.findMany({
      where: { tipo: 'impresion', activo: true },
      orderBy: { nombre: 'asc' },
    });

    if (categorias.length === 0) return { categorias: [] };

    // Productos de la sucursal vinculados a categorias tipo impresion.
    const productos = await prisma.productos.findMany({
      where: {
        categoria_id: { in: categorias.map((c) => c.id) },
        sucursal_id: corte.sucursal_id,
        activo: true,
      },
      select: { id: true, categoria_id: true, maquina_id: true },
    });

    const categoriaIdToMaquinaIds = new Map<number, Set<number>>();
    for (const c of categorias) categoriaIdToMaquinaIds.set(c.id, new Set());
    for (const p of productos) {
      if (p.categoria_id && p.maquina_id) {
        categoriaIdToMaquinaIds.get(p.categoria_id)?.add(p.maquina_id);
      }
    }

    const result = categorias.map((c) => {
      const maquinaIds = Array.from(categoriaIdToMaquinaIds.get(c.id) ?? []);
      let conteoInicial = 0;
      if (reporte) {
        for (const det of reporte.detalle) {
          if (maquinaIds.includes(det.maquina_id)) {
            conteoInicial += Number(det.contador_inicial);
          }
        }
      }
      return {
        categoria_id: c.id,
        nombre: c.nombre,
        conteo_inicial: conteoInicial,
        conteo_final: conteoInicial, // se completa abajo
      };
    });

    // Conteos finales: impresiones del período por categoria.
    const ventas = await prisma.ventas.findMany({
      where: {
        sucursal_id: corte.sucursal_id,
        estado: 'completada',
        created_at: { gte: fechaDesde, lte: fechaHasta },
      },
      select: { venta_detalle: { select: { cantidad: true, productos: { select: { categoria_id: true, maquina_id: true } } } } },
    });
    const mermas = await prisma.mermas.findMany({
      where: {
        sucursal_id: corte.sucursal_id,
        fecha: { gte: fechaDesde, lte: fechaHasta },
        tipo: 'producto',
      },
      select: { cantidad: true, productos: { select: { categoria_id: true, maquina_id: true } } },
    });

    const conteoPorCategoria = new Map<number, number>();
    for (const c of categorias) conteoPorCategoria.set(c.id, 0);
    for (const v of ventas) {
      for (const d of v.venta_detalle) {
        const catId = d.productos?.categoria_id;
        if (catId != null && conteoPorCategoria.has(catId)) {
          conteoPorCategoria.set(catId, (conteoPorCategoria.get(catId) ?? 0) + Number(d.cantidad));
        }
      }
    }
    for (const m of mermas) {
      const catId = m.productos?.categoria_id;
      if (catId != null && conteoPorCategoria.has(catId)) {
        conteoPorCategoria.set(catId, (conteoPorCategoria.get(catId) ?? 0) + Number(m.cantidad));
      }
    }

    return {
      categorias: result.map((c) => ({
        categoria_id: c.categoria_id,
        nombre: c.nombre,
        conteo_inicial: c.conteo_inicial,
        conteo_final: c.conteo_inicial + (conteoPorCategoria.get(c.categoria_id) ?? 0),
      })),
    };
  }
}

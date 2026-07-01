import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface MaquinaInput {
  sucursal_id: number;
  nombre: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  reset_diario?: boolean;
  fecha_instalacion?: string;
  contador_inicial?: number;
  contador_total?: number;
}

export class MaquinasService {
  async findAll({ page, limit, search, sucursalId, activo }: {
    page: number; limit: number; search?: string; sucursalId?: number; activo?: boolean;
  }) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { tipo: { contains: search } },
        { marca: { contains: search } },
        { modelo: { contains: search } },
      ];
    }
    if (sucursalId) where.sucursal_id = sucursalId;
    if (activo !== undefined) where.activo = activo;

    const [data, total] = await Promise.all([
      prisma.maquinas.findMany({
        where, skip, take: limit, orderBy: { nombre: 'asc' },
        include: {
          sucursales: { select: { id: true, nombre: true } },
          _count: { select: { impresiones: true, productos: true } },
        },
      }),
      prisma.maquinas.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: number) {
    const m = await prisma.maquinas.findUnique({
      where: { id },
      include: {
        sucursales: true,
        _count: { select: { impresiones: true, productos: true } },
      },
    });
    if (!m) throw new NotFoundError('Máquina');
    return m;
  }

  async create(dto: MaquinaInput) {
    return prisma.maquinas.create({
      data: {
        sucursal_id: dto.sucursal_id,
        nombre: dto.nombre,
        tipo: dto.tipo,
        marca: dto.marca,
        modelo: dto.modelo,
        reset_diario: dto.reset_diario ?? false,
        fecha_instalacion: dto.fecha_instalacion ? new Date(dto.fecha_instalacion) : new Date(),
        contador_inicial: dto.contador_inicial ?? 0,
        contador_total: dto.contador_total ?? dto.contador_inicial ?? 0,
      },
    });
  }

  async update(id: number, dto: Partial<MaquinaInput> & { activo?: boolean }) {
    await this.findById(id);
    return prisma.maquinas.update({
      where: { id },
      data: {
        sucursal_id: dto.sucursal_id!,
        nombre: dto.nombre!,
        tipo: dto.tipo!,
        marca: dto.marca,
        modelo: dto.modelo,
        reset_diario: dto.reset_diario,
        fecha_instalacion: dto.fecha_instalacion ? new Date(dto.fecha_instalacion) : undefined,
        contador_inicial: dto.contador_inicial ?? 0,
        contador_total: dto.contador_total ?? 0,
      },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    // Quitar máquina de productos asociados
    await prisma.productos.updateMany({ where: { maquina_id: id }, data: { maquina_id: null } });
    return prisma.maquinas.update({ where: { id }, data: { activo: false } });
  }

  /**
   * Estadísticas de una máquina: contadores diario/semanal/mensual/total
   */
  async getStats(id: number, fechaDesde?: string) {
    await this.findById(id);
    const desde = fechaDesde ? new Date(fechaDesde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ahora = new Date();
    const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - 7);
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [hoy, semana, mes, total, recientes] = await Promise.all([
      prisma.impresiones.count({ where: { maquina_id: id, fecha: { gte: inicioDia } } }),
      prisma.impresiones.count({ where: { maquina_id: id, fecha: { gte: inicioSemana } } }),
      prisma.impresiones.count({ where: { maquina_id: id, fecha: { gte: inicioMes } } }),
      prisma.impresiones.count({ where: { maquina_id: id } }),
      prisma.impresiones.findMany({
        where: { maquina_id: id, fecha: { gte: desde } },
        orderBy: { fecha: 'desc' },
        take: 50,
        include: { productos: { select: { id: true, nombre: true } }, usuarios: { select: { id: true, nombre: true } } },
      }),
    ]);
    return { hoy, semana, mes, total, recientes };
  }

  /**
   * Reporte de impresiones por máquina para corte de caja
   */
  async getReporteCorte(sucursalId: number, fechaDesde: Date) {
    const maquinas = await prisma.maquinas.findMany({
      where: { sucursal_id: sucursalId, activo: true },
      select: { id: true, nombre: true, tipo: true, contador_total: true, contador_inicial: true },
      orderBy: { nombre: 'asc' },
    });

    if (maquinas.length === 0) {
      return { maquinas: [], total_impresiones: 0, total_mermas: 0 };
    }

    const maquinaIds = maquinas.map((m) => m.id);

    const [impresionesPorMaquina, mermasPorMaquina] = await Promise.all([
      prisma.impresiones.groupBy({
        by: ['maquina_id'],
        where: {
          maquina_id: { in: maquinaIds },
          sucursal_id: sucursalId,
          fecha: { gte: fechaDesde },
        },
        _count: { id: true },
      }),
      prisma.impresiones.groupBy({
        by: ['maquina_id'],
        where: {
          maquina_id: { in: maquinaIds },
          sucursal_id: sucursalId,
          fecha: { gte: fechaDesde },
          fue_merma: true,
        },
        _count: { id: true },
      }),
    ]);

    const impresionesMap = new Map(impresionesPorMaquina.map((i) => [i.maquina_id, i._count.id]));
    const mermasMap = new Map(mermasPorMaquina.map((m) => [m.maquina_id, m._count.id]));

    const reporte = maquinas.map((m) => {
      const total = impresionesMap.get(m.id) ?? 0;
      const mermas = mermasMap.get(m.id) ?? 0;
      return {
        maquina_id: m.id,
        nombre: m.nombre,
        tipo: m.tipo,
        contador_inicial: m.contador_inicial,
        contador_total: m.contador_total,
        impresiones_periodo: total,
        mermas_periodo: mermas,
        impresiones_exitosas: total - mermas,
      };
    });

    const totalImpresiones = reporte.reduce((sum, r) => sum + r.impresiones_periodo, 0);
    const totalMermas = reporte.reduce((sum, r) => sum + r.mermas_periodo, 0);

    return {
      maquinas: reporte,
      total_impresiones: totalImpresiones,
      total_mermas: totalMermas,
    };
  }
}

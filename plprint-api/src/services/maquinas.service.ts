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
      },
    });
  }

  async update(id: number, dto: Partial<MaquinaInput> & { activo?: boolean }) {
    await this.findById(id);
    return prisma.maquinas.update({ where: { id }, data: dto });
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
}

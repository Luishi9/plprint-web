import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

export class GastosService {
  // ====== Categorías ======
  async findAllCategorias() {
    return prisma.gastos_categorias.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { gastos: true } } },
    });
  }

  async createCategoria(dto: { nombre: string; descripcion?: string }) {
    const existing = await prisma.gastos_categorias.findUnique({ where: { nombre: dto.nombre } });
    if (existing) throw new ConflictError('Ya existe una categoría con ese nombre');
    return prisma.gastos_categorias.create({ data: dto });
  }

  async updateCategoria(id: number, dto: { nombre?: string; descripcion?: string }) {
    const cat = await prisma.gastos_categorias.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Categoría');
    if (dto.nombre && dto.nombre !== cat.nombre) {
      const dup = await prisma.gastos_categorias.findUnique({ where: { nombre: dto.nombre } });
      if (dup) throw new ConflictError('Ya existe una categoría con ese nombre');
    }
    return prisma.gastos_categorias.update({ where: { id }, data: dto });
  }

  async removeCategoria(id: number) {
    const cat = await prisma.gastos_categorias.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Categoría');
    return prisma.gastos_categorias.update({ where: { id }, data: { activo: false } });
  }

  // ====== Gastos ======
  async findAllGastos({ page, limit, search, fechaDesde, fechaHasta, tipo, categoriaId, sucursalId }: {
    page: number; limit: number; search?: string; fechaDesde?: string; fechaHasta?: string;
    tipo?: string; categoriaId?: number; sucursalId?: number;
  }) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { concepto: { contains: search, mode: 'insensitive' as const } },
        { notas: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) (where.fecha as Record<string, Date>).gte = new Date(fechaDesde);
      if (fechaHasta) (where.fecha as Record<string, Date>).lte = new Date(fechaHasta);
    }
    if (tipo) where.tipo = tipo;
    if (categoriaId) where.categoria_id = categoriaId;
    if (sucursalId) where.sucursal_id = sucursalId;

    const [data, total, totalMonto] = await Promise.all([
      prisma.gastos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha: 'desc' },
        include: {
          categoria: { select: { id: true, nombre: true } },
          sucursales: { select: { id: true, nombre: true } },
          usuarios: { select: { id: true, nombre: true } },
        },
      }),
      prisma.gastos.count({ where }),
      prisma.gastos.aggregate({ where, _sum: { monto: true } }),
    ]);
    return { data, total, totalMonto: totalMonto._sum.monto || 0 };
  }

  async findGastoById(id: number) {
    const g = await prisma.gastos.findUnique({
      where: { id },
      include: {
        categoria: true,
        sucursales: true,
        usuarios: { select: { id: true, nombre: true } },
        autorizado: { select: { id: true, nombre: true } },
      },
    });
    if (!g) throw new NotFoundError('Gasto');
    return g;
  }

  async createGasto(dto: {
    categoria_id: number; concepto: string; monto: number; tipo?: string;
    sucursal_id?: number; usuario_id?: number; autorizado_por?: number;
    comprobante_url?: string; notas?: string; fecha?: string;
  }) {
    const data: Record<string, unknown> = {
      categoria_id: dto.categoria_id,
      concepto: dto.concepto,
      monto: dto.monto,
      tipo: dto.tipo || 'gasto',
    };
    if (dto.sucursal_id) data.sucursal_id = dto.sucursal_id;
    if (dto.usuario_id) data.usuario_id = dto.usuario_id;
    if (dto.autorizado_por) data.autorizado_por = dto.autorizado_por;
    if (dto.comprobante_url) data.comprobante_url = dto.comprobante_url;
    if (dto.notas) data.notas = dto.notas;
    if (dto.fecha) data.fecha = new Date(dto.fecha);
    return prisma.gastos.create({ data: data as never });
  }

  async updateGasto(id: number, dto: {
    categoria_id?: number; concepto?: string; monto?: number; tipo?: string;
    sucursal_id?: number; autorizado_por?: number;
    comprobante_url?: string; notas?: string;
  }) {
    await this.findGastoById(id);
    return prisma.gastos.update({ where: { id }, data: dto });
  }

  async removeGasto(id: number) {
    await this.findGastoById(id);
    return prisma.gastos.delete({ where: { id } });
  }
}

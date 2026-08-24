import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class ClientesService {
  async findAll({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { telefono: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.clientes.findMany({ where, skip, take: limit, orderBy: { nombre: 'asc' } }),
      prisma.clientes.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: number) {
    const c = await prisma.clientes.findFirst({ where: { id, activo: true } });
    if (!c) throw new NotFoundError('Cliente');
    return c;
  }

  async getHistorial(id: number) {
    await this.findById(id);
    return prisma.ventas.findMany({
      where: { cliente_id: id },
      orderBy: { created_at: 'desc' },
      include: {
        sucursales: { select: { nombre: true } },
        venta_detalle: { include: { productos: { select: { nombre: true } } } },
      },
    });
  }

  async create(dto: { nombre: string; telefono?: string; email?: string; direccion?: string; rfc?: string; uso_cfdi?: string; regimen_fiscal_receptor?: string; domicilio_fiscal_cp?: string }) {
    return prisma.clientes.create({ data: dto });
  }

  async update(id: number, dto: Partial<{ nombre: string; telefono: string; email: string; direccion: string; rfc: string; uso_cfdi: string; regimen_fiscal_receptor: string; domicilio_fiscal_cp: string }>) {
    await this.findById(id);
    return prisma.clientes.update({ where: { id }, data: dto });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.clientes.update({ where: { id }, data: { activo: false } });
  }
}

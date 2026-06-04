import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface ProveedorInput {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  rfc?: string;
  direccion?: string;
  notas?: string;
}

export class ProveedoresService {
  async findAll({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { contacto: { contains: search } },
          { telefono: { contains: search } },
          { email: { contains: search } },
          { rfc: { contains: search } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.proveedores.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
        include: {
          _count: { select: { productos: true, insumos: true } },
        },
      }),
      prisma.proveedores.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: number) {
    const p = await prisma.proveedores.findFirst({
      where: { id, activo: true },
      include: { _count: { select: { productos: true, insumos: true } } },
    });
    if (!p) throw new NotFoundError('Proveedor');
    return p;
  }

  async create(dto: ProveedorInput) {
    const existing = await prisma.proveedores.findFirst({
      where: { nombre: dto.nombre, activo: true },
    });
    if (existing) throw new ConflictError('Ya existe un proveedor con ese nombre');
    return prisma.proveedores.create({ data: dto });
  }

  async update(id: number, dto: Partial<ProveedorInput>) {
    await this.findById(id);
    if (dto.nombre) {
      const existing = await prisma.proveedores.findFirst({
        where: { nombre: dto.nombre, activo: true, NOT: { id } },
      });
      if (existing) throw new ConflictError('Ya existe un proveedor con ese nombre');
    }
    return prisma.proveedores.update({ where: { id }, data: dto });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.proveedores.update({ where: { id }, data: { activo: false } });
  }
}

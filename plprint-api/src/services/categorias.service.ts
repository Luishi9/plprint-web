import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class CategoriasService {
  async findAll(tipo?: string) {
    return prisma.categorias.findMany({
      where: { activo: true, ...(tipo && { tipo }) },
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { productos: true } } },
    });
  }

  async findById(id: number) {
    const cat = await prisma.categorias.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Categoría');
    return cat;
  }

  async create(dto: { nombre: string; tipo?: string; descripcion?: string }) {
    return prisma.categorias.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo || 'venta',
        descripcion: dto.descripcion,
      },
    });
  }

  async update(id: number, dto: { nombre?: string; tipo?: string; descripcion?: string }) {
    await this.findById(id);
    return prisma.categorias.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findById(id);
    return prisma.categorias.update({ where: { id }, data: { activo: false } });
  }
}

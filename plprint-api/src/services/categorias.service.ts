import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class CategoriasService {
  async findAll() {
    return prisma.categorias.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { productos: true } } },
    });
  }

  async findById(id: number) {
    const cat = await prisma.categorias.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Categoría');
    return cat;
  }

  async create(dto: { nombre: string }) {
    return prisma.categorias.create({ data: { nombre: dto.nombre } });
  }

  async update(id: number, dto: { nombre: string }) {
    await this.findById(id);
    return prisma.categorias.update({ where: { id }, data: { nombre: dto.nombre } });
  }

  async remove(id: number) {
    await this.findById(id);
    // Soft delete: deja activo=false
    return prisma.categorias.update({ where: { id }, data: { activo: false } });
  }
}

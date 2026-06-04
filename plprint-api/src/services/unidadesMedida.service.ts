import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface UnidadMedidaInput {
  nombre: string;
  abreviatura: string;
}

export class UnidadesMedidaService {
  async findAll() {
    return prisma.unidades_medida.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findById(id: number) {
    const u = await prisma.unidades_medida.findUnique({ where: { id } });
    if (!u) throw new NotFoundError('Unidad de medida');
    return u;
  }

  async create(dto: UnidadMedidaInput) {
    const existing = await prisma.unidades_medida.findUnique({ where: { nombre: dto.nombre } });
    if (existing) throw new ConflictError('Ya existe una unidad de medida con ese nombre');
    return prisma.unidades_medida.create({ data: dto });
  }

  async update(id: number, dto: Partial<UnidadMedidaInput>) {
    await this.findById(id);
    if (dto.nombre) {
      const existing = await prisma.unidades_medida.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existing) throw new ConflictError('Ya existe una unidad de medida con ese nombre');
    }
    return prisma.unidades_medida.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findById(id);
    return prisma.unidades_medida.delete({ where: { id } });
  }
}

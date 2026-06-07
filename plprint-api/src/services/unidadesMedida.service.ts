import { prisma } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { clearUnidadInfoCache } from './productos.service';

export interface UnidadMedidaInput {
  nombre: string;
  abreviatura: string;
  es_medida?: boolean;
  tipo_medida?: 'm2' | 'ml' | null;
}

const TIPOS_MEDIDA = ['m2', 'ml'] as const;

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
    this.validarMedida(dto.es_medida, dto.tipo_medida);
    clearUnidadInfoCache();
    return prisma.unidades_medida.create({
      data: {
        nombre: dto.nombre,
        abreviatura: dto.abreviatura,
        es_medida: dto.es_medida ?? false,
        tipo_medida: dto.es_medida ? (dto.tipo_medida ?? null) : null,
      },
    });
  }

  async update(id: number, dto: Partial<UnidadMedidaInput>) {
    await this.findById(id);
    if (dto.nombre) {
      const existing = await prisma.unidades_medida.findFirst({
        where: { nombre: dto.nombre, NOT: { id } },
      });
      if (existing) throw new ConflictError('Ya existe una unidad de medida con ese nombre');
    }
    clearUnidadInfoCache();
    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.abreviatura !== undefined) data.abreviatura = dto.abreviatura;
    if (dto.es_medida !== undefined) {
      data.es_medida = dto.es_medida;
      data.tipo_medida = dto.es_medida ? (dto.tipo_medida ?? null) : null;
      this.validarMedida(dto.es_medida, dto.tipo_medida);
    } else if (dto.tipo_medida !== undefined) {
      this.validarMedida(true, dto.tipo_medida);
      data.tipo_medida = dto.tipo_medida;
    }
    return prisma.unidades_medida.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findById(id);
    return prisma.unidades_medida.delete({ where: { id } });
  }

  private validarMedida(esMedida: boolean | undefined, tipoMedida: string | null | undefined) {
    if (esMedida && tipoMedida && !TIPOS_MEDIDA.includes(tipoMedida as typeof TIPOS_MEDIDA[number])) {
      throw new ValidationError(`tipo_medida inválido. Valores permitidos: ${TIPOS_MEDIDA.join(', ')}`);
    }
  }
}

import { prisma } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

interface CreateMetodoPagoDTO {
  nombre: string;
  icono?: string;
}

interface UpdateMetodoPagoDTO {
  nombre?: string;
  icono?: string;
  activo?: boolean;
}

export class MetodosPagoService {
  async findAll(includeInactive = false) {
    return prisma.metodos_pago.findMany({
      where: includeInactive ? {} : { activo: true },
      orderBy: [{ es_sistema: 'desc' }, { nombre: 'asc' }],
      include: { _count: { select: { ventas: true } } },
    });
  }

  async findById(id: number) {
    const metodo = await prisma.metodos_pago.findUnique({
      where: { id },
      include: { _count: { select: { ventas: true } } },
    });
    if (!metodo) throw new NotFoundError('Método de pago');
    return metodo;
  }

  async create(dto: CreateMetodoPagoDTO) {
    const existe = await prisma.metodos_pago.findUnique({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError(`Ya existe un método de pago con el nombre '${dto.nombre}'`);

    return prisma.metodos_pago.create({
      data: {
        nombre: dto.nombre,
        icono: dto.icono,
        es_sistema: false,
        activo: true,
      },
    });
  }

  async update(id: number, dto: UpdateMetodoPagoDTO) {
    const metodo = await prisma.metodos_pago.findUnique({ where: { id } });
    if (!metodo) throw new NotFoundError('Método de pago');

    if (dto.nombre && dto.nombre !== metodo.nombre) {
      const existe = await prisma.metodos_pago.findUnique({ where: { nombre: dto.nombre } });
      if (existe) throw new ConflictError(`Ya existe un método de pago con el nombre '${dto.nombre}'`);
    }

    return prisma.metodos_pago.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
        ...(dto.icono !== undefined && { icono: dto.icono }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
      },
    });
  }

  async remove(id: number) {
    const metodo = await prisma.metodos_pago.findUnique({
      where: { id },
      include: { _count: { select: { ventas: true } } },
    });
    if (!metodo) throw new NotFoundError('Método de pago');

    if (metodo.es_sistema) {
      throw new ValidationError('No se puede eliminar un método de pago del sistema');
    }

    if (metodo._count.ventas > 0) {
      throw new ValidationError(
        `No se puede eliminar el método de pago porque tiene ${metodo._count.ventas} venta(s) asociada(s)`,
      );
    }

    await prisma.metodos_pago.delete({ where: { id } });
  }

  async toggleActivo(id: number) {
    const metodo = await prisma.metodos_pago.findUnique({ where: { id } });
    if (!metodo) throw new NotFoundError('Método de pago');

    return prisma.metodos_pago.update({
      where: { id },
      data: { activo: !metodo.activo },
    });
  }
}

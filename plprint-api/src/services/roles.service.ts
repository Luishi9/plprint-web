import { prisma } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

interface CreateRolDTO {
  nombre: string;
  descripcion?: string;
  permisos: number[];
}

interface UpdateRolDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: number[];
}

export class RolesService {
  async findAll() {
    return prisma.roles.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: { select: { usuarios: true } },
        rol_permisos: {
          include: { permisos: { select: { id: true, modulo: true, accion: true, descripcion: true } } },
        },
      },
    });
  }

  async findById(id: number) {
    const rol = await prisma.roles.findUnique({
      where: { id },
      include: {
        _count: { select: { usuarios: true } },
        rol_permisos: {
          include: { permisos: { select: { id: true, modulo: true, accion: true, descripcion: true } } },
        },
      },
    });
    if (!rol) throw new NotFoundError('Rol');
    return rol;
  }

  async create(dto: CreateRolDTO) {
    const existe = await prisma.roles.findUnique({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictError(`Ya existe un rol con el nombre '${dto.nombre}'`);

    if (dto.permisos.length > 0) {
      const existentes = await prisma.permisos.count({
        where: { id: { in: dto.permisos } },
      });
      if (existentes !== dto.permisos.length) {
        throw new ValidationError('Uno o mas permisos no existen');
      }
    }

    return prisma.$transaction(async (tx) => {
      const rol = await tx.roles.create({
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          es_sistema: false,
          activo: true,
        },
      });

      if (dto.permisos.length > 0) {
        await tx.rol_permisos.createMany({
          data: dto.permisos.map((permisoId) => ({ rol_id: rol.id, permiso_id: permisoId })),
        });
      }

      const rolCompleto = await tx.roles.findUnique({
        where: { id: rol.id },
        include: {
          _count: { select: { usuarios: true } },
          rol_permisos: {
            include: { permisos: { select: { id: true, modulo: true, accion: true, descripcion: true } } },
          },
        },
      });
      return rolCompleto!;
    });
  }

  async update(id: number, dto: UpdateRolDTO) {
    const rol = await prisma.roles.findUnique({ where: { id } });
    if (!rol) throw new NotFoundError('Rol');

    if (dto.nombre && dto.nombre !== rol.nombre) {
      const existe = await prisma.roles.findUnique({ where: { nombre: dto.nombre } });
      if (existe) throw new ConflictError(`Ya existe un rol con el nombre '${dto.nombre}'`);
    }

    if (dto.permisos && dto.permisos.length > 0) {
      const existentes = await prisma.permisos.count({
        where: { id: { in: dto.permisos } },
      });
      if (existentes !== dto.permisos.length) {
        throw new ValidationError('Uno o mas permisos no existen');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.roles.update({
        where: { id },
        data: {
          ...(dto.nombre !== undefined && { nombre: dto.nombre }),
          ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
      });

      if (dto.permisos !== undefined) {
        await tx.rol_permisos.deleteMany({ where: { rol_id: id } });
        if (dto.permisos.length > 0) {
          await tx.rol_permisos.createMany({
            data: dto.permisos.map((permisoId) => ({ rol_id: id, permiso_id: permisoId })),
          });
        }
      }

      const rolCompleto = await tx.roles.findUnique({
        where: { id },
        include: {
          _count: { select: { usuarios: true } },
          rol_permisos: {
            include: { permisos: { select: { id: true, modulo: true, accion: true, descripcion: true } } },
          },
        },
      });
      return rolCompleto!;
    });
  }

  async remove(id: number) {
    const rol = await prisma.roles.findUnique({
      where: { id },
      include: { _count: { select: { usuarios: true } } },
    });
    if (!rol) throw new NotFoundError('Rol');

    if (rol.es_sistema) {
      throw new ValidationError('No se puede eliminar un rol del sistema');
    }

    if (rol._count.usuarios > 0) {
      throw new ValidationError(
        `No se puede eliminar el rol porque tiene ${rol._count.usuarios} usuario(s) asignado(s)`,
      );
    }

    await prisma.roles.delete({ where: { id } });
  }

  async findAllPermisos() {
    return prisma.permisos.findMany({
      orderBy: [{ modulo: 'asc' }, { accion: 'asc' }],
    });
  }
}

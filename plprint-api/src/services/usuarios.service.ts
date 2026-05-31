import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

interface CreateUsuarioDTO {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
}

export class UsuariosService {
  async findAll() {
    return prisma.usuarios.findMany({
      where: { activo: true },
      select: {
        id: true, nombre: true, email: true, activo: true, created_at: true,
        roles: { select: { nombre: true } },
        usuarios_sucursales: {
          select: { sucursales: { select: { id: true, nombre: true } } },
        },
      },
    });
  }

  async findById(id: number) {
    const u = await prisma.usuarios.findFirst({
      where: { id, activo: true },
      select: {
        id: true, nombre: true, email: true, activo: true, created_at: true,
        roles: { select: { nombre: true } },
        usuarios_sucursales: {
          select: { sucursales: { select: { id: true, nombre: true } } },
        },
      },
    });
    if (!u) throw new NotFoundError('Usuario');
    return u;
  }

  async create(dto: CreateUsuarioDTO) {
    const existe = await prisma.usuarios.findUnique({ where: { email: dto.email } });
    if (existe) throw new ConflictError('Ya existe un usuario con ese email');

    const password_hash = await bcrypt.hash(dto.password, 12);
    return prisma.usuarios.create({
      data: { nombre: dto.nombre, email: dto.email, password_hash, rol_id: dto.rolId },
      select: { id: true, nombre: true, email: true, created_at: true },
    });
  }

  async update(id: number, dto: Partial<CreateUsuarioDTO>) {
    await this.findById(id);
    const data: Record<string, unknown> = {};
    if (dto.nombre) data.nombre = dto.nombre;
    if (dto.email) data.email = dto.email;
    if (dto.rolId) data.rol_id = dto.rolId;
    if (dto.password) data.password_hash = await bcrypt.hash(dto.password, 12);

    return prisma.usuarios.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true },
    });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.usuarios.update({ where: { id }, data: { activo: false } });
  }

  async asignarSucursal(usuarioId: number, sucursalId: number) {
    return prisma.usuarios_sucursales.upsert({
      where: { usuario_id_sucursal_id: { usuario_id: usuarioId, sucursal_id: sucursalId } },
      update: {},
      create: { usuario_id: usuarioId, sucursal_id: sucursalId },
    });
  }

  async removerSucursal(usuarioId: number, sucursalId: number) {
    return prisma.usuarios_sucursales.delete({
      where: { usuario_id_sucursal_id: { usuario_id: usuarioId, sucursal_id: sucursalId } },
    });
  }
}

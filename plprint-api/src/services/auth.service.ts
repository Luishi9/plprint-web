import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  async login(email: string, password: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: {
        usuarios_sucursales: {
          select: {
            sucursal_id: true,
            sucursales: { select: { id: true, nombre: true } },
          },
        },
        roles: { select: { nombre: true } },
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    const sucursales = usuario.usuarios_sucursales.map((us) => us.sucursal_id);
    const sucursalesDetalle = usuario.usuarios_sucursales.map((us) => us.sucursales);

    const permisos = await this.getPermisosUsuario(usuario.rol_id!);

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rolId: usuario.rol_id!,
      sucursales,
      tokenVersion: usuario.token_version,
      permisos,
    };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken({ sub: usuario.id }),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.roles?.nombre,
        sucursales,
        sucursalesDetalle,
        permisos,
      },
    };
  }

  async logout(userId: number) {
    // Incrementar token_version invalida todos los tokens existentes del usuario
    await prisma.usuarios.update({
      where: { id: userId },
      data: { token_version: { increment: 1 } },
    });
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const usuario = await prisma.usuarios.findUnique({
      where: { id: payload.sub },
      include: { usuarios_sucursales: { select: { sucursal_id: true } } },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Token invalido');
    }

    const sucursales = usuario.usuarios_sucursales.map((us) => us.sucursal_id);
    const permisos = await this.getPermisosUsuario(usuario.rol_id!);

    const newPayload = {
      sub: usuario.id,
      email: usuario.email,
      rolId: usuario.rol_id!,
      sucursales,
      tokenVersion: usuario.token_version,
      permisos,
    };

    return {
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken({ sub: usuario.id }),
    };
  }

  async getProfile(id: number) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        created_at: true,
        rol_id: true,
        roles: { select: { nombre: true } },
        usuarios_sucursales: {
          select: { sucursales: { select: { id: true, nombre: true } } },
        },
      },
    });

    if (!usuario) throw new NotFoundError('Usuario');

    const permisos = usuario.rol_id ? await this.getPermisosUsuario(usuario.rol_id) : [];

    return { ...usuario, permisos };
  }

  private async getPermisosUsuario(rolId: number): Promise<string[]> {
    const rol = await prisma.roles.findUnique({
      where: { id: rolId },
      select: { es_sistema: true },
    });

    if (rol?.es_sistema && rolId === 1) {
      const todos = await prisma.permisos.findMany({
        select: { modulo: true, accion: true },
      });
      return todos.map((p) => `${p.modulo}.${p.accion}`);
    }

    const permisos = await prisma.rol_permisos.findMany({
      where: { rol_id: rolId },
      include: { permisos: { select: { modulo: true, accion: true } } },
    });

    return permisos.map((rp) => `${rp.permisos.modulo}.${rp.permisos.accion}`);
  }
}

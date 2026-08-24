import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

type ConfigGroup = Record<string, string | number | boolean>;

export class ConfiguracionService {
  async findAll(): Promise<Record<string, ConfigGroup>> {
    const configs = await prisma.configuracion.findMany({
      orderBy: [{ grupo: 'asc' }, { clave: 'asc' }],
    });

    return configs.reduce<Record<string, ConfigGroup>>((acc, c) => {
      if (!acc[c.grupo]) acc[c.grupo] = {};
      acc[c.grupo][c.clave] = this.parseValue(c.valor, c.tipo);
      return acc;
    }, {});
  }

  async findByGrupo(grupo: string): Promise<ConfigGroup> {
    const configs = await prisma.configuracion.findMany({
      where: { grupo },
      orderBy: { clave: 'asc' },
    });

    if (configs.length === 0) {
      throw new NotFoundError(`Grupo de configuración '${grupo}'`);
    }

    return configs.reduce<ConfigGroup>((acc, c) => {
      acc[c.clave] = this.parseValue(c.valor, c.tipo);
      return acc;
    }, {});
  }

  async findByClave(clave: string) {
    const config = await prisma.configuracion.findUnique({ where: { clave } });
    if (!config) throw new NotFoundError(`Configuración '${clave}'`);
    return config;
  }

  async updateMany(
    updates: Array<{ clave: string; valor: string | number | boolean }>,
  ): Promise<{ updated: number }> {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new ValidationError('Se requiere al menos un valor a actualizar');
    }

    const existentes = await prisma.configuracion.findMany({
      where: { clave: { in: updates.map((u) => u.clave) } },
      select: { clave: true, tipo: true },
    });

    if (existentes.length !== updates.length) {
      const encontradas = new Set(existentes.map((e) => e.clave));
      const faltantes = updates.map((u) => u.clave).filter((c) => !encontradas.has(c));
      throw new NotFoundError(`Configuraciones inexistentes: ${faltantes.join(', ')}`);
    }

    const tipoPorClave = new Map(existentes.map((e) => [e.clave, e.tipo]));

    const result = await prisma.$transaction(
      updates.map((u) => {
        const tipo = tipoPorClave.get(u.clave) ?? 'string';
        return prisma.configuracion.update({
          where: { clave: u.clave },
          data: { valor: this.stringifyValue(u.valor, tipo) },
        });
      }),
    );

    return { updated: result.length };
  }

  async updateLogoUrl(logoUrl: string): Promise<void> {
    await this.findByClave('empresa_logo_url');
    await prisma.configuracion.update({
      where: { clave: 'empresa_logo_url' },
      data: { valor: logoUrl },
    });
  }

  async updateCsdPath(clave: string, filePath: string): Promise<void> {
    await this.findByClave(clave);
    await prisma.configuracion.update({
      where: { clave },
      data: { valor: filePath },
    });
  }

  private parseValue(valor: string | null, tipo: string): string | number | boolean {
    if (valor === null) {
      return tipo === 'boolean' ? false : tipo === 'number' ? 0 : '';
    }

    switch (tipo) {
      case 'boolean':
        return valor === 'true' || valor === '1';
      case 'number':
        return Number(valor);
      default:
        return valor;
    }
  }

  private stringifyValue(valor: string | number | boolean, tipo: string): string {
    switch (tipo) {
      case 'boolean':
        return valor ? 'true' : 'false';
      case 'number':
        return String(valor);
      default:
        return String(valor);
    }
  }
}

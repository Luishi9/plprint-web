import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class SucursalesService {
  async findAll() {
    return prisma.sucursales.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findById(id: number) {
    const s = await prisma.sucursales.findUnique({ where: { id } });
    if (!s) throw new NotFoundError('Sucursal');
    return s;
  }

  async create(dto: { nombre: string; direccion?: string; telefono?: string; copiarProductos?: boolean }) {
    const { copiarProductos, ...sucursalData } = dto;

    return prisma.$transaction(async (tx) => {
      const nuevaSucursal = await tx.sucursales.create({ data: sucursalData });

      if (copiarProductos) {
        // Obtener todos los productos activos del sistema
        const todosLosProductos = await tx.productos.findMany({
          where: { activo: true },
          select: { id: true },
        });

        if (todosLosProductos.length > 0) {
          // Obtener config de stock desde el inventario de la matriz (si existe)
          const matriz = await tx.sucursales.findFirst({
            where: { id: { not: nuevaSucursal.id } },
            orderBy: { id: 'asc' },
          });

          const stockMatriz = matriz
            ? await tx.inventario.findMany({
                where: { sucursal_id: matriz.id },
                select: { producto_id: true, stock_minimo: true, stock_maximo: true },
              })
            : [];

          const stockMap = new Map(stockMatriz.map(i => [i.producto_id, i]));

          await tx.inventario.createMany({
            data: todosLosProductos.map(p => ({
              producto_id: p.id,
              sucursal_id: nuevaSucursal.id,
              cantidad: 0,
              stock_minimo: stockMap.get(p.id)?.stock_minimo ?? 0,
              stock_maximo: stockMap.get(p.id)?.stock_maximo ?? undefined,
            })),
            skipDuplicates: true,
          });
        }
      }

      return nuevaSucursal;
    });
  }

  async update(id: number, dto: Partial<{ nombre: string; direccion: string; telefono: string; activa: boolean; copiarProductos: boolean }>) {
    const { copiarProductos, ...sucursalData } = dto;
    await this.findById(id);

    return prisma.$transaction(async (tx) => {
      const sucursal = await tx.sucursales.update({ where: { id }, data: sucursalData });

      if (copiarProductos) {
        const todosLosProductos = await tx.productos.findMany({
          where: { activo: true },
          select: { id: true },
        });

        if (todosLosProductos.length > 0) {
          const matriz = await tx.sucursales.findFirst({
            where: { id: { not: id } },
            orderBy: { id: 'asc' },
          });

          const stockMatriz = matriz
            ? await tx.inventario.findMany({
                where: { sucursal_id: matriz.id },
                select: { producto_id: true, stock_minimo: true, stock_maximo: true },
              })
            : [];

          const stockMap = new Map(stockMatriz.map(i => [i.producto_id, i]));

          await tx.inventario.createMany({
            data: todosLosProductos.map(p => ({
              producto_id: p.id,
              sucursal_id: id,
              cantidad: 0,
              stock_minimo: stockMap.get(p.id)?.stock_minimo ?? 0,
              stock_maximo: stockMap.get(p.id)?.stock_maximo ?? undefined,
            })),
            skipDuplicates: true,
          });
        }
      }

      return sucursal;
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return prisma.sucursales.update({ where: { id }, data: { activa: false } });
  }
}

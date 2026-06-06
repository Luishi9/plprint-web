import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export type NivelPrecio = 'medio_mayoreo' | 'mayoreo' | 'super_mayoreo';

const NIVELES: NivelPrecio[] = ['medio_mayoreo', 'mayoreo', 'super_mayoreo'];

export const NIVELES_LABEL: Record<NivelPrecio, string> = {
  medio_mayoreo: 'Medio mayoreo',
  mayoreo: 'Mayoreo',
  super_mayoreo: 'Super mayoreo',
};

export const getByProducto = async (productoId: number) => {
  const existe = await prisma.productos.findUnique({ where: { id: productoId } });
  if (!existe) throw new NotFoundError('Producto no encontrado');
  return prisma.producto_precios.findMany({
    where: { producto_id: productoId },
    orderBy: { cantidad_minima: 'asc' },
  });
};

export const create = async (productoId: number, data: { nivel: string; cantidad_minima: number; precio: number }) => {
  if (!NIVELES.includes(data.nivel as NivelPrecio)) {
    throw new ValidationError(`Nivel inválido. Valores permitidos: ${NIVELES.join(', ')}`);
  }
  if (data.cantidad_minima < 1) {
    throw new ValidationError('cantidad_minima debe ser mayor o igual a 1');
  }
  if (data.precio < 0) {
    throw new ValidationError('precio no puede ser negativo');
  }
  const producto = await prisma.productos.findUnique({ where: { id: productoId } });
  if (!producto) throw new NotFoundError('Producto no encontrado');
  await validarCreciente(productoId, data.nivel as NivelPrecio, data.cantidad_minima);
  return prisma.producto_precios.create({
    data: {
      producto_id: productoId,
      nivel: data.nivel,
      cantidad_minima: data.cantidad_minima,
      precio: data.precio,
    },
  });
};

export const update = async (productoId: number, precioId: number, data: { cantidad_minima?: number; precio?: number; activo?: boolean }) => {
  const existe = await prisma.producto_precios.findFirst({ where: { id: precioId, producto_id: productoId } });
  if (!existe) throw new NotFoundError('Precio no encontrado');
  if (data.cantidad_minima !== undefined) {
    if (data.cantidad_minima < 1) throw new ValidationError('cantidad_minima debe ser mayor o igual a 1');
    await validarCreciente(productoId, existe.nivel as NivelPrecio, data.cantidad_minima, precioId);
  }
  if (data.precio !== undefined && data.precio < 0) {
    throw new ValidationError('precio no puede ser negativo');
  }
  return prisma.producto_precios.update({
    where: { id: precioId },
    data: {
      ...(data.cantidad_minima !== undefined && { cantidad_minima: data.cantidad_minima }),
      ...(data.precio !== undefined && { precio: data.precio }),
      ...(data.activo !== undefined && { activo: data.activo }),
    },
  });
};

export const remove = async (productoId: number, precioId: number) => {
  const existe = await prisma.producto_precios.findFirst({ where: { id: precioId, producto_id: productoId } });
  if (!existe) throw new NotFoundError('Precio no encontrado');
  await prisma.producto_precios.delete({ where: { id: precioId } });
};

const validarCreciente = async (productoId: number, nivel: NivelPrecio, cantidad: number, excludeId?: number) => {
  const otros = await prisma.producto_precios.findMany({
    where: {
      producto_id: productoId,
      nivel: { in: NIVELES.filter((n) => n !== nivel) },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  const idx = NIVELES.indexOf(nivel);
  for (const o of otros) {
    const oIdx = NIVELES.indexOf(o.nivel as NivelPrecio);
    if (oIdx < idx && cantidad <= o.cantidad_minima) {
      throw new ValidationError(`cantidad_minima (${cantidad}) debe ser mayor que la de ${NIVELES_LABEL[o.nivel as NivelPrecio]} (${o.cantidad_minima})`);
    }
    if (oIdx > idx && cantidad >= o.cantidad_minima) {
      throw new ValidationError(`cantidad_minima (${cantidad}) debe ser menor que la de ${NIVELES_LABEL[o.nivel as NivelPrecio]} (${o.cantidad_minima})`);
    }
  }
};

export const calcularPrecioPorVolumen = (
  precioBase: number,
  cantidad: number,
  precios: Array<{ nivel: string; cantidad_minima: number; precio: unknown; activo: boolean }>,
): { precio: number; nivel: NivelPrecio | null } => {
  const aplicables = precios
    .filter((p) => p.activo && cantidad >= p.cantidad_minima)
    .sort((a, b) => b.cantidad_minima - a.cantidad_minima);
  if (aplicables.length === 0) return { precio: precioBase, nivel: null };
  const ganador = aplicables[0];
  return { precio: Number(ganador.precio), nivel: ganador.nivel as NivelPrecio };
};

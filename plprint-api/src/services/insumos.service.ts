import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Prisma } from '@prisma/client';

const PAD = 4;
const FALLBACK_PREFIX = 'INS';

function padWithX(s: string, len: number): string {
  return s.length >= len ? s.substring(0, len) : s.padEnd(len, 'X');
}

function buildPrefix(nombre: string): string {
  const words = nombre
    .toUpperCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, 3);
  if (words.length === 0) return FALLBACK_PREFIX;
  if (words.length === 1) return padWithX(words[0], 4);
  if (words.length === 2) {
    return padWithX(words[0].substring(0, 2) + words[1].substring(0, 2), 4);
  }
  return padWithX(
    words[0].substring(0, 2) + words[1].substring(0, 1) + words[2].substring(0, 1),
    4
  );
}

async function nextCodigoForPrefix(
  tx: Prisma.TransactionClient,
  prefix: string
): Promise<string> {
  const last = await tx.insumos.findFirst({
    where: { codigo: { startsWith: prefix + '-' } },
    orderBy: { codigo: 'desc' },
    select: { codigo: true },
  });
  if (!last) return `${prefix}-${'1'.padStart(PAD, '0')}`;
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  const m = last.codigo?.match(re);
  const nextNum = m ? parseInt(m[1], 10) + 1 : 1;
  return `${prefix}-${String(nextNum).padStart(PAD, '0')}`;
}

export async function generarCodigoInsumo(
  nombre: string,
  tx?: Prisma.TransactionClient
): Promise<string> {
  const client = tx ?? prisma;
  const prefix = buildPrefix(nombre);
  return nextCodigoForPrefix(client, prefix);
}

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
}

interface CreateInsumoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  precioCompra?: number;
  proveedorId?: number;
}

export class InsumosService {
  async findAll({ page, limit, search }: FindAllParams) {
    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { codigo: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.insumos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
        include: {
          proveedores: { select: { id: true, nombre: true } },
        },
      }),
      prisma.insumos.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    const insumo = await prisma.insumos.findFirst({
      where: { id, activo: true },
      include: {
        proveedores: { select: { id: true, nombre: true } },
        inventario: {
          include: { sucursales: { select: { id: true, nombre: true } } },
        },
        producto_insumos: {
          include: {
            productos: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!insumo) throw new NotFoundError('Insumo');
    return insumo;
  }

  async create(data: CreateInsumoDTO) {
    const codigoManual = data.codigo && data.codigo.trim() !== '' ? data.codigo.trim() : null;
    if (codigoManual) {
      const existing = await prisma.insumos.findUnique({ where: { codigo: codigoManual } });
      if (existing) throw new ConflictError('Ya existe un insumo con ese código');
    }
    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          const codigo = codigoManual ?? (await generarCodigoInsumo(data.nombre, tx));
          return tx.insumos.create({
            data: {
              codigo,
              nombre: data.nombre,
              descripcion: data.descripcion,
              unidad_medida: data.unidadMedida ?? 'unidad',
              precio_compra: data.precioCompra,
              proveedor_id: data.proveedorId,
            },
          });
        });
      } catch (err) {
        if (
          codigoManual ||
          !(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')
        ) {
          throw err;
        }
      }
    }
    throw new ConflictError('No se pudo generar un código único. Intente de nuevo');
  }

  async update(id: number, data: Partial<CreateInsumoDTO>) {
    await this.findById(id);
    let codigo: string | null | undefined;
    if (data.codigo !== undefined) {
      const trimmed = data.codigo.trim();
      if (trimmed === '') {
        codigo = null;
      } else {
        codigo = trimmed;
        const existing = await prisma.insumos.findFirst({ where: { codigo, NOT: { id } } });
        if (existing) throw new ConflictError('Ya existe un insumo con ese código');
      }
    }
    return prisma.insumos.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.unidadMedida && { unidad_medida: data.unidadMedida }),
        ...(data.precioCompra !== undefined && { precio_compra: data.precioCompra }),
        ...(data.proveedorId !== undefined && { proveedor_id: data.proveedorId }),
        ...(codigo !== undefined && { codigo }),
      },
    });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.insumos.update({ where: { id }, data: { activo: false } });
  }

  async getInventarioBySucursal(sucursalId: number, search?: string) {
    const where = {
      sucursal_id: sucursalId,
      insumos: { activo: true },
      ...(search && {
        insumos: {
          OR: [
            { nombre: { contains: search } },
            { codigo: { contains: search } },
          ],
        },
      }),
    };

    return prisma.insumos_inventario.findMany({
      where,
      include: {
        insumos: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            unidad_medida: true,
            precio_compra: true,
          },
        },
      },
      orderBy: { insumos: { nombre: 'asc' } },
    });
  }

  async ajustarStock(insumoId: number, sucursalId: number, cantidad: number, tipo: 'entrada' | 'salida') {
    const insumo = await prisma.insumos.findFirst({
      where: { id: insumoId, activo: true },
    });
    if (!insumo) throw new NotFoundError('Insumo');

    const inventario = await prisma.insumos_inventario.findUnique({
      where: { insumo_id_sucursal_id: { insumo_id: insumoId, sucursal_id: sucursalId } },
    });

    if (!inventario) {
      if (tipo === 'entrada') {
        return prisma.insumos_inventario.create({
          data: {
            insumo_id: insumoId,
            sucursal_id: sucursalId,
            cantidad: cantidad,
          },
        });
      } else {
        throw new Error('No hay inventario para esta sucursal');
      }
    }

    const nuevaCantidad = tipo === 'entrada'
      ? Number(inventario.cantidad) + cantidad
      : Number(inventario.cantidad) - cantidad;

    if (nuevaCantidad < 0) {
      throw new Error('Stock insuficiente');
    }

    return prisma.insumos_inventario.update({
      where: { id: inventario.id },
      data: { cantidad: nuevaCantidad },
    });
  }
}

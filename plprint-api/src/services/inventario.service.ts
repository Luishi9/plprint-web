import { prisma } from '../config/database';

interface FindBySucursalParams {
  search?: string;
  soloStockBajo?: boolean;
}

interface AjustarDTO {
  productoId: number;
  sucursalId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  notas?: string;
  usuarioId: number;
  stockMinimo?: number;
}

export class InventarioService {
  async findBySucursal(sucursalId: number, { search, soloStockBajo }: FindBySucursalParams) {
    const rows = await prisma.inventario.findMany({
      where: {
        sucursal_id: sucursalId,
        productos: {
          activo: true,
          ...(search && {
            OR: [
              { nombre: { contains: search } },
              { codigo: { contains: search } },
            ],
          }),
        },
      },
      include: {
        productos: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            imagen_url: true,
            precio_venta: true,
            unidad_medida: true,
          },
        },
      },
      orderBy: { productos: { nombre: 'asc' } },
    });

    // Filtrar en JS: cantidad <= stock_minimo (columna vs columna, no soportado directamente en Prisma)
    if (soloStockBajo) {
      return rows.filter((r) => r.cantidad <= r.stock_minimo);
    }
    return rows;
  }

  async ajustar(dto: AjustarDTO) {
    return prisma.$transaction(async (tx) => {
      const cantidadCambia = dto.cantidad > 0;
      const inv = await tx.inventario.upsert({
        where: {
          producto_id_sucursal_id: {
            producto_id: dto.productoId,
            sucursal_id: dto.sucursalId,
          },
        },
        update: {
          ...(cantidadCambia && {
            cantidad:
              dto.tipo === 'entrada'
                ? { increment: dto.cantidad }
                : dto.tipo === 'salida'
                ? { decrement: dto.cantidad }
                : dto.cantidad,
          }),
          ...(dto.stockMinimo !== undefined && { stock_minimo: dto.stockMinimo }),
        },
        create: {
          producto_id: dto.productoId,
          sucursal_id: dto.sucursalId,
          cantidad: dto.tipo === 'entrada' ? dto.cantidad : 0,
          ...(dto.stockMinimo !== undefined && { stock_minimo: dto.stockMinimo }),
        },
      });

      // Solo registrar movimiento de kardex si realmente se movió cantidad.
      if (cantidadCambia) {
        await tx.kardex_movimientos.create({
          data: {
            producto_id: dto.productoId,
            sucursal_id: dto.sucursalId,
            tipo: dto.tipo,
            cantidad: dto.cantidad,
            notas: dto.notas,
            usuario_id: dto.usuarioId,
          },
        });
      }

      return inv;
    });
  }

  async getKardex(productoId: number, sucursalId: number) {
    return prisma.kardex_movimientos.findMany({
      where: { producto_id: productoId, sucursal_id: sucursalId },
      orderBy: { created_at: 'desc' },
      take: 100,
      include: {
        usuarios: { select: { nombre: true } },
      },
    });
  }
}

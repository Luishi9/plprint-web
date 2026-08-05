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

  async create(dto: { nombre: string; direccion?: string; telefono?: string; copiarProductos?: boolean; copiarInsumos?: boolean }) {
    const { copiarProductos, copiarInsumos, ...sucursalData } = dto;

    return prisma.$transaction(async (tx) => {
      const nuevaSucursal = await tx.sucursales.create({ data: sucursalData });

      // Matriz = primera sucursal existente distinta a la nueva
      const matriz = await tx.sucursales.findFirst({
        where: { id: { not: nuevaSucursal.id } },
        orderBy: { id: 'asc' },
      });

      // Mapa de insumos matriz -> nueva sucursal (para replicar BOM)
      const insumosMap = new Map<number, number>();

      if (copiarInsumos && matriz) {
        const insumosMatriz = await tx.insumos.findMany({
          where: { activo: true, sucursal_id: matriz.id },
        });

        for (const ins of insumosMatriz) {
          const nuevoInsumo = await tx.insumos.create({
            data: {
              codigo: ins.codigo,
              nombre: ins.nombre,
              descripcion: ins.descripcion,
              unidad_medida: ins.unidad_medida,
              ancho_rollo: ins.ancho_rollo,
              precio_compra: ins.precio_compra,
              proveedor_id: ins.proveedor_id,
              sucursal_id: nuevaSucursal.id,
            },
          });

          await tx.insumos_inventario.create({
            data: {
              insumo_id: nuevoInsumo.id,
              sucursal_id: nuevaSucursal.id,
              cantidad: 0,
              stock_minimo: 0,
            },
          });

          insumosMap.set(ins.id, nuevoInsumo.id);
        }
      }

      if (copiarProductos && matriz) {
        const productosOrigen = await tx.productos.findMany({
          where: { activo: true, sucursal_id: matriz.id },
          include: {
            producto_precios: { where: { activo: true } },
            producto_insumos: true,
          },
        });

        for (const p of productosOrigen) {
          const nuevoProducto = await tx.productos.create({
            data: {
              codigo: p.codigo,
              nombre: p.nombre,
              descripcion: p.descripcion,
              precio_venta: p.precio_venta,
              precio_compra: p.precio_compra,
              categoria_id: p.categoria_id,
              proveedor_id: p.proveedor_id,
              unidad_medida: p.unidad_medida,
              cobrar_minimo_1: p.cobrar_minimo_1,
              maquina_id: p.maquina_id,
              activo: true,
              sucursal_id: nuevaSucursal.id,
            },
          });

          for (const pr of p.producto_precios) {
            await tx.producto_precios.create({
              data: {
                producto_id: nuevoProducto.id,
                nivel: pr.nivel,
                cantidad_minima: pr.cantidad_minima,
                precio: pr.precio,
              },
            });
          }

          await tx.inventario.create({
            data: {
              producto_id: nuevoProducto.id,
              sucursal_id: nuevaSucursal.id,
              cantidad: 0,
              stock_minimo: 0,
            },
          });

          // Replicar BOM si los insumos fueron copiados
          if (copiarInsumos) {
            for (const pi of p.producto_insumos) {
              const nuevoInsumoId = insumosMap.get(pi.insumo_id);
              if (nuevoInsumoId) {
                await tx.producto_insumos.create({
                  data: {
                    producto_id: nuevoProducto.id,
                    insumo_id: nuevoInsumoId,
                    cantidad_requerida: pi.cantidad_requerida,
                  },
                });
              }
            }
          }
        }
      }

      return nuevaSucursal;
    });
  }

  async update(id: number, dto: Partial<{ nombre: string; direccion: string; telefono: string; activa: boolean; copiarProductos: boolean; copiarInsumos: boolean }>) {
    const { copiarProductos, copiarInsumos, ...sucursalData } = dto;
    await this.findById(id);

    return prisma.$transaction(async (tx) => {
      const sucursal = await tx.sucursales.update({ where: { id }, data: sucursalData });

      // Matriz = primera sucursal existente distinta a la actual
      const matriz = await tx.sucursales.findFirst({
        where: { id: { not: id } },
        orderBy: { id: 'asc' },
      });

      // Mapa de insumos matriz -> esta sucursal (para replicar BOM)
      const insumosMap = new Map<number, number>();

      if (copiarInsumos && matriz) {
        const insumosMatriz = await tx.insumos.findMany({
          where: { activo: true, sucursal_id: matriz.id },
        });

        for (const ins of insumosMatriz) {
          const nuevoInsumo = await tx.insumos.create({
            data: {
              codigo: ins.codigo,
              nombre: ins.nombre,
              descripcion: ins.descripcion,
              unidad_medida: ins.unidad_medida,
              ancho_rollo: ins.ancho_rollo,
              precio_compra: ins.precio_compra,
              proveedor_id: ins.proveedor_id,
              sucursal_id: id,
            },
          });

          await tx.insumos_inventario.create({
            data: {
              insumo_id: nuevoInsumo.id,
              sucursal_id: id,
              cantidad: 0,
              stock_minimo: 0,
            },
          });

          insumosMap.set(ins.id, nuevoInsumo.id);
        }
      }

      if (copiarProductos && matriz) {
        const productosOrigen = await tx.productos.findMany({
          where: { activo: true, sucursal_id: matriz.id },
          include: {
            producto_precios: { where: { activo: true } },
            producto_insumos: true,
          },
        });

        for (const p of productosOrigen) {
          const nuevoProducto = await tx.productos.create({
            data: {
              codigo: p.codigo,
              nombre: p.nombre,
              descripcion: p.descripcion,
              precio_venta: p.precio_venta,
              precio_compra: p.precio_compra,
              categoria_id: p.categoria_id,
              proveedor_id: p.proveedor_id,
              unidad_medida: p.unidad_medida,
              cobrar_minimo_1: p.cobrar_minimo_1,
              maquina_id: p.maquina_id,
              activo: true,
              sucursal_id: id,
            },
          });

          for (const pr of p.producto_precios) {
            await tx.producto_precios.create({
              data: {
                producto_id: nuevoProducto.id,
                nivel: pr.nivel,
                cantidad_minima: pr.cantidad_minima,
                precio: pr.precio,
              },
            });
          }

          await tx.inventario.create({
            data: {
              producto_id: nuevoProducto.id,
              sucursal_id: id,
              cantidad: 0,
              stock_minimo: 0,
            },
          });

          // Replicar BOM si los insumos fueron copiados
          if (copiarInsumos) {
            for (const pi of p.producto_insumos) {
              const nuevoInsumoId = insumosMap.get(pi.insumo_id);
              if (nuevoInsumoId) {
                await tx.producto_insumos.create({
                  data: {
                    producto_id: nuevoProducto.id,
                    insumo_id: nuevoInsumoId,
                    cantidad_requerida: pi.cantidad_requerida,
                  },
                });
              }
            }
          }
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

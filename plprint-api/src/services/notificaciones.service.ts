import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { Decimal } from '@prisma/client/runtime/library';

interface UpdateNotificacionDTO {
  activo?: boolean;
  umbral?: number | null;
}

export interface NotificacionStockProducto {
  producto_id: number;
  nombre: string;
  codigo: string | null;
  imagen_url: string | null;
  sucursal_id: number;
  sucursal_nombre: string;
  cantidad: number;
  stock_minimo: number;
  deficit: number;
}

export interface NotificacionStockInsumo {
  insumo_id: number;
  nombre: string;
  codigo: string | null;
  sucursal_id: number;
  sucursal_nombre: string;
  cantidad: number;
  stock_minimo: number;
  deficit: number;
  unidad_medida: string;
}

export interface NotificacionVentaCancelada {
  id: number;
  total: number;
  created_at: Date;
  usuarios: { id: number; nombre: string } | null;
  sucursales: { id: number; nombre: string } | null;
  clientes: { id: number; nombre: string } | null;
}

export interface NotificacionProductoSinStock {
  producto_id: number;
  nombre: string;
  codigo: string | null;
  imagen_url: string | null;
  sucursal_id: number;
  sucursal_nombre: string;
}

export interface ResumenNotificaciones {
  stock_bajo_productos: number;
  stock_bajo_insumos: number;
  ventas_dia: number;
  ventas_dia_total: number;
  ventas_canceladas: number;
  productos_sin_stock: number;
  total: number;
}

export class NotificacionesService {
  // ============== CONFIGURACIÓN CRUD ==============

  async findAllConfig() {
    return prisma.notificaciones_config.findMany({
      orderBy: { tipo: 'asc' },
    });
  }

  async findConfigByTipo(tipo: string) {
    const notif = await prisma.notificaciones_config.findUnique({ where: { tipo } });
    if (!notif) throw new NotFoundError(`Configuración de notificación '${tipo}'`);
    return notif;
  }

  async updateConfig(tipo: string, dto: UpdateNotificacionDTO) {
    const existe = await prisma.notificaciones_config.findUnique({ where: { tipo } });
    if (!existe) throw new NotFoundError(`Configuración de notificación '${tipo}'`);

    return prisma.notificaciones_config.update({
      where: { tipo },
      data: {
        ...(dto.activo !== undefined && { activo: dto.activo }),
        ...(dto.umbral !== undefined && {
          umbral: dto.umbral === null ? null : new Decimal(dto.umbral),
        }),
      },
    });
  }

  // ============== ALERTAS DERIVADAS ==============

  /**
   * Productos con stock por debajo de su stock_minimo en `inventario`,
   * o sin entradas (cantidad 0). El umbral de la notificación actua como piso global
   * independiente del stock_minimo por producto.
   */
  async getStockBajoProductos(umbralGlobal?: number | null): Promise<NotificacionStockProducto[]> {
    const rows = await prisma.inventario.findMany({
      where: {
        productos: { activo: true },
      },
      include: {
        productos: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            imagen_url: true,
          },
        },
        sucursales: { select: { id: true, nombre: true } },
      },
    });

    return rows
      .filter((r) => {
        if (r.cantidad <= 0) return true;
        if (r.cantidad <= r.stock_minimo) return true;
        if (umbralGlobal !== undefined && umbralGlobal !== null && r.cantidad <= umbralGlobal) {
          return true;
        }
        return false;
      })
      .map((r) => ({
        producto_id: r.productos.id,
        nombre: r.productos.nombre,
        codigo: r.productos.codigo,
        imagen_url: r.productos.imagen_url,
        sucursal_id: r.sucursales.id,
        sucursal_nombre: r.sucursales.nombre,
        cantidad: r.cantidad,
        stock_minimo: r.stock_minimo,
        deficit: Math.max(0, r.stock_minimo - r.cantidad),
      }));
  }

  /**
   * Insumos con cantidad por debajo de su stock_minimo o por debajo del umbral global.
   */
  async getStockBajoInsumos(umbralGlobal?: number | null): Promise<NotificacionStockInsumo[]> {
    const rows = await prisma.insumos_inventario.findMany({
      where: { insumos: { activo: true } },
      include: {
        insumos: { select: { id: true, codigo: true, nombre: true, unidad_medida: true } },
        sucursales: { select: { id: true, nombre: true } },
      },
    });

    return rows
      .filter((r) => {
        const cantidad = Number(r.cantidad);
        const minimo = Number(r.stock_minimo);
        if (cantidad <= 0) return true;
        if (cantidad <= minimo) return true;
        if (umbralGlobal !== undefined && umbralGlobal !== null && cantidad <= umbralGlobal) {
          return true;
        }
        return false;
      })
      .map((r) => {
        const cantidad = Number(r.cantidad);
        const minimo = Number(r.stock_minimo);
        return {
          insumo_id: r.insumos.id,
          nombre: r.insumos.nombre,
          codigo: r.insumos.codigo,
          sucursal_id: r.sucursales.id,
          sucursal_nombre: r.sucursales.nombre,
          cantidad,
          stock_minimo: minimo,
          deficit: Math.max(0, minimo - cantidad),
          unidad_medida: r.insumos.unidad_medida,
        };
      });
  }

  /**
   * Ventas del día (estado = completada).
   */
  async getVentasDelDia() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);

    const ventas = await prisma.ventas.findMany({
      where: {
        estado: 'completada',
        created_at: { gte: inicio, lte: fin },
      },
      orderBy: { created_at: 'desc' },
      include: {
        usuarios: { select: { id: true, nombre: true } },
        sucursales: { select: { id: true, nombre: true } },
        clientes: { select: { id: true, nombre: true } },
      },
    });

    const total = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    return { ventas, total };
  }

  /**
   * Ventas canceladas en las últimas 24 horas.
   */
  async getVentasCanceladas(): Promise<NotificacionVentaCancelada[]> {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = await prisma.ventas.findMany({
      where: {
        estado: 'cancelada',
        created_at: { gte: hace24h },
      },
      orderBy: { created_at: 'desc' },
      include: {
        usuarios: { select: { id: true, nombre: true } },
        sucursales: { select: { id: true, nombre: true } },
        clientes: { select: { id: true, nombre: true } },
      },
    });
    return rows.map((v) => ({
      id: v.id,
      total: Number(v.total),
      created_at: v.created_at,
      usuarios: v.usuarios,
      sucursales: v.sucursales,
      clientes: v.clientes,
    }));
  }

  /**
   * Productos que no tienen ningún registro en inventario o que tienen cantidad 0
   * en todas las sucursales activas.
   */
  async getProductosSinStock(): Promise<NotificacionProductoSinStock[]> {
    const productos = await prisma.productos.findMany({
      where: { activo: true },
      include: {
        inventario: { include: { sucursales: { select: { id: true, nombre: true, activa: true } } } },
      },
    });

    const resultado: NotificacionProductoSinStock[] = [];
    for (const p of productos) {
      const stocksPorSucursal = p.inventario.filter((i) => i.sucursales.activa);
      if (stocksPorSucursal.length === 0) {
        // No tiene inventario en ninguna sucursal activa
        resultado.push({
          producto_id: p.id,
          nombre: p.nombre,
          codigo: p.codigo,
          imagen_url: p.imagen_url,
          sucursal_id: 0,
          sucursal_nombre: 'Sin sucursal asignada',
        });
        continue;
      }
      for (const inv of stocksPorSucursal) {
        if (inv.cantidad === 0) {
          resultado.push({
            producto_id: p.id,
            nombre: p.nombre,
            codigo: p.codigo,
            imagen_url: p.imagen_url,
            sucursal_id: inv.sucursales.id,
            sucursal_nombre: inv.sucursales.nombre,
          });
        }
      }
    }
    return resultado;
  }

  /**
   * Resumen agregado de notificaciones: cuenta los totales por tipo.
   * Si la notificación está inactiva, devuelve 0 en su contador.
   */
  async getResumen(): Promise<ResumenNotificaciones> {
    const config = await prisma.notificaciones_config.findMany();
    const configMap = new Map(config.map((c) => [c.tipo, c]));

    const [productos, insumos, ventasDia, canceladas, sinStock] = await Promise.all([
      configMap.get('stock_bajo_productos')?.activo
        ? this.getStockBajoProductos(
            configMap.get('stock_bajo_productos')?.umbral
              ? Number(configMap.get('stock_bajo_productos')!.umbral)
              : null,
          )
        : Promise.resolve([] as NotificacionStockProducto[]),
      configMap.get('stock_bajo_insumos')?.activo
        ? this.getStockBajoInsumos(
            configMap.get('stock_bajo_insumos')?.umbral
              ? Number(configMap.get('stock_bajo_insumos')!.umbral)
              : null,
          )
        : Promise.resolve([] as NotificacionStockInsumo[]),
      configMap.get('ventas_dia')?.activo
        ? this.getVentasDelDia()
        : Promise.resolve({ ventas: [], total: 0 }),
      configMap.get('venta_cancelada')?.activo
        ? this.getVentasCanceladas()
        : Promise.resolve([] as NotificacionVentaCancelada[]),
      configMap.get('producto_sin_stock')?.activo
        ? this.getProductosSinStock()
        : Promise.resolve([] as NotificacionProductoSinStock[]),
    ]);

    return {
      stock_bajo_productos: productos.length,
      stock_bajo_insumos: insumos.length,
      ventas_dia: ventasDia.ventas.length,
      ventas_dia_total: ventasDia.total,
      ventas_canceladas: canceladas.length,
      productos_sin_stock: sinStock.length,
      total:
        productos.length +
        insumos.length +
        ventasDia.ventas.length +
        canceladas.length +
        sinStock.length,
    };
  }

  /**
   * Listado completo de alertas, agrupado por tipo, respetando la configuración activo/inactivo.
   */
  async getAlertas() {
    const config = await prisma.notificaciones_config.findMany();
    const configMap = new Map(config.map((c) => [c.tipo, c]));

    const tiposActivos = {
      stock_bajo_productos: configMap.get('stock_bajo_productos')?.activo ?? false,
      stock_bajo_insumos: configMap.get('stock_bajo_insumos')?.activo ?? false,
      ventas_dia: configMap.get('ventas_dia')?.activo ?? false,
      venta_cancelada: configMap.get('venta_cancelada')?.activo ?? false,
      producto_sin_stock: configMap.get('producto_sin_stock')?.activo ?? false,
    };

    const umbrales = {
      stock_bajo_productos: configMap.get('stock_bajo_productos')?.umbral
        ? Number(configMap.get('stock_bajo_productos')!.umbral)
        : null,
      stock_bajo_insumos: configMap.get('stock_bajo_insumos')?.umbral
        ? Number(configMap.get('stock_bajo_insumos')!.umbral)
        : null,
    };

    const [productos, insumos, ventasDia, canceladas, sinStock] = await Promise.all([
      tiposActivos.stock_bajo_productos
        ? this.getStockBajoProductos(umbrales.stock_bajo_productos)
        : Promise.resolve([] as NotificacionStockProducto[]),
      tiposActivos.stock_bajo_insumos
        ? this.getStockBajoInsumos(umbrales.stock_bajo_insumos)
        : Promise.resolve([] as NotificacionStockInsumo[]),
      tiposActivos.ventas_dia
        ? this.getVentasDelDia()
        : Promise.resolve({ ventas: [], total: 0 }),
      tiposActivos.venta_cancelada
        ? this.getVentasCanceladas()
        : Promise.resolve([] as NotificacionVentaCancelada[]),
      tiposActivos.producto_sin_stock
        ? this.getProductosSinStock()
        : Promise.resolve([] as NotificacionProductoSinStock[]),
    ]);

    return {
      configuracion: config,
      tipos_activos: tiposActivos,
      alertas: {
        stock_bajo_productos: productos,
        stock_bajo_insumos: insumos,
        ventas_dia: ventasDia,
        venta_cancelada: canceladas,
        producto_sin_stock: sinStock,
      },
    };
  }
}

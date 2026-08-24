import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { setTemp, getTemp, deleteTemp } from '../utils/tempStore';
import { consolidarDataValidationsAsync } from './insumos.service';
import crypto from 'crypto';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  categoriaId?: number;
  categoriaTipo?: string;
  sucursalId?: number;
}

const _unidadInfoCache = new Map<string, { es_medida: boolean; tipo_medida: string | null }>();

const getUnidadInfo = async (abreviatura: string | null) => {
  if (!abreviatura) return { es_medida: false, tipo_medida: null };
  if (_unidadInfoCache.has(abreviatura)) return _unidadInfoCache.get(abreviatura)!;
  const u = await prisma.unidades_medida.findFirst({ where: { abreviatura } });
  const info = { es_medida: u?.es_medida ?? false, tipo_medida: u?.tipo_medida ?? null };
  _unidadInfoCache.set(abreviatura, info);
  return info;
};

export const clearUnidadInfoCache = () => _unidadInfoCache.clear();

const attachUnidadInfo = async <T extends { unidad_medida: string | null; id: number }>(productos: T[]) => {
  const unidades = Array.from(new Set(productos.map((p) => p.unidad_medida).filter(Boolean) as string[]));
  await Promise.all(unidades.map(getUnidadInfo));

  const productoIds = productos.map((p) => p.id);
  const insumosConRollo = await prisma.producto_insumos.findMany({
    where: {
      producto_id: { in: productoIds },
      insumos: { ancho_rollo: { not: null } },
    },
    select: {
      producto_id: true,
      insumos: { select: { ancho_rollo: true } },
    },
  });

  const rolloMap = new Map<number, number>();
  for (const pi of insumosConRollo) {
    if (pi.insumos.ancho_rollo && !rolloMap.has(pi.producto_id)) {
      rolloMap.set(pi.producto_id, Number(pi.insumos.ancho_rollo));
    }
  }

  return productos.map((p) => {
    const info = p.unidad_medida ? _unidadInfoCache.get(p.unidad_medida) : null;
    const anchoRollo = rolloMap.get(p.id) ?? null;
    return { ...p, unidad_info: info ?? { es_medida: false, tipo_medida: null }, ancho_rollo: anchoRollo };
  });
};

const PAD = 4;
const FALLBACK_PREFIX = 'PROD';

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

async function nextCodigoForProducto(
  tx: Prisma.TransactionClient,
  prefix: string,
  sucursalId: number
): Promise<string> {
  const last = await tx.productos.findFirst({
    where: { codigo: { startsWith: prefix + '-' }, sucursal_id: sucursalId },
    orderBy: { codigo: 'desc' },
    select: { codigo: true },
  });
  if (!last) return `${prefix}-${'1'.padStart(PAD, '0')}`;
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  const m = last.codigo?.match(re);
  const nextNum = m ? parseInt(m[1], 10) + 1 : 1;
  return `${prefix}-${String(nextNum).padStart(PAD, '0')}`;
}

export async function generarCodigoProducto(
  nombre: string,
  tx?: Prisma.TransactionClient,
  sucursalId?: number
): Promise<string> {
  const client = tx ?? prisma;
  const prefix = buildPrefix(nombre);
  return nextCodigoForProducto(client, prefix, sucursalId ?? 1);
}

interface PreviewRow {
  fila: number;
  codigo: string | null;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  unidadMedida: string;
  manejaInventario: boolean;
  precioVenta: number;
  precioCompra: number | null;
  categoriaId?: number;
  preciosPorVolumen: Array<{ nivel: string; cantidadMinima: number; precio: number }>;
  errors: string[];
  warnings: string[];
}

interface ImportPreviewData {
  rows: PreviewRow[];
  duplicados: Array<{ fila: number; codigo: string; nombreExistente: string; nombreNuevo: string }>;
}

interface CreateProductoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  precioCompra?: number;
  categoriaId?: number;
  proveedorId?: number;
  unidadMedida?: string;
  imagenUrl?: string;
  cantidadInicial?: number;
  stockMinimo?: number;
  sucursalId?: number;
  usuarioId?: number;
  cobrarMinimo1?: boolean;
  maquinaId?: number;
  claveProdServ?: string;
  claveUnidad?: string;
  insumos?: Array<{ insumoId: number; cantidadRequerida: number }>;
}

export class ProductosService {
  async findAll({ page, limit, search, categoriaId, categoriaTipo, sucursalId }: FindAllParams) {

    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { codigo: { contains: search } },
        ],
      }),
      ...(categoriaId && { categoria_id: categoriaId }),
      ...(categoriaTipo && { categorias: { tipo: categoriaTipo.toLowerCase() } }),
      ...(sucursalId && { sucursal_id: sucursalId }),
      // toLowerCase() para que no importe si el query viene en mayúsculas o minúsculas
    };

    const [data, total] = await Promise.all([
      prisma.productos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
        include: {
          categorias: { select: { nombre: true } },
          maquinas: { select: { id: true, nombre: true } },
          inventario: {
            //select: { cantidad: true },
            include: { sucursales: { select: { id: true, nombre: true } } },
          },
          producto_precios: {
            where: { activo: true },
            orderBy: { cantidad_minima: 'asc' },
          }
        },
      }),
      prisma.productos.count({ where }),
    ]);

    return { data: await attachUnidadInfo(data), total };
  }

  async findById(id: number) {
    const producto = await prisma.productos.findFirst({
      where: { id, activo: true },
      include: {
        categorias: true,
        proveedores: { select: { id: true, nombre: true } },
        maquinas: { select: { id: true, nombre: true } },
        inventario: {
          include: { sucursales: { select: { id: true, nombre: true } } },
        },
        producto_insumos: {
          include: {
            insumos: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                unidad_medida: true,
              },
            },
          },
        },
        producto_precios: {
          where: { activo: true },
          orderBy: { cantidad_minima: 'asc' },
        },
      },
    });

    if (!producto) throw new NotFoundError('Producto');
    const [withInfo] = await attachUnidadInfo([producto]);
    return withInfo;
  }

  async create(data: CreateProductoDTO) {

    return prisma.$transaction(async (tx) => {
      // 1. Crear el producto
      const producto = await tx.productos.create({
        data: {
          codigo: data.codigo ?? await generarCodigoProducto(data.nombre, tx, data.sucursalId),
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio_venta: data.precioVenta,
          precio_compra: data.precioCompra,
          categoria_id: data.categoriaId,
          proveedor_id: data.proveedorId,
          unidad_medida: data.unidadMedida,
          imagen_url: data.imagenUrl,
          cobrar_minimo_1: data.cobrarMinimo1 ?? false,
          maquina_id: data.maquinaId,
          clave_prod_serv: data.claveProdServ || null,
          clave_unidad: data.claveUnidad || null,
          sucursal_id: data.sucursalId ?? 1,
        },
      });

      // 2. Si hay cantidad inicial, registrar en inventario y tabla kardex
      if (data.cantidadInicial && data.cantidadInicial > 0 && data.sucursalId && data.usuarioId) {
        await tx.inventario.create({
          data: {
            producto_id: producto.id,
            sucursal_id: data.sucursalId,
            cantidad: data.cantidadInicial,
            stock_minimo: data.stockMinimo ?? 0,
          },
        });

        // Registrar en Kardex (movimiento)
        await tx.kardex_movimientos.create({
          data: {
            producto_id: producto.id,
            sucursal_id: data.sucursalId,
            usuario_id: data.usuarioId,
            tipo: 'entrada',
            cantidad: data.cantidadInicial,
            notas: 'Inventario inicial al crear el producto',
          }
        });
      }

      // 3. Si hay insumos, validar que pertenezcan a la misma sucursal y crear las relaciones
      if (data.insumos && data.insumos.length > 0) {
        const sucursalProducto = data.sucursalId ?? 1;
        const insumosIds = data.insumos.map(i => i.insumoId);
        const insumosEncontrados = await tx.insumos.findMany({
          where: { id: { in: insumosIds } },
          select: { id: true, sucursal_id: true },
        });
        const insumosDeMismaSucursal = insumosEncontrados.filter(i => i.sucursal_id === sucursalProducto);
        if (insumosEncontrados.length !== insumosDeMismaSucursal.length) {
          throw new ValidationError('Todos los insumos del BOM deben pertenecer a la misma sucursal del producto');
        }

        await tx.producto_insumos.createMany({
          data: data.insumos.map(ins => ({
            producto_id: producto.id,
            insumo_id: ins.insumoId,
            cantidad_requerida: ins.cantidadRequerida,
          })),
        });
      }

      return producto;
    });
  }

  async update(id: number, data: Partial<CreateProductoDTO>) {
    await this.findById(id);

    return prisma.$transaction(async (tx) => {
      // 1. Actualizar el producto
      const producto = await tx.productos.update({
        where: { id },
        data: {
          ...(data.nombre && { nombre: data.nombre }),
          ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
          ...(data.precioVenta !== undefined && { precio_venta: data.precioVenta }),
          ...(data.precioCompra !== undefined && { precio_compra: data.precioCompra }),
          ...(data.categoriaId !== undefined && { categoria_id: data.categoriaId }),
          ...(data.proveedorId !== undefined && { proveedor_id: data.proveedorId }),
          ...(data.unidadMedida && { unidad_medida: data.unidadMedida }),
          ...(data.imagenUrl && { imagen_url: data.imagenUrl }),
          ...(data.codigo && { codigo: data.codigo }),
          ...(data.cobrarMinimo1 !== undefined && { cobrar_minimo_1: data.cobrarMinimo1 }),
          ...(data.maquinaId !== undefined && { maquina_id: data.maquinaId }),
          ...(data.claveProdServ !== undefined && { clave_prod_serv: data.claveProdServ || null }),
          ...(data.claveUnidad !== undefined && { clave_unidad: data.claveUnidad || null }),
        },
      });

      // 2. Si hay insumos, actualizar las relaciones producto-insumo
      if (data.insumos !== undefined) {
        // Eliminar relaciones existentes
        await tx.producto_insumos.deleteMany({
          where: { producto_id: id },
        });

        // Crear nuevas relaciones si hay insumos
        if (data.insumos.length > 0) {
          // Validar que los insumos pertenezcan a la misma sucursal del producto
          const productoActual = await tx.productos.findUnique({ where: { id }, select: { sucursal_id: true } });
          const sucursalProducto = productoActual?.sucursal_id ?? 1;
          const insumosIds = data.insumos.map(i => i.insumoId);
          const insumosEncontrados = await tx.insumos.findMany({
            where: { id: { in: insumosIds } },
            select: { id: true, sucursal_id: true },
          });
          const insumosDeMismaSucursal = insumosEncontrados.filter(i => i.sucursal_id === sucursalProducto);
          if (insumosEncontrados.length !== insumosDeMismaSucursal.length) {
            throw new ValidationError('Todos los insumos del BOM deben pertenecer a la misma sucursal del producto');
          }

          await tx.producto_insumos.createMany({
            data: data.insumos.map(ins => ({
              producto_id: id,
              insumo_id: ins.insumoId,
              cantidad_requerida: ins.cantidadRequerida,
            })),
          });
        }
      }

      return producto;
    });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return prisma.productos.update({ where: { id }, data: { activo: false, codigo: null } });
  }

  async getInsumosByProducto(productoId: number) {
    const producto = await prisma.productos.findFirst({
      where: { id: productoId, activo: true },
    });
    if (!producto) throw new NotFoundError('Producto');

    return prisma.producto_insumos.findMany({
      where: { producto_id: productoId },
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
    });
  }

  async generateTemplate(): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Productos');

    const headers = [
      'codigo', 'Nombre', 'Categoria', 'Descripcion', 'Unidad de medida',
      'Maneja inventario', 'Precio venta', 'Precio compra',
      'Medio mayoreo (SI/NO)', 'Cantidad medio mayoreo', 'Precio medio mayoreo',
      'Mayoreo (SI/NO)', 'Cantidad mayoreo', 'Precio mayoreo',
      'Super mayoreo (SI/NO)', 'Cantidad super mayoreo', 'Precio super mayoreo',
    ];

    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF225C5E' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    ws.addRow(['', 'Ejemplo de producto', 'Impresion', '', 'unidad', 'SI', '100', '50',
      'SI', '10', '90', 'NO', '', '', 'NO', '', '']);

    ws.columns = [
      { width: 12 }, { width: 30 }, { width: 20 }, { width: 40 }, { width: 16 },
      { width: 18 }, { width: 12 }, { width: 12 },
      { width: 22 }, { width: 22 }, { width: 20 },
      { width: 18 }, { width: 18 }, { width: 16 },
      { width: 24 }, { width: 24 }, { width: 22 },
    ];

    // Hoja auxiliar "Unidades"
    const unidades = await prisma.unidades_medida.findMany();
    const wsU = wb.addWorksheet('Unidades');
    wsU.addRow(['Abreviatura', 'Nombre']);
    const headerU = wsU.getRow(1);
    headerU.eachCell((cell) => {
      cell.font = { bold: true };
    });
    for (const u of unidades) {
      wsU.addRow([u.abreviatura, u.nombre]);
    }
    wsU.columns = [{ width: 14 }, { width: 30 }];

    // Validacion de datos (dropdown) en columna "Unidad de medida" (E)
    const filaFinUnidades = Math.max(unidades.length + 1 + 50, 200);
    const dvConfig = {
      type: 'list',
      allowBlank: true,
      showInputMessage: true,
      promptTitle: 'Unidad de medida',
      prompt: 'Selecciona una unidad de la lista',
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Unidad invalida',
      error: 'Selecciona una unidad de la lista o deja en blanco',
      formulae: [`Unidades!$A$2:$A$${filaFinUnidades}`],
    };
    const wsDv = ws as unknown as { dataValidations: { add: (addr: string, dv: typeof dvConfig) => void } };
    for (let r = 2; r <= 1000; r++) {
      wsDv.dataValidations.add(`E${r}`, dvConfig);
    }

    const buffer = await wb.xlsx.writeBuffer();
    return consolidarDataValidationsAsync(Buffer.from(buffer), 'E2:E1000');
  }

  async exportCatalog(sucursalId?: number): Promise<Buffer> {
    const productos = await prisma.productos.findMany({
      where: { activo: true, ...(sucursalId && { sucursal_id: sucursalId }) },
      include: {
        categorias: { select: { nombre: true } },
        inventario: { select: { id: true } },
        producto_precios: { where: { activo: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Productos');

    const headers = [
      'codigo', 'Nombre', 'Categoria', 'Descripcion', 'Unidad de medida',
      'Maneja inventario', 'Precio venta', 'Precio compra',
      'Medio mayoreo (SI/NO)', 'Cantidad medio mayoreo', 'Precio medio mayoreo',
      'Mayoreo (SI/NO)', 'Cantidad mayoreo', 'Precio mayoreo',
      'Super mayoreo (SI/NO)', 'Cantidad super mayoreo', 'Precio super mayoreo',
    ];

    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF225C5E' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    for (const p of productos) {
      const precios = p.producto_precios;
      const medio = precios.find(pr => pr.nivel === 'medio_mayoreo');
      const mayoreo = precios.find(pr => pr.nivel === 'mayoreo');
      const superM = precios.find(pr => pr.nivel === 'super_mayoreo');

      ws.addRow([
        p.codigo || '',
        p.nombre,
        p.categorias?.nombre || '',
        p.descripcion || '',
        p.unidad_medida,
        p.inventario.length > 0 ? 'SI' : 'NO',
        Number(p.precio_venta),
        p.precio_compra ? Number(p.precio_compra) : '',
        medio ? 'SI' : 'NO',
        medio ? medio.cantidad_minima : '',
        medio ? Number(medio.precio) : '',
        mayoreo ? 'SI' : 'NO',
        mayoreo ? mayoreo.cantidad_minima : '',
        mayoreo ? Number(mayoreo.precio) : '',
        superM ? 'SI' : 'NO',
        superM ? superM.cantidad_minima : '',
        superM ? Number(superM.precio) : '',
      ]);
    }

    ws.columns = [
      { width: 12 }, { width: 30 }, { width: 20 }, { width: 40 }, { width: 16 },
      { width: 18 }, { width: 12 }, { width: 12 },
      { width: 22 }, { width: 22 }, { width: 20 },
      { width: 18 }, { width: 18 }, { width: 16 },
      { width: 24 }, { width: 24 }, { width: 22 },
    ];

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async previewImport(filePath: string, sucursalId: number): Promise<{ token: string; total: number; nuevos: number; duplicados: Array<{ fila: number; codigo: string; nombreExistente: string; nombreNuevo: string; cambios: string[] }>; errores: Array<{ fila: number; codigo: string; razon: string }>; warnings: Array<{ fila: number; codigo: string; mensaje: string }> }> {
    const wb = XLSX.readFile(filePath);
    const wsname = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(wb.Sheets[wsname], { header: 1 });

    const CATALOG = {
      CODIGO: 0, NOMBRE: 1, CATEGORIA: 2, DESCRIPCION: 3,
      UNIDAD_MEDIDA: 4, MANEJA_INVENTARIO: 5,
      PRECIO_VENTA: 6, PRECIO_COMPRA: 7,
      MEDIO_SI_NO: 8, MEDIO_CANTIDAD: 9, MEDIO_PRECIO: 10,
      MAYOREO_SI_NO: 11, MAYOREO_CANTIDAD: 12, MAYOREO_PRECIO: 13,
      SUPER_SI_NO: 14, SUPER_CANTIDAD: 15, SUPER_PRECIO: 16,
    };

    const headerRow = rows[0] as string[];
    if (!headerRow) throw new NotFoundError('El archivo no contiene encabezados');

    const [categorias, unidadesList] = await Promise.all([
      prisma.categorias.findMany({ where: { activo: true } }),
      prisma.unidades_medida.findMany(),
    ]);

    const previewRows: PreviewRow[] = [];
    const errores: Array<{ fila: number; codigo: string; razon: string }> = [];
    const warnings: Array<{ fila: number; codigo: string; mensaje: string }> = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as (string | number | null | undefined)[];
      if (!row || row.every(c => c === undefined || c === null || c === '')) continue;

      const fila = i + 1;
      const errors: string[] = [];
      const rowWarnings: string[] = [];

      const rawCodigo = String(row[CATALOG.CODIGO] ?? '').trim();
      const nombre = String(row[CATALOG.NOMBRE] ?? '').trim();
      const categoriaRaw = String(row[CATALOG.CATEGORIA] ?? '').trim();
      const descripcion = String(row[CATALOG.DESCRIPCION] ?? '').trim() || null;
      const unidadRaw = String(row[CATALOG.UNIDAD_MEDIDA] ?? '').trim().toLowerCase();
      const manInvRaw = String(row[CATALOG.MANEJA_INVENTARIO] ?? '').trim().toUpperCase();
      const precioVenta = Number(row[CATALOG.PRECIO_VENTA]);
      const precioCompraRaw = row[CATALOG.PRECIO_COMPRA];

      const medioSiNo = String(row[CATALOG.MEDIO_SI_NO] ?? '').trim().toUpperCase();
      const medioCantidad = Number(row[CATALOG.MEDIO_CANTIDAD]);
      const medioPrecio = Number(row[CATALOG.MEDIO_PRECIO]);
      const mayoreoSiNo = String(row[CATALOG.MAYOREO_SI_NO] ?? '').trim().toUpperCase();
      const mayoreoCantidad = Number(row[CATALOG.MAYOREO_CANTIDAD]);
      const mayoreoPrecio = Number(row[CATALOG.MAYOREO_PRECIO]);
      const superSiNo = String(row[CATALOG.SUPER_SI_NO] ?? '').trim().toUpperCase();
      const superCantidad = Number(row[CATALOG.SUPER_CANTIDAD]);
      const superPrecio = Number(row[CATALOG.SUPER_PRECIO]);

      if (!nombre) errors.push('Nombre es requerido');
      if (!precioVenta || precioVenta <= 0) errors.push('Precio venta debe ser mayor a 0');

      let categoriaId: number | undefined;
      if (categoriaRaw) {
        const cat = categorias.find(c => c.nombre.toLowerCase() === categoriaRaw.toLowerCase());
        if (cat) categoriaId = cat.id;
        else errors.push(`Categoria "${categoriaRaw}" no existe`);
      }

      let unidad = 'unidad';
      let esMedida = false;
      if (unidadRaw) {
        const u = unidadesList.find(
          x => x.abreviatura.toLowerCase() === unidadRaw || x.nombre.toLowerCase() === unidadRaw
        );
        if (u) {
          unidad = u.abreviatura;
          esMedida = u.es_medida;
        } else {
          rowWarnings.push(`Unidad de medida "${unidadRaw}" no encontrada, se usara "unidad"`);
        }
      }

      let manejaInventario = manInvRaw === 'SI';
      if (esMedida && manejaInventario) {
        manejaInventario = false;
        rowWarnings.push('Producto con unidad de medida (m²/ml) no puede manejar inventario, se forza a NO');
      }

      let codigo = rawCodigo || null;

      if (!codigo) {
        codigo = await generarCodigoProducto(nombre, undefined, sucursalId);
      }

      const preciosPorVolumen: Array<{ nivel: string; cantidadMinima: number; precio: number }> = [];

      if (medioSiNo === 'SI') {
        if (!medioCantidad || medioCantidad <= 0 || !medioPrecio || medioPrecio <= 0) {
          errors.push('Medio mayoreo marcado como SI pero falta cantidad o precio valido');
        } else {
          preciosPorVolumen.push({ nivel: 'medio_mayoreo', cantidadMinima: medioCantidad, precio: medioPrecio });
        }
      }
      if (mayoreoSiNo === 'SI') {
        if (!mayoreoCantidad || mayoreoCantidad <= 0 || !mayoreoPrecio || mayoreoPrecio <= 0) {
          errors.push('Mayoreo marcado como SI pero falta cantidad o precio valido');
        } else {
          preciosPorVolumen.push({ nivel: 'mayoreo', cantidadMinima: mayoreoCantidad, precio: mayoreoPrecio });
        }
      }
      if (superSiNo === 'SI') {
        if (!superCantidad || superCantidad <= 0 || !superPrecio || superPrecio <= 0) {
          errors.push('Super mayoreo marcado como SI pero falta cantidad o precio valido');
        } else {
          preciosPorVolumen.push({ nivel: 'super_mayoreo', cantidadMinima: superCantidad, precio: superPrecio });
        }
      }

      const previewRow: PreviewRow = {
        fila, codigo, nombre,
        categoria: categoriaRaw || null,
        descripcion,
        unidadMedida: unidad,
        manejaInventario,
        precioVenta,
        precioCompra: precioCompraRaw ? Number(precioCompraRaw) : null,
        categoriaId,
        preciosPorVolumen,
        errors,
        warnings: rowWarnings,
      };

      previewRows.push(previewRow);

      if (errors.length > 0) {
        errores.push({ fila, codigo, razon: errors.join('; ') });
      }
      warnings.push(...rowWarnings.map(m => ({ fila, codigo, mensaje: m })));
    }

    const codigosExistentes = await prisma.productos.findMany({
      where: {
        codigo: { in: previewRows.filter(r => r.errors.length === 0).map(r => r.codigo).filter(Boolean) as string[] },
        sucursal_id: sucursalId,
      },
      include: {
        producto_precios: { where: { activo: true } },
      },
    });

    type ExistingProducto = typeof codigosExistentes[number];
    const codigoMap = new Map<string, ExistingProducto>(
      codigosExistentes.filter((p): p is typeof p & { codigo: string } => p.codigo !== null).map(p => [p.codigo, p])
    );

    const normalizePP = (pp: Array<{ nivel: string; cantidad_minima: number | string; precio: number | string }>) =>
      pp
        .map(p => ({ nivel: p.nivel, cantidad_minima: Number(p.cantidad_minima), precio: Number(p.precio) }))
        .sort((a, b) => a.nivel.localeCompare(b.nivel));

    const duplicados: Array<{ fila: number; codigo: string; nombreExistente: string; nombreNuevo: string; cambios: string[] }> = [];
    const sinDuplicados: PreviewRow[] = [];

    for (const row of previewRows) {
      if (row.errors.length > 0) continue;
      if (!row.codigo || !codigoMap.has(row.codigo)) {
        sinDuplicados.push(row);
        continue;
      }
      const existing = codigoMap.get(row.codigo)!;

      const cambios: string[] = [];
      if (existing.nombre !== row.nombre) cambios.push('nombre');
      if ((existing.descripcion ?? null) !== (row.descripcion ?? null)) cambios.push('descripcion');
      if ((existing.categoria_id ?? null) !== (row.categoriaId ?? null)) cambios.push('categoria');
      if (existing.unidad_medida !== row.unidadMedida) cambios.push('unidad');
      if (Number(existing.precio_venta) !== Number(row.precioVenta)) cambios.push('precio_venta');
      if (Number(existing.precio_compra ?? 0) !== Number(row.precioCompra ?? 0)) cambios.push('precio_compra');

      const ppExistente = normalizePP(existing.producto_precios as any);
      const ppNuevo = normalizePP(
        row.preciosPorVolumen.map(p => ({
          nivel: p.nivel,
          cantidad_minima: p.cantidadMinima,
          precio: p.precio,
        }))
      );
      if (JSON.stringify(ppExistente) !== JSON.stringify(ppNuevo)) cambios.push('precios_volumen');

      if (cambios.length > 0) {
        duplicados.push({
          fila: row.fila,
          codigo: row.codigo,
          nombreExistente: existing.nombre,
          nombreNuevo: row.nombre,
          cambios,
        });
      }
      // Si no hay cambios: omitido silenciosamente (no se agrega a duplicados ni a sinDuplicados).
    }

    const token = crypto.randomUUID();
    const data: ImportPreviewData = { rows: previewRows, duplicados };
    setTemp(token, data);

    return {
      token,
      total: previewRows.length,
      nuevos: sinDuplicados.length,
      duplicados,
      errores,
      warnings,
    };
  }

  async confirmImport(
    token: string,
    decisiones: Record<string, string>,
    sucursalId: number,
    usuarioId: number
  ) {
    const data = getTemp<ImportPreviewData>(token);
    if (!data) throw new NotFoundError('Token de preview expirado o invalido');

    deleteTemp(token);

    let importados = 0;
    let actualizados = 0;
    let omitidos = 0;
    const errores: Array<{ fila: number; codigo: string; razon: string }> = [];

    for (const row of data.rows) {
      if (row.errors.length > 0) {
        errores.push({ fila: row.fila, codigo: row.codigo ?? '', razon: row.errors.join('; ') });
        continue;
      }

      const isDuplicado = data.duplicados.some(d => d.codigo === row.codigo);
      if (isDuplicado) {
        const decision = row.codigo ? decisiones[row.codigo] : 'omitir';
        if (decision === 'omitir') {
          omitidos++;
          continue;
        }

        try {
          await prisma.$transaction(async (tx) => {
            const existing = await tx.productos.findFirst({ where: { codigo: row.codigo, sucursal_id: sucursalId } });
            if (existing) {
              await tx.productos.update({
                where: { id: existing.id },
                data: {
                  nombre: row.nombre,
                  descripcion: row.descripcion,
                  categoria_id: row.categoriaId,
                  unidad_medida: row.unidadMedida,
                  precio_venta: row.precioVenta,
                  precio_compra: row.precioCompra,
                },
              });

              await tx.producto_precios.deleteMany({ where: { producto_id: existing.id } });
              if (row.preciosPorVolumen.length > 0) {
                await tx.producto_precios.createMany({
                  data: row.preciosPorVolumen.map(p => ({
                    producto_id: existing.id,
                    nivel: p.nivel,
                    cantidad_minima: p.cantidadMinima,
                    precio: p.precio,
                  })),
                });
              }
            }
          });
          actualizados++;
        } catch (err) {
          errores.push({ fila: row.fila, codigo: row.codigo ?? '', razon: `Error al actualizar: ${err instanceof Error ? err.message : 'desconocido'}` });
        }
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          let codigo = row.codigo;
          if (!codigo) {
            codigo = await generarCodigoProducto(row.nombre, tx, sucursalId);
          }

          let created = false;
          let lastP2002: Error | null = null;

          for (let attempt = 0; attempt < 10 && !created; attempt++) {
            try {
              const codigoActual = attempt === 0
                ? codigo
                : await generarCodigoProducto(row.nombre, tx, sucursalId);

              const producto = await tx.productos.create({
                data: {
                  codigo: codigoActual,
                  nombre: row.nombre,
                  descripcion: row.descripcion,
                  precio_venta: row.precioVenta,
                  precio_compra: row.precioCompra,
                  categoria_id: row.categoriaId,
                  unidad_medida: row.unidadMedida,
                  sucursal_id: sucursalId,
                },
              });

              if (row.manejaInventario) {
                await tx.inventario.create({
                  data: {
                    producto_id: producto.id,
                    sucursal_id: sucursalId,
                    cantidad: 0,
                    stock_minimo: 0,
                  },
                });
              }

              if (row.preciosPorVolumen.length > 0) {
                await tx.producto_precios.createMany({
                  data: row.preciosPorVolumen.map(p => ({
                    producto_id: producto.id,
                    nivel: p.nivel,
                    cantidad_minima: p.cantidadMinima,
                    precio: p.precio,
                  })),
                });
              }

              created = true;
            } catch (err) {
              if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002'
              ) {
                lastP2002 = err;
                continue;
              }
              throw err;
            }
          }

          if (!created) throw lastP2002 ?? new Error('No se pudo crear el producto');
        });
        importados++;
      } catch (err) {
        errores.push({ fila: row.fila, codigo: row.codigo ?? '', razon: `Error al crear: ${err instanceof Error ? err.message : 'desconocido'}` });
      }
    }

    return { importados, actualizados, omitidos, errores };
  }
}

import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { setTemp, getTemp, deleteTemp } from '../utils/tempStore';
import crypto from 'crypto';

interface PreviewInsumoRow {
  fila: number;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  unidadMedida: string;
  anchoRollo: number | null;
  precioCompra: number | null;
  errors: string[];
  warnings: string[];
}

interface ImportInsumoPreviewData {
  rows: PreviewInsumoRow[];
  duplicados: Array<{ fila: number; codigo: string; nombreExistente: string; nombreNuevo: string; cambios: string[] }>;
}

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
  prefix: string,
  sucursalId: number
): Promise<string> {
  const last = await tx.insumos.findFirst({
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

export async function generarCodigoInsumo(
  nombre: string,
  tx?: Prisma.TransactionClient,
  sucursalId?: number
): Promise<string> {
  if (!sucursalId) throw new Error('sucursalId es requerido para generar codigo de insumo');
  const client = tx ?? prisma;
  const prefix = buildPrefix(nombre);
  return nextCodigoForPrefix(client, prefix, sucursalId);
}

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  sucursalId?: number;
}

interface CreateInsumoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  anchoRollo?: number;
  precioCompra?: number;
  proveedorId?: number;
  sucursalId?: number;
}

export class InsumosService {
  async findAll({ page, limit, search, sucursalId }: FindAllParams) {
    const skip = (page - 1) * limit;
    const where = {
      activo: true,
      ...(sucursalId ? { sucursal_id: sucursalId } : {}),
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
          sucursales: { select: { id: true, nombre: true } },
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
        sucursales: { select: { id: true, nombre: true } },
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
    if (!data.sucursalId) throw new Error('sucursalId es requerido');
    const sucursalId = data.sucursalId;
    const codigoManual = data.codigo && data.codigo.trim() !== '' ? data.codigo.trim() : null;
    if (codigoManual) {
      const existing = await prisma.insumos.findFirst({
        where: { codigo: codigoManual, sucursal_id: sucursalId },
      });
      if (existing) throw new ConflictError('Ya existe un insumo con ese codigo en esta sucursal');
    }
    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          const codigo = codigoManual ?? (await generarCodigoInsumo(data.nombre, tx, sucursalId));
          return tx.insumos.create({
            data: {
              codigo,
              nombre: data.nombre,
              descripcion: data.descripcion,
              unidad_medida: data.unidadMedida ?? 'unidad',
              ancho_rollo: data.anchoRollo ? String(data.anchoRollo) : null,
              precio_compra: data.precioCompra,
              proveedor_id: data.proveedorId,
              sucursal_id: sucursalId,
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
    throw new ConflictError('No se pudo generar un codigo unico. Intente de nuevo');
  }

  async update(id: number, data: Partial<CreateInsumoDTO>) {
    const current = await this.findById(id);
    const sucursalId = current.sucursal_id;
    let codigo: string | undefined;
    if (data.codigo !== undefined) {
      const trimmed = data.codigo.trim();
      if (trimmed === '') {
        codigo = await generarCodigoInsumo(data.nombre ?? current.nombre, undefined, sucursalId);
      } else {
        const existing = await prisma.insumos.findFirst({
          where: { codigo: trimmed, sucursal_id: sucursalId, NOT: { id } },
        });
        if (existing) throw new ConflictError('Ya existe un insumo con ese codigo en esta sucursal');
        codigo = trimmed;
      }
    }
    const updateData: Record<string, unknown> = {};
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.unidadMedida) updateData.unidad_medida = data.unidadMedida;
    if (data.anchoRollo !== undefined) {
      updateData.ancho_rollo = data.anchoRollo ? String(data.anchoRollo) : null;
    }
    if (data.precioCompra !== undefined) updateData.precio_compra = data.precioCompra;
    if (data.proveedorId !== undefined) updateData.proveedor_id = data.proveedorId;
    if (codigo !== undefined) updateData.codigo = codigo;

    return prisma.insumos.update({
      where: { id },
      data: updateData,
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

    if (insumo.sucursal_id !== sucursalId) {
      throw new Error('El insumo no pertenece a la sucursal indicada');
    }

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

  // ============ IMPORTAR / DESCARGAR CATÁLOGO ============

  async generateTemplate(): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Insumos');

    const headers = [ // encabezado del excel 
      'codigo', 'Nombre', 'Descripcion', 'Unidad de medida', 'Ancho rollo', 'Precio compra',
    ];

    const headerRow = ws.addRow(headers); 
    headerRow.eachCell((cell) => { // estilo de encabezado
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF225C5E' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 14 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    ws.addRow(['', 'Ejemplo de insumo', '', 'PZ', '', '']); // fila de ejemplo

    ws.columns = [ // ancho de columnas
      { width: 12 }, { width: 30 }, { width: 40 }, { width: 18 },
      { width: 14 }, { width: 14 },
    ];

    // Hoja auxiliar "Unidades"
    const unidades = await prisma.unidades_medida.findMany();
    const wsU = wb.addWorksheet('Unidades');
    wsU.addRow(['Abreviatura', 'Nombre']);
    const headerU = wsU.getRow(1);
    headerU.eachCell((cell) => {
      cell.font = { bold: true };
    });
    for (const u of unidades) { // agregar unidades a la hoja auxiliar
      wsU.addRow([u.abreviatura, u.nombre]);
    }
    wsU.columns = [{ width: 14 }, { width: 30 }];

    // Validacion de datos (dropdown) en columna "Unidad de medida" (D)
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
    const wsDv = ws as unknown as { dataValidations: { add: (addr: string, dv: typeof dvConfig) => void } }; // cast para acceder a dataValidations
    for (let r = 2; r <= 1000; r++) { // agregar validacion a cada fila de la columna D
      wsDv.dataValidations.add(`D${r}`, dvConfig);
    }

    const buffer = await wb.xlsx.writeBuffer();
    // Post-procesar XML para consolidar dataValidations superpuestas en un unico rango
    return consolidarDataValidationsAsync(Buffer.from(buffer), 'D2:D1000');
  }

  async exportCatalog(sucursalId?: number): Promise<Buffer> {
    const insumos = await prisma.insumos.findMany({
      where: { activo: true, ...(sucursalId ? { sucursal_id: sucursalId } : {}) },
      orderBy: { nombre: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Insumos'); // hoja principal

    const headers = [ // encabezado del excel
      'codigo', 'Nombre', 'Descripcion', 'Unidad de medida', 'Ancho rollo', 'Precio compra',
    ];

    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF225C5E' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    for (const i of insumos) {
      ws.addRow([
        i.codigo || '',
        i.nombre,
        i.descripcion || '',
        i.unidad_medida,
        i.ancho_rollo ? Number(i.ancho_rollo) : '',
        i.precio_compra ? Number(i.precio_compra) : '',
      ]);
    }

    ws.columns = [
      { width: 12 }, { width: 30 }, { width: 40 }, { width: 18 },
      { width: 14 }, { width: 14 },
    ];

    // Hoja auxiliar "Unidades" (referencia para el dropdown)
    const unidades = await prisma.unidades_medida.findMany(); // obtener unidades de medida
    const wsU = wb.addWorksheet('Unidades'); // hoja auxiliar
    wsU.addRow(['Abreviatura', 'Nombre']); // encabezado de la hoja auxiliar
    const headerU = wsU.getRow(1);
    headerU.eachCell((cell) => { // estilo de encabezado de la hoja auxiliar
      cell.font = { bold: true };
    });
    for (const u of unidades) { // agregar unidades a la hoja auxiliar
      wsU.addRow([u.abreviatura, u.nombre]);
    }
    wsU.columns = [{ width: 14 }, { width: 30 }]; // ancho de columnas de la hoja auxiliar

    // Validacion de datos (dropdown) en columna "Unidad de medida" (D)
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
    const wsDv = ws as unknown as { dataValidations: { add: (addr: string, dv: typeof dvConfig) => void } }; // cast para acceder a dataValidations
    const filaFin = Math.max(insumos.length + 1, 100);
    for (let r = 2; r <= filaFin; r++) {
      wsDv.dataValidations.add(`D${r}`, dvConfig);
    }

    const buffer = await wb.xlsx.writeBuffer();
    return consolidarDataValidationsAsync(Buffer.from(buffer), `D2:D${filaFin}`);
  }

  async previewImport(filePath: string, sucursalId: number): Promise<{ token: string; total: number; nuevos: number; duplicados: Array<{ fila: number; codigo: string; nombreExistente: string; nombreNuevo: string; cambios: string[] }>; errores: Array<{ fila: number; codigo: string; razon: string }>; warnings: Array<{ fila: number; codigo: string; mensaje: string }> }> {
    const wb = XLSX.readFile(filePath);
    const wsname = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(wb.Sheets[wsname], { header: 1 });

    const CATALOG = {
      CODIGO: 0, NOMBRE: 1, DESCRIPCION: 2, UNIDAD_MEDIDA: 3,
      ANCHO_ROLLO: 4, PRECIO_COMPRA: 5,
    };

    const headerRow = rows[0] as string[];
    if (!headerRow) throw new NotFoundError('El archivo no contiene encabezados');

    const unidadesList = await prisma.unidades_medida.findMany();

    const previewRows: PreviewInsumoRow[] = [];
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
      const descripcionRaw = String(row[CATALOG.DESCRIPCION] ?? '').trim();
      const descripcion = descripcionRaw === '' ? null : descripcionRaw;
      const unidadRaw = String(row[CATALOG.UNIDAD_MEDIDA] ?? '').trim().toLowerCase();
      const anchoRolloRaw = row[CATALOG.ANCHO_ROLLO];
      const precioCompraRaw = row[CATALOG.PRECIO_COMPRA];

      if (!nombre) errors.push('Nombre es requerido');

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

      let anchoRollo: number | null = null;
      if (anchoRolloRaw !== undefined && anchoRolloRaw !== null && String(anchoRolloRaw).trim() !== '') {
        anchoRollo = Number(anchoRolloRaw);
        if (isNaN(anchoRollo) || anchoRollo < 0) {
          errors.push('Ancho rollo debe ser un numero >= 0');
          anchoRollo = null;
        }
      }

      let precioCompra: number | null = null;
      if (precioCompraRaw !== undefined && precioCompraRaw !== null && String(precioCompraRaw).trim() !== '') {
        precioCompra = Number(precioCompraRaw);
        if (isNaN(precioCompra) || precioCompra < 0) {
          errors.push('Precio compra debe ser un numero >= 0');
          precioCompra = null;
        }
      }

      let codigo = rawCodigo || null;
      if (!codigo) {
        codigo = await generarCodigoInsumo(nombre, undefined, sucursalId);
      }

      const previewRow: PreviewInsumoRow = {
        fila, codigo, nombre, descripcion,
        unidadMedida: unidad,
        anchoRollo,
        precioCompra,
        errors,
        warnings: rowWarnings,
      };

      previewRows.push(previewRow);

      if (errors.length > 0) {
        errores.push({ fila, codigo, razon: errors.join('; ') });
      }
      warnings.push(...rowWarnings.map(m => ({ fila, codigo, mensaje: m })));
    }

    // Buscar existentes por codigo dentro de la sucursal
    const codigosExistentes = await prisma.insumos.findMany({
      where: {
        codigo: { in: previewRows.filter(r => r.errors.length === 0 && r.codigo).map(r => r.codigo) as string[] },
        activo: true,
        sucursal_id: sucursalId,
      },
    });

    const codigoMap = new Map<string, typeof codigosExistentes[number]>(
      codigosExistentes.filter((p): p is typeof p => p.codigo !== null).map(p => [p.codigo, p])
    );

    const duplicados: Array<{ fila: number; codigo: string; nombreExistente: string; nombreNuevo: string; cambios: string[] }> = [];
    const sinDuplicados: PreviewInsumoRow[] = [];

    for (const row of previewRows) {
      if (row.errors.length > 0) continue;
      if (!row.codigo || !codigoMap.has(row.codigo)) {
        sinDuplicados.push(row);
        continue;
      }
      const existing = codigoMap.get(row.codigo)!;

      const cambios: string[] = [];
      if (existing.nombre !== row.nombre) cambios.push('nombre');
      // Normalizar descripcion: "" y null son equivalentes
      const existDesc = existing.descripcion ?? null;
      const rowDesc = row.descripcion ?? null;
      const existDescNorm = (existDesc === '' || existDesc === null) ? null : existDesc;
      const rowDescNorm = (rowDesc === '' || rowDesc === null) ? null : rowDesc;
      if (existDescNorm !== rowDescNorm) cambios.push('descripcion');
      if (existing.unidad_medida !== row.unidadMedida) cambios.push('unidad_medida');

      const existAncho = existing.ancho_rollo ? Number(existing.ancho_rollo) : null;
      if (existAncho !== row.anchoRollo) cambios.push('ancho_rollo');

      const existPrecio = existing.precio_compra ? Number(existing.precio_compra) : null;
      if (existPrecio !== row.precioCompra) cambios.push('precio_compra');

      if (cambios.length > 0) {
        duplicados.push({
          fila: row.fila,
          codigo: row.codigo,
          nombreExistente: existing.nombre,
          nombreNuevo: row.nombre,
          cambios,
        });
      }
      // Sin cambios: omitido silenciosamente.
    }

    const token = crypto.randomUUID();
    const data: ImportInsumoPreviewData = { rows: previewRows, duplicados };
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
  ) {
    const data = getTemp<ImportInsumoPreviewData>(token);
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

      // Detectar duplicado en DB directamente dentro de la misma sucursal
      const existingRow = row.codigo ? await prisma.insumos.findFirst({ where: { codigo: row.codigo, activo: true, sucursal_id: sucursalId } }) : null;
      if (existingRow) {
        const isDuplicadoConCambios = data.duplicados.some(d => d.codigo === row.codigo);
        const decision = isDuplicadoConCambios ? (decisiones[row.codigo!] || 'omitir') : 'omitir';

        if (decision === 'omitir') {
          omitidos++;
          continue;
        }

        try {
          await prisma.$transaction(async (tx) => {
            const existing = row.codigo ? await tx.insumos.findFirst({ where: { codigo: row.codigo, activo: true, sucursal_id: sucursalId } }) : null;
            if (existing) {
              await tx.insumos.update({
                where: { id: existing.id },
                data: {
                  nombre: row.nombre,
                  descripcion: row.descripcion,
                  unidad_medida: row.unidadMedida,
                  ancho_rollo: row.anchoRollo ? String(row.anchoRollo) : null,
                  precio_compra: row.precioCompra,
                },
              });
            }
          });
          actualizados++;
        } catch (err) {
          errores.push({ fila: row.fila, codigo: row.codigo ?? '', razon: `Error al actualizar: ${err instanceof Error ? err.message : 'desconocido'}` });
        }
        continue;
      }

      // Crear nuevo insumo
      try {
        await prisma.$transaction(async (tx) => {
          let codigo = row.codigo;
          if (!codigo) {
            codigo = await generarCodigoInsumo(row.nombre, tx, sucursalId);
          }

          let created = false;
          let lastP2002: Error | null = null;

          for (let attempt = 0; attempt < 10 && !created; attempt++) {
            try {
              const codigoActual = attempt === 0
                ? codigo
                : await generarCodigoInsumo(row.nombre, tx, sucursalId);

              await tx.insumos.create({
                data: {
                  codigo: codigoActual,
                  nombre: row.nombre,
                  descripcion: row.descripcion,
                  unidad_medida: row.unidadMedida,
                  ancho_rollo: row.anchoRollo ? String(row.anchoRollo) : null,
                  precio_compra: row.precioCompra,
                  sucursal_id: sucursalId,
                },
              });

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

          if (!created) throw lastP2002 ?? new Error('No se pudo crear el insumo');
        });
        importados++;
      } catch (err: any) {
        errores.push({ fila: row.fila, codigo: row.codigo ?? '', razon: `Error al crear: ${err instanceof Error ? err.message : 'desconocido'}` });
      }
    }

    return { importados, actualizados, omitidos, errores };
  }
}

/**
 * Post-procesa el XLSX generado por ExcelJS para consolidar multiples entradas
 * de dataValidation con el mismo formula1 en una sola con el sqref indicado.
 * ExcelJS a veces produce entries superpuestas (ej: D2:D1000 y D10:D1000) que
 * generan overlaps; este helper las reemplaza por un unico sqref limpio.
 *
 * @param buffer   Buffer del archivo .xlsx generado
 * @param targetSqref Rango final deseado (ej. "D2:D1000")
 */
export function consolidarDataValidations(buffer: Buffer, targetSqref: string): Buffer {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const JSZip = require('jszip');
  const zip = JSZip.loadAsync(buffer);

  // jszip es async — para mantener API sync, retorno el buffer original y
  // aplico la consolidacion en otro paso. Mejor: hacer async.
  // Para no romper la firma, devolvemos el buffer tal cual y aplicamos
  // un fix directo con replace de strings sobre el buffer.
  const xmlStr = buffer.toString('latin1');

  // Buscar el sheet XML dentro del zip requiere leer con jszip; más simple:
  // usar post-procesamiento búsqueda de patrón de sqref duplicado por string.
  // JSZip comprime los entries (deflate), no es posible buscar string en bruto.

  // Por lo tanto, devolvemos el buffer original y se usa la versión async
  // de consolidarDataValidationsAsync en su lugar.
  return buffer;
}

export async function consolidarDataValidationsAsync(buffer: Buffer, targetSqref: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(buffer);

  // Buscar el sheet XML que contenga <dataValidations>
  let sheetFile: string | null = null;
  let sheetXml: string | null = null;
  const candidates: string[] = [];
  zip.forEach((relativePath: string, _file: any) => {
    if (relativePath.startsWith('xl/worksheets/sheet') && relativePath.endsWith('.xml')) {
      candidates.push(relativePath);
    }
  });
  for (const c of candidates) {
    const xml = await zip.file(c).async('string');
    if (xml.includes('<dataValidations')) {
      sheetFile = c;
      sheetXml = xml;
      break;
    }
  }
  if (!sheetFile || !sheetXml) return buffer;

  // Extraer bloque <dataValidations ...>...</dataValidations>
  const m = sheetXml.match(/<dataValidations[^>]*count="(\d+)"[^>]*>([\s\S]*?)<\/dataValidations>/);
  if (!m) return buffer;

  const outer = m[0];
  const inner = m[2];

  // Extraer cada <dataValidation ...>...</dataValidation>
  const entries: Array<{ attrs: Record<string, string>; formula: string; body: string }> = [];
  const re = /<dataValidation([^>]*)>([\s\S]*?)<\/dataValidation>/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(inner)) !== null) {
    const attrsStr = mm[1];
    const body = mm[2];
    const attrs: Record<string, string> = {};
    const attrRe = /(\w+)="([^"]*)"/g;
    let am: RegExpExecArray | null;
    while ((am = attrRe.exec(attrsStr)) !== null) {
      attrs[am[1]] = am[2];
    }
    const fm = body.match(/<formula1>([\s\S]*?)<\/formula1>/);
    entries.push({ attrs, formula: fm ? fm[1] : '', body });
  }

  // Agrupar por formula1
  const byFormula = new Map<string, Array<{ attrs: Record<string, string>; body: string }>>();
  for (const e of entries) {
    if (!byFormula.has(e.formula)) byFormula.set(e.formula, []);
    byFormula.get(e.formula)!.push({ attrs: e.attrs, body: e.body });
  }

  // Reconstruir <dataValidations> con un unico sqref por formula1
  let newInner = '';
  let newCount = 0;
  for (const [, group] of byFormula) {
    const first = group[0];
    const attrsArr = Object.entries(first.attrs)
      .filter(([k]) => k !== 'sqref')
      .map(([k, v]) => `${k}="${v}"`);
    attrsArr.push(`sqref="${targetSqref}"`);
    newInner += `<dataValidation ${attrsArr.join(' ')}>${first.body}</dataValidation>`;
    newCount++;
  }

  const newOuter = `<dataValidations count="${newCount}">${newInner}</dataValidations>`;
  const newXml = sheetXml.replace(outer, newOuter);

  zip.file(sheetFile, newXml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

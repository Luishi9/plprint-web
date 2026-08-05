export interface Insumo {
  id: number;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string;
  ancho_rollo: string | null;
  precio_compra: string | null;
  proveedor_id: number | null;
  sucursal_id: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  proveedores?: {
    id: number;
    nombre: string;
  } | null;
  sucursales?: {
    id: number;
    nombre: string;
  };
  inventario?: InsumoInventario[];
  producto_insumos?: ProductoInsumo[];
}

export interface InsumoInventario {
  id: number;
  insumo_id: number;
  sucursal_id: number;
  cantidad: string;
  stock_minimo: string;
  updated_at: string;
  sucursales?: {
    id: number;
    nombre: string;
  };
}

export interface ProductoInsumo {
  id: number;
  producto_id: number;
  insumo_id: number;
  cantidad_requerida: string;
  productos?: {
    id: number;
    nombre: string;
  };
  insumos?: {
    id: number;
    codigo: string | null;
    nombre: string;
    unidad_medida: string;
  };
}

export interface InsumoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  anchoRollo?: number;
  precioCompra?: number;
  proveedorId?: number;
  sucursalId?: number;
}

export interface AjusteInsumoDTO {
  insumoId: number;
  sucursalId: number;
  cantidad: number;
  tipo: 'entrada' | 'salida';
}

export interface ImportInsumoPreviewData {
  token: string;
  total: number;
  nuevos: number;
  duplicados: Array<{
    fila: number;
    codigo: string;
    nombreExistente: string;
    nombreNuevo: string;
    cambios?: string[];
  }>;
  errores: Array<{ fila: number; codigo: string; razon: string }>;
  warnings: Array<{ fila: number; codigo: string; mensaje: string }>;
}

export interface ImportInsumoConfirmResult {
  importados: number;
  actualizados: number;
  omitidos: number;
  errores: Array<{ fila: number; codigo: string; razon: string }>;
}

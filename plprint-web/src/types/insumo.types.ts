export interface Insumo {
  id: number;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string;
  precio_compra: string | null;
  proveedor_id: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  proveedores?: {
    id: number;
    nombre: string;
  } | null;
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
  precioCompra?: number;
  proveedorId?: number;
}

export interface AjusteInsumoDTO {
  insumoId: number;
  sucursalId: number;
  cantidad: number;
  tipo: 'entrada' | 'salida';
}

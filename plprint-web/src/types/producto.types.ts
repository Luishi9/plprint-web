export interface Producto {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  precio_compra?: number;
  unidad_medida: string;
  clave_prod_serv?: string;
  clave_unidad?: string;
  imagen_url?: string;
  activo: boolean;
  cobrar_minimo_1?: boolean;
  categoria_id?: number;
  proveedor_id?: number;
  maquina_id?: number | null;
  categorias?: { nombre: string; tipo?: string };
  maquinas?: { id: number; nombre: string } | null;
  inventario?: Array<{ cantidad: number; stock_minimo: number; sucursal_id: number }>;
}

export interface CreateProductoPayload {
  nombre: string;
  precioVenta: number;
  precioCompra?: number;
  categoriaId?: number;
  descripcion?: string;
  codigo?: string;
  unidadMedida?: string;
  imagen?: File;
  cantidadInicial?: number;
  sucursalId?: number;
  cobrarMinimo1?: boolean;
  maquinaId?: number | null;
}

export interface ItemInventario {
  id: number;
  cantidad: number;
  stock_minimo: number;
  stock_maximo?: number;
  productos: Pick<Producto, 'id' | 'codigo' | 'nombre' | 'imagen_url' | 'precio_venta' | 'unidad_medida'>;
}

export interface VentaItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface VentaAbono {
  id: number;
  monto: number | string;
  metodo_pago: string;
  notas: string | null;
  fecha: string;
  usuarios?: { id: number; nombre: string };
}

export interface Venta {
  id: number;
  folio?: string;
  total: number;
  descuento: number;
  descuento_motivo?: string | null;
  metodo_pago: string;
  metodo_pago_id?: number | null;
  estado: string;
  estado_pago?: 'pagada' | 'pendiente' | 'parcial';
  saldo_pendiente?: number | string;
  fecha_limite_pago?: string | null;
  cotizacion_id?: number | null;
  notas?: string | null;
  created_at: string;
  sucursal_id?: number | null;
  cliente_id?: number | null;
  cliente?: { nombre: string };
  clientes?: { nombre: string };
  usuarios?: { nombre: string };
  sucursales?: { nombre: string };
  venta_detalle: {
    id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    descuento?: number | string | null;
    notas?: string | null;
    productos?: { nombre: string };
  }[];
  ventas_abonos?: VentaAbono[];
}

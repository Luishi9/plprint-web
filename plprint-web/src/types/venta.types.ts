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
  metodo_pago: string;
  estado: string;
  estado_pago?: 'pagada' | 'pendiente' | 'parcial';
  saldo_pendiente?: number | string;
  fecha_limite_pago?: string | null;
  cotizacion_id?: number | null;
  created_at: string;
  clientes?: { nombre: string };
  usuarios?: { nombre: string };
  sucursales?: { nombre: string };
  venta_detalle: {
    id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos?: { nombre: string };
  }[];
  ventas_abonos?: VentaAbono[];
}

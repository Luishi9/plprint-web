import { forwardRef } from 'react';
import logoImage from '@/assets/logo.png';
import { escapeHtml } from '@/utils/escapeHtml';

const DEFAULT_LOGO_URL = `${typeof window !== 'undefined' ? window.location.origin : ''}${logoImage}`;
const TICKET_DATE_FMT = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

export interface TicketData {
  ventaId: number;
  folio?: string;
  fecha: Date;
  sucursal: string;
  cajero: string;
  cliente: string;
  metodoPago: string;
  items: {
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    ancho_m?: number;
    alto_m?: number;
    labelUnidad?: string;
    esMedida?: boolean;
    tipoMedida?: 'm2' | 'ml' | null;
  }[];
  subtotal: number;
  descuentoGlobal: number;
  base: number;
  iva: number;
  ivaPorcentaje: number;
  ivaActivo: boolean;
  total: number;
  notas?: string;
  monedaSimbolo?: string;
  monedaDecimales?: number;
  metodoPagoLabel?: string;
  montoRecibido?: number;
  cambio?: number;
  saldoPendiente?: number;
}

export function buildTicketHtml(data: TicketData, logoUrl: string = DEFAULT_LOGO_URL): string {
  const fecha = TICKET_DATE_FMT.format(data.fecha);

  const finalLogoUrl = logoUrl || DEFAULT_LOGO_URL;
  const simbolo = data.monedaSimbolo || '$';
  const decimales = typeof data.monedaDecimales === 'number' ? data.monedaDecimales : 2;
  const fmt = (n: number) => `${simbolo}${n.toFixed(decimales)}`;

  const rows = data.items.map((item) => {
    const lineTotal = item.precioUnitario * item.cantidad - item.descuento;
    const medidaInfo = item.esMedida && item.ancho_m != null && item.alto_m != null
      ? `<div style="font-size:9px;color:#666;">${item.tipoMedida === 'm2' ? `${item.ancho_m}m × ${item.alto_m}m` : `${item.alto_m}m`} = ${escapeHtml(item.labelUnidad ?? '')}</div>`
      : '';
    return `
      <tr>
        <td style="padding:3px 2px;font-weight:600;">${escapeHtml(item.nombre)}${medidaInfo}</td>
        <td style="padding:3px 2px;text-align:center;">${item.cantidad}</td>
        <td style="padding:3px 2px;text-align:right;">${fmt(item.precioUnitario)}</td>
        <td style="padding:3px 2px;text-align:right;">${fmt(lineTotal)}</td>
      </tr>
      ${item.descuento > 0 ? `<tr><td colspan="4" style="text-align:right;font-size:9px;color:#666;">Desc: -${fmt(item.descuento)}</td></tr>` : ''}
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket #${data.ventaId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      color: #000;
      background: #fff;
      width: 80mm;
      padding: 4mm 6mm 8mm;
    }
    @page { margin: 0; size: 80mm auto; }
    @media print { body { width: 80mm; } }
    .center { text-align: center; }
    .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .divider-solid { border: none; border-top: 1px solid #000; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 10px; text-align: left; padding: 2px; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
  </style>
</head>
<body>
  <div class="center" style="margin-bottom:8px;">
    <img src="${escapeHtml(finalLogoUrl)}" width="48" height="48" style="object-fit:contain;" />
    <div style="font-size:16px;font-weight:bold;letter-spacing:2px;margin-top:4px;">PLPRINT</div>
    <div style="font-size:10px;color:#555;">Punto de Venta</div>
    <div style="font-size:10px;color:#555;">${escapeHtml(data.sucursal)}</div>
  </div>

  <hr class="divider" />

  <div class="row"><strong>TICKET #${String(data.ventaId).padStart(6, '0')}</strong></div>
  ${data.folio ? `<div class="row" style="font-size:10px;color:#555;"><span>Folio:</span><span>${escapeHtml(data.folio)}</span></div>` : ''}
  <div style="color:#333;">${fecha}</div>
  <div class="row" style="margin-top:2px;"><span>Cajero:</span><span>${escapeHtml(data.cajero)}</span></div>
  <div class="row"><span>Cliente:</span><span>${escapeHtml(data.cliente)}</span></div>
  <div class="row"><span>Pago:</span><span>${escapeHtml(data.metodoPagoLabel || data.metodoPago)}</span></div>

  <hr class="divider" />

  <table>
    <thead>
      <tr>
        <th>PRODUCTO</th>
        <th style="text-align:center;">CANT</th>
        <th style="text-align:right;">PRECIO</th>
        <th style="text-align:right;">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      <tr><td colspan="4"><hr class="divider-solid" /></td></tr>
      ${rows}
    </tbody>
  </table>

  <hr class="divider" />

  <div class="row"><span>Subtotal:</span><span>${fmt(data.subtotal)}</span></div>
  ${data.descuentoGlobal > 0 ? `<div class="row" style="color:#555;"><span>Descuento:</span><span>-${fmt(data.descuentoGlobal)}</span></div>` : ''}
  ${data.ivaActivo && data.ivaPorcentaje > 0 ? `
    <div class="row" style="font-size:10px;color:#555;"><span>Base:</span><span>${fmt(data.base)}</span></div>
    <div class="row" style="font-size:10px;color:#555;"><span>IVA (${data.ivaPorcentaje}%):</span><span>${fmt(data.iva)}</span></div>
  ` : ''}
  <hr class="divider-solid" />
  <div class="row" style="font-size:15px;font-weight:bold;">
    <span>TOTAL:</span><span>${fmt(data.total)}</span>
  </div>

  ${typeof data.montoRecibido === 'number' && data.montoRecibido > 0 ? `
    <div class="row" style="margin-top:4px;"><span>Recibido:</span><span>${fmt(data.montoRecibido)}</span></div>
    ${typeof data.cambio === 'number' && data.cambio > 0 ? `
      <div class="row" style="font-size:14px;font-weight:bold;border:1px dashed #000;padding:4px 6px;margin-top:4px;">
        <span>CAMBIO:</span><span>${fmt(data.cambio)}</span>
      </div>
    ` : ''}
    ${typeof data.saldoPendiente === 'number' && data.saldoPendiente > 0 ? `
      <div class="row" style="font-size:13px;font-weight:bold;color:#000;background:#fde68a;padding:4px 6px;margin-top:4px;border:1px solid #b45309;">
        <span>SALDO PENDIENTE:</span><span>${fmt(data.saldoPendiente)}</span>
      </div>
      <div class="center" style="font-size:10px;margin-top:2px;color:#b45309;">~ Pago parcial, abonos requeridos ~</div>
    ` : ''}
  ` : ''}

  ${data.notas ? `<hr class="divider" /><div style="font-weight:bold;">Notas:</div><div style="color:#444;">${escapeHtml(data.notas)}</div>` : ''}

  <hr class="divider" />
  <div class="center" style="color:#555;">
    <div>¡Gracias por su compra!</div>
    <div style="margin-top:2px;">PLPrint — ${escapeHtml(data.sucursal)}</div>
  </div>
</body>
</html>`;
}

export const TicketImpresion = forwardRef<HTMLDivElement, { data: TicketData | null }>(
  (_props, ref) => <div ref={ref} />,
);
TicketImpresion.displayName = 'TicketImpresion';

import { buildTicketHtml, TicketData } from './components/TicketImpresion';
import { sileo } from 'sileo';
import type { Venta } from '@/types/venta.types';
import type { MoneyFormatter, MetodoLabelResolver, LogoSrc } from './types';
import { escapeHtml } from '@/utils/escapeHtml';
import { sanitizePrintHtml } from '@/utils/sanitizePrintHtml';
import { formatLocalDateTime } from '@/utils/localDate';

export function buildTicketData(
  venta: Venta,
  subtotal: number,
  getMetodoLabel: MetodoLabelResolver,
  sucursalActivaNombre?: string,
): TicketData {
  return {
    ventaId: venta.id,
    folio: venta.folio,
    fecha: new Date(venta.created_at),
    sucursal: venta.sucursales?.nombre ?? sucursalActivaNombre ?? 'PLPrint',
    cajero: venta.usuarios?.nombre ?? 'Cajero',
    cliente: venta.clientes?.nombre ?? 'Público General',
    metodoPago: venta.metodo_pago,
    metodoPagoLabel: getMetodoLabel(venta.metodo_pago),
    items: venta.venta_detalle.map((d) => ({
      nombre: d.productos?.nombre ?? `Producto #${d.id}`,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precio_unitario),
      descuento: 0,
    })),
    subtotal,
    descuentoGlobal: Number(venta.descuento ?? 0),
    base: subtotal,
    iva: 0,
    ivaPorcentaje: 0,
    ivaActivo: false,
    total: Number(venta.total),
  };
}

export function printTicket(venta: Venta, logoSrc: LogoSrc | string, getMetodoLabel: MetodoLabelResolver) {
  const subtotal = venta.venta_detalle.reduce(
    (acc, d) => acc + Number(d.precio_unitario) * d.cantidad,
    0,
  );
  const html = sanitizePrintHtml(buildTicketHtml(
    buildTicketData(venta, subtotal, getMetodoLabel as any),
    logoSrc ?? undefined,
  ));
  const win = window.open('', '_blank', 'width=400,height=600');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }
}

export function buildAbonosTicketHtml(venta: Venta, money: MoneyFormatter, getMetodoLabel: MetodoLabelResolver): string {
  const total = Number(venta.total);
  const abonos = venta.ventas_abonos || [];
  const abonado = abonos.reduce((acc, a) => acc + Number(a.monto), 0);
  const saldo = total - abonado;
  const fecha = new Date(venta.created_at);

  const rows = abonos.map((a) => {
    const f = formatLocalDateTime(a.fecha);
    return `
        <tr>
          <td style="padding:5px 4px;font-size:11px;border-bottom:1px dashed #e5e7eb;">${f}</td>
          <td style="padding:5px 4px;font-size:11px;">${escapeHtml(getMetodoLabel(a.metodo_pago))}</td>
          <td style="padding:5px 4px;font-size:11px;color:#6b7280;">${escapeHtml(a.usuarios?.nombre || '—')}</td>
          <td style="padding:5px 4px;font-size:11px;text-align:right;color:#2e9e9b;font-weight:600;">+${money(Number(a.monto))}</td>
        </tr>
        ${a.notas ? `<tr><td colspan="4" style="padding:0 4px 6px;font-size:10px;color:#9ca3af;font-style:italic;">&nbsp;&nbsp;${escapeHtml(a.notas)}</td></tr>` : ''}
      `;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Abonos Venta #${venta.id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; max-width: 320px; margin: 0 auto; padding: 12px; color: #1f2937; font-size: 12px; }
  .header { text-align: center; border-bottom: 2px dashed #2e9e9b; padding-bottom: 8px; margin-bottom: 10px; }
  .header h1 { font-size: 16px; color: #2e9e9b; }
  .header p { font-size: 10px; color: #6b7280; margin-top: 2px; }
  .info { margin: 8px 0; line-height: 1.6; }
  .info b { display: inline-block; min-width: 70px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th { text-align: left; padding: 4px; font-size: 10px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #2e9e9b; }
  .totales { border-top: 2px dashed #1f2937; padding-top: 8px; margin-top: 8px; }
  .totales div { display: flex; justify-content: space-between; padding: 2px 0; }
  .totales .saldo { font-size: 14px; font-weight: 700; color: #ea580c; border-top: 1px solid #1f2937; padding-top: 4px; margin-top: 4px; }
  .totales .abonado { color: #2e9e9b; font-weight: 600; }
  .footer { text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #e5e7eb; font-size: 9px; color: #9ca3af; }
  .no-print { text-align: center; margin-top: 12px; }
  .no-print button { padding: 8px 20px; background: #2e9e9b; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-family: sans-serif; }
  @media print { .no-print { display: none; } }
</style></head><body>
  <div class="header">
    <h1>TICKET DE ABONOS</h1>
    <p>Venta #${venta.id} · ${formatLocalDateTime(fecha)}</p>
  </div>
  <div class="info">
    <div><b>Cliente:</b> ${escapeHtml(venta.clientes?.nombre || 'Público General')}</div>
    <div><b>Vendedor:</b> ${escapeHtml(venta.usuarios?.nombre || '—')}</div>
    <div><b>Sucursal:</b> ${escapeHtml(venta.sucursales?.nombre || '—')}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Método</th>
        <th>Usuario</th>
        <th style="text-align:right;">Monto</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:12px;color:#9ca3af;">Sin abonos</td></tr>'}</tbody>
  </table>
  <div class="totales">
    <div><span>Total venta:</span><span><b>${money(total)}</b></span></div>
    <div class="abonado"><span>Total abonado:</span><span>${money(abonado)}</span></div>
    <div class="saldo"><span>SALDO PENDIENTE:</span><span>${money(saldo)}</span></div>
  </div>
  <div class="footer">
    <p>Documento generado el ${formatLocalDateTime(new Date())}</p>
    <p style="margin-top:4px;">PLPrint — Sistema de Punto de Venta</p>
  </div>
  <div class="no-print">
    <button type="button" onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>
</body></html>`;
}

export function printAbonosTicket(venta: Venta, money: MoneyFormatter, getMetodoLabel: MetodoLabelResolver) {
  const html = sanitizePrintHtml(buildAbonosTicketHtml(venta, money, getMetodoLabel));
  const win = window.open('', '_blank', 'width=420,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); };
  } else {
    sileo.info({ title: 'Permite las ventanas emergentes para imprimir.' });
  }
}

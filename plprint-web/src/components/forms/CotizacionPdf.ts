import { useConfigStore } from '@/store/configStore';
import { useMoney } from '@/hooks/useMoney';
import { sileo } from 'sileo';
import { escapeHtml } from '@/utils/escapeHtml';
import { sanitizePrintHtml } from '@/utils/sanitizePrintHtml';

const FECHA_FMT = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit', month: 'long', year: 'numeric',
});
const HORA_FMT = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit', minute: '2-digit', hour12: false,
});

export interface CotizacionPdfData {
  folio: string;
  fecha: Date;
  cliente: string;
  vendedor: string;
  sucursal: string;
  diasVigencia?: number;
  items: {
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
  }[];
  subtotal: number;
  descuento: number;
  descuentoMotivo?: string;
  total: number;
  notas?: string;
  logoUrl?: string;
}

export function useCotizacionPdfBuilder() {
  const config = useConfigStore();
  const { simbolo, decimales } = useMoney();

  const buildHtml = (data: CotizacionPdfData): string => {
    const empresa = {
      nombre: config.getStr('empresa_nombre') || 'PLPrint',
      rfc: config.getStr('empresa_rfc'),
      direccion: config.getStr('empresa_direccion'),
      telefono: config.getStr('empresa_telefono'),
      email: config.getStr('empresa_email'),
    };
    const fmt = (n: number) => `${simbolo}${(n || 0).toFixed(decimales)}`;
    const fechaStr = FECHA_FMT.format(data.fecha);
    const horaStr = HORA_FMT.format(data.fecha);
    const venceStr = data.diasVigencia
      ? FECHA_FMT.format(new Date(data.fecha.getTime() + data.diasVigencia * 24 * 60 * 60 * 1000))
      : null;

    const rows = data.items.map((it) => {
      const lineSubtotal = it.precioUnitario * it.cantidad;
      const lineTotal = lineSubtotal - (it.descuento || 0);
      return `
        <tr>
          <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:12px;">${escapeHtml(it.nombre)}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:12px;">${it.cantidad}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${fmt(it.precioUnitario)}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${fmt(lineSubtotal)}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:600;">${fmt(lineTotal)}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Cotización ${data.folio}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1f2937; padding: 24px; max-width: 850px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2e9e9b; padding-bottom: 16px; margin-bottom: 24px; }
  .empresa-info { flex: 1; }
  .empresa-info h1 { font-size: 22px; color: #2e9e9b; margin-bottom: 4px; }
  .empresa-info p { font-size: 11px; color: #6b7280; line-height: 1.5; }
  .logo { max-width: 100px; max-height: 100px; object-fit: contain; margin-left: 16px; }
  .doc-titulo { text-align: right; }
  .doc-titulo h2 { font-size: 28px; color: #1f2937; letter-spacing: 1px; }
  .doc-titulo .folio { font-size: 14px; color: #2e9e9b; font-weight: 600; margin-top: 4px; }
  .doc-titulo .fecha { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .cliente-box { background: #f3f4f6; border-left: 4px solid #2e9e9b; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; }
  .cliente-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 4px; }
  .cliente-box .valor { font-size: 14px; font-weight: 600; color: #1f2937; }
  .cliente-box .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px; }
  .cliente-box .campo { font-size: 10px; color: #6b7280; }
  .cliente-box .campo strong { display: block; color: #1f2937; font-size: 12px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead { background: #2e9e9b; color: white; }
  th { padding: 10px 6px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  th.r { text-align: right; }
  th.c { text-align: center; }
  .totales { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totales-box { width: 280px; }
  .totales-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
  .totales-row.total { border-top: 2px solid #1f2937; margin-top: 6px; padding-top: 8px; font-size: 18px; font-weight: 700; color: #2e9e9b; }
  .notas { background: #fef9c3; border-left: 4px solid #eab308; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; font-size: 12px; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 10px; color: #9ca3af; }
  .vence { background: #ecfdf5; border: 1px solid #6ee7b7; padding: 8px 14px; border-radius: 4px; margin-bottom: 16px; font-size: 12px; color: #047857; }
  .estado { display: inline-block; padding: 4px 10px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="empresa-info">
      <h1>${escapeHtml(empresa.nombre)}</h1>
      ${empresa.rfc ? `<p><strong>RFC:</strong> ${escapeHtml(empresa.rfc)}</p>` : ''}
      ${empresa.direccion ? `<p>${escapeHtml(empresa.direccion)}</p>` : ''}
      ${empresa.telefono ? `<p><strong>Tel:</strong> ${escapeHtml(empresa.telefono)}</p>` : ''}
      ${empresa.email ? `<p>${escapeHtml(empresa.email)}</p>` : ''}
    </div>
    ${data.logoUrl ? `<img class="logo" src="${escapeHtml(data.logoUrl)}" alt="logo" />` : ''}
    <div class="doc-titulo">
      <h2>COTIZACIÓN</h2>
      <div class="folio">Folio: ${escapeHtml(data.folio)}</div>
      <div class="fecha">${escapeHtml(fechaStr)} · ${escapeHtml(horaStr)}</div>
      <div class="fecha" style="margin-top:6px;"><span class="estado">Pendiente</span></div>
    </div>
  </div>

  <div class="cliente-box">
    <h3>Información del cliente</h3>
    <div class="valor">${escapeHtml(data.cliente) || 'Público General'}</div>
    <div class="grid">
      <div class="campo"><strong>${escapeHtml(data.vendedor || '—')}</strong>Vendedor</div>
      <div class="campo"><strong>${escapeHtml(data.sucursal || '—')}</strong>Sucursal</div>
      <div class="campo"><strong>${data.items.length}</strong>Productos</div>
    </div>
  </div>

  ${venceStr ? `<div class="vence">📅 Esta cotización es válida hasta el <strong>${escapeHtml(venceStr)}</strong>.</div>` : ''}

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th class="c">Cant.</th>
        <th class="r">P. Unitario</th>
        <th class="r">Subtotal</th>
        <th class="r">Importe</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totales">
    <div class="totales-box">
      <div class="totales-row"><span>Subtotal:</span><span>${fmt(data.subtotal)}</span></div>
      ${data.descuento > 0 ? `
        <div class="totales-row"><span>Descuento${data.descuentoMotivo ? ` (${escapeHtml(data.descuentoMotivo)})` : ''}:</span><span>-${fmt(data.descuento)}</span></div>
      ` : ''}
      <div class="totales-row total"><span>TOTAL:</span><span>${fmt(data.total)}</span></div>
    </div>
  </div>

  ${data.notas ? `<div class="notas"><strong>Notas:</strong> ${escapeHtml(data.notas)}</div>` : ''}

  <div class="footer">
    <p>Este documento es una cotización y no representa una venta realizada.</p>
    <p>Para confirmar, solicite al vendedor la conversión a venta.</p>
    <p style="margin-top:6px;">${escapeHtml(empresa.nombre)} · Generado el ${escapeHtml(fechaStr)} a las ${escapeHtml(horaStr)}</p>
  </div>

  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="padding:10px 24px;background:#2e9e9b;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;">Imprimir / Guardar como PDF</button>
  </div>
</body>
</html>`;
  };

  const descargarPdf = (data: CotizacionPdfData) => {
    const html = sanitizePrintHtml(buildHtml(data));
    const win = window.open('', '_blank', 'width=900,height=1100');
    if (!win) { sileo.info({ title: 'Permite las ventanas emergentes para descargar el PDF.' }); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); };
  };

  return { buildHtml, descargarPdf };
}

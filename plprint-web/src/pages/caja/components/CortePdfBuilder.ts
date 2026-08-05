import { useConfigStore } from '@/store/configStore';
import { useMoney } from '@/hooks/useMoney';
import type { CorteCaja, MovimientoCaja, ResumenCaja, MaquinaReporteItem, CategoriaImpresionReporteItem } from '@/api/caja.api';
import { sileo } from 'sileo';
import { escapeHtml } from '@/utils/escapeHtml';
import { sanitizePrintHtml } from '@/utils/sanitizePrintHtml';

const CORTE_DATE_FMT = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
const CORTE_TIME_FMT = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit', minute: '2-digit', hour12: false,
});

export interface CortePdfData {
  corte: CorteCaja;
  movimientos: MovimientoCaja[];
  resumen: ResumenCaja;
  reporteMaquinas?: MaquinaReporteItem[];
  reporteCategoriasImpresion?: CategoriaImpresionReporteItem[];
}

export function useCortePdfBuilder() {
  const config = useConfigStore();
  const { simbolo, decimales } = useMoney();

  const buildHtml = (data: CortePdfData): string => {
    const { corte, movimientos, resumen } = data;

    const empresa = {
      nombre: config.getStr('empresa_nombre') || 'PLPrint',
      rfc: config.getStr('empresa_rfc'),
      direccion: config.getStr('empresa_direccion'),
      telefono: config.getStr('empresa_telefono'),
      email: config.getStr('empresa_email'),
    };
    
    //const ticketMensaje = config.getStr('ticket_mensaje_pie') || 'Gracias por su preferencia';

    const fmt = (n: number) => `${simbolo}${(n || 0).toFixed(decimales)}`;
    const fmtDate = (d: string | null) => d ? CORTE_DATE_FMT.format(new Date(d)) : '—';
    const fmtTime = (d: string) => CORTE_TIME_FMT.format(new Date(d));

    const montoInicial = Number(corte.monto_inicial);
    const efectivoEsperado = montoInicial + resumen.total_efectivo_ventas + resumen.total_ingresos + resumen.total_abonos_efectivo - resumen.total_gastos - resumen.total_retiros;
    const montoReal = corte.monto_final_real ? Number(corte.monto_final_real) : null;
    const diferencia = corte.diferencia ? Number(corte.diferencia) : 0;

    const movimientoRows = movimientos.map((m) => {
      const montoDisplay = m.signo > 0 ? `+${fmt(m.monto)}` : `-${fmt(m.monto)}`;
      const colorClass = m.signo > 0 ? 'color:#059669;' : 'color:#dc2626;';
      return `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;">${fmtTime(m.fecha)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;">${escapeHtml(m.tipo_display)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;">${escapeHtml(m.concepto || '—')}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;">${escapeHtml(m.usuario || '—')}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;text-align:right;${colorClass}font-weight:600;">${montoDisplay}</td>
        </tr>`;
    }).join('');

    const metodoRows = resumen.ventas_por_metodo_pago.map((v) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${escapeHtml(v.metodo)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;font-weight:600;">${fmt(v.total)}</td>
      </tr>`).join('');

    const diferenciaColor = diferencia >= 0 ? '#059669' : '#dc2626';
    const diferenciaSigno = diferencia >= 0 ? '+' : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Corte de Caja #${corte.id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1f2937; padding: 24px; max-width: 850px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2e9e9b; padding-bottom: 16px; margin-bottom: 20px; }
  .empresa-info h1 { font-size: 22px; color: #2e9e9b; margin-bottom: 4px; }
  .empresa-info p { font-size: 11px; color: #6b7280; line-height: 1.5; }
  .doc-titulo { text-align: right; }
  .doc-titulo h2 { font-size: 24px; color: #1f2937; letter-spacing: 1px; }
  .doc-titulo .corte-id { font-size: 14px; color: #2e9e9b; font-weight: 600; margin-top: 4px; }
  .doc-titulo .fecha { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .estado-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 6px; }
  .estado-abierta { background: #dcfce7; color: #166534; }
  .estado-cerrada { background: #f3f4f6; color: #4b5563; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .info-card { background: #f9fafb; border-left: 4px solid #2e9e9b; padding: 12px 16px; border-radius: 4px; }
  .info-card h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 6px; }
  .info-card p { font-size: 12px; line-height: 1.6; }
  .info-card strong { color: #1f2937; }
  .section-title { font-size: 14px; font-weight: 700; color: #1f2937; margin: 20px 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead { background: #2e9e9b; color: white; }
  th { padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  th.r { text-align: right; }
  .resumen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .resumen-box { background: #f9fafb; border-radius: 6px; padding: 14px; }
  .resumen-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
  .resumen-row.total { border-top: 2px solid #1f2937; margin-top: 8px; padding-top: 10px; font-size: 14px; font-weight: 700; }
  .resumen-row.total-esperado { color: #2e9e9b; }
  .diferencia-box { background: ${diferencia >= 0 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${diferencia >= 0 ? '#86efac' : '#fca5a5'}; border-radius: 6px; padding: 12px 16px; text-align: center; margin-bottom: 20px; }
  .diferencia-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
  .diferencia-box .valor { font-size: 20px; font-weight: 700; color: ${diferenciaColor}; margin-top: 4px; }
  .observaciones { background: #fef9c3; border-left: 4px solid #eab308; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; font-size: 12px; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 10px; color: #9ca3af; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
    @page { margin: 1.5cm; }
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
    <div class="doc-titulo">
      <h2>CORTE DE CAJA</h2>
      <div class="corte-id">Corte #${corte.id}</div>
      <div class="fecha">${fmtDate(corte.fecha_apertura)}</div>
      <div class="estado-badge ${corte.estado === 'abierta' ? 'estado-abierta' : 'estado-cerrada'}">${corte.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h3>Apertura</h3>
      <p><strong>${fmtDate(corte.fecha_apertura)}</strong></p>
      <p>Por: ${escapeHtml(corte.usuario_apertura?.nombre || '—')}</p>
      <p>Monto inicial: <strong>${fmt(montoInicial)}</strong></p>
    </div>
    <div class="info-card">
      <h3>Cierre</h3>
      <p><strong>${fmtDate(corte.fecha_cierre)}</strong></p>
      <p>Por: ${escapeHtml(corte.usuario_cierre?.nombre || '—')}</p>
      <p>Monto final: <strong>${montoReal !== null ? fmt(montoReal) : '—'}</strong></p>
    </div>
  </div>

  <h3 class="section-title">Resumen Financiero</h3>
  <div class="resumen-grid">
    <div class="resumen-box">
      <div class="resumen-row"><span>Monto inicial:</span><span>${fmt(montoInicial)}</span></div>
      <div class="resumen-row" style="color:#059669;"><span>Ventas en efectivo:</span><span>+${fmt(resumen.total_efectivo_ventas)}</span></div>
      <div class="resumen-row" style="color:#059669;"><span>Ingresos:</span><span>+${fmt(resumen.total_ingresos)}</span></div>
      <div class="resumen-row" style="color:#2563eb;"><span>Abonos en efectivo:</span><span>+${fmt(resumen.total_abonos_efectivo)}</span></div>
      <div class="resumen-row" style="color:#dc2626;"><span>Gastos:</span><span>-${fmt(resumen.total_gastos)}</span></div>
      <div class="resumen-row" style="color:#ea580c;"><span>Retiros:</span><span>-${fmt(resumen.total_retiros)}</span></div>
      <div class="resumen-row total total-esperado"><span>Efectivo esperado:</span><span>${fmt(efectivoEsperado)}</span></div>
    </div>
    <div class="resumen-box">
      <div class="resumen-row"><span>Total ventas:</span><span>${fmt(resumen.total_ventas)}</span></div>
      <div class="resumen-row"><span>Total ingresos:</span><span>${fmt(resumen.total_ingresos)}</span></div>
      <div class="resumen-row"><span>Total gastos:</span><span>${fmt(resumen.total_gastos)}</span></div>
      <div class="resumen-row"><span>Total retiros:</span><span>${fmt(resumen.total_retiros)}</span></div>
      <div class="resumen-row total"><span>Efectivo real:</span><span>${montoReal !== null ? fmt(montoReal) : '—'}</span></div>
    </div>
  </div>

  ${diferencia !== 0 || montoReal !== null ? `
  <div class="diferencia-box">
    <div class="label">Diferencia</div>
    <div class="valor">${diferenciaSigno}${fmt(diferencia)}</div>
  </div>` : ''}

  ${resumen.ventas_por_metodo_pago.length > 0 ? `
  <h3 class="section-title">Ventas por Método de Pago</h3>
  <table>
    <thead>
      <tr>
        <th>Método de Pago</th>
        <th class="r">Total</th>
      </tr>
    </thead>
    <tbody>${metodoRows}</tbody>
  </table>` : ''}

  ${data.reporteMaquinas && data.reporteMaquinas.length > 0 ? `
  <h3 class="section-title">Reporte de Máquinas</h3>
  <table>
    <thead>
      <tr>
        <th>Máquina</th>
        <th>Tipo</th>
        <th class="r">Contador Inicial</th>
        <th class="r">Contador Final</th>
      </tr>
    </thead>
    <tbody>${data.reporteMaquinas.map((m) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${escapeHtml(m.nombre)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${escapeHtml(m.tipo)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${m.contador_inicial}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;font-weight:600;">${m.contador_final}</td>
      </tr>
    `).join('')}</tbody>
  </table>` : ''}

  ${data.reporteCategoriasImpresion && data.reporteCategoriasImpresion.length > 0 ? `
  <h3 class="section-title">Categorías de Impresión</h3>
  <table>
    <thead>
      <tr>
        <th>Categoría</th>
        <th class="r">Conteo Inicial</th>
        <th class="r">Conteo Final</th>
      </tr>
    </thead>
    <tbody>${data.reporteCategoriasImpresion.map((c) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${escapeHtml(c.nombre)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${c.conteo_inicial}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;font-weight:600;">${c.conteo_final}</td>
      </tr>
    `).join('')}</tbody>
  </table>` : ''}

  ${movimientos.length > 0 ? `
  <h3 class="section-title">Detalle de Movimientos (${movimientos.length})</h3>
  <table>
    <thead>
      <tr>
        <th>Hora</th>
        <th>Tipo</th>
        <th>Concepto</th>
        <th>Usuario</th>
        <th class="r">Monto</th>
      </tr>
    </thead>
    <tbody>${movimientoRows}</tbody>
  </table>` : ''}

  ${corte.observaciones ? `
  <div class="observaciones"><strong>Observaciones:</strong> ${escapeHtml(corte.observaciones)}</div>` : ''}

  <div class="footer">
    <p style="margin-top:6px;">${escapeHtml(empresa.nombre)} · Sucursal: ${escapeHtml(corte.sucursales?.nombre || '—')}</p>
  </div>

  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="padding:10px 24px;background:#2e9e9b;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;">Imprimir / Guardar como PDF</button>
  </div>
</body>
</html>`;
  };

  const descargarPdf = (data: CortePdfData) => {
    const html = sanitizePrintHtml(buildHtml(data));
    const win = window.open('', '_blank', 'width=900,height=1100');
    if (!win) { sileo.info({ title: 'Permite las ventanas emergentes para descargar el PDF.' }); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      const btn = win.document.querySelector('.no-print button');
      if (btn) btn.addEventListener('click', () => win.print());
      win.focus();
      win.print();
    };
  };

  const buildTicketHtml = (data: CortePdfData): string => {
    const { corte, movimientos, resumen } = data;
    const empresa = {
      nombre: config.getStr('empresa_nombre') || 'PLPrint',
      ticketMensaje: config.getStr('ticket_mensaje_pie') || 'Gracias por su preferencia',
    };
    const fmt = (n: number) => `${simbolo}${(n || 0).toFixed(decimales)}`;
    const fechaFmt = new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    });
    const horaFmt = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fmtDate = (d: string | null) => d ? fechaFmt.format(new Date(d)) : '—';
    const fmtTime = (d: string) => horaFmt.format(new Date(d));

    const montoInicial = Number(corte.monto_inicial);
    const efectivoEsperado =
      montoInicial + resumen.total_efectivo_ventas + resumen.total_ingresos +
      resumen.total_abonos_efectivo - resumen.total_gastos - resumen.total_retiros;
    const montoReal = corte.monto_final_real ? Number(corte.monto_final_real) : null;
    const diferencia = corte.diferencia ? Number(corte.diferencia) : 0;

    const movimientoLines = movimientos.map((m) => {
      const signo = m.signo > 0 ? '+' : '-';
      const color = m.signo > 0 ? '#059669' : '#dc2626';
      return `<div style="display:flex;justify-content:space-between;gap:4px;line-height:1.5;">
        <span>${fmtTime(m.fecha)} ${escapeHtml(m.tipo_display)}</span>
        <span style="color:${color};font-weight:600;">${signo}${fmt(m.monto)}</span>
      </div>`;
    }).join('');

    const metodoLines = resumen.ventas_por_metodo_pago.map((v) =>
      `<div style="display:flex;justify-content:space-between;gap:4px;line-height:1.5;">
        <span>${escapeHtml(v.metodo)}</span><span>${fmt(v.total)}</span>
      </div>`,
    ).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Corte de Caja #${corte.id}</title>
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
    .title { font-size: 14px; font-weight: bold; letter-spacing: 2px; margin: 6px 0 2px; }
    .subtitle { font-size: 10px; color: #555; }
    .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .divider-solid { border: none; border-top: 1px solid #000; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; gap: 4px; line-height: 1.5; }
    .section-title { font-weight: bold; text-align: center; margin: 4px 0; }
    .total-final { font-size: 13px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
    .diff-pos { color: #059669; }
    .diff-neg { color: #dc2626; }
    .footer { text-align: center; margin-top: 8px; font-size: 10px; color: #555; }
    .no-print { text-align: center; margin-top: 12px; }
    .no-print button {
      padding: 10px 24px; background: #2e9e9b; color: white;
      border: none; border-radius: 6px; font-weight: 600;
      cursor: pointer; font-size: 14px; font-family: sans-serif;
    }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">${escapeHtml(empresa.nombre)}</div>
    <div class="subtitle">CORTE DE CAJA</div>
    <div class="subtitle">${escapeHtml(corte.sucursales?.nombre || '—')}</div>
  </div>

  <hr class="divider" />
  <div class="row"><strong>CORTE #${String(corte.id).padStart(6, '0')}</strong></div>
  <div>Apertura: ${fmtDate(corte.fecha_apertura)}</div>
  <div>Cierre: ${fmtDate(corte.fecha_cierre)}</div>
  <div>Abrió: ${escapeHtml(corte.usuario_apertura?.nombre || '—')}</div>
  ${corte.usuario_cierre ? `<div>Cerró: ${escapeHtml(corte.usuario_cierre.nombre)}</div>` : ''}

  <hr class="divider" />
  <div class="section-title">RESUMEN</div>
  <div class="row"><span>Monto inicial:</span><span>${fmt(montoInicial)}</span></div>
  <div class="row"><span>Ventas efvo.:</span><span style="color:#059669;">+${fmt(resumen.total_efectivo_ventas)}</span></div>
  <div class="row"><span>Ingresos:</span><span style="color:#059669;">+${fmt(resumen.total_ingresos)}</span></div>
  <div class="row"><span>Abonos efvo.:</span><span style="color:#2563eb;">+${fmt(resumen.total_abonos_efectivo)}</span></div>
  <div class="row"><span>Gastos:</span><span style="color:#dc2626;">-${fmt(resumen.total_gastos)}</span></div>
  <div class="row"><span>Retiros:</span><span style="color:#ea580c;">-${fmt(resumen.total_retiros)}</span></div>
  <hr class="divider-solid" />
  <div class="row total-final"><span>ESPERADO:</span><span>${fmt(efectivoEsperado)}</span></div>
  <div class="row"><span>Real:</span><span>${montoReal !== null ? fmt(montoReal) : '—'}</span></div>
  <div class="row ${diferencia >= 0 ? 'diff-pos' : 'diff-neg'}">
    <span>DIF:</span><span><strong>${diferencia >= 0 ? '+' : ''}${fmt(diferencia)}</strong></span>
  </div>

  ${resumen.ventas_por_metodo_pago.length > 0 ? `
    <hr class="divider" />
    <div class="section-title">VENTAS POR MÉTODO</div>
    ${metodoLines}
  ` : ''}

  ${movimientos.length > 0 ? `
    <hr class="divider" />
    <div class="section-title">MOVIMIENTOS (${movimientos.length})</div>
    ${movimientoLines}
  ` : ''}

  ${corte.observaciones ? `
    <hr class="divider" />
    <div><strong>Notas:</strong> ${escapeHtml(corte.observaciones)}</div>
  ` : ''}

  <hr class="divider" />
  <div class="footer">${escapeHtml(empresa.ticketMensaje)}</div>

  <div class="no-print">
    <button type="button" onclick="window.print()">Imprimir / Guardar como PDF</button>
  </div>
</body>
</html>`;
  };

  const imprimirTicket = (data: CortePdfData) => {
    const html = sanitizePrintHtml(buildTicketHtml(data));
    const win = window.open('', '_blank', 'width=400,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => {
        const btn = win.document.querySelector('.no-print button');
        if (btn) btn.addEventListener('click', () => win.print());
        win.focus();
        win.print();
      };
    } else {
      sileo.info({ title: 'Permite las ventanas emergentes para imprimir.' });
    }
  };

  return { buildHtml, descargarPdf, buildTicketHtml, imprimirTicket };
}

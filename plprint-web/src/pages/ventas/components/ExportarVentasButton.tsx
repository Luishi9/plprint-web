import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Venta } from '@/types/venta.types';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import * as XLSX from 'xlsx';
import { sileo } from 'sileo';

interface Props {
  ventas: Venta[];
  desde?: string;
  hasta?: string;
}

export default function ExportarVentasButton({ ventas, desde, hasta }: Props) {
  const [open, setOpen] = useState(false);
  const { getLabel: getMetodoLabel } = useMetodosPago();
  const { format: money } = useMoney();

  const fechaStr = desde && hasta
    ? `${desde}_a_${hasta}`
    : new Date().toISOString().split('T')[0];

  const exportExcel = () => {
    const rows: Record<string, unknown>[] = [];
    for (const v of ventas) {
      for (const d of v.venta_detalle) {
        rows.push({
          Fecha: new Date(v.created_at).toLocaleDateString('es-MX'),
          Folio: v.folio || `#${v.id}`,
          '#Venta': v.id,
          Cliente: v.clientes?.nombre || 'Público General',
          Vendedor: v.usuarios?.nombre || '—',
          Producto: d.productos?.nombre || `Producto #${d.id}`,
          Cantidad: d.cantidad,
          'Precio Unitario': Number(d.precio_unitario),
          Subtotal: Number(d.subtotal),
          Descuento: Number(v.descuento),
          'Total Venta': Number(v.total),
          'Método Pago': getMetodoLabel(v.metodo_pago),
          'Estado Pago': v.estado_pago || 'pagada',
          Abonado: v.ventas_abonos
            ? v.ventas_abonos.reduce((acc, a) => acc + Number(a.monto), 0)
            : 0,
          Saldo: Number(v.saldo_pendiente || 0),
          Estado: v.estado === 'cancelada' ? 'Cancelada' : 'Completada',
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wscols = [
      { wch: 12 }, { wch: 18 }, { wch: 8 }, { wch: 20 },
      { wch: 18 }, { wch: 30 }, { wch: 8 }, { wch: 14 },
      { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 16 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, `historial-ventas-${fechaStr}.xlsx`);
    setOpen(false);
  };

  const exportPdf = () => {
    const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    const totalAbonos = ventas.reduce(
      (acc, v) =>
        acc + (v.ventas_abonos || []).reduce((s, a) => s + Number(a.monto), 0),
      0,
    );
    const totalSaldo = ventas.reduce((acc, v) => acc + Number(v.saldo_pendiente || 0), 0);

    const rows = ventas
      .map(
        (v) => `
      <tr>
        <td style="padding:4px 6px;border:1px solid #ddd;">${v.folio || `#${v.id}`}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;">${new Date(v.created_at).toLocaleDateString('es-MX')}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;">${v.clientes?.nombre || 'Público General'}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;">${v.usuarios?.nombre || '—'}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;text-align:right;">${money(Number(v.total))}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;text-align:center;">${getMetodoLabel(v.metodo_pago)}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;text-align:center;">${v.estado_pago || 'pagada'}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;text-align:right;">${money(totalAbonos)}</td>
        <td style="padding:4px 6px;border:1px solid #ddd;text-align:right;">${money(totalSaldo)}</td>
      </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Historial de Ventas</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; padding: 20px; color: #1f2937; font-size: 12px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header h1 { font-size: 20px; color: #2e9e9b; margin-bottom: 4px; }
  .header p { color: #6b7280; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #2e9e9b; color: white; padding: 6px; font-size: 10px; text-align: left; border: 1px solid #2e9e9b; }
  td { padding: 4px 6px; border: 1px solid #ddd; }
  tr:nth-child(even) { background: #f9fafb; }
  .totales { margin-top: 16px; display: flex; justify-content: space-between; font-weight: bold; }
  .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #9ca3af; }
  @media print { body { padding: 10px; } }
</style></head><body>
  <div class="header">
    <h1>Historial de Ventas</h1>
    <p>${desde && hasta ? `Del ${desde} al ${hasta}` : `Generado el ${new Date().toLocaleDateString('es-MX')}`}</p>
    <p>Total registros: ${ventas.length}</p>
  </div>
  <table>
    <thead><tr>
      <th>Folio</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th>
      <th style="text-align:right;">Total</th><th style="text-align:center;">M. Pago</th>
      <th style="text-align:center;">Estado Pago</th><th style="text-align:right;">Abonado</th>
      <th style="text-align:right;">Saldo</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totales">
    <span>Total ventas: ${money(totalVentas)}</span>
    <span>Total abonado: ${money(totalAbonos)}</span>
    <span>Saldo pendiente: ${money(totalSaldo)}</span>
  </div>
  <div class="footer">PLPrint — Sistema de Punto de Venta</div>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); win.print(); };
    } else {
      sileo.info({ title: 'Permite las ventanas emergentes para imprimir.' });
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={ventas.length === 0}
        className="h-10 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2 text-sm"
      >
        <Icon name="file_download" size={16} />
        Exportar
        <Icon name={open ? 'expand_less' : 'expand_more'} size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl min-w-[140px] overflow-hidden">
            <button
              onClick={exportExcel}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <Icon name="table_chart" size={16} className="text-[#2e9e9b]" />
              Excel (.xlsx)
            </button>
            <button
              onClick={exportPdf}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <Icon name="picture_as_pdf" size={16} className="text-red-400" />
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

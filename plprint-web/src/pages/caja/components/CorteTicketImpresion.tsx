import type { CorteCaja, MovimientoCaja, ResumenCaja } from '@/api/caja.api';
import { useMoney } from '@/hooks/useMoney';
import { useConfigStore } from '@/store/configStore';

interface Props {
  corte: CorteCaja;
  movimientos: MovimientoCaja[];
  resumen: ResumenCaja;
}

export default function CorteTicketImpresion({ corte, movimientos, resumen }: Props) {
  const { format: money } = useMoney();
  const nombreEmpresa = useConfigStore((s) => s.getStr('empresa_nombre')) || 'PLPrint';
  const ticketMensaje = useConfigStore((s) => s.getStr('ticket_mensaje_pie')) || 'Gracias por su preferencia';

  const montoInicial = Number(corte.monto_inicial);
  const efectivoEsperado = montoInicial + resumen.total_efectivo_ventas + resumen.total_ingresos + resumen.total_abonos_efectivo - resumen.total_gastos - resumen.total_retiros;
  const diferencia = corte.diferencia ? Number(corte.diferencia) : 0;

  return (
    <div id="corte-ticket" className="bg-white text-black p-6 text-xs font-mono max-w-[300px] mx-auto">
      <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
        <h2 className="text-lg font-bold">{nombreEmpresa}</h2>
        <p className="text-gray-500">Corte de Caja</p>
      </div>

      <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
        <p>Apertura: {new Date(corte.fecha_apertura).toLocaleString('es-MX')}</p>
        <p>Cierre: {corte.fecha_cierre ? new Date(corte.fecha_cierre).toLocaleString('es-MX') : '—'}</p>
        <p>Abrió: {corte.usuario_apertura?.nombre || '—'}</p>
        {corte.usuario_cierre && <p>Cerró: {corte.usuario_cierre.nombre}</p>}
        <p>Sucursal: {corte.sucursales?.nombre || '—'}</p>
      </div>

      <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
        <p className="font-bold mb-1">RESUMEN</p>
        <p>Ventas: {money(resumen.total_ventas)}</p>
        <p>Ingresos: +{money(resumen.total_ingresos)}</p>
        <p>Gastos: -{money(resumen.total_gastos)}</p>
        <p>Retiros: -{money(resumen.total_retiros)}</p>
        <p className="font-bold mt-1">Esperado: {money(efectivoEsperado)}</p>
        <p>Real: {corte.monto_final_real ? money(Number(corte.monto_final_real)) : '—'}</p>
        <p className={`font-bold ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Diferencia: {diferencia >= 0 ? '+' : ''}{money(diferencia)}
        </p>
      </div>

      {movimientos.length > 0 && (
        <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
          <p className="font-bold mb-1">MOVIMIENTOS</p>
          {movimientos.map((m, i) => (
            <p key={`${m.referencia_tipo}-${m.referencia_id}-${m.fecha}-${i}`} className="truncate">
              {new Date(m.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} | {m.tipo_display} | {m.signo > 0 ? '+' : '-'}{money(m.monto)}
            </p>
          ))}
        </div>
      )}

      <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
        <p className="font-bold mb-1">VENTAS POR MÉTODO DE PAGO</p>
        {resumen.ventas_por_metodo_pago.map((v) => (
          <p key={v.metodo}>{v.metodo}: {money(v.total)}</p>
        ))}
      </div>

      {corte.observaciones && (
        <p className="text-gray-600 mb-2">Notas: {corte.observaciones}</p>
      )}

      <div className="text-center pt-2">
        <p className="text-gray-500">{ticketMensaje}</p>
      </div>
    </div>
  );
}

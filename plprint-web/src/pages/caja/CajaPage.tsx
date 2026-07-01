import { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';

import { cajaApi, CorteCaja, MovimientoCaja, ResumenCaja } from '@/api/caja.api';
import { usuariosApi } from '@/api/usuarios.api';
import { sucursalesApi } from '@/api/sucursales.api';
import { useAuthStore } from '@/store/authStore';
import { useSucursalStore } from '@/store/sucursalStore';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';

import ResumenCards from './components/ResumenCards';
import FiltrosBar from './components/FiltrosBar';
import MovimientosTable from './components/MovimientosTable';
import AperturaModal from './components/AperturaModal';
import CorteModal from './components/CorteModal';
import MovimientoModal from './components/MovimientoModal';
import ReimprimirCorteModal from './components/ReimprimirCorteModal';
import { useCortePdfBuilder } from './components/CortePdfBuilder';

export default function CajaPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const { sucursalActiva } = useSucursalStore();
  const sucursalIdDefault = sucursalActiva?.id || usuario?.sucursales?.[0] || 0;
  const { descargarPdf } = useCortePdfBuilder();

  // Estado principal
  const [cajaActual, setCajaActual] = useState<CorteCaja | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [resumen, setResumen] = useState<ResumenCaja | null>(null);
  const [cortesList, setCortesList] = useState<CorteCaja[]>([]);
  const [usuariosList, setUsuariosList] = useState<Array<{ id: number; nombre: string }>>([]);
  const [sucursalesList, setSucursalesList] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Filtros
  const [filtroCorte, setFiltroCorte] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroSucursal, setFiltroSucursal] = useState<number>(sucursalIdDefault);
  const [corteSeleccionado, setCorteSeleccionado] = useState<CorteCaja | null>(null);

  // Modales
  const [aperturaOpen, setAperturaOpen] = useState(false);
  const [corteOpen, setCorteOpen] = useState(false);
  const [movimientoOpen, setMovimientoOpen] = useState(false);
  const [movimientoTipo, setMovimientoTipo] = useState<'ingreso' | 'gasto' | 'retiro'>('gasto');
  const [reimprimirOpen, setReimprimirOpen] = useState(false);

  const fetchEstado = useCallback(async () => {
    try {
      const res = await cajaApi.getEstado(filtroSucursal);
      setCajaActual(res.data.data);
    } catch { /* ignore */ }
  }, [filtroSucursal]);

  const fetchMovimientos = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = {
        page,
        limit,
        sucursalId: filtroSucursal,
      };
      if (filtroUsuario) params.usuarioId = filtroUsuario;
      if (filtroCorte) params.corteId = filtroCorte;

      const res = await cajaApi.getMovimientos(params);
      const meta = res.data?.meta || {};
      setMovimientos(res.data?.data || []);
      setTotal(meta.total || 0);
      setResumen({
        total_ventas: meta.totalVentas || 0,
        total_ingresos: meta.totalIngresos || 0,
        total_gastos: meta.totalGastos || 0,
        total_retiros: meta.totalRetiros || 0,
        total_efectivo_ventas: meta.totalEfectivoVentas || 0,
        total_abonos_efectivo: meta.totalAbonosEfectivo || 0,
        efectivo_esperado: meta.efectivoEsperado || 0,
        monto_inicial: meta.montoInicial || 0,
        ventas_por_metodo_pago: meta.ventasPorMetodoPago || [],
      });
    } catch {
      setMovimientos([]);
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filtroSucursal, filtroUsuario, filtroCorte]);

  const fetchCortes = useCallback(async () => {
    try {
      const res = await cajaApi.getCortes({ sucursalId: filtroSucursal, page: 1, limit: 100 });
      setCortesList(res.data?.data || []);
    } catch { /* ignore */ }
  }, [filtroSucursal]);

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await usuariosApi.getAll({ limit: 100 });
      const data = (res.data as { data: Array<{ id: number; nombre: string }> }).data || [];
      setUsuariosList(data);
    } catch { /* ignore */ }
  }, []);

  const fetchSucursales = useCallback(async () => {
    try {
      const res = await sucursalesApi.getAll();
      setSucursalesList(res.data?.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchEstado(); }, [fetchEstado]);
  useEffect(() => { fetchMovimientos(); }, [fetchMovimientos]);
  useEffect(() => { fetchCortes(); }, [fetchCortes]);
  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);
  useEffect(() => { fetchSucursales(); }, [fetchSucursales]);

  useEffect(() => {
    if (filtroCorte) {
      const found = cortesList.find((c) => c.id === Number(filtroCorte));
      setCorteSeleccionado(found || null);
    } else {
      setCorteSeleccionado(null);
    }
  }, [filtroCorte, cortesList]);

  const handleApertura = async (montoInicial: number) => {
    await cajaApi.aperturar({ sucursal_id: filtroSucursal, monto_inicial: montoInicial });
    await fetchEstado();
    await fetchMovimientos();
  };

  const handleCorte = async (data: { corte_id: number; monto_final_real: number; observaciones?: string }) => {
    await cajaApi.realizarCorte(data);
    try {
      const res = await cajaApi.getCorteReimprimir(data.corte_id);
      const corteData = res.data.data;
      if (corteData) {
        descargarPdf({ corte: corteData.corte, movimientos: corteData.movimientos, resumen: corteData.resumen });
      }
    } catch {
    }
    setCajaActual(null);
    setFiltroCorte('');
    await fetchCortes();
  };

  const handleMovimiento = async (data: { sucursal_id: number; categoria_id: number; concepto: string; monto: number; notas?: string; autorizado_por?: number }) => {
    if (movimientoTipo === 'ingreso') await cajaApi.registrarIngreso(data);
    else if (movimientoTipo === 'gasto') await cajaApi.registrarGasto(data);
    else await cajaApi.registrarRetiro(data);
    await fetchMovimientos();
  };

  const abrirMovimiento = (tipo: 'ingreso' | 'gasto' | 'retiro') => {
    setMovimientoTipo(tipo);
    setMovimientoOpen(true);
  };
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Icon name="account_balance_wallet" size={32} className="text-[#2e9e9b]" />
            Caja
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {cajaActual
              ? `● Abierta desde ${new Date(cajaActual.fecha_apertura).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
              : corteSeleccionado
                ? `Corte #${corteSeleccionado.id} — ${new Date(corteSeleccionado.fecha_apertura).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : '○ Caja cerrada'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {cajaActual && (
            <>
              <Button onClick={() => abrirMovimiento('ingreso')} variant="outline" className="h-10 px-4 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 whitespace-nowrap">
                <Icon name="arrow_outward" size={16} className="mr-2" /> Ingreso
              </Button>
              <Button onClick={() => abrirMovimiento('gasto')} variant="outline" className="h-10 px-4 border-red-500/30 text-red-400 hover:bg-red-500/10 whitespace-nowrap">
                <Icon name="south_east" size={16} className="mr-2" /> Gasto
              </Button>
              <RequirePermission modulo="caja" accion="retiro">
                <Button onClick={() => abrirMovimiento('retiro')} variant="outline" className="h-10 px-4 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 whitespace-nowrap">
                  <Icon name="account_balance" size={16} className="mr-2" /> Retiro
                </Button>
              </RequirePermission>
              <RequirePermission modulo="caja" accion="cerrar">
                <Button onClick={() => setCorteOpen(true)} className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap">
                  <Icon name="account_balance_wallet" size={16} className="mr-2" /> Realizar corte
                </Button>
              </RequirePermission>
            </>
          )}
          {!cajaActual && !corteSeleccionado && (
            <RequirePermission modulo="caja" accion="aperturar">
              <Button onClick={() => setAperturaOpen(true)} className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap">
                <Icon name="add" size={16} className="mr-2" /> Aperturar caja
              </Button>
            </RequirePermission>
          )}
          <RequirePermission modulo="caja" accion="reimprimir">
            <Button onClick={() => setReimprimirOpen(true)} variant="outline" className="h-10 px-4 whitespace-nowrap">
              <Icon name="print" size={16} className="mr-2" /> Reimprimir corte
            </Button>
          </RequirePermission>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <ResumenCards
          resumen={resumen}
          montoInicial={cajaActual ? Number(cajaActual.monto_inicial) : corteSeleccionado ? Number(corteSeleccionado.monto_inicial) : 0}
          montoFinalReal={corteSeleccionado ? Number(corteSeleccionado.monto_final_real || 0) : undefined}
        />
      )}

      {/* Filtros */}
      <FiltrosBar
        cortes={cortesList}
        usuarios={usuariosList}
        sucursales={sucursalesList}
        filtroCorte={filtroCorte}
        filtroUsuario={filtroUsuario}
        filtroSucursal={filtroSucursal}
        onChangeCorte={(v) => { setFiltroCorte(v); setPage(1); }}
        onChangeUsuario={(v) => { setFiltroUsuario(v); setPage(1); }}
        onChangeSucursal={(v) => { setFiltroSucursal(Number(v)); setPage(1); }}
        cajaAbierta={cajaActual !== null}
      />

      {/* Tabla */}
      <MovimientosTable movimientos={movimientos} isLoading={loading} />

      {/* Paginación */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {movimientos.length} de {total}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <span className="font-mono">Página {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modales */}
      <AperturaModal
        open={aperturaOpen}
        onClose={() => setAperturaOpen(false)}
        onConfirm={handleApertura}
      />

      {cajaActual && resumen && (
        <CorteModal
          open={corteOpen}
          onClose={() => setCorteOpen(false)}
          onConfirm={handleCorte}
          corte={cajaActual}
          resumen={resumen}
          sucursalId={filtroSucursal}
        />
      )}

      <MovimientoModal
        open={movimientoOpen}
        onClose={() => setMovimientoOpen(false)}
        onConfirm={handleMovimiento}
        tipo={movimientoTipo}
        sucursalId={filtroSucursal}
      />

      <ReimprimirCorteModal
        open={reimprimirOpen}
        onClose={() => setReimprimirOpen(false)}
        sucursalId={filtroSucursal}
      />
    </div>
  );
}

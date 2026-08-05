import { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { sileo } from 'sileo';

import {
  cajaApi, CorteCaja, MovimientoCaja, ResumenCaja,
  MaquinaReporteItem, CategoriaImpresionReporteItem,
} from '@/api/caja.api';
import { configuracionApi } from '@/api/configuracion.api';
import { usuariosApi } from '@/api/usuarios.api';
import { sucursalesApi } from '@/api/sucursales.api';
import { useAuthStore } from '@/store/authStore';
import { useSucursalStore } from '@/store/sucursalStore';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import ResumenCards from './components/ResumenCards';
import FiltrosBar from './components/FiltrosBar';
import MovimientosTable from './components/MovimientosTable';
import AperturaModal from './components/AperturaModal';
import CorteModal from './components/CorteModal';
import MovimientoModal from './components/MovimientoModal';
import ReimprimirCorteModal from './components/ReimprimirCorteModal';
import { MaquinasCorteModal } from './components/MaquinasCorteModal';
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
  const [recomendacionOpen, setRecomendacionOpen] = useState(false);

  // Modal de reporte de máquinas (post-cierre)
  const [maquinasModalOpen, setMaquinasModalOpen] = useState(false);
  const [reporteMaquinas, setReporteMaquinas] = useState<MaquinaReporteItem[]>([]);
  const [reporteCategorias, setReporteCategorias] = useState<CategoriaImpresionReporteItem[]>([]);
  const [cortePendiente, setCortePendiente] = useState<{
    corte_id: number;
    monto_final_real: number;
    observaciones?: string;
  } | null>(null);
  const [savingReporte, setSavingReporte] = useState(false);

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

  useEffect(() => {
    if (!loading && !cajaActual && !corteSeleccionado && movimientos.length > 0) {
      setRecomendacionOpen(true);
    }
  }, [loading, cajaActual, corteSeleccionado, movimientos.length]);

  useEffect(() => {
    setRecomendacionOpen(false);
  }, [filtroSucursal]);

  const handleApertura = async (montoInicial: number) => {
    await cajaApi.aperturar({ sucursal_id: filtroSucursal, monto_inicial: montoInicial });
    await fetchEstado();
    await fetchMovimientos();
  };

  const handleCorte = async (data: { corte_id: number; monto_final_real: number; observaciones?: string }) => {
    // Verificar si la sucursal es centro de impresión.
    let esCentroImpresion = false;
    try {
      const configRes = await configuracionApi.getByGrupo('maquinas');
      esCentroImpresion = configRes.data?.data?.somos_centro_impresion === true;
    } catch {
      esCentroImpresion = false;
    }

    if (esCentroImpresion) {
      // Cargar reporte inicial desde backend (snapshot persistido al aperturar).
      try {
        const [repMaquinas, repCategorias] = await Promise.all([
          cajaApi.getCorteReporteMaquinas(data.corte_id),
          cajaApi.getCorteReporteCategoriasImpresion(data.corte_id),
        ]);
        setReporteMaquinas(repMaquinas.data?.data?.maquinas ?? []);
        setReporteCategorias(repCategorias.data?.data?.categorias ?? []);
        setCortePendiente(data);
        setMaquinasModalOpen(true);
        return;
      } catch (e) {
        console.error('Error al cargar reporte de máquinas:', e);
        sileo.error({ title: 'No se pudo cargar el reporte de máquinas. Se cerrará sin el reporte.' });
        // Continuar con el flujo simple.
      }
    }

    // Flujo sin reporte de máquinas (sucursal NO es centro de impresión).
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

  const handleConfirmarReporteMaquinas = async (payload: { maquinasContadores: Array<{ maquinaId: number; contadorFinal: number }> }) => {
    if (!cortePendiente) return;
    try {
      setSavingReporte(true);
      await cajaApi.realizarCorte({
        corte_id: cortePendiente.corte_id,
        monto_final_real: cortePendiente.monto_final_real,
        observaciones: cortePendiente.observaciones,
        maquinasContadores: payload.maquinasContadores,
      });
      const [res, repMaquinasActualizado, repCategoriasActualizado] = await Promise.all([
        cajaApi.getCorteReimprimir(cortePendiente.corte_id),
        cajaApi.getCorteReporteMaquinas(cortePendiente.corte_id),
        cajaApi.getCorteReporteCategoriasImpresion(cortePendiente.corte_id),
      ]);
      const corteData = res.data.data;
      if (corteData) {
        descargarPdf({
          corte: corteData.corte,
          movimientos: corteData.movimientos,
          resumen: corteData.resumen,
          reporteMaquinas: repMaquinasActualizado.data?.data?.maquinas ?? [],
          reporteCategoriasImpresion: repCategoriasActualizado.data?.data?.categorias ?? [],
        });
      }
      setMaquinasModalOpen(false);
      setCortePendiente(null);
      setReporteMaquinas([]);
      setReporteCategorias([]);
      setCajaActual(null);
      setFiltroCorte('');
      await fetchCortes();
      sileo.success({ title: 'Corte realizado correctamente.' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      sileo.error({ title: e.response?.data?.message || 'No se pudo guardar el reporte de máquinas.' });
    } finally {
      setSavingReporte(false);
    }
  };

  const handleCancelarReporteMaquinas = () => {
    setMaquinasModalOpen(false);
    setCortePendiente(null);
    setReporteMaquinas([]);
    setReporteCategorias([]);
    sileo.info({ title: 'Cierre cancelado. La caja sigue abierta.' });
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

      <MaquinasCorteModal
        open={maquinasModalOpen}
        maquinas={reporteMaquinas}
        categorias={reporteCategorias}
        isSaving={savingReporte}
        onClose={handleCancelarReporteMaquinas}
        onConfirm={handleConfirmarReporteMaquinas}
      />

      <Dialog open={recomendacionOpen} onOpenChange={setRecomendacionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="warning" size={20} className="text-amber-400" />
              Caja cerrada
            </DialogTitle>
            <DialogDescription>
              Hay {movimientos.length} movimientos registrados sin un corte de caja activo.
              Te recomendamos aperturar la caja para mantener un mejor control de las ventas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRecomendacionOpen(false)}>
              Continuar sin aperturar
            </Button>
            <Button
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
              onClick={() => {
                setRecomendacionOpen(false);
                setAperturaOpen(true);
              }}
            >
              <Icon name="add" size={16} className="mr-2" />
              Aperturar caja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

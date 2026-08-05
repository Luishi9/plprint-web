import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketData } from './components/TicketImpresion';
import QRTicketModal from './components/QRTicketModal';

import { ventasApi, ProductoConInsumos } from '@/api/ventas.api';
import { usuariosApi } from '@/api/usuarios.api';
import { Venta } from '@/types/venta.types';
import { useSucursalStore } from '@/store/sucursalStore';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import { usePermisos } from '@/hooks/usePermisos';
import { todayLocal } from '@/utils/localDate';
import { sileo } from 'sileo';
import AbonosModal from '@/components/forms/AbonosModal';
import { VentasHeader } from './VentasHeader';
import { VentasTable } from './VentasTable';
import { VentasStats } from './VentasStats';
import { VentaCancelarModal } from './VentaCancelarModal';
import { VentaCancelarInsumosModal } from './VentaCancelarInsumosModal';
import {
  buildTicketData, printTicket, printAbonosTicket,
} from './ticketUtils';

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [qrData, setQrData] = useState<TicketData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'completada' | 'pendiente_pago' | 'cancelada'>('completada');
  const [ventaACancelar, setVentaACancelar] = useState<Venta | null>(null);
  const [productosConInsumos, setProductosConInsumos] = useState<ProductoConInsumos[] | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [ventaAbonos, setVentaAbonos] = useState<Venta | null>(null);
  const [desde, setDesde] = useState(() => todayLocal());
  const [hasta, setHasta] = useState(() => todayLocal());
  const [usuarioId, setUsuarioId] = useState<number | undefined>(undefined);
  const [usuarios, setUsuarios] = useState<{ id: number; nombre: string }[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const { sucursalActiva } = useSucursalStore();
  const { isAdmin } = usePermisos();
  const { src: logoSrc } = useEmpresaLogo();
  const { getLabel: getMetodoLabel } = useMetodosPago();
  const { format: money } = useMoney();
  const navigate = useNavigate();

  function handleReprintTicket(venta: Venta, e: React.MouseEvent) {
    e.stopPropagation();
    printTicket(venta, logoSrc, getMetodoLabel);
  }

  function handleShowQR(venta: Venta, e: React.MouseEvent) {
    e.stopPropagation();
    const subtotal = venta.venta_detalle.reduce(
      (acc, d) => acc + Number(d.precio_unitario) * d.cantidad,
      0,
    );
    setQrData(buildTicketData(venta, subtotal, getMetodoLabel, sucursalActiva?.nombre ?? undefined));
  }

  function handleReprintAbonos(venta: Venta) {
    printAbonosTicket(venta, money as never, getMetodoLabel);
  }

  async function handleCancelarVenta(venta: Venta, e: React.MouseEvent) {
    e.stopPropagation();
    setVentaACancelar(venta);
    setProductosConInsumos(null);
    try {
      const res = await ventasApi.getProductosConInsumos(venta.id);
      const data = (res.data?.data ?? []) as ProductoConInsumos[];
      setProductosConInsumos(data);
    } catch (err) {
      console.error('Error al cargar productos con insumos:', err);
      setProductosConInsumos([]);
    }
  }

  async function confirmarCancelacion() {
    if (!ventaACancelar) return;
    try {
      setIsCanceling(true);
      await ventasApi.cancel(ventaACancelar.id);
      setVentaACancelar(null);
      sileo.success({ title: 'Venta cancelada correctamente.' });
      fetchVentas(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      sileo.error({ title: e.response?.data?.message || 'No se pudo cancelar la venta.' });
    } finally {
      setIsCanceling(false);
    }
  }

  async function confirmarCancelacionConInsumos(payload: {
    insumosDecision: Array<{ productoId: number; accion: 'revertir' | 'merma' }>;
    motivoMerma: string;
  }) {
    if (!ventaACancelar) return;
    try {
      setIsCanceling(true);
      await ventasApi.cancel(ventaACancelar.id, payload);
      setVentaACancelar(null);
      setProductosConInsumos(null);
      sileo.success({ title: 'Venta cancelada correctamente.' });
      fetchVentas(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      sileo.error({ title: e.response?.data?.message || 'No se pudo cancelar la venta.' });
    } finally {
      setIsCanceling(false);
    }
  }

  const fetchVentas = async (isInitial = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    if (isInitial) setIsLoading(true);
    else setIsSearching(true);
    try {
      const params: Record<string, unknown> = {};
      if (sucursalActiva) params.sucursalId = sucursalActiva.id;
      if (filtroEstado === 'cancelada') params.estado = 'cancelada';
      else if (filtroEstado === 'completada') params.estado = 'completada';
      else if (filtroEstado === 'pendiente_pago') {
        params.estadoPago = 'pendiente,parcial';
        params.estado = 'completada';
      }
      if (searchQuery.trim()) params.search = searchQuery.trim();
      params.desde = desde;
      params.hasta = hasta;
      if (usuarioId) params.usuarioId = usuarioId;
      const res = await ventasApi.getAll(params);
      const data: Venta[] = res.data?.data || [];
      setVentas(data);
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') console.error(err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!sucursalActiva) { setIsLoading(false); return; }
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const params: Record<string, unknown> = {};
          if (sucursalActiva) params.sucursalId = sucursalActiva.id;
          if (filtroEstado === 'cancelada') params.estado = 'cancelada';
          else if (filtroEstado === 'completada') params.estado = 'completada';
          else if (filtroEstado === 'pendiente_pago') {
            params.estadoPago = 'pendiente,parcial';
            params.estado = 'completada';
          }
          if (searchQuery.trim()) params.search = searchQuery.trim();
          params.desde = desde;
          params.hasta = hasta;
          if (usuarioId) params.usuarioId = usuarioId;
          const res = await ventasApi.getAll(params);
          if (cancelled) return;
          const data: Venta[] = res.data?.data || [];
          setVentas(data);
        } catch (err: any) {
          if (err?.code !== 'ERR_CANCELED' && !cancelled) console.error(err);
        } finally {
          if (!cancelled) {
            setIsLoading(false);
            setIsSearching(false);
          }
        }
      })();
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [sucursalActiva, filtroEstado, desde, hasta, usuarioId, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    if (isAdmin) {
      usuariosApi.getAll({ limit: 100 }).then((res) => {
        if (cancelled) return;
        const data = res.data?.data || [];
        setUsuarios(data.map((u: { id: number; nombre: string }) => ({ id: u.id, nombre: u.nombre })));
      }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [isAdmin]);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <VentasHeader
        sucursalNombre={sucursalActiva?.nombre}
        isSearching={isSearching}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        desde={desde}
        hasta={hasta}
        onDateChange={(d, h) => { setDesde(d); setHasta(h); }}
        isAdmin={isAdmin}
        usuarios={usuarios}
        usuarioId={usuarioId}
        onUsuarioChange={setUsuarioId}
        ventas={ventas}
        onNueva={() => navigate('/ventas/nueva')}
      />

      {/* STAT CARDS */}
      <VentasStats ventas={ventas} money={money as never} />

      {/* TABLE */}
      <VentasTable
        isLoading={isLoading}
        ventas={ventas}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        money={money as never}
        getMetodoLabel={getMetodoLabel}
        onReprintTicket={handleReprintTicket}
        onShowQR={handleShowQR}
        onAbonos={(venta, e) => { e.stopPropagation(); setVentaAbonos(venta); }}
        onReprintAbonos={handleReprintAbonos}
        onCancelarVenta={handleCancelarVenta}
      />

      <QRTicketModal data={qrData} open={!!qrData} onClose={() => setQrData(null)} />

      <AbonosModal
        open={!!ventaAbonos}
        onOpenChange={(v) => { if (!v) setVentaAbonos(null); }}
        ventaId={ventaAbonos?.id || 0}
        ventaFolio={ventaAbonos?.folio || `#${ventaAbonos?.id || ''}`}
        ventaTotal={Number(ventaAbonos?.total || 0)}
        onAbonoRegistrado={() => fetchVentas(true)}
      />

      {/* MODAL CONFIRMAR CANCELACIÓN — simple si no hay insumos con BOM */}
      {productosConInsumos !== null && productosConInsumos.length === 0 && (
        <VentaCancelarModal
          open={!!ventaACancelar}
          venta={ventaACancelar as never}
          isCanceling={isCanceling}
          money={money as never}
          onClose={() => { setVentaACancelar(null); setProductosConInsumos(null); }}
          onConfirm={confirmarCancelacion}
        />
      )}

      {/* MODAL CONFIRMAR CANCELACIÓN — con decisión de insumos */}
      {productosConInsumos !== null && productosConInsumos.length > 0 && ventaACancelar && (
        <VentaCancelarInsumosModal
          open={!!ventaACancelar}
          venta={ventaACancelar}
          productos={productosConInsumos}
          isCanceling={isCanceling}
          money={money as never}
          onClose={() => { setVentaACancelar(null); setProductosConInsumos(null); }}
          onConfirm={confirmarCancelacionConInsumos}
        />
      )}
    </div>
  );
}


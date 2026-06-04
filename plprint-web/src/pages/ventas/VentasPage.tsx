import { useEffect, useRef, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Plus, Search, Loader2, Receipt,
  ChevronDown, ChevronUp, BadgeCheck, XCircle, Clock, Printer, QrCode, Ban, Check, DollarSign,
} from 'lucide-react';
import { buildTicketHtml, TicketData } from './components/TicketImpresion';
import QRTicketModal from './components/QRTicketModal';

import { ventasApi } from '@/api/ventas.api';
import { Venta } from '@/types/venta.types';
import { useSucursalStore } from '@/store/sucursalStore';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import AbonosModal from '@/components/forms/AbonosModal';

const ESTADO_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  completada: {
    label: 'Completada',
    icon: <BadgeCheck size={12} />,
    cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30',
  },
  cancelada: {
    label: 'Cancelada',
    icon: <XCircle size={12} />,
    cls: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
  pendiente: {
    label: 'Pendiente',
    icon: <Clock size={12} />,
    cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  },
};

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [qrData, setQrData] = useState<TicketData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'completada' | 'cancelada'>('completada');
  const [ventaACancelar, setVentaACancelar] = useState<Venta | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [ventaAbonos, setVentaAbonos] = useState<Venta | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { sucursalActiva } = useSucursalStore();
  const { src: logoSrc } = useEmpresaLogo();
  const { getLabel: getMetodoLabel } = useMetodosPago();
  const { format: money } = useMoney();
  const navigate = useNavigate();

  function handleReprintTicket(venta: Venta, e: React.MouseEvent) {
    e.stopPropagation();
    const subtotal = venta.venta_detalle.reduce(
      (acc, d) => acc + Number(d.precio_unitario) * d.cantidad,
      0,
    );
    const data = buildTicketData(venta, subtotal);
    const html = buildTicketHtml(data, logoSrc);
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  }

  function handleShowQR(venta: Venta, e: React.MouseEvent) {
    e.stopPropagation();
    const subtotal = venta.venta_detalle.reduce(
      (acc, d) => acc + Number(d.precio_unitario) * d.cantidad,
      0,
    );
    setQrData(buildTicketData(venta, subtotal));
  }

  async function handleCancelarVenta(venta: Venta, e: React.MouseEvent) {
    e.stopPropagation();
    setVentaACancelar(venta);
  }

  async function confirmarCancelacion() {
    if (!ventaACancelar) return;
    try {
      setIsCanceling(true);
      await ventasApi.cancel(ventaACancelar.id);
      setVentaACancelar(null);
      fetchVentas(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'No se pudo cancelar la venta.');
    } finally {
      setIsCanceling(false);
    }
  }

  function buildTicketData(venta: Venta, subtotal: number): TicketData {
    return {
      ventaId: venta.id,
      fecha: new Date(venta.created_at),
      sucursal: venta.sucursales?.nombre ?? sucursalActiva?.nombre ?? 'PLPrint',
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

  const fetchVentas = async (isInitial = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    if (isInitial) setIsLoading(true);
    else setIsSearching(true);
    try {
      const params: Record<string, unknown> = {};
      if (sucursalActiva) params.sucursalId = sucursalActiva.id;
      const res = await ventasApi.getAll(params);
      let data: Venta[] = res.data?.data || [];
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        data = data.filter(
          (v) =>
            String(v.id).includes(q) ||
            v.clientes?.nombre?.toLowerCase().includes(q) ||
            v.usuarios?.nombre?.toLowerCase().includes(q),
        );
      }
      if (filtroEstado !== 'todas') {
        data = data.filter((v) => v.estado === filtroEstado);
      }
      setVentas(data);
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') console.error(err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => { fetchVentas(true); }, [sucursalActiva]);

  useEffect(() => {
    const t = setTimeout(() => fetchVentas(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const totales = ventas.reduce(
    (acc, v) => ({
      monto: acc.monto + Number(v.total),
      count: acc.count + 1,
    }),
    { monto: 0, count: 0 },
  );

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ShoppingCart className="text-[#2e9e9b]" size={32} />
            Historial de Ventas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sucursalActiva ? `Sucursal: ${sucursalActiva.nombre}` : 'Todas las sucursales'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          <div className="relative w-full sm:w-64">
            {isSearching
              ? <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-[#2e9e9b] animate-spin" />
              : <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />}
            <Input
              placeholder="Buscar por # o cliente..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <RequirePermission modulo="ventas" accion="crear">
            <Button
              onClick={() => navigate('/ventas/nueva')}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </RequirePermission>
        </motion.div>
      </div>

      {/* FILTRO ESTADO */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground text-xs">Mostrar:</span>
        {[
          { v: 'completada' as const, label: 'Completadas', color: 'bg-[#2e9e9b]' },
          { v: 'cancelada' as const,  label: 'Canceladas',  color: 'bg-red-500' },
          { v: 'todas' as const,      label: 'Todas',      color: 'bg-zinc-500' },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setFiltroEstado(opt.v)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filtroEstado === opt.v
                ? `${opt.color} text-black`
                : 'bg-background border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total ventas', value: totales.count, prefix: '' },
          { label: 'Ingresos', value: money(totales.monto) },
          {
            label: filtroEstado === 'cancelada' ? 'Canceladas' : 'Completadas',
            value: ventas.filter((v) => v.estado === filtroEstado).length,
            prefix: '',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-1"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            <span className="text-2xl font-bold text-[#2e9e9b]">{stat.prefix}{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl border border-border bg-card/50 backdrop-blur-md flex-1 min-h-0 overflow-y-auto overflow-x-auto shadow-2xl transition-opacity duration-200 ${isSearching ? 'opacity-60' : 'opacity-100'}`}
      >
        <div className="relative">
          <table className="w-full text-sm text-left rtl:text-right text-foreground">
            <thead className="text-xs font-medium text-muted-foreground bg-background/50 border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">#</th>
                <th scope="col" className="px-6 py-4 font-semibold">Fecha</th>
                <th scope="col" className="px-6 py-4 font-semibold">Cliente</th>
                <th scope="col" className="px-6 py-4 font-semibold">Vendedor</th>
                <th scope="col" className="px-6 py-4 font-semibold">Método</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Total</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Estado</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2e9e9b]" />
                    <p className="mt-2 text-xs text-muted-foreground">Cargando ventas...</p>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <Receipt size={36} className="mx-auto mb-3 opacity-20" />
                    <p>No se encontraron ventas.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {ventas.map((venta, i) => {
                    const estado = ESTADO_CONFIG[venta.estado] ?? ESTADO_CONFIG.pendiente;
                    const isExpanded = expandedId === venta.id;
                    return (
                      <Fragment key={venta.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="bg-background/30 border-b border-border hover:bg-background/50 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : venta.id)}
                        >
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{venta.id}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(venta.created_at).toLocaleDateString('es-MX', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm">{venta.clientes?.nombre ?? 'Público General'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{venta.usuarios?.nombre ?? '—'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {getMetodoLabel(venta.metodo_pago)}
                          </td>
                          <td className="px-6 py-4 font-bold text-[#2e9e9b] font-mono text-right">
                            {money(Number(venta.total))}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${estado.cls}`}>
                              {estado.icon}
                              {estado.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => handleReprintTicket(venta, e)}
                                className="p-2 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                title="Reimprimir ticket"
                              >
                                <Printer size={16} />
                              </button>
                              <button
                                onClick={(e) => handleShowQR(venta, e)}
                                className="p-2 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                title="QR para cliente"
                              >
                                <QrCode size={16} />
                              </button>
                              {venta.estado === 'completada' && (
                                <RequirePermission modulo="ventas" accion="cancelar">
                                  <button
                                    onClick={(e) => handleCancelarVenta(venta, e)}
                                    className="p-2 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                    title="Cancelar venta"
                                  >
                                    <Ban size={16} />
                                  </button>
                                </RequirePermission>
                              )}
                              {(venta as Venta & { estado_pago?: string; saldo_pendiente?: string | number }).estado_pago &&
                               (venta as Venta & { estado_pago?: string }).estado_pago !== 'pagada' && (
                                <RequirePermission modulo="abonos" accion="ver">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setVentaAbonos(venta); }}
                                    className="p-2 rounded hover:bg-[#2e9e9b]/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                    title="Gestionar abonos"
                                  >
                                    <DollarSign size={16} />
                                  </button>
                                </RequirePermission>
                              )}
                              {isExpanded
                                ? <ChevronUp size={16} className="text-muted-foreground" />
                                : <ChevronDown size={16} className="text-muted-foreground" />}
                            </div>
                          </td>
                        </motion.tr>

                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td colSpan={8} className="bg-background/40 p-0 border-b border-border">
                              <div className="px-6 py-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Detalle de productos</p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border text-muted-foreground text-xs">
                                      <th className="text-left py-1 font-normal">Producto</th>
                                      <th className="text-right py-1 font-normal">Cant.</th>
                                      <th className="text-right py-1 font-normal">Precio</th>
                                      <th className="text-right py-1 font-normal">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {venta.venta_detalle.map((d) => (
                                      <tr key={d.id} className="border-b border-border/50 last:border-0">
                                        <td className="py-2">{d.productos?.nombre ?? `Producto #${d.id}`}</td>
                                        <td className="text-right text-muted-foreground">{d.cantidad}</td>
                                        <td className="text-right text-muted-foreground font-mono">
                                          {money(Number(d.precio_unitario))}
                                        </td>
                                        <td className="text-right font-mono text-[#2e9e9b]">
                                          {money(Number(d.subtotal))}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </Fragment>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <QRTicketModal data={qrData} open={!!qrData} onClose={() => setQrData(null)} />

      <AbonosModal
        open={!!ventaAbonos}
        onOpenChange={(v) => { if (!v) setVentaAbonos(null); }}
        ventaId={ventaAbonos?.id || 0}
        ventaFolio={`#${ventaAbonos?.id || ''}`}
        ventaTotal={Number(ventaAbonos?.total || 0)}
        onAbonoRegistrado={() => fetchVentas(true)}
      />

      {/* MODAL CONFIRMAR CANCELACIÓN */}
      <Dialog open={!!ventaACancelar} onOpenChange={(v) => { if (!v) setVentaACancelar(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Ban className="text-red-400" size={20} /> ¿Cancelar venta?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se cancelará la venta <span className="text-white font-semibold">#{ventaACancelar?.id}</span> de{' '}
              <span className="text-white font-semibold">{ventaACancelar?.clientes?.nombre || 'Público General'}</span>{' '}
              por <span className="text-[#2e9e9b] font-mono">{ventaACancelar ? money(Number(ventaACancelar.total)) : ''}</span>.
              Esta acción se registrará en la bitácora.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex justify-end pt-2">
            <Button variant="outline" onClick={() => setVentaACancelar(null)} disabled={isCanceling}>
              Volver
            </Button>
            <Button
              onClick={confirmarCancelacion}
              disabled={isCanceling}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isCanceling ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Sí, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


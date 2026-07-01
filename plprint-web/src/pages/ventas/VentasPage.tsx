import { useEffect, useRef, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { buildTicketHtml, TicketData } from './components/TicketImpresion';
import QRTicketModal from './components/QRTicketModal';
import VentasDateFilter from './components/VentasDateFilter';
import ExportarVentasButton from './components/ExportarVentasButton';

import { ventasApi } from '@/api/ventas.api';
import { usuariosApi } from '@/api/usuarios.api';
import { Venta } from '@/types/venta.types';
import { useSucursalStore } from '@/store/sucursalStore';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { useMoney } from '@/hooks/useMoney';
import { usePermisos } from '@/hooks/usePermisos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequirePermission } from '@/components/RequirePermission';
import { sileo } from 'sileo';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import AbonosModal from '@/components/forms/AbonosModal';

const ESTADO_PAGO_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pagada:    { label: 'Pagada',    icon: <Icon name="verified" size={12} />,   cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30' },
  parcial:   { label: 'Parcial',   icon: <Icon name="schedule" size={12} />,        cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  pendiente: { label: 'Pendiente', icon: <Icon name="error" size={12} />,  cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

const ESTADO_VENTA_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  cancelada: { label: 'Cancelada', icon: <Icon name="cancel" size={12} />, cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [qrData, setQrData] = useState<TicketData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'completada' | 'pendiente_pago' | 'cancelada'>('completada');
  const [ventaACancelar, setVentaACancelar] = useState<Venta | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [ventaAbonos, setVentaAbonos] = useState<Venta | null>(null);
  const [desde, setDesde] = useState(new Date().toISOString().split('T')[0]);
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);
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

  function handleReprintAbonos(venta: Venta) {
    const total = Number(venta.total);
    const abonos = venta.ventas_abonos || [];
    const abonado = abonos.reduce((acc, a) => acc + Number(a.monto), 0);
    const saldo = total - abonado;
    const fecha = new Date(venta.created_at);

    const rows = abonos.map((a) => {
      const f = new Date(a.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
      return `
        <tr>
          <td style="padding:5px 4px;font-size:11px;border-bottom:1px dashed #e5e7eb;">${f}</td>
          <td style="padding:5px 4px;font-size:11px;">${getMetodoLabel(a.metodo_pago)}</td>
          <td style="padding:5px 4px;font-size:11px;color:#6b7280;">${a.usuarios?.nombre || '—'}</td>
          <td style="padding:5px 4px;font-size:11px;text-align:right;color:#2e9e9b;font-weight:600;">+${money(Number(a.monto))}</td>
        </tr>
        ${a.notas ? `<tr><td colspan="4" style="padding:0 4px 6px;font-size:10px;color:#9ca3af;font-style:italic;">&nbsp;&nbsp;${a.notas}</td></tr>` : ''}
      `;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Abonos Venta #${venta.id}</title>
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
    <p>Venta #${venta.id} · ${fecha.toLocaleString('es-MX')}</p>
  </div>
  <div class="info">
    <div><b>Cliente:</b> ${venta.clientes?.nombre || 'Público General'}</div>
    <div><b>Vendedor:</b> ${venta.usuarios?.nombre || '—'}</div>
    <div><b>Sucursal:</b> ${venta.sucursales?.nombre || '—'}</div>
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
    <p>Documento generado el ${new Date().toLocaleString('es-MX')}</p>
    <p style="margin-top:4px;">PLPrint — Sistema de Punto de Venta</p>
  </div>
  <div class="no-print">
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>
</body></html>`;
    const win = window.open('', '_blank', 'width=420,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); };
    } else {
      sileo.info({ title: 'Permite las ventanas emergentes para imprimir.' });
    }
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
      sileo.error({ title: e.response?.data?.message || 'No se pudo cancelar la venta.' });
    } finally {
      setIsCanceling(false);
    }
  }

  function buildTicketData(venta: Venta, subtotal: number): TicketData {
    return {
      ventaId: venta.id,
      folio: venta.folio,
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

  useEffect(() => { fetchVentas(true); }, [sucursalActiva, filtroEstado, desde, hasta, usuarioId]);

  useEffect(() => {
    const t = setTimeout(() => fetchVentas(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (isAdmin) {
      usuariosApi.getAll({ limit: 100 }).then((res) => {
        const data = res.data?.data || [];
        setUsuarios(data.map((u: { id: number; nombre: string }) => ({ id: u.id, nombre: u.nombre })));
      }).catch(() => {});
    }
  }, [isAdmin]);

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
            <Icon name="shopping_cart" size={32} className="text-[#2e9e9b]" />
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
              ? <Icon name="progress_activity" size={16} className="absolute left-2.5 top-2.5 text-[#2e9e9b] animate-spin" />
              : <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />}
            <Input
              placeholder="Buscar por folio, #, cliente, producto..."
              className="pl-9 bg-card border-border h-10 w-full focus-visible:ring-[#2e9e9b]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ExportarVentasButton ventas={ventas} desde={desde} hasta={hasta} />
          <RequirePermission modulo="ventas" accion="crear">
            <Button
              onClick={() => navigate('/ventas/nueva')}
              className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap"
            >
              <Icon name="add" size={16} className="mr-2" />
              Nueva Venta
            </Button>
          </RequirePermission>
        </motion.div>
      </div>

      {/* FILTROS: Mostrar / Fechas / Vendedor */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground text-xs">Mostrar:</label>
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="appearance-none bg-card border border-border rounded-md px-3 py-1.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
              aria-label="Filtrar estado de ventas"
            >
              <option value="completada">Completadas</option>
              <option value="pendiente_pago">Pend. de pago</option>
              <option value="cancelada">Canceladas</option>
              <option value="todas">Todas</option>
            </select>
            <Icon name="expand_more" size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <VentasDateFilter desde={desde} hasta={hasta} onChange={(d, h) => { setDesde(d); setHasta(h); }} />

        {isAdmin && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs">Vendedor:</span>
            <div className="relative">
              <select
                value={usuarioId ?? ''}
                onChange={(e) => setUsuarioId(e.target.value ? Number(e.target.value) : undefined)}
                className="appearance-none bg-card border border-border rounded-md px-3 py-1.5 pr-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
              >
                <option value="">Todos los vendedores</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
              <Icon name="expand_more" size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total ventas', value: totales.count, prefix: '' },
          { label: 'Ingresos cobrados', value: money(ventas.reduce((acc, v) => acc + Number(v.total) - Number(v.saldo_pendiente || 0), 0)) },
          { label: 'Pendiente de cobro', value: money(ventas.reduce((acc, v) => acc + Number(v.saldo_pendiente || 0), 0)), color: 'text-orange-400' },
          {
            label: 'CxC abiertas',
            value: ventas.filter((v) => v.estado_pago && v.estado_pago !== 'pagada').length,
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
            <span className={`text-2xl font-bold ${stat.color || 'text-[#2e9e9b]'}`}>{stat.prefix}{stat.value}</span>
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
                <th scope="col" className="px-4 py-4 font-semibold">#</th>
                <th scope="col" className="px-4 py-4 font-semibold">Fecha</th>
                <th scope="col" className="px-4 py-4 font-semibold">Cliente</th>
                <th scope="col" className="px-4 py-4 font-semibold text-right">Total</th>
                <th scope="col" className="px-4 py-4 font-semibold text-right">Abonado</th>
                <th scope="col" className="px-4 py-4 font-semibold text-right">Saldo</th>
                <th scope="col" className="px-4 py-4 font-semibold text-center">Estado</th>
                <th scope="col" className="px-4 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <Icon name="progress_activity" size={24} className="mx-auto animate-spin text-[#2e9e9b]" />
                    <p className="mt-2 text-xs text-muted-foreground">Cargando ventas...</p>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <Icon name="receipt" size={36} className="mx-auto mb-3 opacity-20" />
                    <p>No se encontraron ventas.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {ventas.map((venta, i) => {
                    const total = Number(venta.total);
                    const saldo = Number(venta.saldo_pendiente || 0);
                    const abonado = total - saldo;
                    const estadoPago = ESTADO_PAGO_CONFIG[venta.estado_pago || 'pagada'];
                    const isCancelada = venta.estado === 'cancelada';
                    const estadoDisplay = isCancelada ? ESTADO_VENTA_CONFIG.cancelada : estadoPago;
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
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs text-muted-foreground">#{venta.id}</span>
                              <span className="font-mono text-[10px] text-[#2e9e9b]">{venta.folio}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(venta.created_at).toLocaleDateString('es-MX', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {venta.clientes?.nombre ?? 'Público General'}
                          </td>
                          <td className="px-4 py-4 font-bold text-[#2e9e9b] font-mono text-right">
                            {money(total)}
                          </td>
                          <td className="px-4 py-4 text-right font-mono text-sm text-[#2e9e9b]">
                            {money(abonado)}
                          </td>
                          <td className={`px-4 py-4 text-right font-mono font-semibold ${saldo > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                            {money(saldo)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoDisplay.cls}`}>
                              {estadoDisplay.icon}
                              {estadoDisplay.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => handleReprintTicket(venta, e)}
                                className="p-2 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                title="Reimprimir ticket"
                              >
                                <Icon name="print" size={16} />
                              </button>
                              <button
                                onClick={(e) => handleShowQR(venta, e)}
                                className="p-2 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                title="QR para cliente"
                              >
                                <Icon name="qr_code" size={16} />
                              </button>
                              {venta.estado_pago && venta.estado_pago !== 'pagada' && (
                                <RequirePermission modulo="abonos" accion="ver">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setVentaAbonos(venta); }}
                                    className="p-2 rounded hover:bg-[#2e9e9b]/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
                                    title="Gestionar abonos"
                                  >
                                    <Icon name="attach_money" size={16} />
                                  </button>
                                </RequirePermission>
                              )}
                              {venta.ventas_abonos && venta.ventas_abonos.length > 0 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReprintAbonos(venta); }}
                                  className="p-2 rounded hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 transition-colors"
                                  title="Imprimir ticket de abonos"
                                >
                                  <Icon name="description" size={16} />
                                </button>
                              )}
                              {venta.estado === 'completada' && !isCancelada && (
                                <RequirePermission modulo="ventas" accion="cancelar">
                                  <button
                                    onClick={(e) => handleCancelarVenta(venta, e)}
                                    className="p-2 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                    title="Cancelar venta"
                                  >
                                    <Icon name="block" size={16} />
                                  </button>
                                </RequirePermission>
                              )}
                              {isExpanded
                                ? <Icon name="expand_less" size={16} className="text-muted-foreground" />
                                : <Icon name="expand_more" size={16} className="text-muted-foreground" />}
                            </div>
                          </td>
                        </motion.tr>

                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td colSpan={8} className="bg-background/40 p-0 border-b border-border">
                              <div className="px-6 py-4 space-y-4">
                                <div>
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

                                {venta.ventas_abonos && venta.ventas_abonos.length > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Historial de abonos</p>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleReprintAbonos(venta); }}
                                        className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                      >
                                        <Icon name="description" size={12} /> Imprimir ticket
                                      </button>
                                    </div>
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-border text-muted-foreground text-xs">
                                          <th className="text-left py-1 font-normal">Fecha</th>
                                          <th className="text-left py-1 font-normal">Método</th>
                                          <th className="text-left py-1 font-normal">Usuario</th>
                                          <th className="text-left py-1 font-normal">Notas</th>
                                          <th className="text-right py-1 font-normal">Monto</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {venta.ventas_abonos.map((a) => (
                                          <tr key={a.id} className="border-b border-border/50 last:border-0">
                                            <td className="py-2 text-muted-foreground text-xs">
                                              {new Date(a.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-2">{getMetodoLabel(a.metodo_pago)}</td>
                                            <td className="py-2 text-muted-foreground text-xs">{a.usuarios?.nombre || '—'}</td>
                                            <td className="py-2 text-muted-foreground text-xs italic">{a.notas || '—'}</td>
                                            <td className="py-2 text-right font-mono text-[#2e9e9b] font-semibold">
                                              +{money(Number(a.monto))}
                                            </td>
                                          </tr>
                                        ))}
                                        <tr className="border-t border-border bg-background/30">
                                          <td colSpan={4} className="py-2 text-right text-xs text-muted-foreground">Total abonado:</td>
                                          <td className="py-2 text-right font-mono font-bold text-[#2e9e9b]">
                                            {money(venta.ventas_abonos.reduce((acc, a) => acc + Number(a.monto), 0))}
                                          </td>
                                        </tr>
                                        <tr className="bg-background/30">
                                          <td colSpan={4} className="py-2 text-right text-xs text-muted-foreground">Saldo pendiente:</td>
                                          <td className="py-2 text-right font-mono font-bold text-orange-400">
                                            {money(Number(venta.saldo_pendiente || 0))}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                )}
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
        ventaFolio={ventaAbonos?.folio || `#${ventaAbonos?.id || ''}`}
        ventaTotal={Number(ventaAbonos?.total || 0)}
        onAbonoRegistrado={() => fetchVentas(true)}
      />

      {/* MODAL CONFIRMAR CANCELACIÓN */}
      <Dialog open={!!ventaACancelar} onOpenChange={(v) => { if (!v) setVentaACancelar(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="block" size={20} className="text-red-400" /> ¿Cancelar venta?
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
              {isCanceling ? <Icon name="progress_activity" size={16} className="animate-spin mr-1" /> : <Icon name="check" size={16} className="mr-1" />}
              Sí, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


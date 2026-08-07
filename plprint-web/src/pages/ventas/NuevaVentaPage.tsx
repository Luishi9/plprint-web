import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

import { useSucursalStore } from '@/store/sucursalStore';
import { useAuthStore } from '@/store/authStore';
import { useIva } from '@/hooks/useIva';
import { useMoney } from '@/hooks/useMoney';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useMetodosPago } from '@/hooks/useMetodosPago';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';
import CotizacionSelectorModal from '@/components/forms/CotizacionSelectorModal';
import { useCotizacionPdfBuilder } from '@/components/forms/CotizacionPdf';
import StockInsuficienteModal from '@/components/forms/StockInsuficienteModal';
import { VentaTotalesPanel } from './VentaTotalesPanel';
import { CotizacionSuccessView } from './CotizacionSuccessView';
import { VentaSuccessView } from './VentaSuccessView';
import { CartPreview } from './CartPreview';
import { ProductosCatalogoPanel } from './ProductosCatalogoPanel';
import { useProductSearch } from './hooks/useProductSearch';
import { useClienteSearch } from './hooks/useClienteSearch';
import { useCart } from './hooks/useCart';
import { useStockValidation } from './hooks/useStockValidation';
import { useVentaSubmit } from './hooks/useVentaSubmit';

export default function NuevaVentaPage() {
  const navigate = useNavigate();
  const { sucursalActiva } = useSucursalStore() as any;
  const { usuario } = useAuthStore();
  const sucursalEfectiva = sucursalActiva ?? usuario?.sucursalesDetalle?.[0] ?? null;

  const { productSearch, setProductSearch, productos, isSearching } = useProductSearch(sucursalActiva?.id);
  const { clienteSearch, setClienteSearch, clientes, showClientes, setShowClientes } = useClienteSearch();

  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [descuentoMotivo, setDescuentoMotivo] = useState('');
  const {
     cart, setCart, qtyInputs, setQtyInputs, subtotal,
     addToCart, updateQty, setQty, removeItem, setMedidas,
     handleQtyInputChange,
   } = useCart();

   const [clienteSeleccionado, setClienteSeleccionado] = useState<{ id: number; nombre: string; telefono?: string } | null>(null);
   const [metodoPago, setMetodoPago] = useState<string>('efectivo');
   const [notas, setNotas] = useState('');
   const [montoRecibido, setMontoRecibido] = useState('');
   const ticketRef = useRef<HTMLDivElement>(null);

   const subtotalConDescuento = Math.max(0, subtotal - descuentoGlobal);
   const { activo: ivaActivo, porcentaje: ivaPorcentaje, calcular: calcularIva } = useIva();
   const { format: money, simbolo: monedaSimbolo, decimales: monedaDecimales } = useMoney();
   const { src: logoSrc } = useEmpresaLogo();
   const { activos: metodosPagoActivos, getLabel: getMetodoLabel, getIcon: getMetodoIcon } = useMetodosPago();
   const cotizacionPdf = useCotizacionPdfBuilder();
   const desgloseIva = calcularIva(subtotalConDescuento);
   const total = desgloseIva.total;

   const {
     stockAlert, setStockAlert,
     validarStockYAgregar, validarStockYActualizarQty,
     handleQtyInputBlur: handleStockQtyBlur,
     continuarConStockAlert,
   } = useStockValidation(sucursalEfectiva, cart, addToCart, updateQty, setQty, setCart);

   const {
     isSubmitting, isSavingCotizacion, successId, cotizacionFolio,
     setSuccessId, setCotizacionFolio, ticketData, setTicketData,
     showQR, setShowQR, cotizacionOrigenId,
     setCotizacionOrigenId, showCotizacionesModal, setShowCotizacionesModal,
     handleSubmit, handleGuardarComoCotizacion, cargarCotizacion: loadCotizacion,
   } = useVentaSubmit({
     cart, sucursalEfectiva, usuario, clienteSeleccionado,
     descuentoGlobal, descuentoMotivo, metodoPago, notas, montoRecibido,
     subtotal, desgloseIva, total, monedaSimbolo, monedaDecimales,
     ivaActivo, ivaPorcentaje, getMetodoLabel,
   }, {
     setCart, setClienteSeleccionado, setDescuentoGlobal, setDescuentoMotivo, setNotas,
   });

   const cargarCotizacion = (cot: any) => loadCotizacion(cot);

  useEffect(() => {
    if (metodosPagoActivos.length === 0) return;
    if (!metodosPagoActivos.some((m) => m.nombre.toLowerCase() === metodoPago.toLowerCase())) {
      setMetodoPago(metodosPagoActivos[0].nombre.toLowerCase());
    }
  }, [metodosPagoActivos, metodoPago]);

  const handleQtyInputBlur = (id: number) => {
    handleStockQtyBlur(id, qtyInputs, setQtyInputs);
  };

  if (cotizacionFolio) {
    const handleDescargarPdf = () => {
      cotizacionPdf.descargarPdf({
        folio: cotizacionFolio,
        fecha: new Date(),
        cliente: clienteSeleccionado?.nombre || 'Público General',
        vendedor: usuario?.nombre || '—',
        sucursal: sucursalEfectiva?.nombre || '—',
        items: cart.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          ancho_m: i.ancho_m || undefined,
          alto_m: i.alto_m || undefined,
          labelUnidad: i.labelUnidad || undefined,
          esMedida: i.esMedida,
          tipoMedida: i.tipoMedida,
        })),
        subtotal,
        descuento: descuentoGlobal,
        descuentoMotivo: descuentoMotivo || undefined,
        total,
        notas: notas || undefined,
        logoUrl: logoSrc,
      });
    };

    return (
      <CotizacionSuccessView
        total={total}
        folio={cotizacionFolio ?? ''}
        money={money as never}
        onNueva={() => {
          setCart([]);
          setClienteSeleccionado(null);
          setDescuentoGlobal(0);
          setDescuentoMotivo('');
          setNotas('');
          setMontoRecibido('');
          setCotizacionFolio(null);
        }}
        onDescargarPdf={handleDescargarPdf}
      />
    );
  }

  if (successId) {
    return (
      <VentaSuccessView
        ventaId={successId}
        total={total}
        ticketData={ticketData}
        showQR={showQR}
        ticketRef={ticketRef as React.RefObject<HTMLDivElement>}
        logoSrc={logoSrc}
        money={money as never}
        setShowQR={setShowQR}
        onNueva={() => {
          setCart([]);
          setSuccessId(null);
          setClienteSeleccionado(null);
          setDescuentoGlobal(0);
          setDescuentoMotivo('');
          setNotas('');
          setTicketData(null);
          setMontoRecibido('');
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ventas')} className="text-muted-foreground hover:text-white">
            <Icon name="arrow_back" size={18} />
          </Button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Icon name="shopping_cart" className="text-[#2e9e9b]" size={24} />
              Nueva Venta
            </h2>
            <p className="text-xs text-muted-foreground">{sucursalEfectiva?.nombre ?? 'Sin sucursal'}</p>
          </div>
        </div>
        <RequirePermission modulo="cotizaciones" accion="ver">
          <Button
            variant="outline"
            onClick={() => setShowCotizacionesModal(true)}
            className="border-[#2e9e9b]/40 text-[#2e9e9b] hover:bg-[#2e9e9b]/10"
          >
            <Icon name="description" size={16} className="mr-2" /> Ver cotizaciones
          </Button>
        </RequirePermission>
      </div>

      {cotizacionOrigenId && (
        <m.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 rounded-md px-3 py-2 text-xs text-[#2e9e9b] flex items-center justify-between"
        >
          <span>
            <Icon name="draw" size={12} className="inline mr-1" />
            Productos cargados desde cotización #{cotizacionOrigenId}. Al confirmar se generará la venta automáticamente.
          </span>
          <button
            type="button"
            onClick={() => setCotizacionOrigenId(null)}
            aria-label="Cerrar aviso de cotización"
            className="text-muted-foreground hover:text-white"
          >
            <Icon name="close" size={14} />
          </button>
        </m.div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 h-[calc(100dvh-12rem)]">

        <div className="flex flex-col gap-3 flex-1 min-w-0 h-full">
          <ProductosCatalogoPanel
            isSearching={isSearching}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            productos={productos}
            money={money as never}
            onAddToCart={(p) => { validarStockYAgregar(p as never); setProductSearch(''); }}
          />
          <CartPreview
            cart={cart}
            qtyInputs={qtyInputs}
            money={money as never}
            onUpdateQty={validarStockYActualizarQty}
            onQtyInputChange={handleQtyInputChange}
            onQtyInputBlur={handleQtyInputBlur}
            onSetMedidas={setMedidas}
            onRemoveItem={removeItem}
          />
        </div>
        <VentaTotalesPanel
          clienteSeleccionado={clienteSeleccionado}
          clienteSearch={clienteSearch}
          clientes={clientes}
          showClientes={showClientes}
          onClienteSearchChange={setClienteSearch}
          onShowClientes={() => setShowClientes(true)}
          onSeleccionarCliente={(c) => {
            setClienteSeleccionado(c);
            setClienteSearch('');
            setShowClientes(false);
          }}
          onClearCliente={() => setClienteSeleccionado(null)}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          metodosPagoActivos={metodosPagoActivos}
          getMetodoIcon={getMetodoIcon as never}
          total={total}
          montoRecibido={montoRecibido}
          setMontoRecibido={setMontoRecibido}
          monedaSimbolo={monedaSimbolo}
          subtotal={subtotal}
          descuentoGlobal={descuentoGlobal}
          setDescuentoGlobal={setDescuentoGlobal}
          descuentoMotivo={descuentoMotivo}
          setDescuentoMotivo={setDescuentoMotivo}
          notas={notas}
          setNotas={setNotas}
          ivaActivo={ivaActivo}
          ivaPorcentaje={ivaPorcentaje}
          desgloseIva={desgloseIva}
          money={money as never}
          cotizacionOrigenId={cotizacionOrigenId}
          cartLength={cart.length}
          isSubmitting={isSubmitting}
          isSavingCotizacion={isSavingCotizacion}
          onSubmit={handleSubmit}
          onGuardarCotizacion={handleGuardarComoCotizacion}
        />
      </div>

      <CotizacionSelectorModal
        open={showCotizacionesModal}
        onOpenChange={setShowCotizacionesModal}
        onSeleccionar={cargarCotizacion}
      />

      {stockAlert && (
        <StockInsuficienteModal
          open={stockAlert.open}
          onOpenChange={(v) => { if (!v) setStockAlert(null); }}
          productoNombre={stockAlert.productoNombre}
          cantidadSolicitada={stockAlert.cantidadSolicitada}
          faltantes={stockAlert.faltantes}
          onCancelar={() => setStockAlert(null)}
          onContinuar={() => continuarConStockAlert(stockAlert.pendingProduct)}
        />
      )}
    </div>
  );
}


import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CotizacionesToolbar } from './CotizacionesToolbar';
import { CotizacionFormModal } from './CotizacionFormModal';
import { CotizacionAccionesModals } from './CotizacionAccionesModals';
import { CotizacionesTable } from './CotizacionesTable';
import { useCotizaciones } from './useCotizaciones';
import { useMoney } from '@/hooks/useMoney';

export default function CotizacionesPage() {
  const { format: money } = useMoney();
  const {
    cotizaciones, isLoading, search, filtroEstado, page, total, limit,
    modalOpen, editando, clienteId, items, descuento, descuentoMotivo, notas,
    isSaving, formError, clientes, productos,
    convertirItem, isConverting, cancelarItem, isCanceling,
    setSearch, setFiltroEstado, setPage, setModalOpen,
    setClienteId, setItems, setDescuento, setDescuentoMotivo, setNotas,
    setConvertirItem, setCancelarItem,
    fetchCotizaciones, abrirCrear, abrirEditar, handleGuardar,
    handleConvertir, handleCancelar, handleDescargarPdf,
  } = useCotizaciones();

  // Resetear página 1 cuando cambian filtros (search/filtroEstado)
  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filtroEstado]);

  // Cargar cotizaciones (debounced 300ms) cuando cambian search/filtroEstado o page
  useEffect(() => {
    const t = setTimeout(() => { fetchCotizaciones({ pageOverride: page }); }, 300);
    return () => clearTimeout(t);
  }, [search, filtroEstado, page, fetchCotizaciones]);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <CotizacionesToolbar
        search={search}
        filtroEstado={filtroEstado}
        onSearchChange={setSearch}
        onFiltroChange={setFiltroEstado}
        onNueva={abrirCrear}
      />

      <CotizacionesTable
        isLoading={isLoading}
        cotizaciones={cotizaciones as never}
        search={search}
        filtroEstado={filtroEstado}
        money={money as never}
        onDescargarPdf={handleDescargarPdf as never}
        onEditar={abrirEditar as never}
        onConvertir={setConvertirItem as never}
        onCancelar={setCancelarItem as never}
      />

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{cotizaciones.length} de {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <span className="font-mono">Pág. {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>Siguiente</Button>
          </div>
        </div>
      )}

      <CotizacionFormModal
        open={modalOpen}
        editando={editando}
        clientes={clientes}
        productos={productos}
        clienteId={clienteId}
        setClienteId={setClienteId}
        descuento={descuento}
        setDescuento={setDescuento}
        descuentoMotivo={descuentoMotivo}
        setDescuentoMotivo={setDescuentoMotivo}
        notas={notas}
        setNotas={setNotas}
        items={items}
        setItems={setItems}
        isSaving={isSaving}
        formError={formError}
        onClose={() => setModalOpen(false)}
        onGuardar={handleGuardar}
      />

      <CotizacionAccionesModals
        convertirItem={convertirItem}
        isConverting={isConverting}
        onCloseConvertir={() => setConvertirItem(null)}
        onConfirmConvertir={handleConvertir}
        cancelarItem={cancelarItem}
        isCanceling={isCanceling}
        onCloseCancelar={() => setCancelarItem(null)}
        onConfirmCancelar={handleCancelar}
      />
    </div>
  );
}

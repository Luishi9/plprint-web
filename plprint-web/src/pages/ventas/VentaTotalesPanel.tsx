import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/RequirePermission';
import type { MetodoPago } from '@/api/metodosPago.api';
import MontoRecibidoInput from '@/components/forms/MontoRecibidoInput';

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
}

interface MetodoIconResolver {
  (metodo: string): string;
}

interface VentaTotalesPanelProps {
  clienteSeleccionado: Cliente | null;
  clienteSearch: string;
  clientes: Cliente[];
  showClientes: boolean;
  onClienteSearchChange: (v: string) => void;
  onShowClientes: () => void;
  onSeleccionarCliente: (c: Cliente) => void;
  onClearCliente: () => void;

  metodoPago: string;
  setMetodoPago: (v: string) => void;
  metodosPagoActivos: MetodoPago[];
  getMetodoIcon: MetodoIconResolver;

  total: number;
  montoRecibido: string;
  setMontoRecibido: (v: string) => void;
  monedaSimbolo: string;

  subtotal: number;
  descuentoGlobal: number;
  setDescuentoGlobal: (v: number) => void;
  descuentoMotivo: string;
  setDescuentoMotivo: (v: string) => void;
  notas: string;
  setNotas: (v: string) => void;

  ivaActivo: boolean;
  ivaPorcentaje: number;
  desgloseIva: { base: number; iva: number };

  money: (v: number | string) => string;

  cotizacionOrigenId: number | null;
  cartLength: number;
  isSubmitting: boolean;
  isSavingCotizacion: boolean;
  onSubmit: () => void;
  onGuardarCotizacion: () => void;
}

export function VentaTotalesPanel(props: VentaTotalesPanelProps) {
  const {
    clienteSeleccionado, clienteSearch, clientes, showClientes,
    onClienteSearchChange, onShowClientes, onSeleccionarCliente, onClearCliente,
    metodoPago, setMetodoPago, metodosPagoActivos, getMetodoIcon,
    total, montoRecibido, setMontoRecibido, monedaSimbolo,
    subtotal, descuentoGlobal, setDescuentoGlobal, descuentoMotivo, setDescuentoMotivo, notas, setNotas,
    ivaActivo, ivaPorcentaje, desgloseIva, money,
    cotizacionOrigenId, cartLength, isSubmitting, isSavingCotizacion, onSubmit, onGuardarCotizacion,
  } = props;

  return (
    <div className="flex flex-col gap-3 w-full lg:w-[380px] shrink-0">
      <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Cliente</p>
        {clienteSeleccionado ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{clienteSeleccionado.nombre}</p>
              {clienteSeleccionado.telefono && <p className="text-xs text-muted-foreground">{clienteSeleccionado.telefono}</p>}
            </div>
            <button type="button" onClick={onClearCliente} className="text-xs text-muted-foreground hover:text-white underline">
              Cambiar
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              placeholder="Público General (buscar cliente...)"
              className="bg-background border-border text-sm focus-visible:ring-[#2e9e9b]"
              value={clienteSearch}
              onChange={(e) => { onClienteSearchChange(e.target.value); onShowClientes(); }}
              onFocus={onShowClientes}
            />
            {showClientes && clientes.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {clientes.map((c) => (
                  <button type="button"
                    key={c.id}
                    onMouseDown={() => onSeleccionarCliente(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 border-b border-border/50 last:border-0"
                  >
                    <p className="font-medium">{c.nombre}</p>
                    {c.telefono && <p className="text-xs text-muted-foreground">{c.telefono}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Método de pago</p>
        {metodosPagoActivos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Cargando métodos de pago…</p>
        ) : (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(metodosPagoActivos.length, 3)}, minmax(0, 1fr))` }}
          >
            {metodosPagoActivos.map((m) => {
              const value = m.nombre.toLowerCase();
              const iconName = getMetodoIcon(value);
              const isActive = metodoPago === value;
              return (
                <button type="button"
                  key={m.id}
                  onClick={() => setMetodoPago(value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${isActive
                    ? 'border-[#2e9e9b] bg-[#2e9e9b]/10 text-[#2e9e9b]'
                    : 'border-border text-muted-foreground hover:border-border/80 hover:bg-white/5'
                    }`}
                >
                  <Icon name={iconName} size={16} />
                  <span className="line-clamp-1 text-center">{m.nombre}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <MontoRecibidoInput
        total={total}
        value={montoRecibido}
        onChange={setMontoRecibido}
        simbolo={monedaSimbolo}
      />

      <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Descuento ($)</p>
            <Input
              type="number"
              min={0}
              value={descuentoGlobal || ''}
              onChange={(e) => {
                const v = Number(e.target.value);
                setDescuentoGlobal(v);
                if (v === 0) setDescuentoMotivo('');
              }}
              placeholder="0.00"
              className="bg-background border-border text-sm font-mono focus-visible:ring-[#2e9e9b]"
            />
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-sm font-mono text-muted-foreground">{money(subtotal)}</span>
          </div>
        </div>

        {descuentoGlobal > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Motivo del descuento <span className="text-red-500">*</span>
            </p>
            <Input
              required
              minLength={3}
              maxLength={255}
              value={descuentoMotivo}
              onChange={(e) => setDescuentoMotivo(e.target.value)}
              placeholder="Ej. Cliente frecuente, promoción, daño..."
              className="bg-background border-border text-sm focus-visible:ring-[#2e9e9b]"
            />
          </div>
        )}

        <Input
          placeholder="Notas (opcional)"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="bg-background border-border text-sm focus-visible:ring-[#2e9e9b]"
        />

        {ivaActivo && ivaPorcentaje > 0 && (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <div className="flex justify-between">
              <span>Base</span>
              <span className="font-mono">{money(desgloseIva.base)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({ivaPorcentaje}%)</span>
              <span className="font-mono">{money(desgloseIva.iva)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-[#2e9e9b]">
            {money(total)}
          </span>
        </div>

        <Button
          disabled={cartLength === 0 || isSubmitting || isSavingCotizacion}
          onClick={onSubmit}
          className="w-full h-12 text-base bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-bold shadow-[0_0_20px_rgba(153,255,61,0.25)] disabled:opacity-40"
        >
          {isSubmitting ? <Icon name="progress_activity" size={18} className="animate-spin" /> : (
            <>
              <Icon name="check" size={18} className="mr-2" />
              {cotizacionOrigenId ? 'Confirmar y Convertir' : 'Confirmar venta'}
            </>
          )}
        </Button>

        <RequirePermission modulo="cotizaciones" accion={cotizacionOrigenId ? 'editar' : 'crear'}>
          <Button
            disabled={cartLength === 0 || isSubmitting || isSavingCotizacion}
            onClick={onGuardarCotizacion}
            variant="outline"
            className="w-full h-11 text-sm border-[#2e9e9b]/40 text-[#2e9e9b] hover:bg-[#2e9e9b]/10 disabled:opacity-40"
          >
            {isSavingCotizacion ? <Icon name="progress_activity" size={16} className="mr-2 animate-spin" /> : (
              <Icon name="draw" size={16} className="mr-2" />
            )}
            {cotizacionOrigenId ? 'Actualizar Cotización' : 'Guardar como Cotización'}
          </Button>
        </RequirePermission>

        {cotizacionOrigenId && (
          <p className="text-[10px] text-center text-muted-foreground">
            Cotización cargada: edita productos y guarda con "Actualizar", o confirma para convertir en venta.
          </p>
        )}
      </div>
    </div>
  );
}

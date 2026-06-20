import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

import { comprasApi } from '@/api/compras.api';
import { insumosApi } from '@/api/insumos.api';
import { proveedoresApi } from '@/api/proveedores.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMoney } from '@/hooks/useMoney';
import { useAuthStore } from '@/store/authStore';
import { useSucursalStore } from '@/store/sucursalStore';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ItemCompra {
  insumo_id: number;
  insumo_nombre: string;
  insumo_unidad: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  proveedor_id: number;
  proveedor_nombre: string;
  notas: string;
}

interface AgregarComprasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function todayStr() {
  const d = new Date();
  return d.getFullYear()
    + '-' + String(d.getMonth() + 1).padStart(2, '0')
    + '-' + String(d.getDate()).padStart(2, '0');
}

export default function AgregarComprasModal({ open, onOpenChange, onSuccess }: AgregarComprasModalProps) {
  const { simbolo, format: money } = useMoney();
  const usuario = useAuthStore((s) => s.usuario);
  const sucursalActual = useSucursalStore((s) => s.sucursalActiva);

  const [insumos, setInsumos] = useState<Array<{ id: number; nombre: string; unidad_medida: string; precio_compra?: number | string | null }>>([]);
  const [proveedores, setProveedores] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [fecha, setFecha] = useState(todayStr());
  const [factura, setFactura] = useState('');

  const [items, setItems] = useState<ItemCompra[]>([]);

  const [insumoSearch, setInsumoSearch] = useState('');
  const [insumoId, setInsumoId] = useState(0);
  const [cantidad, setCantidad] = useState('1');
  const [precioUnitario, setPrecioUnitario] = useState('0');
  const [proveedorId, setProveedorId] = useState(0);
  const [notas, setNotas] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredInsumos = useMemo(
    () => insumos.filter((i) =>
      !insumoSearch || i.nombre.toLowerCase().includes(insumoSearch.toLowerCase())
    ),
    [insumos, insumoSearch],
  );

  const granTotal = useMemo(
    () => items.reduce((acc, it) => acc + it.total, 0),
    [items],
  );

  useEffect(() => {
    if (!open) return;
    setLoadingCatalogos(true);
    setFormError('');
    setFecha(todayStr());
    setFactura('');
    setItems([]);
    setInsumoSearch('');
    setInsumoId(0);
    setCantidad('1');
    setPrecioUnitario('0');
    setProveedorId(0);
    setNotas('');

    Promise.all([
      insumosApi.getAll({ page: 1, limit: 200 }),
      proveedoresApi.getAll({ page: 1, limit: 200 }),
    ])
      .then(([insumosRes, provRes]) => {
        setInsumos((insumosRes.data as { data: typeof insumos }).data || []);
        setProveedores((provRes.data as { data: typeof proveedores }).data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingCatalogos(false));
  }, [open]);

  const resetItemForm = () => {
    setInsumoSearch('');
    setInsumoId(0);
    setCantidad('1');
    setPrecioUnitario('0');
    setProveedorId(0);
    setNotas('');
    searchRef.current?.focus();
  };

  const handleAddItem = () => {
    if (!insumoId) { setFormError('Selecciona un insumo.'); return; }
    const c = Number(cantidad);
    if (!c || c <= 0) { setFormError('La cantidad debe ser mayor a 0.'); return; }
    const p = Number(precioUnitario);
    if (p < 0) { setFormError('El precio no puede ser negativo.'); return; }

    const ins = insumos.find((i) => i.id === insumoId);
    const prov = proveedores.find((pr) => pr.id === proveedorId);
    const item: ItemCompra = {
      insumo_id: insumoId,
      insumo_nombre: ins?.nombre || '',
      insumo_unidad: ins?.unidad_medida || '',
      cantidad: c,
      precio_unitario: p,
      total: Number((c * p).toFixed(2)),
      proveedor_id: proveedorId,
      proveedor_nombre: prov?.nombre || '',
      notas: notas.trim(),
    };
    setItems((prev) => [...prev, item]);
    setFormError('');
    resetItemForm();
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (items.length === 0) { setFormError('Agrega al menos un insumo.'); return; }
    if (!sucursalActual?.id) { setFormError('No hay sucursal seleccionada.'); return; }

    try {
      setIsSaving(true);
      await comprasApi.createBatch({
        items: items.map((it) => ({
          insumo_id: it.insumo_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          ...(it.proveedor_id && { proveedor_id: it.proveedor_id }),
          ...(it.notas && { notas: it.notas }),
        })),
        sucursal_id: sucursalActual.id,
        ...(factura.trim() && { factura: factura.trim() }),
        ...(fecha && { fecha }),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al registrar las compras.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectInsumo = (id: number) => {
    const ins = insumos.find((i) => i.id === id);
    setInsumoId(id);
    setInsumoSearch(ins?.nombre || '');
    setPrecioUnitario(ins?.precio_compra?.toString() || '0');
    setShowDropdown(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-[90vw] min-h-[85vh] overflow-y-auto bg-card border-border flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="shopping_cart" size={20} /> Agregar Compras de Insumos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registra múltiples insumos en un solo lote. Todos se guardarán juntos.
          </DialogDescription>
        </DialogHeader>

        {loadingCatalogos ? (
          <div className="py-16 flex items-center justify-center">
            <Icon name="hourglass_top" size={32} className="animate-spin text-[#2e9e9b]" />
          </div>
        ) : (
          <div className="flex flex-col min-h-0 flex-1">
            {/* HEADER FIELDS: Fecha + Factura */}
            <div className="px-6 pt-4 pb-3 grid grid-cols-3 gap-4 border-b border-border">
              <div>
                <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                  <Icon name="calendar_today" size={14} /> Fecha de compra
                </label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                  <Icon name="receipt" size={14} /> Factura / Ticket 
                </label>
                <Input
                  placeholder="Ej. FACT-001, TICKET-123..."
                  value={factura}
                  onChange={(e) => setFactura(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium block mb-1 text-muted-foreground">Notas</label>
                <Input
                  placeholder="Lote, obs..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="bg-background h-9"
                />
              </div>
            </div>

            {/* ADD ITEM FORM */}
            <div className="px-6 py-3 border-b border-border bg-black/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Agregar insumo al lote
              </p>
              <div className="grid grid-cols-12 gap-2 items-end">
                {/* Insumo search + dropdown */}
                <div className="col-span-5 relative">
                  <label className="text-[14px] font-medium block mb-1 text-muted-foreground">Insumo *</label>
                  <div className="relative">
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Buscar insumo..."
                      value={insumoSearch}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      onChange={(e) => {
                        setInsumoSearch(e.target.value);
                        setInsumoId(0);
                        setShowDropdown(true);
                      }}
                      className="w-full bg-background border border-border rounded-md text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
                    />
                    <Icon
                      name="unfold_more"
                      size={16}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {showDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md max-h-48 overflow-y-auto shadow-lg">
                      {filteredInsumos.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {insumoSearch ? 'Sin resultados' : 'Escribe para buscar...'}
                        </div>
                      ) : (
                        filteredInsumos.map((i) => (
                          <button
                            key={i.id}
                            type="button"
                            onMouseDown={() => selectInsumo(i.id)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between ${i.id === insumoId ? 'bg-accent text-[#2e9e9b]' : 'text-popover-foreground'}`}
                          >
                            <span>{i.nombre}</span>
                            <span className="text-muted-foreground text-[11px]">({i.unidad_medida})</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-[14px] font-medium block mb-1 text-muted-foreground">Cantidad *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="bg-background h-9"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[14px] font-medium block mb-1 text-muted-foreground">P/U ({simbolo}) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    className="bg-background h-9"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[14px] font-medium block mb-1 text-muted-foreground">Proveedor</label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-md text-sm px-3 py-2 h-9"
                  >
                    <option value={0}>—</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex items-end">
                  <Button
                    onClick={handleAddItem}
                    size="sm"
                    className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold h-9 w-full rounded-md"
                    disabled={isSaving}
                  >
                    <Icon name="add" size={16} /> Agregar
                  </Button>
                </div>

              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="flex-1 overflow-auto px-6 py-3 min-h-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Icon name="shopping_cart" size={40} className="opacity-20" />
                  <p className="text-sm">No hay insumos agregados. Usa el formulario de arriba.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="py-2 pr-2 text-left font-semibold w-8">#</th>
                      <th className="py-2 px-2 text-left font-semibold">Insumo</th>
                      <th className="py-2 px-2 text-right font-semibold">Cantidad</th>
                      <th className="py-2 px-2 text-right font-semibold">P/U</th>
                      <th className="py-2 px-2 text-right font-semibold">Total</th>
                      <th className="py-2 px-2 text-left font-semibold">Proveedor</th>
                      <th className="py-2 px-2 text-left font-semibold">Notas</th>
                      <th className="py-2 pl-2 text-center font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors text-sm">
                        <td className="py-2.5 pr-2 text-muted-foreground font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-2 font-medium text-white">{it.insumo_nombre}</td>
                        <td className="py-2.5 px-2 text-right font-mono">{it.cantidad.toFixed(2)} <span className="text-muted-foreground text-[11px]">{it.insumo_unidad}</span></td>
                        <td className="py-2.5 px-2 text-right font-mono">{money(it.precio_unitario)}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-[#2e9e9b] font-semibold">{money(it.total)}</td>
                        <td className="py-2.5 px-2 text-muted-foreground">{it.proveedor_nombre || '—'}</td>
                        <td className="py-2.5 px-2 text-muted-foreground max-w-[120px] truncate">{it.notas || '—'}</td>
                        <td className="py-2.5 pl-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  
                  <tfoot>
                    <tr className="text-sm font-semibold border-t border-border">
                      <td colSpan={6} className="py-3 pr-2 text-right text-muted-foreground text-lg">Total general:</td>
                      <td colSpan={1} className="py-3 px-2 text-right font-mono text-lg text-[#2e9e9b]">{money(granTotal)}</td>
                      
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ERROR */}
            {formError && (
              <p className="px-6 text-red-400 text-xs pb-2">{formError}</p>
            )}

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-border gap-2 flex justify-end items-center">
              {usuario && sucursalActual && (
                <span className="text-[14px] text-muted-foreground mr-auto">
                  {usuario.nombre} • {sucursalActual.nombre} • {items.length} insumo(s)
                </span>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                <Icon name="close" size={14} className="mr-1" /> Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || items.length === 0}
                className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
              >
                {isSaving
                  ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" />
                  : <Icon name="check" size={14} className="mr-1" />}
                Guardar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

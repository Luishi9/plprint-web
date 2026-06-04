import { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Loader2, Check, X, Package, Truck, FileText, Hash } from 'lucide-react';

import { comprasApi } from '@/api/compras.api';
import { insumosApi } from '@/api/insumos.api';
import { proveedoresApi } from '@/api/proveedores.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMoney } from '@/hooks/useMoney';
import { useAuthStore } from '@/store/authStore';
import { useSucursalStore } from '@/store/sucursalStore';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface CompraInsumoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insumoPreseleccionado?: { id: number; nombre: string; precio_compra?: number | string | null };
  onSuccess?: () => void;
}

export default function CompraInsumoModal({
  open, onOpenChange, insumoPreseleccionado, onSuccess,
}: CompraInsumoModalProps) {
  const { simbolo } = useMoney();
  const usuario = useAuthStore((s) => s.usuario);
  const sucursalActual = useSucursalStore((s) => s.sucursalActiva);

  const [insumos, setInsumos] = useState<Array<{ id: number; nombre: string; unidad_medida: string; precio_compra?: number | string | null }>>([]);
  const [proveedores, setProveedores] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const [form, setForm] = useState({
    insumo_id: insumoPreseleccionado?.id || 0,
    cantidad: '1',
    precio_unitario: insumoPreseleccionado?.precio_compra?.toString() || '0',
    proveedor_id: 0,
    notas: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoadingCatalogos(true);
    Promise.all([
      insumosApi.getAll({ page: 1, limit: 100 }),
      proveedoresApi.getAll({ page: 1, limit: 100 }),
    ])
      .then(([insumosRes, provRes]) => {
        setInsumos((insumosRes.data as { data: typeof insumos }).data || []);
        setProveedores((provRes.data as { data: typeof proveedores }).data || []);
        // Si hay insumo preseleccionado, setear su proveedor por defecto
        if (insumoPreseleccionado) {
          const ins = (insumosRes.data as { data: Array<{ id: number; nombre: string; precio_compra?: number | string | null }> }).data?.find((i) => i.id === insumoPreseleccionado.id);
          if (ins) {
            setForm((f) => ({
              ...f,
              insumo_id: ins.id,
              precio_unitario: ins.precio_compra?.toString() || '0',
            }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCatalogos(false));
  }, [open, insumoPreseleccionado]);

  const insumoSeleccionado = useMemo(
    () => insumos.find((i) => i.id === Number(form.insumo_id)),
    [insumos, form.insumo_id],
  );

  const total = useMemo(() => {
    const c = Number(form.cantidad) || 0;
    const p = Number(form.precio_unitario) || 0;
    return c * p;
  }, [form.cantidad, form.precio_unitario]);

  const handleSubmit = async () => {
    if (!form.insumo_id) { setFormError('Selecciona un insumo.'); return; }
    const cantidad = Number(form.cantidad);
    if (!cantidad || cantidad <= 0) { setFormError('La cantidad debe ser mayor a 0.'); return; }
    const precio = Number(form.precio_unitario);
    if (precio < 0) { setFormError('El precio no puede ser negativo.'); return; }

    try {
      setIsSaving(true);
      await comprasApi.create({
        insumo_id: Number(form.insumo_id),
        cantidad,
        precio_unitario: precio,
        ...(form.proveedor_id && { proveedor_id: Number(form.proveedor_id) }),
        ...(sucursalActual?.id && { sucursal_id: sucursalActual.id }),
        ...(form.notas.trim() && { notas: form.notas.trim() }),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || 'Error al registrar la compra.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Registrar Compra de Insumo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registra una entrada de insumo. Se actualizará el inventario y el último precio de compra.
          </DialogDescription>
        </DialogHeader>

        {loadingCatalogos ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#2e9e9b]" />
          </div>
        ) : (
          <div className="py-2 flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                <Package size={13} /> Insumo *
              </label>
              <select
                value={form.insumo_id}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const ins = insumos.find((i) => i.id === id);
                  setForm({
                    ...form,
                    insumo_id: id,
                    precio_unitario: ins?.precio_compra?.toString() || form.precio_unitario,
                  });
                }}
                className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
              >
                <option value={0}>Seleccionar insumo...</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre} ({i.unidad_medida})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                  <Hash size={13} /> Cantidad *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  className="bg-background"
                />
                {insumoSeleccionado && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Unidad: {insumoSeleccionado.unidad_medida}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                  Precio unitario ({simbolo}) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio_unitario}
                  onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="bg-background/50 border border-border rounded-md p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-xl font-bold text-[#2e9e9b] font-mono">
                {simbolo}{total.toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                <Truck size={13} /> Proveedor
              </label>
              <select
                value={form.proveedor_id}
                onChange={(e) => setForm({ ...form, proveedor_id: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
              >
                <option value={0}>Sin proveedor específico</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                <FileText size={13} /> Notas
              </label>
              <Textarea
                placeholder="Ej. Factura #123, lote, observaciones..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="bg-background min-h-[60px]"
              />
            </div>

            {formError && <p className="text-red-400 text-xs">{formError}</p>}

            {usuario && sucursalActual && (
              <p className="text-[10px] text-muted-foreground text-center">
                Registrado por {usuario.nombre} • Sucursal {sucursalActual.nombre}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            <X size={14} className="mr-1" /> Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || loadingCatalogos}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            {isSaving
              ? <Loader2 size={14} className="mr-1 animate-spin" />
              : <Check size={14} className="mr-1" />}
            Registrar Compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

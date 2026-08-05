import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sileo } from 'sileo';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { OrdenProduccion, EstatusOrden } from '@/api/ordenesProduccion.api';
import { ordenesProduccionApi } from '@/api/ordenesProduccion.api';

const ESTATUS_META: Record<EstatusOrden, { label: string; cls: string; ringCls: string }> = {
  pendiente: { label: 'Pendientes', cls: 'bg-slate-500/10 text-slate-300 border-slate-500/30', ringCls: '' },
  en_proceso: { label: 'En proceso', cls: 'bg-blue-500/10 text-blue-300 border-blue-500/30', ringCls: '' },
  terminado: { label: 'Terminadas', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', ringCls: '' },
  entregado: { label: 'Entregadas', cls: 'bg-[#2e9e9b]/10 text-[#2e9e9b] border-[#2e9e9b]/30', ringCls: '' },
  cancelado: { label: 'Canceladas', cls: 'bg-red-500/10 text-red-400 border-red-500/30', ringCls: '' },
};

const TRANSICIONES: Record<EstatusOrden, EstatusOrden[]> = {
  pendiente:   ['en_proceso', 'cancelado'],
  en_proceso:  ['terminado', 'cancelado'],
  terminado:   ['entregado', 'cancelado'],
  entregado:   [],
  cancelado:   [],
};

interface CambiarEstatusModalProps {
  orden: OrdenProduccion | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CambiarEstatusModal({ orden, onClose, onSaved }: CambiarEstatusModalProps) {
  const [nuevoEstatus, setNuevoEstatus] = useState<EstatusOrden>('en_proceso');
  const [cantidadProducida, setCantidadProducida] = useState<number>(0);
  const [motivo, setMotivo] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset local state when a different orden is mounted via `key={orden?.id}` on parent.
  // No internal effect — the parent remounts us for each new orden.

  if (!orden) return null;

  const opciones = TRANSICIONES[orden.estatus] || [];

  const handleGuardar = async () => {
    if (opciones.length === 0) { setFormError('Esta orden no permite más cambios.'); return; }
    if (!opciones.includes(nuevoEstatus)) {
      setFormError(`Transición inválida. Solo: ${opciones.join(', ')}`);
      return;
    }
    if (nuevoEstatus === 'cancelado' && !motivo.trim()) {
      setFormError('Indica el motivo de cancelación.');
      return;
    }
    if (nuevoEstatus === 'terminado' && cantidadProducida < 0) {
      setFormError('La cantidad producida no puede ser negativa.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      await ordenesProduccionApi.cambiarEstatus(orden.id, {
        nuevoEstatus,
        notas: motivo.trim() || null,
        ...(nuevoEstatus === 'terminado' && { cantidadProducida }),
      });
      sileo.success({ title: 'Estatus actualizado' });
      onSaved();
      onClose();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al cambiar estatus');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!orden} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="play_arrow" size={18} className="text-blue-400" />
            Cambiar estatus — Orden #{orden.id}
          </DialogTitle>
          <DialogDescription>
            Actualmente: <b>{ESTATUS_META[orden.estatus].label}</b>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {opciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Esta orden ya no permite cambios de estatus.</p>
          ) : (
            <>
              <div>
                <label htmlFor="estatus-select" className="text-xs font-semibold text-muted-foreground block mb-1.5">Nuevo estatus</label>
                <Select value={nuevoEstatus} onValueChange={(v) => setNuevoEstatus(v as EstatusOrden)}>
                  <SelectTrigger id="estatus-select" aria-label="Nuevo estatus" className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                    {opciones.map((e) => (
                      <SelectItem key={e} value={e}>{ESTATUS_META[e].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {nuevoEstatus === 'terminado' && (
                <div>
                  <label htmlFor="estatus-cantidad-producida" className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Cantidad producida
                  </label>
                  <Input
                    id="estatus-cantidad-producida"
                    type="number"
                    min={0}
                    max={orden.cantidad}
                    value={cantidadProducida}
                    onChange={(e) => setCantidadProducida(Number(e.target.value))}
                    className="bg-background border-border font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Solicitada: {orden.cantidad}. Se incrementará inventario del producto.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="estatus-notas" className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {nuevoEstatus === 'cancelado' ? 'Motivo de cancelación *' : 'Notas (opcional)'}
                </label>
                <Textarea
                  id="estatus-notas"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={2}
                  placeholder={nuevoEstatus === 'cancelado' ? '¿Por qué se cancela?' : 'Comentarios del cambio...'}
                  className="bg-background border-border"
                />
              </div>
            </>
          )}

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <Icon name="error" size={14} /> {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          {opciones.length > 0 && (
            <Button
              onClick={handleGuardar}
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              {isSaving ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : 'Confirmar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

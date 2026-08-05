import { useEffect, useReducer, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sileo } from 'sileo';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { ordenesProduccionApi, OrdenProduccion, PrioridadOrden } from '@/api/ordenesProduccion.api';
import { productosApi } from '@/api/productos.api';
import { useSucursalStore } from '@/store/sucursalStore';

interface OrdenProduccionModalProps {
  open: boolean;
  onClose: () => void;
  editando: OrdenProduccion | null;
  onSaved: () => void;
}

interface FormState {
  productoId: number;
  cantidad: number;
  prioridad: PrioridadOrden;
  fechaFinEstimada: string;
  usuarioAsignadoId: number | null;
  maquinaId: number | null;
  notas: string;
  isSaving: boolean;
  formError: string;
}

type FormAction =
  | { type: 'set'; field: 'productoId' | 'cantidad'; value: number }
  | { type: 'set'; field: 'prioridad'; value: PrioridadOrden }
  | { type: 'set'; field: 'fechaFinEstimada' | 'notas'; value: string }
  | { type: 'set'; field: 'usuarioAsignadoId' | 'maquinaId'; value: number | null }
  | { type: 'setSaving'; value: boolean }
  | { type: 'setFormError'; value: string }
  | { type: 'reset'; payload: FormState };

const initialForm: FormState = {
  productoId: 0,
  cantidad: 1,
  prioridad: 'normal',
  fechaFinEstimada: '',
  usuarioAsignadoId: null,
  maquinaId: null,
  notas: '',
  isSaving: false,
  formError: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'setFormError':
      return { ...state, formError: action.value };
    case 'reset': {
      const { isSaving: _isSaving, formError: _formError, ...rest } = action.payload;
      return { ...state, ...rest, isSaving: false, formError: '' };
    }
    default:
      return state;
  }
}

export function OrdenProduccionModal({ open, onClose, editando, onSaved }: OrdenProduccionModalProps) {
  const { sucursalActiva } = useSucursalStore();

  const [productos, setProductos] = useState<Array<{ id: number; nombre: string; codigo: string | null; imagen_url: string | null }>>([]);
  const [usuarios, setUsuarios] = useState<Array<{ id: number; nombre: string }>>([]);
  const [maquinas, setMaquinas] = useState<Array<{ id: number; nombre: string; tipo: string }>>([]);

  const [state, dispatch] = useReducer(formReducer, initialForm);
  const { productoId, cantidad, prioridad, fechaFinEstimada, usuarioAsignadoId, maquinaId, notas, isSaving, formError } = state;

  useEffect(() => {
    let cancelled = false;
    if (!open) return;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const authHeader = { Authorization: `Bearer ${token}` };
        const [pRes, uRes, mRes] = await Promise.all([
          productosApi.getAll({ page: 1, limit: 200, categoriaTipo: 'produccion', sucursalId: sucursalActiva?.id }),
          fetch('/api/v1/usuarios?limit=100', { headers: authHeader }).then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
          fetch('/api/v1/maquinas?activa=true', { headers: authHeader }).then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setProductos(((pRes.data as any)?.data) || []);
        setUsuarios(((uRes as any)?.data) || []);
        setMaquinas(((mRes as any)?.data) || []);
      } catch (e) { if (!cancelled) console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [open, sucursalActiva?.id]);

  useEffect(() => {
    const payload: FormState = editando
      ? {
          productoId: editando.producto_id,
          cantidad: editando.cantidad,
          prioridad: editando.prioridad,
          fechaFinEstimada: editando.fecha_fin_estimada ? editando.fecha_fin_estimada.split('T')[0] : '',
          usuarioAsignadoId: editando.usuario_asignado_id,
          maquinaId: editando.maquina_id,
          notas: editando.notas ?? '',
          isSaving: false,
          formError: '',
        }
      : {
          productoId: 0,
          cantidad: 1,
          prioridad: 'normal',
          fechaFinEstimada: '',
          usuarioAsignadoId: null,
          maquinaId: null,
          notas: '',
          isSaving: false,
          formError: '',
        };
    dispatch({ type: 'reset', payload });
  }, [editando, open]);

  const handleGuardar = async () => {
    if (!state.productoId) { dispatch({ type: 'setFormError', value: 'Selecciona un producto.' }); return; }
    if (state.cantidad <= 0) { dispatch({ type: 'setFormError', value: 'La cantidad debe ser mayor a 0.' }); return; }
    if (!sucursalActiva) { dispatch({ type: 'setFormError', value: 'No hay sucursal activa.' }); return; }

    dispatch({ type: 'setSaving', value: true });
    dispatch({ type: 'setFormError', value: '' });
    try {
      const payload = {
        sucursalId: sucursalActiva.id,
        productoId: state.productoId,
        cantidad: state.cantidad,
        prioridad: state.prioridad,
        fechaFinEstimada: state.fechaFinEstimada || null,
        usuarioAsignadoId: state.usuarioAsignadoId || null,
        maquinaId: state.maquinaId || null,
        notas: state.notas.trim() || null,
      };
      if (editando) {
        await ordenesProduccionApi.update(editando.id, payload);
        sileo.success({ title: 'Orden actualizada' });
      } else {
        await ordenesProduccionApi.create(payload);
        sileo.success({ title: 'Orden creada' });
      }
      onSaved();
      onClose();
    } catch (e: any) {
      dispatch({ type: 'setFormError', value: e?.response?.data?.message ?? 'Error al guardar' });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="factory" size={18} className="text-[#2e9e9b]" />
            {editando ? `Editar orden #${editando.id}` : 'Nueva orden de producción'}
          </DialogTitle>
          <DialogDescription>
            Define el producto a fabricar, cantidad y asignación
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="md:col-span-2">
            <label htmlFor="op-producto" className="text-xs font-semibold text-muted-foreground block mb-1.5">Producto *</label>
            <Select value={String(productoId)} onValueChange={(v) => dispatch({ type: 'set', field: 'productoId', value: Number(v) })}>
              <SelectTrigger id="op-producto" className="bg-background border-border">
                <SelectValue placeholder="Selecciona un producto..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border max-h-72">
                {productos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre} {p.codigo ? `(${p.codigo})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="op-cantidad" className="text-xs font-semibold text-muted-foreground block mb-1.5">Cantidad *</label>
            <Input
              id="op-cantidad"
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => dispatch({ type: 'set', field: 'cantidad', value: Number(e.target.value) })}
              className="bg-background border-border font-mono"
            />
          </div>

          <div>
            <label htmlFor="op-prioridad" className="text-xs font-semibold text-muted-foreground block mb-1.5">Prioridad</label>
            <Select value={prioridad} onValueChange={(v) => dispatch({ type: 'set', field: 'prioridad', value: v as PrioridadOrden })}>
              <SelectTrigger id="op-prioridad" className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="op-fecha-fin" className="text-xs font-semibold text-muted-foreground block mb-1.5">Fecha fin estimada</label>
            <Input
              id="op-fecha-fin"
              type="date"
              value={fechaFinEstimada}
              onChange={(e) => dispatch({ type: 'set', field: 'fechaFinEstimada', value: e.target.value })}
              className="bg-background border-border"
            />
          </div>

          <div>
            <label htmlFor="op-asignado" className="text-xs font-semibold text-muted-foreground block mb-1.5">Asignado a</label>
            <Select
              value={usuarioAsignadoId ? String(usuarioAsignadoId) : 'none'}
              onValueChange={(v) => dispatch({ type: 'set', field: 'usuarioAsignadoId', value: v === 'none' ? null : Number(v) })}
            >
              <SelectTrigger id="op-asignado" className="bg-background border-border">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                <SelectItem value="none">— Sin asignar —</SelectItem>
                {usuarios.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="op-maquina" className="text-xs font-semibold text-muted-foreground block mb-1.5">Máquina</label>
            <Select
              value={maquinaId ? String(maquinaId) : 'none'}
              onValueChange={(v) => dispatch({ type: 'set', field: 'maquinaId', value: v === 'none' ? null : Number(v) })}
            >
              <SelectTrigger id="op-maquina" className="bg-background border-border">
                <SelectValue placeholder="Sin máquina" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-border">
                <SelectItem value="none">— Sin máquina —</SelectItem>
                {maquinas.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.nombre} ({m.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="op-notas" className="text-xs font-semibold text-muted-foreground block mb-1.5">Notas</label>
            <Textarea
              id="op-notas"
              value={notas}
              onChange={(e) => dispatch({ type: 'set', field: 'notas', value: e.target.value })}
              rows={3}
              placeholder="Instrucciones especiales, materiales, etc."
              className="bg-background border-border"
            />
          </div>

          {formError && (
            <div className="md:col-span-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <Icon name="error" size={14} /> {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button
            onClick={handleGuardar}
            disabled={isSaving}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
          >
            {isSaving ? <Icon name="hourglass_top" size={16} className="animate-spin" /> : editando ? 'Guardar cambios' : 'Crear orden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

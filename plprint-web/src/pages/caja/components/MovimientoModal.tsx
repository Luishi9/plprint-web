import { useState, useEffect, useReducer } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { categoriasGastosApi, CategoriaGasto } from '@/api/gastos.api';
import { useAuthStore } from '@/store/authStore';
import { useMoney } from '@/hooks/useMoney';

type MovimientoTipo = 'ingreso' | 'gasto' | 'retiro';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    sucursal_id: number;
    categoria_id: number;
    concepto: string;
    monto: number;
    notas?: string;
    autorizado_por?: number;
  }) => Promise<void>;
  tipo: MovimientoTipo;
  sucursalId: number;
}

const TIPO_CFG: Record<MovimientoTipo, { label: string; color: string; }> = {
  ingreso: { label: 'Ingreso', color: 'text-green-400 border-green-500/50 bg-green-500/20' },
  gasto: { label: 'Gasto', color: 'text-red-400 border-red-500/50 bg-red-500/20' },
  retiro: { label: 'Retiro', color: 'text-orange-400 border-orange-500/50 bg-orange-500/20' },
};

interface FormState {
  categoriaId: number;
  concepto: string;
  monto: string;
  notas: string;
  isSaving: boolean;
  error: string;
}

const initialForm: FormState = {
  categoriaId: 0,
  concepto: '',
  monto: '',
  notas: '',
  isSaving: false,
  error: '',
};

type FormAction =
  | { type: 'reset'; firstCategoriaId: number }
  | { type: 'set'; field: 'concepto' | 'monto' | 'notas' | 'categoriaId' | 'error'; value: string | number }
  | { type: 'setSaving'; value: boolean };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'reset':
      return { ...initialForm, categoriaId: action.firstCategoriaId };
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    default:
      return state;
  }
}

export default function MovimientoModal({ open, onClose, onConfirm, tipo, sucursalId }: Props) {
  const { simbolo } = useMoney();
  const usuario = useAuthStore((s) => s.usuario);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [form, dispatch] = useReducer(formReducer, initialForm);

  const cfg = TIPO_CFG[tipo];

  useEffect(() => {
    if (!open) return;
    categoriasGastosApi.getAll().then((res) => {
      const cats = res.data?.data || [];
      setCategorias(cats);
      dispatch({ type: 'reset', firstCategoriaId: cats[0]?.id || 0 });
    });
  }, [open]);

  const handleConfirm = async () => {
    if (!form.categoriaId) { dispatch({ type: 'set', field: 'error', value: 'Selecciona una categoría.' }); return; }
    if (!form.concepto.trim()) { dispatch({ type: 'set', field: 'error', value: 'El concepto es requerido.' }); return; }
    if (!form.monto || Number(form.monto) <= 0) { dispatch({ type: 'set', field: 'error', value: 'El monto debe ser mayor a 0.' }); return; }
    try {
      dispatch({ type: 'setSaving', value: true });
      dispatch({ type: 'set', field: 'error', value: '' });
      const payload = {
        sucursal_id: sucursalId,
        categoria_id: form.categoriaId,
        concepto: form.concepto.trim(),
        monto: Number(form.monto),
        notas: form.notas.trim() || undefined,
      };
      if (tipo === 'retiro' && usuario?.rol === 'admin') {
        (payload as Record<string, unknown>).autorizado_por = usuario.id;
      }
      await onConfirm(payload);
      onClose();
    } catch (e: unknown) {
      dispatch({ type: 'set', field: 'error', value: (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al registrar.' });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold flex items-center gap-2 ${cfg.color.split(' ')[0]}`}>
            {tipo === 'ingreso' ? <Icon name="arrow_outward" size={22} /> : tipo === 'gasto' ? <Icon name="south_east" size={22} /> : <Icon name="account_balance_wallet" size={22} />}
            Registrar {cfg.label}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completa los datos para registrar el {cfg.label.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          <div>
            <label htmlFor="movimiento-categoria" className="text-sm font-medium block mb-1.5">Categoría *</label>
            <select
              id="movimiento-categoria"
              aria-label="Categoría"
              value={form.categoriaId}
              onChange={(e) => dispatch({ type: 'set', field: 'categoriaId', value: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
            >
              <option value={0}>Seleccionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="movimiento-concepto" className="text-sm font-medium block mb-1.5">Concepto *</label>
            <Input
              id="movimiento-concepto"
              placeholder={tipo === 'ingreso' ? 'Ej. Venta de material' : tipo === 'gasto' ? 'Ej. Compra de papel' : 'Ej. Retiro para cambio'}
              value={form.concepto}
              onChange={(e) => dispatch({ type: 'set', field: 'concepto', value: e.target.value })}
              className="bg-background"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="movimiento-monto" className="text-sm font-medium block mb-1.5">Monto ({simbolo}) *</label>
            <Input
              id="movimiento-monto"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.monto}
              onChange={(e) => dispatch({ type: 'set', field: 'monto', value: e.target.value })}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="movimiento-notas" className="text-sm font-medium block mb-1.5">Notas</label>
            <Textarea
              id="movimiento-notas"
              placeholder="Información adicional..."
              value={form.notas}
              onChange={(e) => dispatch({ type: 'set', field: 'notas', value: e.target.value })}
              className="bg-background min-h-[50px]"
            />
          </div>
          {tipo === 'retiro' && (
            <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
              <strong>Retiro:</strong> Requiere autorización de administrador para proceder.
            </div>
          )}
          {form.error && <p className="text-red-400 text-xs">{form.error}</p>}
        </div>
        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={form.isSaving}>
            <Icon name="close" size={14} className="mr-1" /> Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={form.isSaving} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
            {form.isSaving ? <Icon name="progress_activity" size={14} className="mr-1 animate-spin" /> : <Icon name="check" size={14} className="mr-1" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

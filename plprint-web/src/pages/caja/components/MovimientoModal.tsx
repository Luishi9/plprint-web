import { useState, useEffect } from 'react';
import { Loader2, Check, X, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
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

export default function MovimientoModal({ open, onClose, onConfirm, tipo, sucursalId }: Props) {
  const { simbolo } = useMoney();
  const usuario = useAuthStore((s) => s.usuario);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [categoriaId, setCategoriaId] = useState(0);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const cfg = TIPO_CFG[tipo];

  useEffect(() => {
    if (open) {
      categoriasGastosApi.getAll().then((res) => {
        const cats = res.data?.data || [];
        setCategorias(cats);
        setCategoriaId(cats[0]?.id || 0);
        setConcepto('');
        setMonto('');
        setNotas('');
        setError('');
      });
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!categoriaId) { setError('Selecciona una categoría.'); return; }
    if (!concepto.trim()) { setError('El concepto es requerido.'); return; }
    if (!monto || Number(monto) <= 0) { setError('El monto debe ser mayor a 0.'); return; }
    try {
      setIsSaving(true);
      setError('');
      const payload = {
        sucursal_id: sucursalId,
        categoria_id: categoriaId,
        concepto: concepto.trim(),
        monto: Number(monto),
        notas: notas.trim() || undefined,
      };
      if (tipo === 'retiro' && usuario?.rol === 'admin') {
        (payload as Record<string, unknown>).autorizado_por = usuario.id;
      }
      await onConfirm(payload);
      onClose();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al registrar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold flex items-center gap-2 ${cfg.color.split(' ')[0]}`}>
            {tipo === 'ingreso' ? <ArrowUpRight size={22} /> : tipo === 'gasto' ? <ArrowDownRight size={22} /> : <Wallet size={22} />}
            Registrar {cfg.label}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completa los datos para registrar el {cfg.label.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Categoría *</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-md text-sm px-3 py-2"
            >
              <option value={0}>Seleccionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Concepto *</label>
            <Input
              placeholder={tipo === 'ingreso' ? 'Ej. Venta de material' : tipo === 'gasto' ? 'Ej. Compra de papel' : 'Ej. Retiro para cambio'}
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="bg-background"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Monto ({simbolo}) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Notas</label>
            <Textarea
              placeholder="Información adicional..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="bg-background min-h-[50px]"
            />
          </div>
          {tipo === 'retiro' && (
            <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
              <strong>Retiro:</strong> Requiere autorización de administrador para proceder.
            </div>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <DialogFooter className="gap-2 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X size={14} className="mr-1" /> Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving} className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold">
            {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

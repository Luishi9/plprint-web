import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Pencil, Trash2, Loader2, Banknote, Landmark, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { metodosPagoApi, MetodoPago, CreateMetodoPagoDTO } from '@/api/metodosPago.api';

const ICONOS_DISPONIBLES = [
  { value: 'Banknote', label: 'Efectivo', icon: Banknote },
  { value: 'CreditCard', label: 'Tarjeta', icon: CreditCard },
  { value: 'Landmark', label: 'Banco', icon: Landmark },
  { value: 'Wallet', label: 'Cartera', icon: Wallet },
];

function IconPreview({ name }: { name: string | null }) {
  const found = ICONOS_DISPONIBLES.find((i) => i.value === name);
  const Icon = found?.icon ?? Banknote;
  return <Icon size={16} />;
}

export default function MetodosPagoTab() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<MetodoPago | null>(null);
  const [eliminarItem, setEliminarItem] = useState<MetodoPago | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await metodosPagoApi.getAll();
      setMetodos(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (m: MetodoPago) => {
    try {
      await metodosPagoApi.toggleActivo(m.id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    setIsDeleting(true);
    try {
      await metodosPagoApi.remove(eliminarItem.id);
      setEliminarItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard size={16} /> Métodos de pago
            </CardTitle>
            <CardDescription>Personaliza las formas de pago disponibles</CardDescription>
          </div>
          <Button onClick={() => { setEditando(null); setModalOpen(true); }} className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
            <Plus className="mr-2" size={16} /> Nuevo método
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metodos.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-[#2e9e9b]/10 text-[#2e9e9b] flex items-center justify-center">
                    <IconPreview name={m.icono} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{m.nombre}</span>
                      {m.es_sistema && <Badge variant="outline" className="text-xs">Sistema</Badge>}
                      {!m.activo && <Badge variant="destructive" className="text-xs">Inactivo</Badge>}
                    </div>
                    {m._count && (
                      <p className="text-xs text-muted-foreground">{m._count.ventas} venta(s) registrada(s)</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={m.activo} onCheckedChange={() => handleToggle(m)} />
                  <Button variant="ghost" size="icon" onClick={() => { setEditando(m); setModalOpen(true); }}>
                    <Pencil size={15} />
                  </Button>
                  {!m.es_sistema && (
                    <Button variant="ghost" size="icon" onClick={() => setEliminarItem(m)}>
                      <Trash2 size={15} className="text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {metodos.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No hay métodos de pago</p>
            )}
          </div>
        </CardContent>
      </Card>

      <MetodoPagoFormModal
        open={modalOpen}
        onOpenChange={(v) => { if (!v) setEditando(null); setModalOpen(v); }}
        metodo={editando}
        onSaved={() => { setModalOpen(false); setEditando(null); fetchData(); }}
      />

      <Dialog open={!!eliminarItem} onOpenChange={(v) => !v && setEliminarItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar "{eliminarItem?.nombre}"</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEliminarItem(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleEliminar} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

interface MetodoPagoFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  metodo: MetodoPago | null;
  onSaved: () => void;
}

function MetodoPagoFormModal({ open, onOpenChange, metodo, onSaved }: MetodoPagoFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('Banknote');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNombre(metodo?.nombre ?? '');
      setIcono(metodo?.icono ?? 'Banknote');
      setError(null);
    }
  }, [open, metodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (metodo) {
        await metodosPagoApi.update(metodo.id, { nombre, icono });
      } else {
        const data: CreateMetodoPagoDTO = { nombre, icono };
        await metodosPagoApi.create(data);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{metodo ? `Editar "${metodo.nombre}"` : 'Nuevo método de pago'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="mp-nombre">Nombre</Label>
            <Input id="mp-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Icono</Label>
            <div className="grid grid-cols-4 gap-2">
              {ICONOS_DISPONIBLES.map((i) => {
                const Icon = i.icon;
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => setIcono(i.value)}
                    className={`p-3 rounded-md border flex flex-col items-center gap-1 cursor-pointer ${icono === i.value ? 'border-[#2e9e9b] bg-[#2e9e9b]/10' : 'border-border hover:bg-muted'}`}
                  >
                    <Icon size={20} className={icono === i.value ? 'text-[#2e9e9b]' : ''} />
                    <span className="text-xs">{i.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving} className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {metodo ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

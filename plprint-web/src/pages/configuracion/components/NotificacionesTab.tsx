import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { notificacionesApi, NotificacionConfig, UpdateNotificacionDTO } from '@/api/notificaciones.api';

const META: Record<string, { label: string; desc: string; icon: React.ReactNode; hasUmbral: boolean; umbralLabel?: string }> = {
  stock_bajo_productos: {
    label: 'Stock bajo de productos',
    desc: 'Avisa cuando un producto tiene stock igual o menor al mínimo',
    icon: <Icon name="inventory_2" size={16} />,
    hasUmbral: true,
    umbralLabel: 'Umbral global (unidades)',
  },
  stock_bajo_insumos: {
    label: 'Stock bajo de insumos',
    desc: 'Avisa cuando un insumo tiene stock por debajo del mínimo',
    icon: <Icon name="inventory" size={16} />,
    hasUmbral: true,
    umbralLabel: 'Umbral global (unidades)',
  },
  ventas_dia: {
    label: 'Resumen de ventas del día',
    desc: 'Muestra un resumen de ventas realizadas en el día',
    icon: <Icon name="shopping_cart" size={16} />,
    hasUmbral: false,
  },
  venta_cancelada: {
    label: 'Ventas canceladas',
    desc: 'Notifica cuando se cancela una venta en las últimas 24h',
    icon: <Icon name="cancel" size={16} />,
    hasUmbral: false,
  },
  producto_sin_stock: {
    label: 'Productos sin stock',
    desc: 'Avisa sobre productos agotados o sin inventario registrado',
    icon: <Icon name="remove_shopping_cart" size={16} />,
    hasUmbral: false,
  },
};

export default function NotificacionesTab() {
  const [config, setConfig] = useState<NotificacionConfig[]>([]);
  const [resumen, setResumen] = useState<{ [k: string]: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<Record<string, UpdateNotificacionDTO>>({});
  const [isSaving, setIsSaving] = useState<{ [k: string]: boolean }>({});
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string; key: string } | null>(null);

  const fetchData = async () => {
    try {
      const [c, r] = await Promise.all([notificacionesApi.getAllConfig(), notificacionesApi.getResumen()]);
      setConfig(c.data.data);
      setResumen(r.data.data as unknown as { [k: string]: number });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getValue = (c: NotificacionConfig, field: 'activo' | 'umbral') => {
    if (pending[c.tipo]?.[field] !== undefined) return pending[c.tipo]![field];
    if (field === 'activo') return c.activo;
    return c.umbral ? Number(c.umbral) : 0;
  };

  const handleActivo = (c: NotificacionConfig, activo: boolean) => {
    setPending((prev) => ({ ...prev, [c.tipo]: { ...prev[c.tipo], activo } }));
  };

  const handleUmbral = (c: NotificacionConfig, umbral: number) => {
    setPending((prev) => ({ ...prev, [c.tipo]: { ...prev[c.tipo], umbral } }));
  };

  const handleSave = async (c: NotificacionConfig) => {
    const dto = pending[c.tipo];
    if (!dto) return;
    setIsSaving((prev) => ({ ...prev, [c.tipo]: true }));
    setMessage(null);
    try {
      await notificacionesApi.updateConfig(c.tipo, dto);
      setPending((prev) => {
        const next = { ...prev };
        delete next[c.tipo];
        return next;
      });
      await fetchData();
      setMessage({ type: 'ok', text: 'Guardado', key: c.tipo });
      setTimeout(() => setMessage((m) => (m?.key === c.tipo ? null : m)), 2000);
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? 'Error', key: c.tipo });
    } finally {
      setIsSaving((prev) => ({ ...prev, [c.tipo]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="progress_activity" className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="notifications" size={16} /> Configuración de notificaciones
          </CardTitle>
          <CardDescription>Activa o desactiva los avisos y configura umbrales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.map((c) => {
            const meta = META[c.tipo] ?? { label: c.tipo, desc: '', icon: null, hasUmbral: false };
            const activo = getValue(c, 'activo') as boolean;
            const umbral = getValue(c, 'umbral') as number;
            const dirty = !!pending[c.tipo];
            const count = resumen?.[c.tipo] ?? 0;
            return (
              <div key={c.tipo} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-[#2e9e9b]/10 text-[#2e9e9b] flex items-center justify-center shrink-0">
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{meta.label}</span>
                        {activo && count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
                            {count} alerta{count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{meta.desc}</p>
                    </div>
                  </div>
                  <Switch checked={activo} onCheckedChange={(v) => handleActivo(c, v)} />
                </div>
                {meta.hasUmbral && activo && (
                  <div className="mt-3 pt-3 border-t border-border flex items-end gap-3 flex-wrap">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <Label htmlFor={`umbral-${c.tipo}`} className="text-xs">{meta.umbralLabel}</Label>
                      <Input
                        id={`umbral-${c.tipo}`}
                        type="number"
                        min="0"
                        value={umbral}
                        onChange={(e) => handleUmbral(c, Number(e.target.value))}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSave(c)}
                      disabled={!dirty || isSaving[c.tipo]}
                      className="bg-[#2e9e9b] hover:bg-[#48b9b4]"
                    >
                      {isSaving[c.tipo] ? <Icon name="progress_activity" className="animate-spin mr-1" size={14} /> : <Icon name="save" className="mr-1" size={14} />}
                      Guardar
                    </Button>
                    {message?.key === c.tipo && (
                      <span className={`text-xs ${message.type === 'ok' ? 'text-[#2e9e9b]' : 'text-red-500'}`}>
                        {message.text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </m.div>
  );
}

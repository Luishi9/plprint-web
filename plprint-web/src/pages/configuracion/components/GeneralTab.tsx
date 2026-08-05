import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { configuracionApi, ConfigAll, ConfigValue } from '@/api/configuracion.api';
import { useConfigStore } from '@/store/configStore';
import { ConfigurationField } from './ConfigurationField';

type MetaGrupo = {
  label: string;
  icon: React.ReactNode;
  desc: string;
  grupo: string;
  campos: string[];
};

const GRUPOS_META: MetaGrupo[] = [
  {
    label: 'Empresa', icon: <Icon name="apartment" size={16} />, desc: 'Datos de la empresa que aparecen en tickets y reportes',
    grupo: 'empresa',
    campos: ['empresa_nombre', 'empresa_rfc', 'empresa_telefono', 'empresa_email', 'empresa_direccion'],
  },
  {
    label: 'Impuestos', icon: <Icon name="receipt" size={16} />, desc: 'Configuración de IVA y facturación',
    grupo: 'impuestos',
    campos: ['iva_porcentaje', 'iva_activo'],
  },
  {
    label: 'Moneda', icon: <Icon name="payments" size={16} />, desc: 'Formato y símbolo de la moneda',
    grupo: 'moneda',
    campos: ['moneda_simbolo', 'moneda_codigo', 'moneda_decimales', 'moneda_separador_decimal', 'moneda_separador_miles'],
  },
  {
    label: 'Reportes', icon: <Icon name="description" size={16} />, desc: 'Formato de los reportes generados',
    grupo: 'reportes',
    campos: ['reportes_formato', 'reportes_incluir_logo'],
  },
  {
    label: 'Ticket', icon: <Icon name="receipt" size={16} />, desc: 'Personalización del ticket de venta',
    grupo: 'ticket',
    campos: ['ticket_encabezado', 'ticket_subtitulo', 'ticket_mensaje_pie', 'ticket_mostrar_logo', 'ticket_mostrar_direccion', 'ticket_mostrar_telefono', 'ticket_mostrar_rfc', 'ticket_formato_fecha', 'ticket_formato_hora'],
  },
  {
    label: 'Máquinas', icon: <Icon name="precision_manufacturing" size={16} />, desc: 'Configuración de máquinas de impresión',
    grupo: 'maquinas',
    campos: ['somos_centro_impresion'],
  },
];

export default function GeneralTab() {
  const [config, setConfig] = useState<ConfigAll>({});
  const [original, setOriginal] = useState<ConfigAll>({});
  const [pending, setPending] = useState<Record<string, ConfigValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await configuracionApi.getAll();
      setConfig(res.data.data);
      setOriginal(res.data.data);
      setLogoUrl((res.data.data.empresa?.empresa_logo_url as string) ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const getValue = (clave: string): ConfigValue => {
    if (pending[clave] !== undefined) return pending[clave];
    for (const g of GRUPOS_META) {
      if (g.campos.includes(clave)) {
        return original[g.grupo]?.[clave] ?? '';
      }
    }
    return '';
  };

  const handleChange = (clave: string, valor: ConfigValue) => {
    setPending((prev) => ({ ...prev, [clave]: valor }));
  };

  const handleSave = async () => {
    const updates = Object.entries(pending).map(([clave, valor]) => ({ clave, valor }));
    if (updates.length === 0) return;
    setIsSaving(true);
    try {
      await configuracionApi.updateBatch(updates);
      setPending({});
      await fetchConfig();
      useConfigStore.getState().fetch();
      setMessage({ type: 'ok', text: `Guardado: ${updates.length} cambio(s)` });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? 'Error al guardar' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      await configuracionApi.uploadLogo(file);
      await fetchConfig();
      useConfigStore.getState().fetch();
      setMessage({ type: 'ok', text: 'Logo actualizado' });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? 'Error al subir logo' });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="progress_activity" className="animate-spin" size={24} />
      </div>
    );
  }

  const totalPending = Object.keys(pending).length;

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="image" size={16} /> Logo de la empresa
          </CardTitle>
          <CardDescription>Aparece en tickets, login y reportes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg border border-border flex items-center justify-center overflow-hidden bg-muted shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <Icon name="image" size={28} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
                {isUploadingLogo ? <Icon name="progress_activity" className="animate-spin" size={14} /> : <Icon name="upload" size={14} />}
                {isUploadingLogo ? 'Subiendo...' : 'Subir logo'}
              </div>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
            </Label>
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG o SVG. Máx 2MB.</p>
          </div>
        </CardContent>
      </Card>

      {GRUPOS_META.map((g) => (
        <Card key={g.label}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {g.icon} {g.label}
            </CardTitle>
            <CardDescription>{g.desc}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            {g.campos.map((c) => {
              if (!(c in (config[g.grupo] ?? {}))) return null;
              return (
                <ConfigurationField
                  key={c}
                  clave={c}
                  value={getValue(c)}
                  onChange={handleChange}
                />
              );
            })}
          </CardContent>
        </Card>
      ))}

      {totalPending > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background border border-border rounded-lg shadow-lg p-3">
          <span className="text-sm font-medium">{totalPending} cambio(s)</span>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
            {isSaving ? <Icon name="progress_activity" className="animate-spin mr-2" size={14} /> : <Icon name="save" className="mr-2" size={14} />}
            Guardar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPending({})}>
            Descartar
          </Button>
        </div>
      )}

      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-lg shadow-lg px-4 py-2">
          <span className={`text-sm ${message.type === 'ok' ? 'text-[#2e9e9b]' : 'text-red-500'}`}>{message.text}</span>
        </div>
      )}
    </m.div>
  );
}

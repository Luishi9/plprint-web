import { useEffect, useState } from 'react';
import { m } from "framer-motion";
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { configuracionApi, ConfigAll, ConfigValue } from '@/api/configuracion.api';
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
    label: 'Facturación (CFDI)',
    icon: <Icon name="verified" size={16} />,
    desc: 'Datos del emisor para timbrado Finkok CFDI 4.0',
    grupo: 'facturacion',
    campos: [
      'empresa_rfc',
      'razon_social_emisor',
      'regimen_fiscal_emisor',
      'lugar_expedicion_cp',
      'no_certificado',
      'password_llave',
    ],
  },
];

export default function DatosFacturacionTab() {
  const [config, setConfig] = useState<ConfigAll>({});
  const [original, setOriginal] = useState<ConfigAll>({});
  const [pending, setPending] = useState<Record<string, ConfigValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCsd, setIsUploadingCsd] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await configuracionApi.getAll();
      setConfig(res.data.data);
      setOriginal(res.data.data);
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
      setMessage({ type: 'ok', text: `Guardado: ${updates.length} cambio(s)` });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? 'Error al guardar' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCsdUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'cer' | 'key') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCsd(true);
    try {
      await configuracionApi.uploadCsd(file, tipo);
      await fetchConfig();
      setMessage({ type: 'ok', text: `Archivo ${tipo === 'cer' ? '.cer' : '.key'} subido correctamente` });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? `Error al subir .${tipo}` });
    } finally {
      setIsUploadingCsd(false);
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="verified" size={16} /> Certificados de Sello Digital (CSD)
          </CardTitle>
          <CardDescription>Archivos .cer y .key del SAT para timbrado Finkok CFDI 4.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="csd-cer" className="text-sm">Certificado (.cer)</Label>
              <Label htmlFor="csd-cer-upload" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
                  {isUploadingCsd ? <Icon name="progress_activity" className="animate-spin" size={14} /> : <Icon name="upload" size={14} />}
                  {isUploadingCsd ? 'Subiendo...' : 'Subir .cer'}
                </div>
                <input id="csd-cer-upload" type="file" accept=".cer" className="hidden" onChange={(e) => handleCsdUpload(e, 'cer')} disabled={isUploadingCsd} />
              </Label>
              {config.facturacion?.certificado_cer_path ? (
                <p className="text-xs text-[#2e9e9b] truncate">✓ {String(config.facturacion.certificado_cer_path)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Sin archivo</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="csd-key" className="text-sm">Llave privada (.key)</Label>
              <Label htmlFor="csd-key-upload" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
                  {isUploadingCsd ? <Icon name="progress_activity" className="animate-spin" size={14} /> : <Icon name="upload" size={14} />}
                  {isUploadingCsd ? 'Subiendo...' : 'Subir .key'}
                </div>
                <input id="csd-key-upload" type="file" accept=".key" className="hidden" onChange={(e) => handleCsdUpload(e, 'key')} disabled={isUploadingCsd} />
              </Label>
              {config.facturacion?.llave_key_path ? (
                <p className="text-xs text-[#2e9e9b] truncate">✓ {String(config.facturacion.llave_key_path)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Sin archivo</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Reemplaza los archivos existentes al subir uno nuevo. Máx 5MB cada uno.</p>
        </CardContent>
      </Card>

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

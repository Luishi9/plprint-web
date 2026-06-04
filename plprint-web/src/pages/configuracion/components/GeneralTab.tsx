import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Receipt, Banknote, FileText,
  Save, Loader2, Image as ImageIcon, Upload,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { configuracionApi, ConfigAll, ConfigValue } from '@/api/configuracion.api';

type MetaGrupo = {
  label: string;
  icon: React.ReactNode;
  desc: string;
  grupo: string;
  campos: string[];
};

const GRUPOS_META: MetaGrupo[] = [
  {
    label: 'Empresa', icon: <Building2 size={16} />, desc: 'Datos de la empresa que aparecen en tickets y reportes',
    grupo: 'empresa',
    campos: ['empresa_nombre', 'empresa_rfc', 'empresa_telefono', 'empresa_email', 'empresa_direccion'],
  },
  {
    label: 'Impuestos', icon: <Receipt size={16} />, desc: 'Configuración de IVA y facturación',
    grupo: 'impuestos',
    campos: ['iva_porcentaje', 'iva_activo'],
  },
  {
    label: 'Moneda', icon: <Banknote size={16} />, desc: 'Formato y símbolo de la moneda',
    grupo: 'moneda',
    campos: ['moneda_simbolo', 'moneda_codigo', 'moneda_decimales', 'moneda_separador_decimal', 'moneda_separador_miles'],
  },
  {
    label: 'Reportes', icon: <FileText size={16} />, desc: 'Formato de los reportes generados',
    grupo: 'reportes',
    campos: ['reportes_formato', 'reportes_incluir_logo'],
  },
  {
    label: 'Ticket', icon: <Receipt size={16} />, desc: 'Personalización del ticket de venta',
    grupo: 'ticket',
    campos: ['ticket_encabezado', 'ticket_subtitulo', 'ticket_mensaje_pie', 'ticket_mostrar_logo', 'ticket_mostrar_direccion', 'ticket_mostrar_telefono', 'ticket_mostrar_rfc', 'ticket_formato_fecha', 'ticket_formato_hora'],
  },
];

const CAMPO_LABEL: Record<string, string> = {
  empresa_nombre: 'Nombre', empresa_rfc: 'RFC', empresa_telefono: 'Teléfono',
  empresa_email: 'Email', empresa_direccion: 'Dirección',
  iva_porcentaje: 'IVA (%)', iva_activo: 'Activar IVA',
  moneda_simbolo: 'Símbolo', moneda_codigo: 'Código ISO', moneda_decimales: 'Decimales',
  moneda_separador_decimal: 'Separador decimal', moneda_separador_miles: 'Separador de miles',
  reportes_formato: 'Formato por defecto', reportes_incluir_logo: 'Incluir logo',
  ticket_encabezado: 'Encabezado', ticket_subtitulo: 'Subtítulo', ticket_mensaje_pie: 'Mensaje al pie',
  ticket_mostrar_logo: 'Mostrar logo', ticket_mostrar_direccion: 'Mostrar dirección',
  ticket_mostrar_telefono: 'Mostrar teléfono', ticket_mostrar_rfc: 'Mostrar RFC',
  ticket_formato_fecha: 'Formato de fecha', ticket_formato_hora: 'Formato de hora',
};

const SWITCH_CAMPOS = new Set([
  'iva_activo', 'reportes_incluir_logo',
  'ticket_mostrar_logo', 'ticket_mostrar_direccion', 'ticket_mostrar_telefono', 'ticket_mostrar_rfc',
]);

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
      setMessage({ type: 'ok', text: 'Logo actualizado' });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: 'err', text: err?.response?.data?.message ?? 'Error al subir logo' });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const renderCampo = (clave: string) => {
    const value = getValue(clave);
    const id = `cfg-${clave}`;
    const label = CAMPO_LABEL[clave] ?? clave;

    if (SWITCH_CAMPOS.has(clave)) {
      return (
        <div key={clave} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0 md:col-span-2">
          <Label htmlFor={id} className="text-sm font-normal cursor-pointer">{label}</Label>
          <Switch id={id} checked={value === true} onCheckedChange={(v) => handleChange(clave, v)} />
        </div>
      );
    }

    if (clave === 'moneda_codigo') {
      return (
        <div key={clave} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Select value={String(value)} onValueChange={(v) => handleChange(clave, v)}>
            <SelectTrigger id={id}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
              <SelectItem value="USD">USD - Dólar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
              <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
              <SelectItem value="CLP">CLP - Peso Chileno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (clave === 'moneda_simbolo') {
      return (
        <div key={clave} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Select value={String(value)} onValueChange={(v) => handleChange(clave, v)}>
            <SelectTrigger id={id}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="$">$ - Peso/Dólar</SelectItem>
              <SelectItem value="€">€ - Euro</SelectItem>
              <SelectItem value="£">£ - Libra</SelectItem>
              <SelectItem value="¥">¥ - Yen</SelectItem>
              <SelectItem value="₱">₱ - Peso Filipino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (clave === 'reportes_formato') {
      return (
        <div key={clave} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Select value={String(value)} onValueChange={(v) => handleChange(clave, v)}>
            <SelectTrigger id={id}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (clave === 'moneda_separador_decimal' || clave === 'moneda_separador_miles') {
      return (
        <div key={clave} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Input id={id} value={String(value)} onChange={(e) => handleChange(clave, e.target.value)} maxLength={1} className="w-20" />
        </div>
      );
    }

    if (clave === 'ticket_formato_fecha') {
      return (
        <div key={clave} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Select value={String(value)} onValueChange={(v) => handleChange(clave, v)}>
            <SelectTrigger id={id}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (clave === 'ticket_formato_hora') {
      return (
        <div key={clave} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm">{label}</Label>
          <Select value={String(value)} onValueChange={(v) => handleChange(clave, v)}>
            <SelectTrigger id={id}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 horas (HH:mm)</SelectItem>
              <SelectItem value="12h">12 horas (hh:mm a)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    const isLong = clave.includes('encabezado') || clave.includes('subtitulo') || clave.includes('pie') || clave.includes('direccion') || clave.includes('mensaje');
    const isNumber = clave === 'iva_porcentaje' || clave === 'moneda_decimales';

    return (
      <div key={clave} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        {isLong ? (
          <Textarea id={id} value={String(value)} onChange={(e) => handleChange(clave, e.target.value)} rows={2} className="resize-none" />
        ) : (
          <Input
            id={id}
            type={isNumber ? 'number' : 'text'}
            value={String(value)}
            onChange={(e) => handleChange(clave, isNumber ? Number(e.target.value) : e.target.value)}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  const totalPending = Object.keys(pending).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon size={16} /> Logo de la empresa
          </CardTitle>
          <CardDescription>Aparece en tickets, login y reportes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg border border-border flex items-center justify-center overflow-hidden bg-muted shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon size={28} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
                {isUploadingLogo ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
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
              return renderCampo(c);
            })}
          </CardContent>
        </Card>
      ))}

      {totalPending > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background border border-border rounded-lg shadow-lg p-3">
          <span className="text-sm font-medium">{totalPending} cambio(s)</span>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-[#2e9e9b] hover:bg-[#48b9b4]">
            {isSaving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
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
    </motion.div>
  );
}

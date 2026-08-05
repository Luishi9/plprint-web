import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ConfigValue } from '@/api/configuracion.api';

const SWITCH_CAMPOS = new Set([
  'iva_activo', 'reportes_incluir_logo',
  'ticket_mostrar_logo', 'ticket_mostrar_direccion', 'ticket_mostrar_telefono', 'ticket_mostrar_rfc',
  'somos_centro_impresion',
]);

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
  somos_centro_impresion: '¿Somos centro de impresión?',
};

interface ConfigurationFieldProps {
  clave: string;
  value: ConfigValue;
  onChange: (clave: string, value: ConfigValue) => void;
}

export function ConfigurationField({ clave, value, onChange }: ConfigurationFieldProps) {
  const id = `cfg-${clave}`;
  const label = CAMPO_LABEL[clave] ?? clave;

  if (SWITCH_CAMPOS.has(clave)) {
    const boolValue = value === true || value === 'true';
    return (
      <div key={clave} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0 md:col-span-2">
        <Label htmlFor={id} className="text-sm font-normal cursor-pointer">{label}</Label>
        <Switch id={id} checked={boolValue} onCheckedChange={(v) => onChange(clave, v)} />
      </div>
    );
  }

  if (clave === 'moneda_codigo') {
    return (
      <div key={clave} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <Select value={String(value)} onValueChange={(v) => onChange(clave, v)}>
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
        <Select value={String(value)} onValueChange={(v) => onChange(clave, v)}>
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
        <Select value={String(value)} onValueChange={(v) => onChange(clave, v)}>
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
        <Input id={id} value={String(value)} onChange={(e) => onChange(clave, e.target.value)} maxLength={1} className="w-20" />
      </div>
    );
  }

  if (clave === 'ticket_formato_fecha') {
    return (
      <div key={clave} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <Select value={String(value)} onValueChange={(v) => onChange(clave, v)}>
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
        <Select value={String(value)} onValueChange={(v) => onChange(clave, v)}>
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
        <Textarea id={id} value={String(value)} onChange={(e) => onChange(clave, e.target.value)} rows={2} className="resize-none" />
      ) : (
        <Input
          id={id}
          type={isNumber ? 'number' : 'text'}
          value={String(value)}
          onChange={(e) => onChange(clave, isNumber ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}

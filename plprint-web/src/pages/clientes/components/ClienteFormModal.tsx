import { useEffect, useReducer } from 'react';
import { Icon } from '@/components/ui/Icon';
import { clientesApi } from '@/api/clientes.api';
import { Cliente } from '../ClientesPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  rfc: string;
  uso_cfdi: string;
  regimen_fiscal_receptor: string;
  domicilio_fiscal_cp: string;
  isSaving: boolean;
  errors: Record<string, string>;
}

type FormAction =
  | { type: 'set'; field: keyof Omit<FormState, 'isSaving' | 'errors'>; value: string }
  | { type: 'setSaving'; value: boolean }
  | { type: 'setErrors'; value: Record<string, string> }
  | { type: 'reset'; payload: { nombre: string; telefono: string; email: string; direccion: string; rfc: string; uso_cfdi: string; regimen_fiscal_receptor: string; domicilio_fiscal_cp: string } };

const initialForm: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  rfc: '',
  uso_cfdi: '',
  regimen_fiscal_receptor: '',
  domicilio_fiscal_cp: '',
  isSaving: false,
  errors: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'setErrors':
      return { ...state, errors: action.value };
    case 'reset':
      return {
        ...state,
        nombre: action.payload.nombre,
        telefono: action.payload.telefono,
        email: action.payload.email,
        direccion: action.payload.direccion,
        rfc: action.payload.rfc,
        uso_cfdi: action.payload.uso_cfdi,
        regimen_fiscal_receptor: action.payload.regimen_fiscal_receptor,
        domicilio_fiscal_cp: action.payload.domicilio_fiscal_cp,
        errors: {},
      };
    default:
      return state;
  }
}

export default function ClienteFormModal({ open, cliente, onClose, onSaved }: Props) {
  const isEdit = !!cliente;
  const [state, dispatch] = useReducer(formReducer, initialForm);
  const errors = state.errors;
  const isSaving = state.isSaving;

  useEffect(() => {
    if (open) {
      dispatch({
        type: 'reset',
        payload: {
          nombre: cliente?.nombre ?? '',
          telefono: cliente?.telefono ?? '',
          email: cliente?.email ?? '',
          direccion: cliente?.direccion ?? '',
          rfc: (cliente as any)?.rfc ?? '',
          uso_cfdi: (cliente as any)?.uso_cfdi ?? '',
          regimen_fiscal_receptor: (cliente as any)?.regimen_fiscal_receptor ?? '',
          domicilio_fiscal_cp: (cliente as any)?.domicilio_fiscal_cp ?? '',
        },
      });
    }
  }, [open, cliente]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!state.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = 'Correo inválido';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { dispatch({ type: 'setErrors', value: errs }); return; }
    dispatch({ type: 'setSaving', value: true });
    try {
      const payload = {
        nombre: state.nombre.trim(),
        telefono: state.telefono.trim() || undefined,
        email: state.email.trim() || undefined,
        direccion: state.direccion.trim() || undefined,
        rfc: state.rfc.trim() || undefined,
        uso_cfdi: state.uso_cfdi || undefined,
        regimen_fiscal_receptor: state.regimen_fiscal_receptor || undefined,
        domicilio_fiscal_cp: state.domicilio_fiscal_cp.trim() || undefined,
      };
      if (isEdit) {
        await clientesApi.update(cliente!.id, payload);
      } else {
        await clientesApi.create(payload);
      }
      onSaved();
    } catch (err: any) {
      dispatch({ type: 'setErrors', value: { general: err?.response?.data?.message ?? 'Error al guardar' } });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name="person" size={18} className="text-[#2e9e9b]" />
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          {errors.general && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {errors.general}
            </p>
          )}

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Nombre <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Icon name="person" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={state.nombre}
                onChange={(e) => dispatch({ type: 'set', field: 'nombre', value: e.target.value })}
                placeholder="Nombre completo del cliente"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {errors.nombre && <p className="text-xs text-red-400">{errors.nombre}</p>}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Teléfono</Label>
            <div className="relative">
              <Icon name="phone" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={state.telefono}
                onChange={(e) => dispatch({ type: 'set', field: 'telefono', value: e.target.value })}
                placeholder="Ej: 555-123-4567"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Correo electrónico</Label>
            <div className="relative">
              <Icon name="mail" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={state.email}
                onChange={(e) => dispatch({ type: 'set', field: 'email', value: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="pl-8 bg-background/50 border-border"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente-direccion" className="text-muted-foreground text-xs uppercase tracking-wider">Dirección</Label>
            <div className="relative">
              <Icon name="location_on" size={13} className="absolute left-3 top-3 text-muted-foreground" />
              <textarea
                id="cliente-direccion"
                value={state.direccion}
                onChange={(e) => dispatch({ type: 'set', field: 'direccion', value: e.target.value })}
                placeholder="Calle, colonia, ciudad…"
                rows={2}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2e9e9b]/30 resize-none"
              />
            </div>
          </div>

          {/* Separador CFDI */}
          <div className="pt-2 mt-1 border-t border-border/60">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Datos de facturación (CFDI 4.0)</p>
          </div>

          {/* RFC */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">RFC</Label>
            <div className="relative">
              <Icon name="badge" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={state.rfc}
                onChange={(e) => dispatch({ type: 'set', field: 'rfc', value: e.target.value.toUpperCase() })}
                placeholder="Ej: ABCD123456EFA"
                maxLength={39}
                className="pl-8 bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Uso CFDI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Uso CFDI</Label>
              <Select
                value={state.uso_cfdi}
                onValueChange={(v) => dispatch({ type: 'set', field: 'uso_cfdi', value: v })}
              >
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                  <SelectItem value="G02">G02 - Devoluciones, descuentos o bonificaciones</SelectItem>
                  <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                  <SelectItem value="I01">I01 - Construcciones</SelectItem>
                  <SelectItem value="I02">I02 - Mobiliario y equipo</SelectItem>
                  <SelectItem value="I03">I03 - Equipo de transporte</SelectItem>
                  <SelectItem value="I04">I04 - Equipo de cómputo</SelectItem>
                  <SelectItem value="I05">I05 - Dados, troqueles y herramental</SelectItem>
                  <SelectItem value="I06">I06 - Comunicaciones telefónicas</SelectItem>
                  <SelectItem value="I07">I07 - Comunicaciones satelitales</SelectItem>
                  <SelectItem value="I08">I08 - Otra maquinaria y equipo</SelectItem>
                  <SelectItem value="D01">D01 - Honorarios médicos</SelectItem>
                  <SelectItem value="D02">D02 - Gastos médicos por incapacidad</SelectItem>
                  <SelectItem value="D03">D03 - Gastos funerales</SelectItem>
                  <SelectItem value="D04">D04 - Donativos</SelectItem>
                  <SelectItem value="D05">D05 - Intereses reales</SelectItem>
                  <SelectItem value="D06">D06 - Aportaciones voluntarias al SAR</SelectItem>
                  <SelectItem value="D07">D07 - Primas por seguros de gastos médicos</SelectItem>
                  <SelectItem value="D08">D08 - Gastos de transportación escolar</SelectItem>
                  <SelectItem value="D09">D09 - Depósitos en cuentas de ahorro</SelectItem>
                  <SelectItem value="D10">D10 - Pagos por servicios educativos</SelectItem>
                  <SelectItem value="P01">P01 - Por definir</SelectItem>
                  <SelectItem value="CP01">CP01 - Consultoría y asesoría</SelectItem>
                  <SelectItem value="CP14">CP14 - Servicios de comunicación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Régimen fiscal receptor */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Régimen fiscal</Label>
              <Select
                value={state.regimen_fiscal_receptor}
                onValueChange={(v) => dispatch({ type: 'set', field: 'regimen_fiscal_receptor', value: v })}
              >
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="601">601 - General de Ley Personas Morales</SelectItem>
                  <SelectItem value="603">603 - Personas Morales con Fines no Lucrativos</SelectItem>
                  <SelectItem value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</SelectItem>
                  <SelectItem value="606">606 - Arrendamiento</SelectItem>
                  <SelectItem value="607">607 - Régimen de Enajenación o Adquisición de Bienes</SelectItem>
                  <SelectItem value="608">608 - Demás Ingresos</SelectItem>
                  <SelectItem value="610">610 - Residentes en el Extranjero sin Establecimiento Permanente en México</SelectItem>
                  <SelectItem value="611">611 - Ingresos por Dividendos, Sociedades y Personas Morales</SelectItem>
                  <SelectItem value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</SelectItem>
                  <SelectItem value="614">614 - Personas Físicas con Actividades Empresariales</SelectItem>
                  <SelectItem value="616">616 - Sin Obligaciones Fiscales</SelectItem>
                  <SelectItem value="621">621 - Incorporación Fiscal</SelectItem>
                  <SelectItem value="622">622 - Actividades Agrícolas, Ganaderas, Silvícolas o Pesqueras</SelectItem>
                  <SelectItem value="626">626 - Régimen de los Ingresos por Intereses</SelectItem>
                  <SelectItem value="629">629 - Régimen de Causantes Menores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CP domicilio fiscal */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">CP domicilio fiscal</Label>
            <div className="relative">
              <Icon name="location_on" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={state.domicilio_fiscal_cp}
                onChange={(e) => dispatch({ type: 'set', field: 'domicilio_fiscal_cp', value: e.target.value })}
                placeholder="Ej: 12345"
                maxLength={5}
                className="pl-8 bg-background/50 border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" className="border-border" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
            >
              {isSaving && <Icon name="progress_activity" size={14} className="animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

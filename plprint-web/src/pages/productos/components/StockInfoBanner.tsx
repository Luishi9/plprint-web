import { UseFormReturn } from 'react-hook-form';

interface StockInfoBannerProps {
  isEditing: boolean;
  tieneExistencias: boolean;
  sucursalNombre: string | undefined;
  form: UseFormReturn<any>;
}

export function StockInfoBanner({ isEditing, tieneExistencias, sucursalNombre, form }: StockInfoBannerProps) {
  if (!tieneExistencias || !form.watch('cantidadInicial')) return null;

  return (
    <div className="bg-[#2e9e9b]/10 border border-[#2e9e9b]/20 rounded-lg p-3 text-sm text-[#2e9e9b]">
      <p>
        {isEditing
          ? <>Se registrará una <strong>Entrada de {form.watch('cantidadInicial')}</strong> unidades en la sucursal <strong>{sucursalNombre || 'actual'}</strong>.</>
          : <>Se registrará una <strong>Entrada Inicial de {form.watch('cantidadInicial')}</strong> unidades en la sucursal <strong>{sucursalNombre || 'actual'}</strong>.</>}
        {form.watch('stockMinimo') ? ` Stock mínimo: ${form.watch('stockMinimo')} uds.` : ''}
      </p>
    </div>
  );
}

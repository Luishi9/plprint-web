import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { NIVELES_LABEL, NivelPrecio } from '@/api/preciosProducto.api';

export interface PrecioNivelState {
  id: number | null;
  cantidad_minima: string;
  precio: string;
}

interface PreciosVolumenSectionProps {
  preciosVolumen: Record<NivelPrecio, PrecioNivelState>;
  onChange: (nivel: NivelPrecio, field: 'cantidad_minima' | 'precio', value: string) => void;
}

export function PreciosVolumenSection({ preciosVolumen, onChange }: PreciosVolumenSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="sell" size={14} className="text-[#2e9e9b]" />
        <p className="text-sm font-medium text-foreground">Precios por volumen</p>
        <span className="text-xs text-muted-foreground">(opcional)</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Define desde qué cantidad se aplica cada precio. Déjalo vacío para no usar ese nivel.
      </p>
      <div className="space-y-2">
        {(Object.keys(preciosVolumen) as NivelPrecio[]).map((nivel) => (
          <div key={nivel} className="grid grid-cols-[140px_1fr_1fr] gap-2 items-center">
            <span className="text-xs text-muted-foreground">{NIVELES_LABEL[nivel]}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Desde</span>
              <Input
                type="number"
                min="1"
                placeholder="N"
                value={preciosVolumen[nivel].cantidad_minima}
                onChange={(e) => onChange(nivel, 'cantidad_minima', e.target.value)}
                className="bg-background font-mono h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground">u.</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={preciosVolumen[nivel].precio}
                onChange={(e) => onChange(nivel, 'precio', e.target.value)}
                className="bg-background font-mono h-8 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

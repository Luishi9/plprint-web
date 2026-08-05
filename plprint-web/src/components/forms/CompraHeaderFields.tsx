import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';

interface CompraHeaderFieldsProps {
  fecha: string;
  setFecha: (v: string) => void;
  factura: string;
  setFactura: (v: string) => void;
  notas: string;
  setNotas: (v: string) => void;
}

export function CompraHeaderFields({
  fecha, setFecha, factura, setFactura, notas, setNotas,
}: CompraHeaderFieldsProps) {
  return (
    <div className="px-6 pt-4 pb-3 grid grid-cols-3 gap-4 border-b border-border">
      <div>
        <label htmlFor="compra-fecha" className="text-sm font-medium block mb-1.5 flex items-center gap-1">
          <Icon name="calendar_today" size={14} /> Fecha de compra
        </label>
        <Input
          id="compra-fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="bg-background"
        />
      </div>
      <div>
        <label htmlFor="compra-factura" className="text-sm font-medium block mb-1.5 flex items-center gap-1">
          <Icon name="receipt" size={14} /> Factura / Ticket
        </label>
        <Input
          id="compra-factura"
          placeholder="Ej. FACT-001, TICKET-123..."
          value={factura}
          onChange={(e) => setFactura(e.target.value)}
          className="bg-background"
        />
      </div>
      <div>
        <label htmlFor="compra-notas" className="text-[14px] font-medium block mb-1 text-muted-foreground">Notas</label>
        <Input
          id="compra-notas"
          placeholder="Lote, obs..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="bg-background h-9"
        />
      </div>
    </div>
  );
}

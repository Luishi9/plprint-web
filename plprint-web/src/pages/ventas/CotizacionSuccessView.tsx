import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CotizacionSuccessViewProps {
  total: number;
  folio: string;
  money: (v: number | string) => string;
  onNueva: () => void;
  onDescargarPdf: () => void;
}

export function CotizacionSuccessView({
  total, folio, money, onNueva, onDescargarPdf,
}: CotizacionSuccessViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <m.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 flex items-center justify-center">
          <Icon name="draw" size={40} className="text-[#2e9e9b]" />
        </div>
        <h2 className="text-2xl font-bold text-white">¡Cotización guardada!</h2>
        <p className="text-muted-foreground">
          Folio: <span className="text-[#2e9e9b] font-mono font-bold">{folio}</span>
        </p>
        <p className="text-3xl font-bold text-[#2e9e9b]">{money(total)}</p>
        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          <Button
            variant="outline"
            onClick={onNueva}
            className="border-border"
          >
            Nueva cotización
          </Button>
          <Button
            onClick={onDescargarPdf}
            className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold gap-2"
          >
            <Icon name="download" size={16} />
            Descargar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/cotizaciones')}
            className="border-border"
          >
            Ver cotizaciones
          </Button>
        </div>
      </m.div>
    </div>
  );
}

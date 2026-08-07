import { m } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import QRTicketModal from './components/QRTicketModal';
import { sanitizePrintHtml } from '@/utils/sanitizePrintHtml';
import { TicketImpresion } from './components/TicketImpresion';
import { buildTicketHtml } from './components/TicketImpresion';
import { sileo } from 'sileo';
import type { TicketData } from './components/TicketImpresion';

interface VentaSuccessViewProps {
  ventaId: number;
  total: number;
  ticketData: TicketData | null;
  showQR: boolean;
  ticketRef: React.RefObject<HTMLDivElement>;
  logoSrc: string | null | undefined;
  money: (v: number | string) => string;
  setShowQR: (v: boolean) => void;
  onNueva: () => void;
}

export function VentaSuccessView({
  ventaId, total, ticketData, showQR, ticketRef, logoSrc, money,
  setShowQR, onNueva,
}: VentaSuccessViewProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    if (!ticketData) return;
    const html = sanitizePrintHtml(buildTicketHtml(ticketData, logoSrc ?? ''));
    const printWin = window.open('', '_blank', 'width=420,height=700,scrollbars=yes');
    if (!printWin) {
      sileo.info({ title: 'Permite las ventanas emergentes para imprimir.' });
      return;
    }
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    printWin.onload = () => { printWin.focus(); printWin.print(); };
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <TicketImpresion ref={ticketRef} data={ticketData} />
        <m.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#2e9e9b]/10 border border-[#2e9e9b]/30 flex items-center justify-center">
            <Icon name="check" size={40} className="text-[#2e9e9b]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">¡Venta registrada!</h2>
          <p className="text-muted-foreground">Venta #{ventaId} completada correctamente.</p>
          <p className="text-3xl font-bold text-[#2e9e9b]">{money(total)}</p>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={() => { onNueva(); }}
              className="border-border"
            >
              Nueva venta
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="border-border gap-2"
            >
              <Icon name="print" size={16} />
              Imprimir ticket
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQR(true)}
              className="border-border gap-2"
            >
              <Icon name="qr_code" size={16} />
              QR para cliente
            </Button>
            <Button
              onClick={() => navigate('/ventas')}
              className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
            >
              Ver historial
            </Button>
          </div>
        </m.div>
      </div>

      <QRTicketModal data={ticketData} open={showQR} onClose={() => setShowQR(false)} />
    </>
  );
}

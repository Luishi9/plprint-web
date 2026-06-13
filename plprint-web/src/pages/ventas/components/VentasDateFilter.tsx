import { Icon } from '@/components/ui/Icon';

interface Props {
  desde: string;
  hasta: string;
  onChange: (desde: string, hasta: string) => void;
}

export default function VentasDateFilter({ desde, hasta, onChange }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const handleHoy = () => {
    onChange(today, today);
  };

  const handleEsteMes = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    onChange(firstDay, today);
  };

  const esHoy = desde === today && hasta === today;
  const esEsteMes = (() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    return desde === firstDay && hasta === today;
  })();
  const esPersonalizado = !esHoy && !esEsteMes;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground text-xs">Fechas:</span>
      {[
        { key: 'hoy', label: 'Hoy', active: esHoy },
        { key: 'esteMes', label: 'Este mes', active: esEsteMes },
      ].map((opt) => (
        <button
          key={opt.key}
          onClick={() => {
            if (opt.key === 'hoy') handleHoy();
            else if (opt.key === 'esteMes') handleEsteMes();
          }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            opt.active
              ? 'bg-[#2e9e9b] text-black'
              : 'bg-background border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
      <div className="flex items-center gap-1 ml-1">
        <input
          type="date"
          value={desde}
          onChange={(e) => onChange(e.target.value, hasta)}
          className="bg-card border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
        />
        <span className="text-muted-foreground text-xs">—</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => onChange(desde, e.target.value)}
          className="bg-card border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2e9e9b]"
        />
      </div>
      {(esPersonalizado || (!esHoy && !esEsteMes && desde !== '')) && (
        <button
          onClick={handleHoy}
          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-[#2e9e9b] transition-colors"
          title="Restablecer a hoy"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

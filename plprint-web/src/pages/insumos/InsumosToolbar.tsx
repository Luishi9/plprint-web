import { Icon } from '@/components/ui/Icon';

interface InsumosToolbarProps {
  searchQuery: string;
  isSearching: boolean;
  onSearchChange: (v: string) => void;
  onNuevo: () => void;
  onAgregarCompra: () => void;
  onImportar?: () => void;
  onExportar?: () => void;
}

export function InsumosToolbar({
  searchQuery, isSearching, onSearchChange, onNuevo, onAgregarCompra,
  onImportar, onExportar,
}: InsumosToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
        <Icon name="inventory" className="text-[#2e9e9b]" size={32} />
        Insumos
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        Gestión de materias primas y materiales
      </p>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            placeholder="Buscar insumo..."
            aria-label="Buscar insumo"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 bg-card border-border h-10 w-full sm:w-64 focus-visible:ring-[#2e9e9b] rounded-md border"
          />
          {isSearching && (
            <Icon name="progress_activity" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e9e9b] animate-spin" size={16} />
          )}
        </div>
        {onImportar && (
          <button
            type="button"
            onClick={onImportar}
            className="h-10 px-4 border border-[#2e9e9b]/30 text-[#2e9e9b] hover:bg-[#2e9e9b]/10 whitespace-nowrap rounded-md"
          >
            <Icon name="upload_file" size={16} className="mr-2 inline" /> Importar Excel
          </button>
        )}
        {onExportar && (
          <button
            type="button"
            onClick={onExportar}
            className="h-10 px-4 border border-[#2e9e9b]/30 text-[#2e9e9b] hover:bg-[#2e9e9b]/10 whitespace-nowrap rounded-md"
          >
            <Icon name="download" size={16} className="mr-2 inline" /> Exportar catálogo
          </button>
        )}
        <button
          type="button"
          onClick={onNuevo}
          className="h-10 px-4 bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold shadow-[0_0_15px_rgba(153,255,61,0.2)] whitespace-nowrap rounded-md"
        >
          <Icon name="add" className="mr-1.5 inline" size={16} />
          Nuevo insumo
        </button>
        <button
          type="button"
          onClick={onAgregarCompra}
          className="h-10 px-4 whitespace-nowrap rounded-md border border-border"
        >
          <Icon name="shopping_cart" size={16} className="mr-2 inline" /> Agregar Compra
        </button>
      </div>
    </div>
  );
}

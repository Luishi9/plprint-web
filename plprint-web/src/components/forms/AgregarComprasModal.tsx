import { useEffect, useMemo, useRef, useState, useReducer } from 'react';
import { Icon } from '@/components/ui/Icon';

import { comprasApi } from '@/api/compras.api';
import { insumosApi } from '@/api/insumos.api';
import { proveedoresApi } from '@/api/proveedores.api';
import { Button } from '@/components/ui/button';
import { useMoney } from '@/hooks/useMoney';
import { useAuthStore } from '@/store/authStore';
import { useSucursalStore } from '@/store/sucursalStore';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ComprasTable } from './ComprasTable';
import { CompraHeaderFields } from './CompraHeaderFields';
import { CompraItemForm } from './CompraItemForm';

interface ItemCompra {
  insumo_id: number;
  insumo_nombre: string;
  insumo_unidad: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  proveedor_id: number;
  proveedor_nombre: string;
  notas: string;
}

interface FormState {
  fecha: string;
  factura: string;
  notas: string;
  items: ItemCompra[];
  insumoSearch: string;
  insumoId: number;
  cantidad: string;
  precioUnitario: string;
  proveedorId: number;
  isSaving: boolean;
  formError: string;
}

const initialForm: FormState = {
  fecha: '',
  factura: '',
  notas: '',
  items: [],
  insumoSearch: '',
  insumoId: 0,
  cantidad: '1',
  precioUnitario: '0',
  proveedorId: 0,
  isSaving: false,
  formError: '',
};

type FormAction =
  | { type: 'set'; field: 'fecha' | 'factura' | 'notas' | 'insumoSearch' | 'cantidad' | 'precioUnitario' | 'insumoId' | 'proveedorId' | 'formError'; value: string | number }
  | { type: 'setSaving'; value: boolean }
  | { type: 'addItem'; item: ItemCompra }
  | { type: 'removeItem'; index: number }
  | { type: 'selectInsumo'; id: number; nombre: string; precioCompra: string }
  | { type: 'resetItemForm' }
  | { type: 'resetAll'; fecha: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value } as FormState;
    case 'setSaving':
      return { ...state, isSaving: action.value };
    case 'addItem':
      return { ...state, items: [...state.items, action.item], formError: '' };
    case 'removeItem':
      return { ...state, items: state.items.filter((_, i) => i !== action.index) };
    case 'selectInsumo':
      return {
        ...state,
        insumoId: action.id,
        insumoSearch: action.nombre,
        precioUnitario: action.precioCompra,
      };
    case 'resetItemForm':
      return {
        ...state,
        insumoSearch: '',
        insumoId: 0,
        cantidad: '1',
        precioUnitario: '0',
        proveedorId: 0,
        notas: '',
      };
    case 'resetAll':
      return {
        ...initialForm,
        fecha: action.fecha,
      };
    default:
      return state;
  }
}

interface AgregarComprasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function todayStr() {
  const d = new Date();
  return d.getFullYear()
    + '-' + String(d.getMonth() + 1).padStart(2, '0')
    + '-' + String(d.getDate()).padStart(2, '0');
}

export default function AgregarComprasModal({ open, onOpenChange, onSuccess }: AgregarComprasModalProps) {
  const { simbolo, format: money } = useMoney();
  const usuario = useAuthStore((s) => s.usuario);
  const sucursalActual = useSucursalStore((s) => s.sucursalActiva);

  const [insumos, setInsumos] = useState<Array<{ id: number; nombre: string; unidad_medida: string; precio_compra?: number | string | null }>>([]);
  const [proveedores, setProveedores] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const [form, dispatch] = useReducer(formReducer, initialForm);
  const {
    fecha, factura, notas, items,
    insumoSearch, insumoId, cantidad, precioUnitario, proveedorId,
    isSaving, formError,
  } = form;

  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredInsumos = useMemo(
    () => insumos.filter((i) =>
      !insumoSearch || i.nombre.toLowerCase().includes(insumoSearch.toLowerCase())
    ),
    [insumos, insumoSearch],
  );

  const granTotal = useMemo(
    () => items.reduce((acc, it) => acc + it.total, 0),
    [items],
  );

  useEffect(() => {
    if (!open) return;
    setLoadingCatalogos(true);
    dispatch({ type: 'resetAll', fecha: todayStr() });

    Promise.all([
      insumosApi.getAll({ page: 1, limit: 200, sucursalId: sucursalActual?.id }),
      proveedoresApi.getAll({ page: 1, limit: 200 }),
    ])
      .then(([insumosRes, provRes]) => {
        setInsumos((insumosRes.data as { data: typeof insumos }).data || []);
        setProveedores((provRes.data as { data: typeof proveedores }).data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingCatalogos(false));
  }, [open]);

  const resetItemForm = () => {
    dispatch({ type: 'resetItemForm' });
    searchRef.current?.focus();
  };

  const handleAddItem = () => {
    if (!insumoId) { dispatch({ type: 'set', field: 'formError', value: 'Selecciona un insumo.' }); return; }
    const c = Number(cantidad);
    if (!c || c <= 0) { dispatch({ type: 'set', field: 'formError', value: 'La cantidad debe ser mayor a 0.' }); return; }
    const p = Number(precioUnitario);
    if (p < 0) { dispatch({ type: 'set', field: 'formError', value: 'El precio no puede ser negativo.' }); return; }

    const ins = insumos.find((i) => i.id === insumoId);
    const prov = proveedores.find((pr) => pr.id === proveedorId);
    const item: ItemCompra = {
      insumo_id: insumoId,
      insumo_nombre: ins?.nombre || '',
      insumo_unidad: ins?.unidad_medida || '',
      cantidad: c,
      precio_unitario: p,
      total: Number((c * p).toFixed(2)),
      proveedor_id: proveedorId,
      proveedor_nombre: prov?.nombre || '',
      notas: notas.trim(),
    };
    dispatch({ type: 'addItem', item });
    resetItemForm();
  };

  const handleRemoveItem = (idx: number) => {
    dispatch({ type: 'removeItem', index: idx });
  };

  const handleSubmit = async () => {
    if (items.length === 0) { dispatch({ type: 'set', field: 'formError', value: 'Agrega al menos un insumo.' }); return; }
    if (!sucursalActual?.id) { dispatch({ type: 'set', field: 'formError', value: 'No hay sucursal seleccionada.' }); return; }

    try {
      dispatch({ type: 'setSaving', value: true });
      await comprasApi.createBatch({
        items: items.map((it) => ({
          insumo_id: it.insumo_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          ...(it.proveedor_id && { proveedor_id: it.proveedor_id }),
          ...(it.notas && { notas: it.notas }),
        })),
        sucursal_id: sucursalActual.id,
        ...(factura.trim() && { factura: factura.trim() }),
        ...(fecha && { fecha }),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      dispatch({ type: 'set', field: 'formError', value: err.response?.data?.message || 'Error al registrar las compras.' });
    } finally {
      dispatch({ type: 'setSaving', value: false });
    }
  };

  const selectInsumo = (id: number) => {
    const ins = insumos.find((i) => i.id === id);
    dispatch({
      type: 'selectInsumo',
      id,
      nombre: ins?.nombre || '',
      precioCompra: ins?.precio_compra?.toString() || '0',
    });
    setShowDropdown(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-[90vw] min-h-[85vh] overflow-y-auto bg-card border-border flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-[#2e9e9b] text-xl font-bold flex items-center gap-2">
            <Icon name="shopping_cart" size={20} /> Agregar Compras de Insumos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registra múltiples insumos en un solo lote. Todos se guardarán juntos.
          </DialogDescription>
        </DialogHeader>

        {loadingCatalogos ? (
          <div className="py-16 flex items-center justify-center">
            <Icon name="hourglass_top" size={32} className="animate-spin text-[#2e9e9b]" />
          </div>
        ) : (
          <div className="flex flex-col min-h-0 flex-1">
            {/* HEADER FIELDS: Fecha + Factura */}
            <CompraHeaderFields
              fecha={fecha}
              setFecha={(v) => dispatch({ type: 'set', field: 'fecha', value: v })}
              factura={factura}
              setFactura={(v) => dispatch({ type: 'set', field: 'factura', value: v })}
              notas={notas}
              setNotas={(v) => dispatch({ type: 'set', field: 'notas', value: v })}
            />

            {/* ADD ITEM FORM */}
            <CompraItemForm
              insumoSearch={insumoSearch}
              setInsumoSearch={(v) => dispatch({ type: 'set', field: 'insumoSearch', value: v })}
              searchRef={searchRef}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              filteredInsumos={filteredInsumos as never}
              selectInsumo={selectInsumo}
              insumoId={insumoId}
              cantidad={cantidad}
              setCantidad={(v) => dispatch({ type: 'set', field: 'cantidad', value: v })}
              precioUnitario={precioUnitario}
              setPrecioUnitario={(v) => dispatch({ type: 'set', field: 'precioUnitario', value: v })}
              simbolo={simbolo}
              proveedorId={proveedorId}
              setProveedorId={(v) => dispatch({ type: 'set', field: 'proveedorId', value: Number(v) })}
              proveedores={proveedores}
              isSaving={isSaving}
              onAdd={handleAddItem}
            />

            {/* ITEMS TABLE */}
            <div className="flex-1 overflow-auto px-6 py-3 min-h-0">
              <ComprasTable
                items={items}
                granTotal={granTotal}
                simbolo={simbolo}
                money={money as never}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* ERROR */}
            {formError && (
              <p className="px-6 text-red-400 text-xs pb-2">{formError}</p>
            )}

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-border gap-2 flex justify-end items-center">
              {usuario && sucursalActual && (
                <span className="text-[14px] text-muted-foreground mr-auto">
                  {usuario.nombre} • {sucursalActual.nombre} • {items.length} insumo(s)
                </span>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                <Icon name="close" size={14} className="mr-1" /> Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || items.length === 0}
                className="bg-[#2e9e9b] hover:bg-[#48b9b4] text-black font-semibold"
              >
                {isSaving
                  ? <Icon name="hourglass_top" size={14} className="mr-1 animate-spin" />
                  : <Icon name="check" size={14} className="mr-1" />}
                Guardar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

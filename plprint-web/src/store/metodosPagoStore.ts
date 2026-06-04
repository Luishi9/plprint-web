import { create } from 'zustand';
import { metodosPagoApi, MetodoPago } from '@/api/metodosPago.api';

interface MetodosPagoState {
  data: MetodoPago[];
  byNombre: Record<string, MetodoPago>;
  byId: Record<number, MetodoPago>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetch: (force?: boolean) => Promise<void>;
  getByNombre: (nombre: string) => MetodoPago | undefined;
  getById: (id: number) => MetodoPago | undefined;
}

const indexar = (data: MetodoPago[]) => {
  const byNombre: Record<string, MetodoPago> = {};
  const byId: Record<number, MetodoPago> = {};
  for (const m of data) {
    byNombre[m.nombre.toLowerCase()] = m;
    byId[m.id] = m;
  }
  return { byNombre, byId };
};

export const useMetodosPagoStore = create<MetodosPagoState>((set, get) => ({
  data: [],
  byNombre: {},
  byId: {},
  isLoaded: false,
  isLoading: false,
  error: null,

  fetch: async (force = false) => {
    if (get().isLoading) return;
    if (get().isLoaded && !force) return;
    set({ isLoading: true, error: null });
    try {
      const res = await metodosPagoApi.getAll();
      const data = res.data?.data ?? [];
      const { byNombre, byId } = indexar(data);
      set({ data, byNombre, byId, isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error al cargar métodos de pago', isLoading: false });
    }
  },

  getByNombre: (nombre) => get().byNombre[nombre?.toLowerCase()],
  getById: (id) => get().byId[id],
}));

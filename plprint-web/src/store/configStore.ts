import { create } from 'zustand';
import { configuracionApi, ConfigAll, ConfigValue } from '@/api/configuracion.api';

interface ConfigState {
  data: ConfigAll;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  get: (clave: string) => ConfigValue | undefined;
  getStr: (clave: string) => string;
  getNum: (clave: string) => number;
  getBool: (clave: string) => boolean;
}

const findByClave = (data: ConfigAll, clave: string): ConfigValue | undefined => {
  const grupo = clave.split('_')[0];
  // First try the expected group
  if (data[grupo]?.[clave] !== undefined) {
    return data[grupo]?.[clave];
  }
  // Fallback: search all groups for the clave
  for (const g of Object.keys(data)) {
    if (data[g]?.[clave] !== undefined) {
      return data[g]?.[clave];
    }
  }
  return undefined;
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  data: {},
  isLoaded: false,
  isLoading: false,
  error: null,

  fetch: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const res = await configuracionApi.getAll();
      set({ data: res.data.data, isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error al cargar configuración', isLoading: false });
    }
  },

  get: (clave) => findByClave(get().data, clave),

  getStr: (clave) => {
    const v = findByClave(get().data, clave);
    return v == null ? '' : String(v);
  },

  getNum: (clave) => {
    const v = findByClave(get().data, clave);
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v !== '') return Number(v);
    return 0;
  },

  getBool: (clave) => {
    const v = findByClave(get().data, clave);
    if (v === true) return true;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    return false;
  },
}));

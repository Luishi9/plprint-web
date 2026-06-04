import { apiClient } from './client';

export type ConfigValue = string | number | boolean;
export type ConfigGroup = Record<string, ConfigValue>;
export type ConfigAll = Record<string, ConfigGroup>;

export interface ConfigUpdate {
  clave: string;
  valor: string | number | boolean;
}

export const configuracionApi = {
  getAll: () => apiClient.get<{ data: ConfigAll }>('/configuracion'),
  getByGrupo: (grupo: string) =>
    apiClient.get<{ data: ConfigGroup }>(`/configuracion/${grupo}`),
  updateBatch: (updates: ConfigUpdate[]) =>
    apiClient.put('/configuracion', { updates }),
  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    return apiClient.post('/configuracion/logo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

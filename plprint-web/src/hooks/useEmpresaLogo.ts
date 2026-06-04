import { useMemo } from 'react';
import { useConfigStore } from '@/store/configStore';
import logoImage from '@/assets/logo.png';

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/v1\/?$/, '');

export function useEmpresaLogo() {
  const url = useConfigStore((s) => s.getStr('empresa_logo_url'));

  return useMemo(() => {
    if (!url) return { src: logoImage, isCustom: false };
    if (url.startsWith('http://') || url.startsWith('https://')) return { src: url, isCustom: true };
    if (url.startsWith('data:')) return { src: url, isCustom: true };
    if (url.startsWith('/uploads/')) {
      const sep = BACKEND_ORIGIN ? '/' : '';
      return { src: `${BACKEND_ORIGIN}${sep}${url}`, isCustom: true };
    }
    return { src: url, isCustom: true };
  }, [url]);
}

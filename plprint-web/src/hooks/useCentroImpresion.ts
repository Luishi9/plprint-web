import { useConfigStore } from '@/store/configStore';

export function useCentroImpresion() {
  const esCentroImpresion = useConfigStore((s) => s.getBool('somos_centro_impresion'));
  return { esCentroImpresion };
}

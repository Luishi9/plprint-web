import { useConfigStore } from '@/store/configStore';

export function useMoney() {
  const simbolo = useConfigStore((s) => s.getStr('moneda_simbolo')) || '$';
  const codigo = useConfigStore((s) => s.getStr('moneda_codigo')) || 'MXN';
  const decimales = useConfigStore((s) => s.getNum('moneda_decimales'));
  const sepDecimal = useConfigStore((s) => s.getStr('moneda_separador_decimal')) || '.';
  const sepMiles = useConfigStore((s) => s.getStr('moneda_separador_miles')) || ',';

  const format = (value: number): string => {
    const safe = Number.isFinite(value) ? value : 0;
    const [intPart, decPart] = safe.toFixed(decimales).split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sepMiles);
    const formatted = decimales > 0 ? `${intFormatted}${sepDecimal}${decPart}` : intFormatted;
    return `${simbolo}${formatted}`;
  };

  return { simbolo, codigo, decimales, sepDecimal, sepMiles, format };
}

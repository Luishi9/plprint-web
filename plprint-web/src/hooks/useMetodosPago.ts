import { useEffect, useMemo } from 'react';
import { useMetodosPagoStore } from '@/store/metodosPagoStore';
import type { MetodoPago } from '@/api/metodosPago.api';

const ICON_MAP: Record<string, string> = {
  efectivo: 'payments',
  cash: 'payments',
  banknote: 'payments',
  tarjeta: 'credit_card',
  card: 'credit_card',
  credito: 'credit_card',
  debito: 'credit_card',
  transferencia: 'account_balance',
  transfer: 'account_balance',
  billetera: 'account_balance_wallet',
  wallet: 'account_balance_wallet',
  crypto: 'currency_bitcoin',
  bitcoin: 'currency_bitcoin',
  movil: 'smartphone',
  mobile: 'smartphone',
};

const resolveIcon = (icono: string | null | undefined, nombre: string): string => {
  const key = (icono || nombre || '').toLowerCase();
  return ICON_MAP[key] ?? 'paid';
};

const fallbackLabel = (raw: string): string => {
  if (!raw) return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export function useMetodosPago() {
  const data = useMetodosPagoStore((s) => s.data);
  const byNombre = useMetodosPagoStore((s) => s.byNombre);
  const isLoaded = useMetodosPagoStore((s) => s.isLoaded);
  const isLoading = useMetodosPagoStore((s) => s.isLoading);
  const error = useMetodosPagoStore((s) => s.error);
  const fetch = useMetodosPagoStore((s) => s.fetch);

  useEffect(() => {
    if (!isLoaded && !isLoading) fetch();
  }, [isLoaded, isLoading, fetch]);

  const activos = useMemo(
    () => data.filter((m) => m.activo).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [data],
  );

  const getByNombre = (nombre: string): MetodoPago | undefined =>
    byNombre[nombre?.toLowerCase()];

  const getLabel = (raw: string): string => {
    if (!raw) return '';
    const m = getByNombre(raw);
    return m?.nombre ?? fallbackLabel(raw);
  };

  const getIcon = (raw: string): string => {
    if (!raw) return 'paid';
    const m = getByNombre(raw);
    return resolveIcon(m?.icono, m?.nombre ?? raw);
  };

  return {
    metodos: data,
    activos,
    isLoaded,
    isLoading,
    error,
    fetch,
    getByNombre,
    getLabel,
    getIcon,
  };
}

import { useEffect, useMemo } from 'react';
import {
  Banknote, CreditCard, Landmark, Wallet, Bitcoin, Smartphone, CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';
import { useMetodosPagoStore } from '@/store/metodosPagoStore';
import type { MetodoPago } from '@/api/metodosPago.api';

const ICON_MAP: Record<string, LucideIcon> = {
  efectivo: Banknote,
  cash: Banknote,
  banknote: Banknote,
  tarjeta: CreditCard,
  card: CreditCard,
  credito: CreditCard,
  debito: CreditCard,
  transferencia: Landmark,
  transfer: Landmark,
  billetera: Wallet,
  wallet: Wallet,
  crypto: Bitcoin,
  bitcoin: Bitcoin,
  movil: Smartphone,
  mobile: Smartphone,
};

const resolveIcon = (icono: string | null | undefined, nombre: string): LucideIcon => {
  const key = (icono || nombre || '').toLowerCase();
  return ICON_MAP[key] ?? CircleDollarSign;
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

  const getIcon = (raw: string): LucideIcon => {
    if (!raw) return CircleDollarSign;
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

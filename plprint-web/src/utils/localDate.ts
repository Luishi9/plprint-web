// Helpers de fecha/hora en zona horaria America/Mexico_City.
// Toda la UI del sistema se renderiza en hora de Ciudad de Mexico para evitar
// inconsistencias cuando el navegador del usuario o el servidor estan en otra TZ.

const TIME_ZONE = 'America/Mexico_City';

const YMD_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const SHORT_DATE_FMT = new Intl.DateTimeFormat('es-MX', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const FULL_DATETIME_FMT = new Intl.DateTimeFormat('es-MX', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const SHORT_DATETIME_FMT = new Intl.DateTimeFormat('es-MX', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Devuelve "YYYY-MM-DD" en hora de Ciudad de Mexico. */
export function todayLocal(): string {
  return YMD_FMT.format(new Date());
}

/** Devuelve "YYYY-MM-DD" del primer dia del mes actual en hora de Ciudad de Mexico. */
export function firstDayOfCurrentMonthLocal(): string {
  const now = new Date();
  const month = now.toLocaleString('en-US', { timeZone: TIME_ZONE, month: '2-digit' });
  const year = now.toLocaleString('en-US', { timeZone: TIME_ZONE, year: 'numeric' });
  return `${year}-${month}-01`;
}

/** Devuelve "YYYY-MM-DD" en hora de Ciudad de Mexico para la fecha dada (string ISO o Date). */
export function toYmd(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return YMD_FMT.format(date);
}

/** Formato corto "29 jul 2026" en hora local. */
export function formatLocalDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return SHORT_DATE_FMT.format(date);
}

/** Formato completo "29 jul 2026, 18:00" en hora local. */
export function formatLocalDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return FULL_DATETIME_FMT.format(date);
}

/** Formato corto "29 jul, 18:00" en hora local. */
export function formatLocalShortDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return SHORT_DATETIME_FMT.format(date);
}

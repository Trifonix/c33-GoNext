import i18n from '@/src/i18n';

function getLocale(): 'ru-RU' | 'en-US' {
  return i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'ru-RU';
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(getLocale(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  try {
    return new Date(iso.includes('T') ? iso : `${iso}T00:00:00`).toLocaleDateString(getLocale(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isoToDate(iso: string | null): Date | null {
  if (!iso) {
    return null;
  }
  const parsed = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) {
    return i18n.t('date.notSpecified');
  }
  if (start && end) {
    return `${formatDate(start)} — ${formatDate(end)}`;
  }
  return start
    ? i18n.t('date.from', { date: formatDate(start) })
    : i18n.t('date.until', { date: formatDate(end) });
}

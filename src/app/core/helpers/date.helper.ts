const ONE_MINUTE = 60_000;
const ONE_HOUR = 3_600_000;
const ONE_DAY = 86_400_000;
const ONE_WEEK = 604_800_000;

export const formatTime = (iso: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatRelative = (iso: string | null): string => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();

  if (diff < ONE_MINUTE) return 'just now';
  if (diff < ONE_HOUR) return `${Math.floor(diff / ONE_MINUTE)}m ago`;
  if (diff < ONE_DAY) return `${Math.floor(diff / ONE_HOUR)}h ago`;
  if (diff < ONE_WEEK) return `${Math.floor(diff / ONE_DAY)}d ago`;
  return formatDate(iso);
};

// i18n-aware relative formatter. Caller passes a translator bound to the
// `chat` namespace; keys live under `time.*`.
export const formatRelativeI18n = (
  iso: string | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();

  if (diff < ONE_MINUTE) return t('time.justNow');
  if (diff < ONE_HOUR)
    return t('time.minutesAgo', { count: Math.floor(diff / ONE_MINUTE) });
  if (diff < ONE_DAY)
    return t('time.hoursAgo', { count: Math.floor(diff / ONE_HOUR) });
  if (diff < ONE_WEEK)
    return t('time.daysAgo', { count: Math.floor(diff / ONE_DAY) });
  return formatDate(iso);
};

export const isSameDay = (isoA: string, isoB: string): boolean => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

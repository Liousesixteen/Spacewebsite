interface DateTimeParts {
  date: string;
  time: string;
  full: string;
}

export function formatLaunchDateTime(
  value: string | Date,
  locale: string,
  timeZone?: string
) {
  return getDateTimeParts(value, locale, timeZone).full;
}

export function formatLaunchWindow(
  start: string | Date,
  end: string | Date | null | undefined,
  locale: string,
  timeZone?: string
) {
  if (!end || new Date(start).getTime() === new Date(end).getTime()) return null;

  const startParts = getDateTimeParts(start, locale, timeZone);
  const endParts = getDateTimeParts(end, locale, timeZone);

  return startParts.date === endParts.date
    ? `${startParts.full}–${endParts.time}`
    : `${startParts.full}–${endParts.full}`;
}

export function isTentativeLaunchTime(rawStatus?: string | null) {
  const status = rawStatus?.trim().toLowerCase();
  if (!status) return false;

  return (
    status.includes('to be determined') ||
    status.includes('to be confirmed') ||
    /\btbd\b/.test(status) ||
    /\btbc\b/.test(status) ||
    status.includes('待定') ||
    status.includes('待确认')
  );
}

function getDateTimeParts(
  value: string | Date,
  locale: string,
  timeZone?: string
): DateTimeParts {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  });
  const parts = formatter.formatToParts(new Date(value));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || '';
  const date = `${read('year')}-${read('month')}-${read('day')}`;
  const time = `${read('hour')}:${read('minute')}`;

  return { date, time, full: `${date} ${time}` };
}

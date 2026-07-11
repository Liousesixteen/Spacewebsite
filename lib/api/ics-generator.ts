/**
 * ICS (iCalendar) generator — pure logic.
 *
 * Produces RFC 5545-compliant calendar files for launch events.
 * Framework-agnostic: no Next.js, React, or Prisma imports.
 */

export interface IcsEventInput {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  startDate: Date;
  endDate?: Date | null;
  categories?: string[];
}

/**
 * Escape special characters for ICS text values.
 */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Format a Date to ICS datetime format (YYYYMMDDTHHmmssZ).
 */
function formatIcsDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

/**
 * Generate a VCALENDAR string for a single launch event.
 */
export function generateSingleEventIcs(event: IcsEventInput): string {
  const now = formatIcsDate(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SpaceData//Launch Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatIcsDate(event.startDate)}`,
  ];

  if (event.endDate) {
    lines.push(`DTEND:${formatIcsDate(event.endDate)}`);
  } else {
    // Default to 2-hour duration if no end date
    const defaultEnd = new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);
    lines.push(`DTEND:${formatIcsDate(defaultEnd)}`);
  }

  lines.push(`DTSTAMP:${now}`);
  lines.push(`UID:${event.uid}`);
  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  if (event.categories && event.categories.length > 0) {
    lines.push(`CATEGORIES:${event.categories.map(escapeIcsText).join(',')}`);
  }

  // 30-minute reminder alarm
  lines.push('BEGIN:VALARM');
  lines.push('TRIGGER:-PT30M');
  lines.push('ACTION:DISPLAY');
  lines.push(`DESCRIPTION:${escapeIcsText(`即将发射: ${event.title}`)}`);
  lines.push('END:VALARM');

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Generate a VCALENDAR string for multiple launch events.
 */
export function generateCalendarIcs(events: IcsEventInput[]): string {
  const now = formatIcsDate(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SpaceData//Launch Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`DTSTART:${formatIcsDate(event.startDate)}`);

    if (event.endDate) {
      lines.push(`DTEND:${formatIcsDate(event.endDate)}`);
    }

    lines.push(`DTSTAMP:${now}`);
    lines.push(`UID:${event.uid}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }

    if (event.url) {
      lines.push(`URL:${event.url}`);
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

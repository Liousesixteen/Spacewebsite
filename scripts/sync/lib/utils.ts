/**
 * Shared sync utilities.
 */

import { LaunchStatus, RocketStatus, AstronautStatus, LaunchSiteStatus, SpacecraftStatus } from '@prisma/client';

/** Slugify an arbitrary string into a stable id-safe slug. */
export function slugify(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Map LL2 launch status to our LaunchStatus enum.
 * LL2 status names: "Go", "TBD", "Success", "Failure", "Hold", "In Flight",
 * "Partial Failure", "TBC", "Launch Successful", "Launch Failure", etc.
 */
export function mapLaunchStatus(ll2Status: string | null | undefined): LaunchStatus {
  if (!ll2Status) return LaunchStatus.PLANNED;
  const s = ll2Status.toLowerCase();
  if (s.includes('success')) return LaunchStatus.SUCCESS;
  if (s.includes('failure')) return LaunchStatus.FAILURE;
  if (s.includes('flight')) return LaunchStatus.IN_FLIGHT;
  if (s.includes('hold') || s.includes('postpone') || s.includes('partial')) return LaunchStatus.POSTPONED;
  return LaunchStatus.PLANNED;
}

/** Map LL2 launcher status to our RocketStatus enum. */
export function mapRocketStatus(ll2Status: string | null | undefined): RocketStatus {
  if (!ll2Status) return RocketStatus.IN_DEVELOPMENT;
  const s = ll2Status.toLowerCase();
  if (s.includes('active')) return RocketStatus.ACTIVE;
  if (s.includes('retired')) return RocketStatus.RETIRED;
  return RocketStatus.IN_DEVELOPMENT;
}

/** Map LL2 astronaut status to our AstronautStatus enum. */
export function mapAstronautStatus(ll2Status: string | null | undefined): AstronautStatus {
  if (!ll2Status) return AstronautStatus.ACTIVE;
  const s = ll2Status.toLowerCase();
  if (s.includes('lost') || s.includes('deceased') || s.includes('died')) return AstronautStatus.DECEASED;
  if (s.includes('retired')) return AstronautStatus.RETIRED;
  return AstronautStatus.ACTIVE;
}

/** Map LL2 pad status to our LaunchSiteStatus enum. */
export function mapLaunchSiteStatus(ll2Status: string | null | undefined): LaunchSiteStatus {
  if (!ll2Status) return LaunchSiteStatus.ACTIVE;
  const s = ll2Status.toLowerCase();
  if (s.includes('active')) return LaunchSiteStatus.ACTIVE;
  if (s.includes('construction')) return LaunchSiteStatus.UNDER_CONSTRUCTION;
  return LaunchSiteStatus.INACTIVE;
}

/** Map LL2 spacecraft status to our SpacecraftStatus enum. */
export function mapSpacecraftStatus(ll2Status: string | null | undefined): SpacecraftStatus {
  if (!ll2Status) return SpacecraftStatus.OPERATIONAL;
  const s = ll2Status.toLowerCase();
  if (s.includes('lost') || s.includes('destroyed')) return SpacecraftStatus.LOST;
  if (s.includes('retired') || s.includes('inactive')) return SpacecraftStatus.RETIRED;
  return SpacecraftStatus.OPERATIONAL;
}

/** Parse an ISO date string. Returns null if invalid. */
export function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Parse "Xd Yh Zm" duration strings (LL2 astronaut total time in space) to minutes.
 * Examples: "365d 2h 30m" -> 525870, "10h" -> 600, "" -> 0.
 */
export function parseDurationToMinutes(text: string | null | undefined): number {
  if (!text) return 0;
  let total = 0;
  const dayMatch = text.match(/(\d+)\s*d/);
  const hourMatch = text.match(/(\d+)\s*h/);
  const minMatch = text.match(/(\d+)\s*m(?!s)/);
  if (dayMatch) total += parseInt(dayMatch[1], 10) * 24 * 60;
  if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) total += parseInt(minMatch[1], 10);
  return total;
}

/** Quietly trim and fall back to a default for description fields. */
export function descOrEmpty(...candidates: Array<string | null | undefined>): string {
  for (const c of candidates) {
    if (c && c.trim()) return c.trim();
  }
  return '';
}

/** Pick a non-null number from candidates. */
export function num(...candidates: Array<number | null | undefined>): number | null {
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }
  return null;
}

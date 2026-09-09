/**
 * Sync astronauts from Launch Library 2 `/astronaut` endpoint.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { runTrackedSync } from './lib/sync-run';
import { mapAstronautStatus, parseDate, parseDurationToMinutes, slugify, descOrEmpty } from './lib/utils';

interface LL2NestedRef {
  name?: string | null;
  abbrev?: string | null;
}

interface LL2Astronaut {
  id: number;
  name?: string | null;
  status?: LL2NestedRef | null;
  agency?: LL2NestedRef | null;
  type?: LL2NestedRef | null;
  date_of_birth?: string | null;
  date_of_death?: string | null;
  nationality?: string | LL2NestedRef[] | null;
  bio?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  wiki?: string | null;
  profile_image?: string | null;
  flights_count?: number | null;
  spacewalks_count?: number | null;
  time_in_space?: string | null;
}

function nationalityName(n: LL2Astronaut['nationality']): string {
  if (!n) return '';
  if (typeof n === 'string') return n;
  if (Array.isArray(n) && n.length > 0) {
    return n[0]?.name || n[0]?.abbrev || '';
  }
  return '';
}

export async function syncAstronauts(): Promise<{ added: number; updated: number; skipped: number }> {
  return runTrackedSync('Launch Library 2: Astronauts', syncAstronautsImpl);
}

async function syncAstronautsImpl(): Promise<{ added: number; updated: number; skipped: number }> {
  console.log('[astronauts] Fetching astronauts from LL2...');
  const astronauts = await fetchLL2List<LL2Astronaut>('/astronaut/', { limit: 100, mode: 'detailed' }, 1000);
  console.log(`[astronauts] Got ${astronauts.length} astronauts`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const a of astronauts) {
    const name = a.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }
    const id = `ll2-${slugify(name)}`;
    if (id === 'll2-') {
      skipped++;
      continue;
    }

    const birthDate = parseDate(a.date_of_birth);
    if (!birthDate) {
      // birthDate is required (non-nullable in schema). Skip records without it.
      skipped++;
      continue;
    }

    const socialLinks: Record<string, string> = {};
    if (a.twitter) socialLinks.twitter = a.twitter;
    if (a.instagram) socialLinks.instagram = a.instagram;
    if (a.wiki) socialLinks.wikipedia = a.wiki;

    const data = {
      name,
      nationality: nationalityName(a.nationality) || 'Unknown',
      agency: a.agency?.abbrev || a.agency?.name || 'Independent',
      birthDate,
      status: mapAstronautStatus(a.status?.name),
      spaceFlights: a.flights_count ?? 0,
      totalTimeInSpace: parseDurationToMinutes(a.time_in_space),
      bio: descOrEmpty(a.bio, name),
      photo: a.profile_image || null,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : Prisma.JsonNull,
    };

    try {
      const existing = await prisma.astronaut.findUnique({ where: { id } });
      await prisma.astronaut.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      if (existing) updated++;
      else added++;
    } catch (e) {
      console.error(`[astronauts] Failed to upsert ${name}:`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`[astronauts] Done. added=${added} updated=${updated} skipped=${skipped}`);
  return { added, updated, skipped };
}

if (require.main === module) {
  syncAstronauts()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

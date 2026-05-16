/**
 * Sync spacecraft from Launch Library 2 `/spacecraft` endpoint.
 *
 * LL2 spacecraft entities tend to be sparse, so we apply sensible defaults.
 */

import { SpacecraftType } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { mapSpacecraftStatus, parseDate, slugify, descOrEmpty, num } from './lib/utils';

interface LL2NestedRef {
  name?: string | null;
  abbrev?: string | null;
}

interface LL2SpacecraftConfig {
  id?: number;
  name?: string | null;
  type?: LL2NestedRef | null;
  agency?: LL2NestedRef | null;
  in_use?: boolean;
  capability?: string | null;
  history?: string | null;
  details?: string | null;
  maiden_flight?: string | null;
  height?: number | null;
  diameter?: number | null;
  human_rated?: boolean;
  crew_capacity?: number | null;
  payload_capacity?: number | null;
  flight_life?: string | null;
  image_url?: string | null;
}

interface LL2Spacecraft {
  id: number;
  name?: string | null;
  serial_number?: string | null;
  status?: LL2NestedRef | null;
  description?: string | null;
  spacecraft_config?: LL2SpacecraftConfig | null;
}

function mapType(typeName: string | null | undefined, crewed: boolean): SpacecraftType {
  const t = (typeName || '').toLowerCase();
  if (t.includes('station')) return SpacecraftType.SPACE_STATION;
  if (t.includes('satellite')) return SpacecraftType.SATELLITE;
  if (t.includes('probe') || t.includes('lander') || t.includes('rover')) return SpacecraftType.PROBE;
  if (t.includes('cargo') || t.includes('resupply')) return SpacecraftType.CARGO_SPACECRAFT;
  if (crewed || t.includes('crewed') || t.includes('manned') || t.includes('capsule')) return SpacecraftType.CREWED_SPACECRAFT;
  return SpacecraftType.SATELLITE;
}

export async function syncSpacecraft(): Promise<{ added: number; updated: number; skipped: number }> {
  console.log('[spacecraft] Fetching spacecraft from LL2...');
  const list = await fetchLL2List<LL2Spacecraft>('/spacecraft/', { limit: 100, mode: 'detailed' }, 200);
  console.log(`[spacecraft] Got ${list.length} spacecraft`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const sc of list) {
    const cfg = sc.spacecraft_config;
    const baseName = sc.name || cfg?.name;
    if (!baseName) {
      skipped++;
      continue;
    }
    const id = `ll2-${slugify(baseName)}`;
    if (id === 'll2-') {
      skipped++;
      continue;
    }

    const launchDate = parseDate(cfg?.maiden_flight) || new Date();
    const crewed = (cfg?.human_rated ?? false) || (cfg?.crew_capacity ?? 0) > 0;
    const type = mapType(cfg?.type?.name, crewed);

    const heightVal = num(cfg?.height) ?? 0;
    const diameterVal = num(cfg?.diameter) ?? 0;
    const dimensions = heightVal && diameterVal ? `${heightVal}m × ${diameterVal}m` : 'N/A';

    const data = {
      name: baseName,
      type,
      operator: cfg?.agency?.abbrev || cfg?.agency?.name || 'Unknown',
      launchDate,
      status: mapSpacecraftStatus(sc.status?.name),
      orbitType: 'LEO',
      orbitAltitude: null,
      orbitInclination: null,
      orbitPeriod: null,
      mass: num(cfg?.payload_capacity) ?? 0,
      dimensions,
      mission: descOrEmpty(cfg?.capability, sc.description, baseName),
      description: descOrEmpty(cfg?.details, cfg?.history, sc.description, baseName),
      images: [cfg?.image_url].filter((u): u is string => Boolean(u)),
    };

    try {
      const existing = await prisma.spacecraft.findUnique({ where: { id } });
      await prisma.spacecraft.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      if (existing) updated++;
      else added++;
    } catch (e) {
      console.error(`[spacecraft] Failed to upsert ${baseName}:`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`[spacecraft] Done. added=${added} updated=${updated} skipped=${skipped}`);
  return { added, updated, skipped };
}

if (require.main === module) {
  syncSpacecraft()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

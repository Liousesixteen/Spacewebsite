/**
 * Sync launches from Launch Library 2 (upcoming + previous), enriched with
 * SpaceX API data (YouTube URLs etc.).
 *
 * Resolves rocketId / launchSiteId by upserting placeholder rows when the
 * referenced rocket or launch site is not already in the database.
 */

import { LaunchStatus, RocketStatus, LaunchSiteStatus } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { fetchSpaceX } from './lib/spacex-client';
import { mapLaunchStatus, parseDate, slugify, descOrEmpty } from './lib/utils';

interface LL2NestedRef {
  name?: string | null;
  abbrev?: string | null;
}

interface LL2LaunchPad {
  id?: number;
  name?: string | null;
  location?: {
    name?: string | null;
    country_code?: string | null;
    description?: string | null;
  } | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

interface LL2Mission {
  name?: string | null;
  description?: string | null;
  type?: string | null;
  orbit?: LL2NestedRef | null;
}

interface LL2Rocket {
  configuration?: {
    id?: number;
    name?: string | null;
    full_name?: string | null;
    manufacturer?: { name?: string | null; country_code?: string | null } | null;
  } | null;
}

interface LL2VidUrl {
  url?: string | null;
  title?: string | null;
  source?: string | null;
}

interface LL2Launch {
  id: string;
  name?: string | null;
  net?: string | null;
  status?: LL2NestedRef | null;
  mission?: LL2Mission | null;
  rocket?: LL2Rocket | null;
  pad?: LL2LaunchPad | null;
  image?: string | null;
  infographic?: string | null;
  vidURLs?: LL2VidUrl[];
  launch_service_provider?: LL2NestedRef | null;
}

interface SpaceXLaunch {
  id: string;
  name?: string;
  flight_number?: number;
  links?: {
    youtube_id?: string | null;
    webcast?: string | null;
    article?: string | null;
    wikipedia?: string | null;
  };
}

async function resolveRocketId(rocketName: string, manufacturer: string, country: string): Promise<string | null> {
  if (!rocketName) return null;
  const id = `ll2-${slugify(rocketName)}`;
  if (id === 'll2-') return null;
  const existing = await prisma.rocket.findUnique({ where: { id } });
  if (existing) return existing.id;

  // Also try matching an existing rocket by name (e.g. seeded data).
  const byName = await prisma.rocket.findFirst({ where: { name: rocketName } });
  if (byName) return byName.id;

  // Create a placeholder so the launch foreign key is satisfied.
  await prisma.rocket.create({
    data: {
      id,
      name: rocketName,
      manufacturer: manufacturer || 'Unknown',
      country: country || 'UNK',
      height: 0,
      diameter: 0,
      mass: 0,
      payloadToLEO: 0,
      payloadToGTO: 0,
      stages: 2,
      firstFlight: null,
      status: RocketStatus.ACTIVE,
      successRate: 0,
      description: rocketName,
      images: [],
    },
  });
  return id;
}

async function resolveLaunchSiteId(pad: LL2LaunchPad | null | undefined): Promise<string | null> {
  const locName = pad?.location?.name;
  if (!locName) return null;
  const id = `ll2-${slugify(locName)}`;
  if (id === 'll2-') return null;
  const existing = await prisma.launchSite.findUnique({ where: { id } });
  if (existing) return existing.id;

  const byName = await prisma.launchSite.findFirst({ where: { name: locName } });
  if (byName) return byName.id;

  const parts = locName.split(',').map((p) => p.trim());
  const country = pad?.location?.country_code || parts[parts.length - 1] || 'UNK';
  const region = parts.length > 1 ? parts[parts.length - 2] : '';
  const lat = typeof pad?.latitude === 'number' ? pad.latitude : Number(pad?.latitude || 0);
  const lng = typeof pad?.longitude === 'number' ? pad.longitude : Number(pad?.longitude || 0);

  await prisma.launchSite.create({
    data: {
      id,
      name: locName,
      country,
      region,
      latitude: Number.isFinite(lat) ? lat : 0,
      longitude: Number.isFinite(lng) ? lng : 0,
      operator: 'Various',
      status: LaunchSiteStatus.ACTIVE,
      pads: pad?.name ? [{ name: pad.name }] : [],
      description: pad?.location?.description || locName,
    },
  });
  return id;
}

export async function syncLaunches(): Promise<{ added: number; updated: number; skipped: number }> {
  console.log('[launches] Fetching upcoming launches from LL2...');
  const upcoming = await fetchLL2List<LL2Launch>(
    '/launch/upcoming/',
    { limit: 100, mode: 'detailed' },
    100
  );
  console.log('[launches] Fetching previous launches from LL2...');
  const previous = await fetchLL2List<LL2Launch>(
    '/launch/previous/',
    { limit: 100, mode: 'detailed', ordering: '-net' },
    500
  );
  const all = [...upcoming, ...previous];
  console.log(`[launches] Got ${all.length} launches total (upcoming=${upcoming.length}, previous=${previous.length})`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const l of all) {
    const name = l.name?.trim();
    const date = parseDate(l.net);
    if (!name || !date) {
      skipped++;
      continue;
    }

    const cfg = l.rocket?.configuration;
    const rocketName = cfg?.full_name || cfg?.name || '';
    const manufacturer = cfg?.manufacturer?.name || l.launch_service_provider?.name || 'Unknown';
    const country = cfg?.manufacturer?.country_code || 'UNK';

    let rocketId: string | null = null;
    let launchSiteId: string | null = null;
    try {
      rocketId = await resolveRocketId(rocketName, manufacturer, country);
      launchSiteId = await resolveLaunchSiteId(l.pad);
    } catch (e) {
      console.error(`[launches] Failed to resolve refs for ${name}:`, (e as Error).message);
    }

    if (!rocketId || !launchSiteId) {
      skipped++;
      continue;
    }

    const externalId = `ll2-${l.id}`;
    const status = mapLaunchStatus(l.status?.name);

    // We default IN_FLIGHT/PLANNED to PLANNED for upcoming events without
    // explicit status; the mapping already handles that.
    const videoUrl = l.vidURLs?.find((v) => v.url)?.url || null;
    const images = [l.image, l.infographic].filter((u): u is string => Boolean(u));

    const data = {
      name,
      date,
      status: status as LaunchStatus,
      missionDescription: descOrEmpty(l.mission?.description, name),
      payloads: l.mission ? { mission: l.mission.name, type: l.mission.type, orbit: l.mission.orbit?.name } : {},
      videoUrl,
      images,
      externalId,
      rocketId,
      launchSiteId,
    };

    try {
      const existing = await prisma.launch.findUnique({ where: { externalId } });
      if (existing) {
        await prisma.launch.update({ where: { externalId }, data });
        updated++;
      } else {
        await prisma.launch.create({ data });
        added++;
      }
    } catch (e) {
      console.error(`[launches] Failed to upsert ${name}:`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`[launches] Initial sync done. added=${added} updated=${updated} skipped=${skipped}`);

  // Enrich SpaceX launches with YouTube URLs.
  try {
    console.log('[launches] Enriching SpaceX launches with YouTube URLs...');
    const spacexLaunches = await fetchSpaceX<SpaceXLaunch[]>('/launches');
    let enriched = 0;
    for (const sx of spacexLaunches) {
      if (!sx.links?.webcast && !sx.links?.youtube_id) continue;
      const url = sx.links.webcast || `https://www.youtube.com/watch?v=${sx.links.youtube_id}`;
      // Attempt to find the matching launch by SpaceX flight number / name.
      const match = await prisma.launch.findFirst({
        where: { name: { contains: sx.name || '', mode: 'insensitive' }, videoUrl: null },
      });
      if (match) {
        await prisma.launch.update({ where: { id: match.id }, data: { videoUrl: url } });
        enriched++;
      }
    }
    console.log(`[launches] Enriched ${enriched} launches with SpaceX video URLs`);
  } catch (e) {
    console.warn(`[launches] SpaceX enrichment skipped: ${(e as Error).message}`);
  }

  return { added, updated, skipped };
}

if (require.main === module) {
  syncLaunches()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

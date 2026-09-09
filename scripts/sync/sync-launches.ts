/**
 * Sync launches from Launch Library 2 (upcoming + previous), enriched with
 * SpaceX API data (YouTube URLs etc.).
 *
 * Resolves rocketId / launchSiteId by upserting placeholder rows when the
 * referenced rocket or launch site is not already in the database.
 */

import { LaunchStatus, RocketStatus } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { fetchSpaceX } from './lib/spacex-client';
import { mapLimit, memoizeAsync } from './lib/cache';
import { notifyFailureStreak } from './lib/sync-run';
import {
  mapCountryCode,
  mapLaunchSiteStatus,
  mapLaunchStatus,
  parseDate,
  slugify,
  descOrEmpty,
} from './lib/utils';

interface LL2NestedRef {
  id?: number | string | null;
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
  map_url?: string | null;
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
  window_start?: string | null;
  window_end?: string | null;
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

interface RocketRef {
  rocketName: string;
  manufacturer: string;
  country: string;
}

interface LaunchPadRef {
  pad: LL2LaunchPad | null | undefined;
  launchSiteId: string;
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
      country: mapCountryCode(country),
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
  const country = mapCountryCode(pad?.location?.country_code || parts[parts.length - 1] || 'UNK');
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
      status: mapLaunchSiteStatus('active'),
      pads: pad?.name ? [{ name: pad.name }] : [],
      description: pad?.location?.description || locName,
    },
  });
  return id;
}

async function resolveAgencyId(provider: LL2NestedRef | null | undefined): Promise<string | null> {
  const name = provider?.name?.trim();
  if (!name) return null;
  const externalId = provider?.id ? `ll2-agency-${provider?.id}` : `ll2-agency-${slugify(name)}`;
  if (externalId.endsWith('-')) return null;

  const existing = await prisma.agency.findFirst({
    where: {
      OR: [{ externalId }, { name }],
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  // Try to infer country from the provider name or abbreviation.
  let country = 'Unknown';
  if (name.includes('CNSA') || name.includes('China') || name.includes('CASC')) country = 'China';
  else if (name.includes('NASA') || name.includes('SpaceX') || name.includes('ULA')) country = 'USA';
  else if (name.includes('Roscosmos') || name.includes('Russian')) country = 'Russia';
  else if (name.includes('JAXA') || name.includes('Japan')) country = 'Japan';
  else if (name.includes('ISRO') || name.includes('India')) country = 'India';
  else if (name.includes('ESA') || name.includes('Arianespace')) country = 'Europe';
  else if (name.includes('Korea') || name.includes('KARI')) country = 'South Korea';

  const created = await prisma.agency.create({
    data: {
      id: externalId,
      name,
      abbrev: provider?.abbrev || null,
      country,
      externalId,
      source: 'Launch Library 2',
      lastSyncedAt: new Date(),
    },
    select: { id: true },
  });
  return created.id;
}

async function resolveLaunchPadId(
  pad: LL2LaunchPad | null | undefined,
  launchSiteId: string
): Promise<string | null> {
  const name = pad?.name?.trim();
  if (!name) return null;
  const externalId = pad?.id ? `ll2-pad-${pad?.id}` : `ll2-pad-${slugify(name)}`;
  if (externalId.endsWith('-')) return null;

  const locName = pad?.location?.name || '';
  const parts = locName.split(',').map((p) => p.trim()).filter(Boolean);
  const country = mapCountryCode(pad?.location?.country_code || parts[parts.length - 1]);
  const region = parts.length > 1 ? parts[parts.length - 2] : null;
  const lat = typeof pad?.latitude === 'number' ? pad.latitude : Number(pad?.latitude || NaN);
  const lng = typeof pad?.longitude === 'number' ? pad.longitude : Number(pad?.longitude || NaN);

  const launchPad = await prisma.launchPad.upsert({
    where: { externalId },
    create: {
      id: externalId,
      name,
      country,
      region,
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      status: mapLaunchSiteStatus('active'),
      mapUrl: pad?.map_url || null,
      launchSiteId,
      externalId,
      source: 'Launch Library 2',
      lastSyncedAt: new Date(),
    },
    update: {
      name,
      country,
      region,
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      mapUrl: pad?.map_url || null,
      launchSiteId,
      source: 'Launch Library 2',
      lastSyncedAt: new Date(),
    },
    select: { id: true },
  });

  return launchPad.id;
}

export async function syncLaunches(): Promise<{ added: number; updated: number; skipped: number }> {
  const syncRunId = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const syncVersion = '2.3.0';

  // Create a sync run record
  let syncRun: { id: string } | null = null;
  try {
    syncRun = await prisma.syncRun.create({
      data: {
        id: syncRunId,
        source: 'Launch Library 2: Launches',
        status: 'FETCHING',
        version: syncVersion,
      },
      select: { id: true },
    });
  } catch (e) {
    console.warn('[launches] Could not create SyncRun record:', (e as Error).message);
  }

  const updateSyncStatus = async (status: string, error?: string) => {
    if (!syncRun) return;
    try {
      await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status,
          completedAt: status === 'SUCCEEDED' || status === 'FAILED' || status === 'PARTIAL' ? new Date() : undefined,
          error: error || undefined,
        },
      });
    } catch {
      // best-effort
    }
  };

  try {
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

  const externalIds = all.map((launch) => `ll2-${launch.id}`);
  const existingLaunches = await prisma.launch.findMany({
    where: { externalId: { in: externalIds } },
    select: { id: true, externalId: true, date: true, status: true },
  });
  const existingLaunchMap = new Map(
    existingLaunches
      .filter((l): l is { id: string; externalId: string; date: Date; status: LaunchStatus } => Boolean(l.externalId))
      .map((l) => [l.externalId, l])
  );

  await updateSyncStatus('NORMALIZING');

  const getRocketId = memoizeAsync(
    (ref: RocketRef) => resolveRocketId(ref.rocketName, ref.manufacturer, ref.country),
    (ref) => `${ref.rocketName}|${ref.manufacturer}|${ref.country}`
  );
  const getLaunchSiteId = memoizeAsync(
    resolveLaunchSiteId,
    (pad) => pad?.location?.name || ''
  );
  const getAgencyId = memoizeAsync(
    resolveAgencyId,
    (provider) => String(provider?.id || provider?.name || '')
  );
const getLaunchPadId = memoizeAsync(
    (ref: LaunchPadRef) => resolveLaunchPadId(ref.pad, ref.launchSiteId),
    (ref) => `${ref.pad?.id || ref.pad?.name || ''}|${ref.launchSiteId}`
  );

  let added = 0;
  let updated = 0;
  let skipped = 0;

  await mapLimit(all, 4, async (l, index) => {
    const name = l.name?.trim();
    const date = parseDate(l.net);
    if (!name || !date) {
      skipped++;
      return;
    }

    const cfg = l.rocket?.configuration;
    const rocketName = cfg?.full_name || cfg?.name || '';
    const manufacturer = cfg?.manufacturer?.name || l.launch_service_provider?.name || 'Unknown';
    const country = cfg?.manufacturer?.country_code || 'UNK';

    let rocketId: string | null = null;
    let launchSiteId: string | null = null;
    let agencyId: string | null = null;
    let launchPadId: string | null = null;
    try {
      rocketId = await getRocketId({ rocketName, manufacturer, country });
      launchSiteId = await getLaunchSiteId(l.pad);
      agencyId = await getAgencyId(l.launch_service_provider);
      if (launchSiteId) {
        launchPadId = await getLaunchPadId({ pad: l.pad, launchSiteId });
      }
    } catch (e) {
      console.error(`[launches] Failed to resolve refs for ${name}:`, (e as Error).message);
    }

    if (!rocketId || !launchSiteId) {
      skipped++;
      return;
    }

    const externalId = `ll2-${l.id}`;
    const status = mapLaunchStatus(l.status?.name);

    // We default IN_FLIGHT/PLANNED to PLANNED for upcoming events without
    // explicit status; the mapping already handles that.
    const videoUrl = l.vidURLs?.find((v) => v.url)?.url || null;
    const images = [l.image, l.infographic].filter((u): u is string => Boolean(u));
    const missionName = l.mission?.name?.trim() || null;
    const missionType = l.mission?.type?.trim() || null;
    const orbitName = l.mission?.orbit?.name?.trim() || null;
    const orbitAbbrev = l.mission?.orbit?.abbrev?.trim() || null;
    const now = new Date();

    const data = {
      name,
      date,
      status: status as LaunchStatus,
      missionDescription: descOrEmpty(l.mission?.description, name),
      missionName,
      missionType,
      orbitName,
      orbitAbbrev,
      windowStart: parseDate(l.window_start),
      windowEnd: parseDate(l.window_end),
      slug: slugify(name),
      payloads: l.mission ? { mission: missionName, type: missionType, orbit: orbitName } : {},
      videoUrl,
      webcastUrl: videoUrl,
      images,
      externalId,
      source: 'Launch Library 2',
      sourceUrl: `https://ll.thespacedevs.com/2.3.0/launch/${l.id}/`,
      lastSyncedAt: now,
      rawStatus: l.status?.name || null,
      rocketId,
      launchSiteId,
      agencyId,
      launchPadId,
    };

    try {
      // Detect changes before upsert
      const existing = existingLaunchMap.get(externalId);
      const isUpdate = Boolean(existing);

      const launch = await prisma.launch.upsert({
        where: { externalId },
        create: data,
        update: data,
        select: { id: true },
      });

      // Record change events for status and date changes
      if (existing) {
        const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
        const newStatus = String(status);
        const oldStatus = String(existing.status);
        if (newStatus !== oldStatus) {
          changes.push({ field: 'status', oldValue: oldStatus, newValue: newStatus });
        }
        const newDate = date.toISOString();
        const oldDate = existing.date.toISOString();
        if (newDate !== oldDate) {
          changes.push({ field: 'date', oldValue: oldDate, newValue: newDate });
        }
        for (const change of changes) {
          try {
            await prisma.changeEvent.create({
              data: {
                entityType: 'Launch',
                entityId: launch.id,
                field: change.field,
                oldValue: change.oldValue,
                newValue: change.newValue,
                source: 'Launch Library 2',
              },
            });
          } catch {
            // best-effort change tracking
          }
        }
      }

      await prisma.payload.deleteMany({ where: { launchId: launch.id, source: 'Launch Library 2' } });
      if (missionName) {
        await prisma.payload.create({
          data: {
            name: missionName,
            type: missionType,
            orbit: orbitName || orbitAbbrev,
            launchId: launch.id,
            externalId: `ll2-payload-${l.id}`,
            source: 'Launch Library 2',
            lastSyncedAt: now,
          },
        });
      }
      await prisma.dataSourceRecord.upsert({
        where: {
          source_entityType_externalId: {
            source: 'Launch Library 2',
            entityType: 'Launch',
            externalId,
          },
        },
        create: {
          source: 'Launch Library 2',
          entityType: 'Launch',
          externalId,
          internalId: launch.id,
          lastSyncedAt: now,
          status: 'ok',
          message: l.status?.name || null,
        },
        update: {
          internalId: launch.id,
          lastSyncedAt: now,
          status: 'ok',
          message: l.status?.name || null,
        },
      });

      if (isUpdate) updated++;
      else added++;
    } catch (e) {
      console.error(`[launches] Failed to upsert ${name}:`, (e as Error).message);
      skipped++;
    }
    if ((index + 1) % 50 === 0) {
      console.log(`[launches]   processed ${index + 1}/${all.length}`);
    }
  });

  console.log(`[launches] Initial sync done. added=${added} updated=${updated} skipped=${skipped}`);

  await updateSyncStatus('ENRICHING');

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
        await prisma.launch.update({
          where: { id: match.id },
          data: {
            videoUrl: url,
            webcastUrl: url,
            articleUrl: sx.links.article || null,
            wikiUrl: sx.links.wikipedia || null,
          },
        });
        enriched++;
      }
    }
    console.log(`[launches] Enriched ${enriched} launches with SpaceX video URLs`);
  } catch (e) {
    console.warn(`[launches] SpaceX enrichment skipped: ${(e as Error).message}`);
  }

  // Update SyncRun with final stats
  if (syncRun) {
    try {
      await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: skipped > 0 && added === 0 && updated === 0 ? 'PARTIAL' : 'SUCCEEDED',
          completedAt: new Date(),
          recordsAdded: added,
          recordsUpdated: updated,
          recordsSkipped: skipped,
        },
      });
    } catch {
      // best-effort
    }
  }

    return { added, updated, skipped };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateSyncStatus('FAILED', message);
    await notifyFailureStreak('Launch Library 2: Launches', message);
    console.error('[launches] Sync failed:', message);
    throw error;
  }
}

if (require.main === module) {
  syncLaunches()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

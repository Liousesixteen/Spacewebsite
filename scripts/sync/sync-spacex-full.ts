/**
 * Sync all SpaceX historical launches from the SpaceX API v4.
 * No rate limits, no auth required.
 * Covers all SpaceX launches from Falcon 1 through Starship.
 */

import { LaunchStatus } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';

const SPACEX_BASE = 'https://api.spacexdata.com/v4';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function mapStatus(success: boolean | null, upcoming: boolean): LaunchStatus {
  if (upcoming) return LaunchStatus.PLANNED;
  if (success === true) return LaunchStatus.SUCCESS;
  if (success === false) return LaunchStatus.FAILURE;
  return LaunchStatus.PLANNED;
}

interface SpaceXLaunch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  details: string | null;
  rocket: string;        // rocket ID
  launchpad: string;     // launchpad ID
  links: {
    webcast: string | null;
    youtube_id: string | null;
    article: string | null;
    wikipedia: string | null;
    patch: { small: string | null; large: string | null };
  };
  payloads: string[];
  cores: { core: string | null; reused: boolean | null; landing_success: boolean | null }[];
  flight_number: number;
  failures: { time: number; altitude: number | null; reason: string }[];
}

interface SpaceXRocket { id: string; name: string; company: string; country: string; height: { meters: number }; diameter: { meters: number }; mass: { kg: number }; payload_weights: { lb: number; kg: number; id: string }[]; stages: number; first_flight: string; success_rate_pct: number; description: string; flickr_images: string[]; active: boolean; }
interface SpaceXLaunchpad { id: string; name: string; full_name: string; locality: string; region: string; latitude: number; longitude: number; details: string; status: string; }

async function fetchSpacex<T>(path: string): Promise<T> {
  const res = await fetch(`${SPACEX_BASE}${path}`, {
    headers: { 'User-Agent': 'SpaceWebsite/1.0' }
  });
  if (!res.ok) throw new Error(`SpaceX API error: ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  console.log('[spacex] Fetching SpaceX data...');

  const [launches, rockets, launchpads] = await Promise.all([
    fetchSpacex<SpaceXLaunch[]>('/launches'),
    fetchSpacex<SpaceXRocket[]>('/rockets'),
    fetchSpacex<SpaceXLaunchpad[]>('/launchpads'),
  ]);

  console.log(`[spacex] Got ${launches.length} launches, ${rockets.length} rockets, ${launchpads.length} launchpads`);

  // Upsert rockets
  let rocketAdded = 0, rocketUpdated = 0;
  const rocketIdMap = new Map<string, string>(); // spacex rocket id → our db id

  for (const r of rockets) {
    const id = `spacex-${r.id}`;
    rocketIdMap.set(r.id, id);
    const leoPayload = r.payload_weights?.find(p => p.id === 'leo')?.kg ?? 0;
    const gtoPayload = r.payload_weights?.find(p => p.id === 'gto')?.kg ?? 0;
    const data = {
      name: r.name,
      manufacturer: 'SpaceX',
      country: 'USA',
      height: r.height?.meters ?? 0,
      diameter: r.diameter?.meters ?? 0,
      mass: (r.mass?.kg ?? 0) / 1000, // kg → tonnes
      payloadToLEO: leoPayload / 1000,
      payloadToGTO: gtoPayload / 1000,
      stages: r.stages ?? 2,
      firstFlight: r.first_flight ? new Date(r.first_flight) : null,
      status: r.active ? 'ACTIVE' as const : 'RETIRED' as const,
      successRate: r.success_rate_pct ?? 0,
      description: r.description ?? '',
      images: r.flickr_images ?? [],
    };
    const existing = await prisma.rocket.findUnique({ where: { id } });
    if (existing) {
      await prisma.rocket.update({ where: { id }, data });
      rocketUpdated++;
    } else {
      // Also check by name
      const byName = await prisma.rocket.findFirst({ where: { name: r.name } });
      if (byName) {
        rocketIdMap.set(r.id, byName.id);
        rocketUpdated++;
      } else {
        await prisma.rocket.create({ data: { id, ...data } });
        rocketAdded++;
      }
    }
  }
  console.log(`[spacex] Rockets: added=${rocketAdded} updated=${rocketUpdated}`);

  // Upsert launchpads
  let padAdded = 0, padUpdated = 0;
  const padIdMap = new Map<string, string>();

  for (const p of launchpads) {
    const id = `spacex-pad-${p.id}`;
    padIdMap.set(p.id, id);
    const data = {
      name: p.full_name || p.name,
      country: 'USA',
      region: p.region ?? p.locality ?? '',
      latitude: p.latitude ?? 0,
      longitude: p.longitude ?? 0,
      operator: 'SpaceX',
      status: p.status === 'active' ? 'ACTIVE' as const : 'INACTIVE' as const,
      pads: [{ name: p.name }],
      description: p.details ?? p.full_name ?? p.name,
    };
    const existing = await prisma.launchSite.findUnique({ where: { id } });
    if (existing) {
      await prisma.launchSite.update({ where: { id }, data });
      padUpdated++;
    } else {
      const byName = await prisma.launchSite.findFirst({ where: { name: data.name } });
      if (byName) {
        padIdMap.set(p.id, byName.id);
        padUpdated++;
      } else {
        await prisma.launchSite.create({ data: { id, ...data } });
        padAdded++;
      }
    }
  }
  console.log(`[spacex] Launchpads: added=${padAdded} updated=${padUpdated}`);

  // Upsert launches
  let added = 0, updated = 0, skipped = 0;

  for (const l of launches) {
    const externalId = `spacex-${l.id}`;
    const date = new Date(l.date_utc);
    if (Number.isNaN(date.getTime())) { skipped++; continue; }

    const rocketDbId = rocketIdMap.get(l.rocket);
    const padDbId = padIdMap.get(l.launchpad);
    if (!rocketDbId || !padDbId) { skipped++; continue; }

    const images: string[] = [];
    if (l.links?.patch?.small) images.push(l.links.patch.small);
    if (l.links?.patch?.large) images.push(l.links.patch.large);

    const videoUrl = l.links?.webcast
      || (l.links?.youtube_id ? `https://www.youtube.com/watch?v=${l.links.youtube_id}` : null);

    const missionDescription = l.details
      || `SpaceX ${l.name} (Flight ${l.flight_number})`
      + (l.failures?.length ? ` Failure reason: ${l.failures.map(f => f.reason).join('; ')}` : '');

    const payloads = l.payloads?.length
      ? [{ count: l.payloads.length, type: 'payload', ids: l.payloads }]
      : [];

    const data = {
      name: l.name,
      date,
      status: mapStatus(l.success, l.upcoming),
      missionDescription,
      payloads,
      videoUrl: videoUrl ?? null,
      images,
      externalId,
      rocketId: rocketDbId,
      launchSiteId: padDbId,
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
      console.warn(`[spacex] Failed ${l.name}: ${(e as Error).message.slice(0, 80)}`);
      skipped++;
    }
  }

  console.log(`[spacex] Launches: added=${added} updated=${updated} skipped=${skipped}`);
  console.log('[spacex] All done!');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Sync launch sites from Launch Library 2 `/pad` endpoint.
 * Pads are grouped by their parent location (e.g. "Cape Canaveral, FL, USA").
 */

import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { mapLaunchSiteStatus, slugify, descOrEmpty } from './lib/utils';

interface LL2Location {
  id?: number | null;
  name?: string | null;
  country_code?: string | null;
  description?: string | null;
  map_image?: string | null;
}

interface LL2Pad {
  id: number;
  name?: string | null;
  description?: string | null;
  location?: LL2Location | null;
  country_code?: string | null;
  map_url?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  agency_id?: number | null;
  total_launch_count?: number | null;
}

interface PadSummary {
  ll2Id: number;
  name: string;
  status: string;
  launches: number;
}

interface SiteAccumulator {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  description: string;
  pads: PadSummary[];
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function syncLaunchSites(): Promise<{ added: number; updated: number; skipped: number }> {
  console.log('[launch-sites] Fetching pads from LL2...');
  const pads = await fetchLL2List<LL2Pad>('/pad/', { limit: 100, mode: 'detailed' }, 200);
  console.log(`[launch-sites] Got ${pads.length} pads`);

  const sites = new Map<string, SiteAccumulator>();
  for (const pad of pads) {
    const loc = pad.location;
    if (!loc?.name) continue;
    const name = loc.name;
    const id = `ll2-${slugify(name)}`;
    if (!id || id === 'll2-') continue;

    const lat = num(pad.latitude);
    const lng = num(pad.longitude);

    let site = sites.get(id);
    if (!site) {
      // Parse country/region from "City, Region, Country" or fall back to country_code
      const parts = name.split(',').map((p) => p.trim());
      const country = loc.country_code || parts[parts.length - 1] || 'UNK';
      const region = parts.length > 1 ? parts[parts.length - 2] : '';
      site = {
        id,
        name,
        country,
        region,
        latitude: lat ?? 0,
        longitude: lng ?? 0,
        description: descOrEmpty(loc.description, name),
        pads: [],
      };
      sites.set(id, site);
    } else if (site.latitude === 0 && lat !== null) {
      site.latitude = lat;
      site.longitude = lng ?? 0;
    }

    site.pads.push({
      ll2Id: pad.id,
      name: pad.name || `Pad ${pad.id}`,
      status: 'ACTIVE',
      launches: pad.total_launch_count ?? 0,
    });
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const site of sites.values()) {
    const data = {
      name: site.name,
      country: site.country,
      region: site.region,
      latitude: site.latitude,
      longitude: site.longitude,
      operator: 'Various',
      status: mapLaunchSiteStatus('active'),
      pads: site.pads,
      description: site.description,
    };
    try {
      const existing = await prisma.launchSite.findUnique({ where: { id: site.id } });
      await prisma.launchSite.upsert({
        where: { id: site.id },
        create: { id: site.id, ...data },
        update: data,
      });
      if (existing) updated++;
      else added++;
    } catch (e) {
      console.error(`[launch-sites] Failed to upsert ${site.name}:`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`[launch-sites] Done. added=${added} updated=${updated} skipped=${skipped}`);
  return { added, updated, skipped };
}

if (require.main === module) {
  syncLaunchSites()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

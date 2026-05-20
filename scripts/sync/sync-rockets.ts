/**
 * Sync rockets from Launch Library 2 `/launcher` endpoint.
 */

import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { mapRocketStatus, parseDate, slugify, descOrEmpty, num } from './lib/utils';

interface LL2Agency {
  name?: string | null;
  abbrev?: string | null;
  country_code?: string | null;
  type?: string | null;
}

interface LL2Launcher {
  id: number;
  name?: string | null;
  full_name?: string | null;
  description?: string | null;
  variant?: string | null;
  family?: string | null;
  alias?: string | null;
  active?: boolean;
  manufacturer?: LL2Agency | null;
  maiden_flight?: string | null;
  length?: number | null;
  diameter?: number | null;
  launch_mass?: number | null;
  leo_capacity?: number | null;
  gto_capacity?: number | null;
  to_thrust?: number | null;
  apogee?: number | null;
  total_launch_count?: number | null;
  successful_launches?: number | null;
  failed_launches?: number | null;
  consecutive_successful_launches?: number | null;
  image_url?: string | null;
  image?: { image_url?: string | null } | null;
  info_url?: string | null;
}

export async function syncRockets(): Promise<{ added: number; updated: number; skipped: number }> {
  console.log('[rockets] Fetching launcher_config list from LL2...');
  // /config/launcher/ returns rocket configurations (e.g. Falcon 9), which is
  // what we want. /launcher/ returns individual hardware (specific boosters).
  const launchers = await fetchLL2List<LL2Launcher>('/config/launcher/', { limit: 100, mode: 'detailed' }, 500);
  console.log(`[rockets] Got ${launchers.length} launcher configs`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const l of launchers) {
    const name = l.full_name || l.name;
    if (!name) {
      skipped++;
      continue;
    }
    const id = `ll2-${slugify(name)}`;
    if (!id || id === 'll2-') {
      skipped++;
      continue;
    }

    const manufacturerName = l.manufacturer?.name || l.manufacturer?.abbrev || 'Unknown';
    const country = l.manufacturer?.country_code || 'UNK';
    const status = l.active === false ? mapRocketStatus('retired') : mapRocketStatus('active');

    const total = l.total_launch_count ?? 0;
    const success = l.successful_launches ?? 0;
    const successRate = total > 0 ? (success / total) * 100 : 0;

    const data = {
      name,
      manufacturer: manufacturerName,
      country,
      height: num(l.length) ?? 0,
      diameter: num(l.diameter) ?? 0,
      mass: num(l.launch_mass) ?? 0,
      payloadToLEO: num(l.leo_capacity) ?? 0,
      payloadToGTO: num(l.gto_capacity) ?? 0,
      stages: 2,
      firstFlight: parseDate(l.maiden_flight),
      status,
      successRate,
      description: descOrEmpty(l.description, l.alias, name),
      images: [l.image_url, l.image?.image_url].filter((u): u is string => Boolean(u)),
    };

    try {
      const existing = await prisma.rocket.findUnique({ where: { id } });
      await prisma.rocket.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      if (existing) updated++;
      else added++;
    } catch (e) {
      console.error(`[rockets] Failed to upsert ${name}:`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`[rockets] Done. added=${added} updated=${updated} skipped=${skipped}`);
  return { added, updated, skipped };
}

if (require.main === module) {
  syncRockets()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

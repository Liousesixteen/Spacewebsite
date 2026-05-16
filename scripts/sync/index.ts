/**
 * Master sync orchestrator.
 *
 * Order matters:
 *   1. Rockets        (required by launches)
 *   2. Launch sites   (required by launches)
 *   3. Astronauts
 *   4. Spacecraft
 *   5. Launches       (last)
 */

import { prisma } from '../../lib/db/prisma';
import { syncRockets } from './sync-rockets';
import { syncLaunchSites } from './sync-launch-sites';
import { syncAstronauts } from './sync-astronauts';
import { syncSpacecraft } from './sync-spacecraft';
import { syncLaunches } from './sync-launches';

async function main() {
  const started = Date.now();
  console.log('=== Space Website Sync ===');

  const rockets = await safe('rockets', syncRockets);
  const sites = await safe('launch-sites', syncLaunchSites);
  const astronauts = await safe('astronauts', syncAstronauts);
  const spacecraft = await safe('spacecraft', syncSpacecraft);
  const launches = await safe('launches', syncLaunches);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log('\n=== Summary ===');
  console.log(`Rockets       added=${rockets.added}  updated=${rockets.updated}  skipped=${rockets.skipped}`);
  console.log(`LaunchSites   added=${sites.added}  updated=${sites.updated}  skipped=${sites.skipped}`);
  console.log(`Astronauts    added=${astronauts.added}  updated=${astronauts.updated}  skipped=${astronauts.skipped}`);
  console.log(`Spacecraft    added=${spacecraft.added}  updated=${spacecraft.updated}  skipped=${spacecraft.skipped}`);
  console.log(`Launches      added=${launches.added}  updated=${launches.updated}  skipped=${launches.skipped}`);
  console.log(`Total elapsed: ${elapsed}s`);
}

async function safe(
  label: string,
  fn: () => Promise<{ added: number; updated: number; skipped: number }>
): Promise<{ added: number; updated: number; skipped: number }> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[${label}] FAILED:`, (e as Error).message);
    return { added: 0, updated: 0, skipped: 0 };
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().then(() => process.exit(1));
  });

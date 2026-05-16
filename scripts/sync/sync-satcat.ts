/**
 * Sync all satellites and spacecraft from CelesTrak SATCAT.
 *
 * SATCAT is a comprehensive catalog of all known satellites (active, retired,
 * decayed) maintained by CelesTrak. It includes objects from all space-faring
 * nations with NORAD catalog IDs, orbital parameters, owner countries, etc.
 *
 * Public CSV download (~6.6MB, ~50000 records). No rate limits, no auth.
 *
 * Imports as Spacecraft entries. Object types:
 *   PAY = Payload (satellites, probes, spacecraft) → imported
 *   R/B = Rocket Body → skipped (we have rockets separately)
 *   DEB = Debris → skipped
 *   UNK = Unknown → skipped
 */

import { SpacecraftType, SpacecraftStatus } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';

const SATCAT_URL = 'https://celestrak.org/pub/satcat.csv';

// CelesTrak owner code → human-readable country name
const OWNER_MAP: Record<string, string> = {
  US: 'USA',
  PRC: 'China',
  CIS: 'Russia',
  ESA: 'Europe',
  FR: 'France',
  UK: 'United Kingdom',
  DEU: 'Germany',
  ITA: 'Italy',
  ESP: 'Spain',
  JPN: 'Japan',
  IND: 'India',
  ISRO: 'India',
  CA: 'Canada',
  AUS: 'Australia',
  BRAZ: 'Brazil',
  KOR: 'South Korea',
  PRK: 'North Korea',
  IRAN: 'Iran',
  ISRA: 'Israel',
  TWN: 'Taiwan',
  ARGN: 'Argentina',
  MEX: 'Mexico',
  TURK: 'Turkey',
  UAE: 'UAE',
  SAUD: 'Saudi Arabia',
  ALG: 'Algeria',
  THAI: 'Thailand',
  ECU: 'Ecuador',
  EGYP: 'Egypt',
  GREC: 'Greece',
  HUN: 'Hungary',
  INDO: 'Indonesia',
  IRAQ: 'Iraq',
  KAZ: 'Kazakhstan',
  LUXE: 'Luxembourg',
  MALA: 'Malaysia',
  NETH: 'Netherlands',
  NIGR: 'Nigeria',
  NOR: 'Norway',
  PAKI: 'Pakistan',
  PERU: 'Peru',
  PHIL: 'Philippines',
  POL: 'Poland',
  POR: 'Portugal',
  QAT: 'Qatar',
  ROC: 'Romania',
  SING: 'Singapore',
  AB: 'Saudi Arabia (Arabsat)',
  AC: 'Asia Cellular Satellite',
  AB1: 'Arab Satellite Communications',
  RP: 'Roscosmos',
  SAFR: 'South Africa',
  SDN: 'Sudan',
  SWED: 'Sweden',
  SWTZ: 'Switzerland',
  THDN: 'Thailand',
  TURM: 'Turkmenistan',
  UKR: 'Ukraine',
  URY: 'Uruguay',
  VENZ: 'Venezuela',
  VTNM: 'Vietnam',
  ASRA: 'Asia',
  BOL: 'Bolivia',
  CHLE: 'Chile',
  EUME: 'EUMETSAT',
  EUTE: 'EUTELSAT',
  GLOB: 'Globalstar',
  IM: 'Inmarsat',
  INTL: 'International',
  IRID: 'Iridium',
  ISS: 'ISS Partners',
  NATO: 'NATO',
  NICA: 'Nicaragua',
  ORB: 'OrbView',
  RASC: 'Roscosmos',
  SES: 'SES',
  ABS: 'Asia Broadcast Satellite',
  AFRS: 'African Regional Sat',
  ANG: 'Angola',
  AZER: 'Azerbaijan',
  BELA: 'Belarus',
  BERM: 'Bermuda',
  BGD: 'Bangladesh',
  CHBZ: 'China/Brazil',
  CHLT: 'Chile',
  COL: 'Colombia',
  CRI: 'Costa Rica',
  CYM: 'Cayman Islands',
  CZCH: 'Czech Republic',
  DEN: 'Denmark',
  DJI: 'Djibouti',
  ETH: 'Ethiopia',
  FIN: 'Finland',
  GHA: 'Ghana',
  GUAT: 'Guatemala',
  HND: 'Honduras',
  KENY: 'Kenya',
  KWT: 'Kuwait',
  LAOS: 'Laos',
  LKA: 'Sri Lanka',
  LTU: 'Lithuania',
  MCO: 'Monaco',
  MDA: 'Moldova',
  MEXX: 'Mexico',
  MNG: 'Mongolia',
  MUS: 'Mauritius',
  NEP: 'Nepal',
  NZ: 'New Zealand',
  OMAN: 'Oman',
  PAKR: 'Pakistan',
  PRY: 'Paraguay',
  RWA: 'Rwanda',
  SLV: 'El Salvador',
  STP: 'Sao Tome',
  TCD: 'Chad',
  TUN: 'Tunisia',
  UGA: 'Uganda',
  USBZ: 'USA/Brazil',
  ZWE: 'Zimbabwe',
};

// CelesTrak status codes → SpacecraftStatus
function mapStatus(code: string): SpacecraftStatus {
  // + : active operational
  // - : not operational
  // P : partial
  // S : standby
  // X : extended mission
  // D : decayed/reentered (we skip these via decay date)
  // ? : unknown
  if (code === 'D') return SpacecraftStatus.RETIRED;
  if (!code || code === '?') return SpacecraftStatus.OPERATIONAL;
  return SpacecraftStatus.OPERATIONAL;
}

// Guess SpacecraftType from name patterns. CelesTrak doesn't have a payload
// type column, so we infer from the name.
function guessType(name: string): SpacecraftType {
  const n = name.toUpperCase();
  if (n.includes('STARLINK') || n.includes('ONEWEB') || n.includes('IRIDIUM') || n.includes('GLOBALSTAR') || n.includes('INMARSAT')) return SpacecraftType.SATELLITE;
  if (n.includes('GPS') || n.includes('GLONASS') || n.includes('GALILEO') || n.includes('BEIDOU') || n.includes('BDS') || n.includes('NAVSTAR')) return SpacecraftType.SATELLITE;
  if (n.includes('ISS') || n.includes('TIANGONG') || n.includes('TIANHE') || n.includes('MENGTIAN') || n.includes('WENTIAN') || n.includes('MIR') || n.includes('SALYUT') || n.includes('SKYLAB')) return SpacecraftType.SPACE_STATION;
  if (n.includes('PROGRESS') || n.includes('TIANZHOU') || n.includes('CYGNUS') || n.includes('HTV') || n.includes('CARGO DRAGON') || n.includes('DRAGON CRS')) return SpacecraftType.CARGO_SPACECRAFT;
  if (n.includes('CREW DRAGON') || n.includes('SOYUZ MS') || n.includes('SHENZHOU') || n.includes('STARLINER') || n.includes('ORION')) return SpacecraftType.CREWED_SPACECRAFT;
  if (n.includes('VOYAGER') || n.includes('PIONEER') || n.includes('MARS') || n.includes('VENERA') || n.includes('JUNO') || n.includes('CASSINI') || n.includes('GALILEO') || n.includes('CHANG\'E') || n.includes("CHANGE") || n.includes('TIANWEN') || n.includes('CHANDRAYAAN') || n.includes('LUNA')) return SpacecraftType.PROBE;
  return SpacecraftType.SATELLITE;
}

interface SatcatRow {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: string;
  OBJECT_TYPE: string;
  OPS_STATUS_CODE: string;
  OWNER: string;
  LAUNCH_DATE: string;
  LAUNCH_SITE: string;
  DECAY_DATE: string;
  PERIOD: string;
  INCLINATION: string;
  APOGEE: string;
  PERIGEE: string;
}

function parseCsv(text: string): SatcatRow[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',');
  const rows: SatcatRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV parsing — SATCAT doesn't quote fields.
    const fields = line.split(',');
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (fields[j] ?? '').trim();
    }
    rows.push(row as unknown as SatcatRow);
  }
  return rows;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function main() {
  // Optional CLI args:
  //   --owner US,PRC      Filter by owner codes (comma-separated)
  //   --max 5000          Cap number of records imported
  //   --include-decayed   Include decayed objects (default: skip)
  const args = process.argv.slice(2);
  const ownerArg = args.find((a) => a.startsWith('--owner'));
  const ownerFilter: string[] | null = ownerArg
    ? ownerArg.replace('--owner=', '').replace('--owner', '').replace(/^[\s=]+/, '').split(',').filter(Boolean)
    : null;
  const maxArg = args.find((a) => a.startsWith('--max'));
  const max = maxArg ? Number(maxArg.replace(/^--max[= ]?/, '')) : Infinity;
  const includeDecayed = args.includes('--include-decayed');

  console.log('[SATCAT] Downloading catalog...');
  const res = await fetch(SATCAT_URL);
  if (!res.ok) throw new Error(`SATCAT download failed: ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  console.log(`[SATCAT] Got ${rows.length} catalog entries`);

  // Build the full set of records to insert/update first (in memory).
  type SpacecraftCreate = {
    id: string;
    name: string;
    type: SpacecraftType;
    operator: string;
    launchDate: Date;
    status: SpacecraftStatus;
    orbitType: string;
    orbitAltitude: number | null;
    orbitInclination: number | null;
    orbitPeriod: number | null;
    mass: number;
    dimensions: string;
    mission: string;
    description: string;
    images: string[];
  };

  const records: SpacecraftCreate[] = [];
  let skipped = 0;
  let processed = 0;

  for (const row of rows) {
    if (processed >= max) break;
    processed++;

    if (row.OBJECT_TYPE !== 'PAY') {
      skipped++;
      continue;
    }
    if (!includeDecayed && row.DECAY_DATE) {
      skipped++;
      continue;
    }
    if (ownerFilter && !ownerFilter.includes(row.OWNER)) {
      skipped++;
      continue;
    }

    const name = row.OBJECT_NAME?.trim();
    const noradId = row.NORAD_CAT_ID?.trim();
    if (!name || !noradId) {
      skipped++;
      continue;
    }

    const id = `satcat-${noradId}`;
    const operator = OWNER_MAP[row.OWNER] || row.OWNER || 'Unknown';
    const country = OWNER_MAP[row.OWNER] || row.OWNER || 'Unknown';
    const launchDate = row.LAUNCH_DATE ? new Date(row.LAUNCH_DATE) : new Date('1970-01-01');
    if (Number.isNaN(launchDate.getTime())) {
      skipped++;
      continue;
    }

    const apogee = parseFloat(row.APOGEE);
    const perigee = parseFloat(row.PERIGEE);
    const altitude = Number.isFinite(apogee) && Number.isFinite(perigee) ? (apogee + perigee) / 2 : null;
    const period = parseFloat(row.PERIOD);
    const inclination = parseFloat(row.INCLINATION);

    const orbitType =
      altitude == null ? 'Unknown' :
      altitude < 2000 ? 'LEO' :
      altitude < 35000 ? 'MEO' :
      altitude < 36500 ? 'GEO' :
      'HEO';

    records.push({
      id,
      name,
      type: guessType(name),
      operator,
      launchDate,
      status: row.DECAY_DATE ? SpacecraftStatus.RETIRED : mapStatus(row.OPS_STATUS_CODE),
      orbitType,
      orbitAltitude: Number.isFinite(altitude) ? (altitude as number) : null,
      orbitInclination: Number.isFinite(inclination) ? inclination : null,
      orbitPeriod: Number.isFinite(period) ? period : null,
      mass: 0,
      dimensions: '',
      mission: `${country} satellite (NORAD ${noradId})`,
      description: `${name} (${country}). NORAD ${noradId}, COSPAR ${row.OBJECT_ID}. Launched ${row.LAUNCH_DATE} from ${row.LAUNCH_SITE || 'unknown site'}.${row.DECAY_DATE ? ` Decayed ${row.DECAY_DATE}.` : ''}`,
      images: [],
    });
  }

  console.log(`[SATCAT] Filtered to ${records.length} payloads (processed=${processed} skipped=${skipped})`);

  // Find which IDs already exist so we know whether to insert or update.
  console.log('[SATCAT] Checking existing records...');
  const ids = records.map((r) => r.id);
  const existing = new Set<string>();
  // Chunk findMany lookups to avoid huge IN clauses.
  for (let i = 0; i < ids.length; i += 1000) {
    const batch = ids.slice(i, i + 1000);
    const found = await prisma.spacecraft.findMany({
      where: { id: { in: batch } },
      select: { id: true },
    });
    for (const f of found) existing.add(f.id);
  }
  const toCreate = records.filter((r) => !existing.has(r.id));
  const toUpdate = records.filter((r) => existing.has(r.id));
  console.log(`[SATCAT] To create: ${toCreate.length}, to update: ${toUpdate.length}`);

  // Bulk create new records (much faster than upsert one-by-one).
  let added = 0;
  if (toCreate.length > 0) {
    console.log('[SATCAT] Bulk creating new records...');
    for (let i = 0; i < toCreate.length; i += 500) {
      const batch = toCreate.slice(i, i + 500);
      const result = await prisma.spacecraft.createMany({
        data: batch,
        skipDuplicates: true,
      });
      added += result.count;
      console.log(`[SATCAT]   created ${added}/${toCreate.length}`);
    }
  }

  // Update existing records in parallel batches.
  let updated = 0;
  if (toUpdate.length > 0) {
    console.log('[SATCAT] Updating existing records...');
    const concurrency = 20;
    for (let i = 0; i < toUpdate.length; i += concurrency) {
      const batch = toUpdate.slice(i, i + concurrency);
      await Promise.all(
        batch.map((rec) =>
          prisma.spacecraft.update({ where: { id: rec.id }, data: rec }).catch(() => null)
        )
      );
      updated += batch.length;
      if (updated % 200 === 0 || updated === toUpdate.length) {
        console.log(`[SATCAT]   updated ${updated}/${toUpdate.length}`);
      }
    }
  }

  console.log(`\n[SATCAT] Done. added=${added} updated=${updated} skipped=${skipped} processed=${processed}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

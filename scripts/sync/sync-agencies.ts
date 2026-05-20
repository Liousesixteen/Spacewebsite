/**
 * Sync space agencies (companies, agencies, manufacturers) from Launch Library 2.
 *
 * LL2 has ~300+ agencies covering government space agencies, commercial
 * launch providers, and satellite manufacturers across the world.
 *
 * Imports as Company entries. Maps LL2 agency type to our CompanyType enum.
 */

import { CompanyType } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { slugify } from './lib/utils';

interface LL2Agency {
  id: number;
  name?: string | null;
  abbrev?: string | null;
  type?: string | null;
  country_code?: string | null;
  description?: string | null;
  administrator?: string | null;
  founding_year?: string | number | null;
  launchers?: string | null;
  spacecraft?: string | null;
  parent?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  info_url?: string | null;
  wiki_url?: string | null;
  total_launch_count?: number;
  successful_launches?: number;
  failed_launches?: number;
  pending_launches?: number;
}

function mapType(t: string | null | undefined): CompanyType {
  const s = (t || '').toLowerCase();
  if (s.includes('government')) return CompanyType.STATE_OWNED;
  if (s.includes('commercial') || s.includes('private')) return CompanyType.PRIVATE;
  if (s.includes('multinational')) return CompanyType.PUBLIC;
  if (s.includes('educational')) return CompanyType.STARTUP;
  return CompanyType.PRIVATE;
}

function mapCountry(code: string | null | undefined): string {
  const map: Record<string, string> = {
    USA: 'USA',
    CHN: 'China',
    RUS: 'Russia',
    JPN: 'Japan',
    IND: 'India',
    FRA: 'France',
    GBR: 'United Kingdom',
    DEU: 'Germany',
    ITA: 'Italy',
    ESP: 'Spain',
    KOR: 'South Korea',
    PRK: 'North Korea',
    IRN: 'Iran',
    ISR: 'Israel',
    BRA: 'Brazil',
    CAN: 'Canada',
    AUS: 'Australia',
    NZL: 'New Zealand',
    UKR: 'Ukraine',
    KAZ: 'Kazakhstan',
    EU: 'Europe',
    INT: 'International',
    UAE: 'UAE',
    SAU: 'Saudi Arabia',
    LUX: 'Luxembourg',
    NLD: 'Netherlands',
    BEL: 'Belgium',
    CHE: 'Switzerland',
    SWE: 'Sweden',
    NOR: 'Norway',
    FIN: 'Finland',
    DNK: 'Denmark',
    POL: 'Poland',
    TUR: 'Turkey',
    SGP: 'Singapore',
    MYS: 'Malaysia',
    THA: 'Thailand',
    VNM: 'Vietnam',
    IDN: 'Indonesia',
    PHL: 'Philippines',
    EGY: 'Egypt',
    ZAF: 'South Africa',
    NGA: 'Nigeria',
    MEX: 'Mexico',
    ARG: 'Argentina',
    CHL: 'Chile',
    COL: 'Colombia',
    PER: 'Peru',
    VEN: 'Venezuela',
    PAK: 'Pakistan',
    BGD: 'Bangladesh',
    LKA: 'Sri Lanka',
    NPL: 'Nepal',
    MMR: 'Myanmar',
    BTN: 'Bhutan',
  };
  return map[code || ''] || code || 'Unknown';
}

async function main() {
  console.log('[agencies] Fetching agencies from LL2...');
  const agencies = await fetchLL2List<LL2Agency>(
    '/agencies/',
    { limit: 100, mode: 'detailed' },
    1000
  );
  console.log(`[agencies] Got ${agencies.length} agencies`);

  type CompanyCreate = {
    id: string;
    name: string;
    country: string;
    type: CompanyType;
    foundedYear: number;
    headquarters: string;
    employees: number | null;
    revenue: number | null;
    products: string[];
    achievements: string[];
    website: string | null;
    stockCode: string | null;
    description: string;
    logo: string | null;
  };

  const records: CompanyCreate[] = [];
  let skipped = 0;

  for (const a of agencies) {
    const name = a.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }
    const id = `ll2-agency-${a.id}`;
    const founded = a.founding_year ? parseInt(String(a.founding_year)) : 0;
    if (Number.isNaN(founded)) {
      skipped++;
      continue;
    }

    const launches = a.total_launch_count ?? 0;
    const successful = a.successful_launches ?? 0;
    const failed = a.failed_launches ?? 0;
    const achievements: string[] = [];
    if (launches > 0) achievements.push(`累计 ${launches} 次发射`);
    if (successful > 0) achievements.push(`成功 ${successful} 次`);
    if (failed > 0) achievements.push(`失败 ${failed} 次`);
    if (a.launchers) achievements.push(`运载器: ${a.launchers}`);

    const products: string[] = [];
    if (a.spacecraft) products.push(...a.spacecraft.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6));
    if (a.launchers) products.push(...a.launchers.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6));

    records.push({
      id,
      name,
      country: mapCountry(a.country_code),
      type: mapType(a.type),
      foundedYear: founded || 1970,
      headquarters: a.administrator || mapCountry(a.country_code),
      employees: null,
      revenue: null,
      products: products.slice(0, 10),
      achievements: achievements.slice(0, 6),
      website: a.info_url || a.wiki_url || null,
      stockCode: null,
      description: a.description || `${name} (${a.abbrev || ''})${founded ? ` 成立于 ${founded} 年` : ''}.`,
      logo: a.logo_url || a.image_url || null,
    });
  }

  console.log(`[agencies] Prepared ${records.length} company records (skipped=${skipped})`);

  const ids = records.map((r) => r.id);
  const existing = new Set<string>();
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    const found = await prisma.company.findMany({
      where: { id: { in: batch } },
      select: { id: true },
    });
    for (const f of found) existing.add(f.id);
  }
  const toCreate = records.filter((r) => !existing.has(r.id));
  const toUpdate = records.filter((r) => existing.has(r.id));
  console.log(`[agencies] To create: ${toCreate.length}, to update: ${toUpdate.length}`);

  let added = 0;
  if (toCreate.length > 0) {
    for (let i = 0; i < toCreate.length; i += 200) {
      const batch = toCreate.slice(i, i + 200);
      const result = await prisma.company.createMany({
        data: batch,
        skipDuplicates: true,
      });
      added += result.count;
      console.log(`[agencies]   created ${added}/${toCreate.length}`);
    }
  }

  let updated = 0;
  if (toUpdate.length > 0) {
    for (let i = 0; i < toUpdate.length; i += 20) {
      const batch = toUpdate.slice(i, i + 20);
      await Promise.all(
        batch.map((rec) =>
          prisma.company.update({ where: { id: rec.id }, data: rec }).catch(() => null)
        )
      );
      updated += batch.length;
    }
    console.log(`[agencies]   updated ${updated}/${toUpdate.length}`);
  }

  console.log(`\n[agencies] Done. added=${added} updated=${updated} skipped=${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

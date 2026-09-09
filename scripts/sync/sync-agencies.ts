/**
 * Sync space agencies from Launch Library 2.
 *
 * Writes LL2 agency records into both the Agency table (for launch
 * relationships) and the Company table (for industry chain browsing).
 *
 * LL2 has ~300+ agencies covering government space agencies, commercial
 * launch providers, and satellite manufacturers worldwide.
 */

import { CompanyType } from '@prisma/client';
import { prisma } from '../../lib/db/prisma';
import { fetchLL2List } from './lib/ll2-client';
import { runTrackedSync } from './lib/sync-run';
import { mapCountryCode, slugify } from './lib/utils';

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

function mapCompanyType(t: string | null | undefined): CompanyType {
  const s = (t || '').toLowerCase();
  if (s.includes('government')) return CompanyType.STATE_OWNED;
  if (s.includes('commercial') || s.includes('private')) return CompanyType.PRIVATE;
  if (s.includes('multinational')) return CompanyType.PUBLIC;
  if (s.includes('educational')) return CompanyType.STARTUP;
  return CompanyType.PRIVATE;
}

function parseFounded(year: string | number | null | undefined): number | null {
  if (year == null) return null;
  const n = typeof year === 'string' ? parseInt(year) : year;
  return Number.isFinite(n) && n > 1900 && n < 2100 ? n : null;
}

export async function syncAgencies(): Promise<{ added: number; updated: number; skipped: number }> {
  return runTrackedSync('Launch Library 2: Agencies', syncAgenciesImpl);
}

async function syncAgenciesImpl(): Promise<{ added: number; updated: number; skipped: number }> {
  console.log('[agencies] Fetching agencies from LL2...');
  const agencies = await fetchLL2List<LL2Agency>(
    '/agencies/',
    { limit: 100, mode: 'detailed' },
    1000
  );
  console.log(`[agencies] Got ${agencies.length} agencies`);

  let agencyAdded = 0;
  let agencyUpdated = 0;
  let companyAdded = 0;
  let companyUpdated = 0;
  let skipped = 0;

  for (const a of agencies) {
    const name = a.name?.trim();
    if (!name) { skipped++; continue; }

    const country = mapCountryCode(a.country_code);
    const founded = parseFounded(a.founding_year);
    const website = a.info_url || a.wiki_url || null;
    const logo = a.logo_url || a.image_url || null;
    const abbrev = a.abbrev?.trim() || null;
    const agencyType = a.type?.trim() || null;
    const externalId = `ll2-agency-${a.id}`;
    const now = new Date();

    // ── Upsert Agency ──
    try {
      const existingAgency = await prisma.agency.findFirst({
        where: { OR: [{ externalId }, { name }] },
        select: { id: true },
      });

      if (existingAgency) {
        await prisma.agency.update({
          where: { id: existingAgency.id },
          data: {
            name,
            abbrev,
            type: agencyType,
            country,
            description: a.description || null,
            administrator: a.administrator || null,
            foundingYear: founded,
            logo,
            website,
            externalId,
            source: 'Launch Library 2',
            lastSyncedAt: now,
          },
        });
        agencyUpdated++;
      } else {
        await prisma.agency.create({
          data: {
            id: externalId,
            name,
            abbrev,
            type: agencyType,
            country,
            description: a.description || null,
            administrator: a.administrator || null,
            foundingYear: founded,
            logo,
            website,
            externalId,
            source: 'Launch Library 2',
            lastSyncedAt: now,
          },
        });
        agencyAdded++;
      }
    } catch (e) {
      console.error(`[agencies] Agency upsert failed for ${name}:`, (e as Error).message);
    }

    // ── Upsert Company (for industry chain) ──
    try {
      const companyId = externalId;
      const launches = a.total_launch_count ?? 0;
      const successful = a.successful_launches ?? 0;
      const failed = a.failed_launches ?? 0;

      const achievements: string[] = [];
      if (launches > 0) achievements.push(`累计 ${launches} 次发射`);
      if (successful > 0) achievements.push(`成功 ${successful} 次`);
      if (failed > 0) achievements.push(`失败 ${failed} 次`);
      if (a.launchers) achievements.push(`运载器: ${a.launchers}`);

      const products: string[] = [];
      if (a.spacecraft) {
        products.push(...a.spacecraft.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6));
      }
      if (a.launchers) {
        products.push(...a.launchers.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6));
      }

      const existingCompany = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });

      const companyData = {
        name,
        country,
        type: mapCompanyType(a.type),
        foundedYear: founded || 1970,
        headquarters: a.administrator || country,
        employees: null as number | null,
        revenue: null as number | null,
        products: products.slice(0, 10),
        achievements: achievements.slice(0, 6),
        website,
        stockCode: null as string | null,
        description: a.description || `${name}${abbrev ? ` (${abbrev})` : ''}${founded ? ` 成立于 ${founded} 年` : ''}.`,
        logo,
        updatedAt: now,
      };

      if (existingCompany) {
        await prisma.company.update({ where: { id: companyId }, data: companyData });
        companyUpdated++;
      } else {
        await prisma.company.create({
          data: { id: companyId, ...companyData, createdAt: now },
        });
        companyAdded++;
      }
    } catch (e) {
      console.error(`[agencies] Company upsert failed for ${name}:`, (e as Error).message);
    }
  }

  console.log(
    `\n[agencies] Done. Agency: added=${agencyAdded} updated=${agencyUpdated}. ` +
    `Company: added=${companyAdded} updated=${companyUpdated}. skipped=${skipped}`
  );
  return {
    added: agencyAdded + companyAdded,
    updated: agencyUpdated + companyUpdated,
    skipped,
  };
}

if (require.main === module) {
  syncAgencies()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      return prisma.$disconnect().then(() => process.exit(1));
    });
}

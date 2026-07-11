import { normalizeCountryName } from './country-stats';

export type CountryIndustryLevel = 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM';

export interface CountryIndustrySegment {
  id: string;
  name: string;
  level: CountryIndustryLevel;
  category?: string;
}

export interface CountryIndustryCompanyInput {
  id: string;
  name: string;
  country: string;
  type: string;
  revenue?: number | null;
  employees?: number | null;
  products?: string[];
  achievements?: string[];
  segments?: Array<{
    segment: CountryIndustrySegment;
  }>;
}

export interface CountryIndustryCountItem {
  id?: string;
  label: string;
  count: number;
}

export interface CountryIndustryStats {
  countrySlug: string;
  companyCount: number;
  totalRevenue: number;
  totalEmployees: number;
  levelCounts: CountryIndustryCountItem[];
  companyTypeCounts: CountryIndustryCountItem[];
  topSegments: CountryIndustryCountItem[];
  featuredCompanies: CountryIndustryCompanyInput[];
}

export interface CountryValueChainCompany {
  id: string;
  name: string;
  type: string;
  revenue?: number | null;
  segmentNames: string[];
}

export interface CountryValueChainLane {
  level: CountryIndustryLevel;
  companyCount: number;
  segments: CountryIndustryCountItem[];
  companies: CountryValueChainCompany[];
}

export function buildCountryIndustryStats(
  countrySlug: string,
  companies: CountryIndustryCompanyInput[]
): CountryIndustryStats {
  const matchedCompanies = companies.filter((company) =>
    getCountrySlugs(company.country).includes(countrySlug)
  );

  return {
    countrySlug,
    companyCount: matchedCompanies.length,
    totalRevenue: matchedCompanies.reduce(
      (sum, company) => sum + (company.revenue ?? 0),
      0
    ),
    totalEmployees: matchedCompanies.reduce(
      (sum, company) => sum + (company.employees ?? 0),
      0
    ),
    levelCounts: countUniqueCompanySegments(
      matchedCompanies,
      (segment) => segment.level
    ),
    companyTypeCounts: countBy(matchedCompanies, (company) => company.type),
    topSegments: countUniqueCompanySegments(
      matchedCompanies,
      (segment) => segment.name,
      (segment) => segment.id
    ),
    featuredCompanies: [...matchedCompanies].sort(compareFeaturedCompanies).slice(0, 8),
  };
}

export function buildCountryValueChainMap(
  companies: CountryIndustryCompanyInput[]
): CountryValueChainLane[] {
  const levels: CountryIndustryLevel[] = ['UPSTREAM', 'MIDSTREAM', 'DOWNSTREAM'];

  return levels.map((level) => {
    const companiesForLevel = companies.filter((company) =>
      (company.segments ?? []).some((ref) => ref.segment.level === level)
    );

    return {
      level,
      companyCount: companiesForLevel.length,
      segments: countUniqueCompanySegments(
        companiesForLevel,
        (segment) => (segment.level === level ? segment.name : undefined),
        (segment) => (segment.level === level ? segment.id : undefined)
      ),
      companies: companiesForLevel
        .map((company) => ({
          id: company.id,
          name: company.name,
          type: company.type,
          revenue: company.revenue,
          segmentNames: (company.segments ?? [])
            .filter((ref) => ref.segment.level === level)
            .map((ref) => ref.segment.name),
        }))
        .sort(compareValueChainCompanies)
        .slice(0, 5),
    };
  });
}

export function getCountrySlugs(value: string): string[] {
  const slugs = new Set<string>();

  for (const part of value.split(',')) {
    const country = normalizeCountryName(part);
    if (country) slugs.add(country.slug);
  }

  return Array.from(slugs);
}

function countUniqueCompanySegments(
  companies: CountryIndustryCompanyInput[],
  getLabel: (segment: CountryIndustrySegment) => string | undefined | null,
  getId?: (segment: CountryIndustrySegment) => string | undefined | null
): CountryIndustryCountItem[] {
  const counts = new Map<string, CountryIndustryCountItem>();

  for (const company of companies) {
    const seenForCompany = new Set<string>();
    for (const ref of company.segments ?? []) {
      const label = getLabel(ref.segment);
      if (!label) continue;

      const id = getId?.(ref.segment) ?? label;
      const key = id || label;
      if (seenForCompany.has(key)) continue;
      seenForCompany.add(key);

      const current = counts.get(key);
      if (current) {
        current.count += 1;
      } else {
        const item: CountryIndustryCountItem = { label, count: 1 };
        if (getId && id) item.id = id;
        counts.set(key, item);
      }
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

function countBy<T>(
  items: T[],
  getLabel: (item: T) => string | undefined | null
): CountryIndustryCountItem[] {
  const counts = new Map<string, CountryIndustryCountItem>();

  for (const item of items) {
    const label = getLabel(item);
    if (!label) continue;
    const current = counts.get(label);
    if (current) {
      current.count += 1;
    } else {
      counts.set(label, { label, count: 1 });
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

function compareFeaturedCompanies(
  a: CountryIndustryCompanyInput,
  b: CountryIndustryCompanyInput
): number {
  const revenueDiff = (b.revenue ?? 0) - (a.revenue ?? 0);
  if (revenueDiff !== 0) return revenueDiff;

  const employeeDiff = (b.employees ?? 0) - (a.employees ?? 0);
  if (employeeDiff !== 0) return employeeDiff;

  return a.name.localeCompare(b.name);
}

function compareValueChainCompanies(
  a: CountryValueChainCompany,
  b: CountryValueChainCompany
): number {
  const revenueDiff = (b.revenue ?? 0) - (a.revenue ?? 0);
  if (revenueDiff !== 0) return revenueDiff;
  return a.name.localeCompare(b.name);
}
